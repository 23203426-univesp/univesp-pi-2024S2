package router

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Test struct {
	Foo string `json:"foo" binding:"required"`
	Bar string `json:"bar" binding:"required"`
}

func setupEngine(engine *gin.Engine) {
}

func setupRoutes(engine *gin.Engine) {
	engine.GET("/ping", func(context *gin.Context) {
		context.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	engine.POST("/ping", func(context *gin.Context) {
		post := Test{}
		if bindErr := context.BindJSON(&post); bindErr != nil {
			context.AbortWithStatus(http.StatusBadRequest)
			return
		}

		context.JSON(http.StatusOK, &post)
	})
}

func Setup() *gin.Engine {
	var engine *gin.Engine = gin.Default()
	setupEngine(engine)
	setupRoutes(engine)
	return engine
}
