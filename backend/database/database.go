package database

import (
	"context"
	"encoding/json"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type TestDocument struct {
	ID   primitive.ObjectID `bson:"_id,omitempty"`
	Name string
	Age  int32
}

func Init() {
	// Get MongoDB URI
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		log.Fatal("Set your 'MONGODB_URI' environment variable.")
	}

	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(uri))
	if err != nil {
		panic(err)
	}

	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()

	testEntry := TestDocument{Name: "nome", Age: 31}

	coll := client.Database("psico").Collection("test")

	_, err = coll.InsertOne(context.TODO(), testEntry)
	if err != nil {
		panic(err)
	}

	cursor, err := coll.Find(context.TODO(), bson.D{{Key: "name", Value: "nome"}})
	if err != nil {
		panic(err)
	}

	var results []TestDocument
	err = cursor.All(context.TODO(), &results)
	if err != nil {
		panic(err)
	}

	for _, result  := range results {
		resultJson, err := json.Marshal(result)
		if err != nil {
			panic(err)
		}
		log.Printf("%s\n", resultJson)
	}
	// title := "Back to the Future"
	// var result bson.M
	// err = coll.FindOne(context.TODO(), bson.D{{"title", title}}).
	// 	Decode(&result)
	// if err == mongo.ErrNoDocuments {
	// 	fmt.Printf("No document was found with the title %s\n", title)
	// 	return
	// }
	// if err != nil {
	// 	panic(err)
	// }
	// jsonData, err := json.MarshalIndent(result, "", "    ")
	// if err != nil {
	// 	panic(err)
	// }
	// fmt.Printf("%s\n", jsonData)
}
