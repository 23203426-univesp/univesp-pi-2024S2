package router

type RegisterRequest struct {
	Username             string            `json:"username" binding:"required"`
	Password             []byte            `json:"password" binding:"required"`
	WrappingKeyParams    WrappingKeyParams `json:"wrappingKeyParams" binding:"required"`
	WrappedEncryptionKey EncryptedData     `json:"wrappedEncryptionKey" binding:"required"`
}

type WrappingKeyParams struct {
	Salt           []byte `json:"salt" binding:"required"`
	IterationCount uint64 `json:"iterationCount" binding:"required"`
}

type EncryptedData struct {
	Iv   []byte `json:"iv" binding:"required"`
	Data []byte `json:"data" binding:"required"`
}
