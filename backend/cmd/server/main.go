package main

import (
	"context"
	"log"
	"time"

	"github.com/joho/godotenv"
	"rafaelsms.com/psico/database"
	"rafaelsms.com/psico/router"
)

func main() {
	// Load environment
	if err := godotenv.Load("mongodb.env"); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database
	database.Init(context.Background())
	defer database.Disconnect(context.Background())

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	database.Test(ctx)

	// Initialize and run router
	r := router.Setup()
	r.Run()
}
