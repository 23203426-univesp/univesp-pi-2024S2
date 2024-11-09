package router

import (
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

type EncryptedData struct {
	Iv   []byte `json:"iv" binding:"required"`
	Data []byte `json:"data" binding:"required"`
}

type RegisterRequest struct {
	Username      string        `json:"username" binding:"required"`
	Password      string        `json:"password" binding:"required"`
	WrappingKey   []byte        `json:"wrappingKeyData" binding:"required"`
	EncryptionKey EncryptedData `json:"encryptionKey" binding:"required"`
}

func userRegister(context *gin.Context) {
	post := RegisterRequest{}
	if err := context.BindJSON(&post); err != nil {
		context.AbortWithStatus(http.StatusBadRequest)
		return
	}

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
