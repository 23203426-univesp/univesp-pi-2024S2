export interface EncryptedData {
	readonly iv: ArrayBuffer;
	readonly data: ArrayBuffer;
};

export interface Base64EncryptedData {
	readonly iv: string;
	readonly data: string;
};

// Data required to make the wrapping key
export interface WrappingKeyParams {
	readonly salt: ArrayBuffer;
	readonly iterationCount: number;
};

export interface Base64WrappingKeyParams {
	readonly salt: string;
	readonly iterationCount: number;
};

// Keys generated for a new user
export interface GeneratedKeys {
	readonly wrappingKeyParams: Base64WrappingKeyParams;
	readonly wrappedEncryptionKey: Base64EncryptedData;
};
