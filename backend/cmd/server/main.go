package main

import (
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

	database.Init()

	r := router.Setup()
	r.Run()
}
