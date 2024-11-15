package router

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
	"rafaelsms.com/psico/database"

	"github.com/gin-gonic/gin"
)

const SALT_LENGTH = 32
const IV_LENGTH = 12
const BCRYPT_COST = 12

func Setup() *gin.Engine {
	var engine *gin.Engine = gin.Default()
	setupEngine(engine)
	setupRoutes(engine)
	return engine
}

func setupEngine(engine *gin.Engine) {
}

func setupRoutes(engine *gin.Engine) {
	engine.GET("/ping", func(ginCtx *gin.Context) {
		ginCtx.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	engine.POST("/register", userRegister)
	// engine.POST("/login", userLogin)
}

func userRegister(ginCtx *gin.Context) {
	// Read and validate request body
	post := RegisterRequest{}
	err := ginCtx.BindJSON(&post)
	if err != nil {
		ginCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = checkArrayLength(post.WrappingKeyParams.Salt, SALT_LENGTH)
	if err != nil {
		ginCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = checkArrayLength(post.WrappedEncryptionKey.Iv, IV_LENGTH)
	if err != nil {
		ginCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	// Run the password through bcrypt
	bcryptPassword, err := bcrypt.GenerateFromPassword(post.Password, BCRYPT_COST)
	if err != nil {
		ginCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// Print json
	resultJson, err := json.Marshal(post)
	if err != nil {
		ginCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	log.Printf("POST body: %s\n", resultJson)

	saltArray := [SALT_LENGTH]byte(post.WrappingKeyParams.Salt)
	ivArray := [IV_LENGTH]byte(post.WrappedEncryptionKey.Iv)

	user := database.User{
		Username: post.Username,
		Password: bcryptPassword,
		WrappingKeyParams: database.WrappingKeyParams{
			Salt:           saltArray,
			IterationCount: post.WrappingKeyParams.IterationCount,
		},
		WrappedEncryptionKey: database.EncryptedData{
			Iv:   ivArray,
			Data: post.WrappedEncryptionKey.Data,
		},
	}
	resultBson, err := bson.Marshal(user)
	if err != nil {
		ginCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	var unmarshalBson bson.M
	err = bson.Unmarshal(resultBson, &unmarshalBson)
	if err != nil {
		ginCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	resultJson, err = json.MarshalIndent(unmarshalBson, "", "\t")
	if err != nil {
		ginCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}
	log.Printf("User: %s\n", resultJson)

	ctx, cancel := context.WithTimeoutCause(
		context.Background(),
		10*time.Second,
		fmt.Errorf("request timed out"),
	)
	defer cancel()
	err = database.InsertNewUser(ctx, user)
	if err != nil {
		ginCtx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	ginCtx.JSON(http.StatusOK, &post)
}

// func userLogin(context *gin.Context) {
// 	post := Test{}
// 	if err := context.BindJSON(&post); err != nil {
// 		context.AbortWithError(http.StatusBadRequest, err)
// 		return
// 	}

// 	context.JSON(http.StatusOK, &post)
// }

func checkArrayLength[K interface{}](array []K, expectedLength int) error {
	if len(array) != expectedLength {
		return fmt.Errorf(
			"expected array of length %d, got %d instead",
			expectedLength,
			len(array),
		)
	}
	return nil
}
