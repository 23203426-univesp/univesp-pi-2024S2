import { EncryptionResult } from '@services/crypto/crypto.type';

// Request to register API
export interface RegisterRequest {
	readonly username: string;
	readonly password: string;
	// Data needed to remake the wrapping key
	readonly wrappingKeySalt: ArrayBuffer;
	readonly wrappingKeyIterationCount: number;
	// Needs to be unwrapped to be used
	readonly wrappedEncryptionKey: EncryptionResult;
};

// Response from register API
export interface RegisterResponse {
	readonly username: string;
	// Data needed to remake the wrapping key
	readonly wrappingKeySalt: ArrayBuffer;
	readonly wrappingKeyIterationCount: number;
	// Needs to be unwrapped to be used
	readonly wrappedEncryptionKey: EncryptionResult;
};

// Request to login API
export interface LogInRequest {
	readonly username: string;
	readonly password: string;
};

// Response from login API
export type LogInResponse = RegisterResponse;

// Logged-in user type
export interface LockedUser {
	readonly username: string;
	// Data needed to remake the wrapping key
	readonly wrappingKeySalt: ArrayBuffer;
	readonly wrappingKeyIterationCount: number;
	// Needs to be unwrapped to be used
	readonly wrappedEncryptionKey: EncryptionResult;
};

// Unlocked user type
export interface UnlockedUser extends LockedUser {
	readonly wrappingKey: CryptoKey;
};

export type UserType = UnlockedUser | LockedUser | undefined;
