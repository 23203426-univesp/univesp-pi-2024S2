package router

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
	"rafaelsms.com/psico/database"

	"github.com/gin-gonic/gin"
)

const SALT_LENGTH = 32
const IV_LENGTH = 12
const BCRYPT_PASSWORD_MAX_LENGTH = 72
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
	engine.POST("/login", userLogin)
}

func userRegister(ginCtx *gin.Context) {
	// Read and validate request body
	post := RegisterRequest{}
	err := ginCtx.BindJSON(&post)
	if err != nil {
		ginCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = checkArrayCeilingLength(post.Password, BCRYPT_PASSWORD_MAX_LENGTH)
	if err != nil {
		ginCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = checkArrayExactLength(post.WrappingKeyParams.Salt, SALT_LENGTH)
	if err != nil {
		ginCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = checkArrayExactLength(post.WrappedEncryptionKey.Iv, IV_LENGTH)
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

	response := LoginResponse{
		Username: user.Username,
		WrappingKeyParams: WrappingKeyParams{
			Salt:           user.WrappingKeyParams.Salt[:],
			IterationCount: user.WrappingKeyParams.IterationCount,
		},
		WrappedEncryptionKey: EncryptedData{
			Iv:   user.WrappedEncryptionKey.Iv[:],
			Data: user.WrappedEncryptionKey.Data,
		},
	}
	ginCtx.JSON(http.StatusOK, &response)
}

func userLogin(ginCtx *gin.Context) {
	// Read and validate request body
	post := LoginRequest{}
	err := ginCtx.BindJSON(&post)
	if err != nil {
		ginCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}
	err = checkArrayCeilingLength(post.Password, BCRYPT_PASSWORD_MAX_LENGTH)
	if err != nil {
		ginCtx.AbortWithError(http.StatusBadRequest, err)
		return
	}

	// Get user from database
	ctx, cancel := context.WithTimeoutCause(
		context.Background(),
		10*time.Second,
		fmt.Errorf("request timed out"),
	)
	defer cancel()
	var user database.User
	err = database.GetUser(ctx, post.Username, &user)
	if err != nil {
		ginCtx.AbortWithError(http.StatusUnauthorized, err)
		return
	}

	// Test given password with user's password
	err = bcrypt.CompareHashAndPassword(user.Password, post.Password)
	if err != nil {
		ginCtx.AbortWithError(http.StatusUnauthorized, err)
		return
	}

	// If nothing went wrong, return user
	response := LoginResponse{
		Username: user.Username,
		WrappingKeyParams: WrappingKeyParams{
			Salt:           user.WrappingKeyParams.Salt[:],
			IterationCount: user.WrappingKeyParams.IterationCount,
		},
		WrappedEncryptionKey: EncryptedData{
			Iv:   user.WrappedEncryptionKey.Iv[:],
			Data: user.WrappedEncryptionKey.Data,
		},
	}
	ginCtx.JSON(http.StatusOK, &response)
}

func checkArrayCeilingLength[K interface{}](array []K, ceilingLength int) error {
	if len(array) > ceilingLength {
		return fmt.Errorf(
			"expected array length of at most %d, got %d instead",
			ceilingLength,
			len(array),
		)
	}
	return nil
}

func checkArrayExactLength[K interface{}](array []K, expectedLength int) error {
	if len(array) != expectedLength {
		return fmt.Errorf(
			"expected array of length %d, got %d instead",
			expectedLength,
			len(array),
		)
	}
	return nil
}
