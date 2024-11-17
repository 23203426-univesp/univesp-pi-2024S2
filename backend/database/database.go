package database

import (
	"context"
	"fmt"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const USER_COLLECTION = "users"

var client *mongo.Client = nil
var database string

func Init(ctx context.Context) error {
	// Get MongoDB URI
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		return fmt.Errorf("set your 'MONGODB_URI' environment variable")
	}
	database = os.Getenv("DATABASE_NAME")
	if database == "" {
		return fmt.Errorf("set your 'DATABASE_NAME' environment variable")
	}

	// Connect to database
	var err error
	client, err = mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %s", err)
	}

	// Establish connection, pinging database
	err = client.Ping(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB server: %s", err)
	}

	database := client.Database(database)

	// Create collections and indexes
	err = database.CreateCollection(
		ctx,
		USER_COLLECTION,
		options.CreateCollection().SetValidator(bson.D{
			{Key: "$jsonSchema", Value: bson.D{
				{Key: "bsonType", Value: "object"},
				{Key: "required", Value: bson.A{
					"_id",
					"username",
					"password",
					"wrapping_key_params",
					"wrapped_encryption_key",
				}},
				{Key: "properties", Value: bson.D{
					{Key: "username", Value: bson.D{
						{Key: "bsonType", Value: "string"},
						{Key: "pattern", Value: "^[a-z0-9_]{4,16}$"},
					}},
					{Key: "password", Value: bson.D{
						{Key: "bsonType", Value: "binData"},
					}},
					{Key: "wrapping_key_params", Value: bson.D{
						{Key: "bsonType", Value: "object"},
						{Key: "required", Value: bson.A{
							"salt",
							"iteration_count",
						}},
						{Key: "properties", Value: bson.D{
							{Key: "salt", Value: bson.D{
								{Key: "bsonType", Value: "binData"},
							}},
							{Key: "iteration_count", Value: bson.D{
								{Key: "bsonType", Value: "long"},
								{Key: "minimum", Value: 800_000},
								{Key: "maximum", Value: 900_000},
							}},
						}},
					}},
					{Key: "wrapped_encryption_key", Value: bson.D{
						{Key: "bsonType", Value: "object"},
						{Key: "required", Value: bson.A{
							"iv",
							"data",
						}},
						{Key: "properties", Value: bson.D{
							{Key: "iv", Value: bson.D{
								{Key: "bsonType", Value: "binData"},
							}},
							{Key: "data", Value: bson.D{
								{Key: "bsonType", Value: "binData"},
							}},
						}},
					}},
				}},
			}},
		}),
	)
	if err != nil {
		return fmt.Errorf("failed to create user collection: %s", err)
	}

	userColl := database.Collection(USER_COLLECTION)
	_, err = userColl.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "username", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("failed to create user collection's index: %s", err)
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

func InsertNewUser(ctx context.Context, user User) error {
	if client == nil {
		return fmt.Errorf("client isn't ready")
	}

	coll := client.Database(database).Collection(USER_COLLECTION)
	_, err := coll.InsertOne(ctx, user)
	if err != nil {
		return fmt.Errorf("failed to insert new user: %s", err)
	}

	return nil
}

func GetUser(ctx context.Context, username string, user *User) error {
	if client == nil {
		return fmt.Errorf("client isn't ready")
	}

	coll := client.Database(database).Collection(USER_COLLECTION)
	err := coll.FindOne(ctx, bson.D{{Key: "username", Value: username}}).Decode(&user)
	if err != nil {
		return fmt.Errorf("failed to find user: %s", err)
	}

	return nil
}
