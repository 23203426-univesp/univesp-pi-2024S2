package main

import (
	"context"
	"log"

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

	// Initialize and run router
	r := router.Setup()
	r.Run()
}
