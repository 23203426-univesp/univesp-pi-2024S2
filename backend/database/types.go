package database

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TestDocument struct {
	ID   primitive.ObjectID `bson:"_id,omitempty"`
	Name string
	Age  uint32
}
