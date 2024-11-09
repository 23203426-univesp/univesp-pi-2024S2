import { EncryptionResult } from '@services/crypto/crypto.type';

// Request to register API
export interface RegisterRequest {
	readonly username: string;
	readonly password: string;
	// Exported wrapping key
	readonly wrappingKeyData: ArrayBuffer;
	// Needs to be unwrapped to be used (requires user's passphrase)
	readonly encryptionKey: EncryptionResult;
};

// Response from register API
export interface RegisterResponse {
	readonly username: string;
	// Exported wrapping key
	readonly wrappingKeyData: ArrayBuffer;
	// Needs to be unwrapped to be used (requires user's passphrase)
	readonly encryptionKey: EncryptionResult;
};

// Request to login API
export interface LogInRequest {
	readonly username: string;
	readonly password: string;
};

// Response from login API
export type LogInResponse = RegisterResponse;

// Logged-in user type
export interface User {
	readonly username: string;
	// Imported wrapping key for the encryption key
	readonly wrappingKey: CryptoKey;
	// Needs to be unwrapped to be used (requires user's passphrase)
	readonly encryptionKey: EncryptionResult;
};

export type UserType = User | undefined;
