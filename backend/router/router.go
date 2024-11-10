package router

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Setup() *gin.Engine {
	var engine *gin.Engine = gin.Default()
	setupEngine(engine)
	setupRoutes(engine)
	return engine
}

func setupEngine(engine *gin.Engine) {
}

func setupRoutes(engine *gin.Engine) {
	engine.GET("/ping", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	engine.POST("/register", userRegister)
	// engine.POST("/login", userLogin)
}

type Base64WrappingKeyParams struct {
	Base64Salt     string `json:"salt" binding:"required"`
	IterationCount uint   `json:"iterationCount" binding:"required"`
}

type Base64EncryptedData struct {
	Base64Iv   string `json:"iv" binding:"required"`
	Base64Data string `json:"data" binding:"required"`
}

type RegisterRequest struct {
	Username             string                  `json:"username" binding:"required"`
	Password             string                  `json:"password" binding:"required"`
	WrappingKeyParams    Base64WrappingKeyParams `json:"wrappingKeyParams" binding:"required"`
	WrappedEncryptionKey Base64EncryptedData     `json:"wrappedEncryptionKey" binding:"required"`
}

type WrappingKeyParams struct {
	Salt           []byte
	IterationCount uint
}

type EncryptedData struct {
	Iv   []byte
	Data []byte
}

func userRegister(context *gin.Context) {
	// Read request body
	post := RegisterRequest{}
	err := context.BindJSON(&post)
	if err != nil {
		context.AbortWithStatus(http.StatusBadRequest)
		return
	}

	hash := sha256.New()

	wrappedEncryptionKeyData, err := base64.StdEncoding.DecodeString(post.WrappedEncryptionKey.Base64Data)
	if err != nil {
		context.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	hash.Write(wrappedEncryptionKeyData)
	fmt.Printf("encryption key data: %x\n", hash.Sum(nil))
	hash.Reset()

	wrappedEncryptionKeyIv, err := base64.StdEncoding.DecodeString(post.WrappedEncryptionKey.Base64Iv)
	if err != nil {
		context.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	hash.Write(wrappedEncryptionKeyIv)
	fmt.Printf("encryption key iv: %x\n", hash.Sum(nil))
	hash.Reset()

	wrappingKeyParamsSalt, err := base64.StdEncoding.DecodeString(post.WrappingKeyParams.Base64Salt)
	if err != nil {
		context.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	hash.Write(wrappingKeyParamsSalt)
	fmt.Printf("wrapping key salt: %x\n", hash.Sum(nil))
	hash.Reset()

	// Print json
	resultJson, err := json.Marshal(post)
	if err != nil {
		context.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	log.Printf("%s\n", resultJson)

	context.JSON(http.StatusOK, &post)
}

// func userLogin(context *gin.Context) {
// 	post := Test{}
// 	if err := context.BindJSON(&post); err != nil {
// 		context.AbortWithStatus(http.StatusBadRequest)
// 		return
// 	}

// 	context.JSON(http.StatusOK, &post)
// }
