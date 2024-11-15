package database

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                   primitive.ObjectID `bson:"_id,omitempty"`
	Username             string
	Password             []byte
	WrappingKeyParams    WrappingKeyParams `bson:"wrapping_key_params"`
	WrappedEncryptionKey EncryptedData     `bson:"wrapped_encryption_key"`
}

type WrappingKeyParams struct {
	Salt           [32]byte
	IterationCount uint64 `bson:"iteration_count"`
}

type EncryptedData struct {
	Iv   [12]byte
	Data []byte
}
