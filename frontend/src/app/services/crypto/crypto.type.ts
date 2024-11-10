export interface EncryptedData {
	readonly iv: ArrayBuffer;
	readonly data: ArrayBuffer;
};

// Data required to make the wrapping key
export interface WrappingKeyParams {
	readonly salt: ArrayBuffer;
	readonly iterationCount: number;
};

// Keys generated for a new user
export interface GeneratedKeys {
	readonly wrappingKeyParams: WrappingKeyParams;
	readonly wrappedEncryptionKey: EncryptedData;
};
