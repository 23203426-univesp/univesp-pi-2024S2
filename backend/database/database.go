package database

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand/v2"
	"os"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client = nil

func Init(ctx context.Context) error {
	// Get MongoDB URI
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		return fmt.Errorf("set your 'MONGODB_URI' environment variable")
	}

	// Connect to database
	var err error
	client, err = mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB using %s: %s", uri, err)
	}

	// Establish connection, pinging database
	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB server: %s", err)
	}

	return nil
}

func Disconnect(ctx context.Context) error {
	if client == nil {
		return fmt.Errorf("client isn't ready")
	}

	// Disconnect and reset variable if successful
	err := client.Disconnect(ctx)
	if err == nil {
		client = nil
	}
	return err
}

func randomChar() byte {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	return byte(charset[rand.IntN(len(charset))])
}

func randomString(length int) string {
	var builder strings.Builder
	builder.Grow(length)
	for i := 0; i < length; i++ {
		builder.WriteByte(randomChar())
	}
	return builder.String()
}

func Test(ctx context.Context) error {
	if client == nil {
		return fmt.Errorf("client isn't ready")
	}

	age := rand.Uint32N(100)
	name := randomString(16)
	testEntry := TestDocument{Name: name, Age: age}
	coll := client.Database("psico").Collection("test")

	_, err := coll.InsertOne(ctx, testEntry)
	if err != nil {
		return err
	}

	cursor, err := coll.Find(ctx, bson.D{})
	if err != nil {
		return err
	}

	var results []TestDocument
	err = cursor.All(ctx, &results)
	if err != nil {
		return err
	}

	for _, result := range results {
		resultJson, err := json.Marshal(result)
		if err != nil {
			return err
		}
		log.Printf("%s\n", resultJson)
	}

	return nil
}
