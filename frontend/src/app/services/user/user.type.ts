import { EncryptedData, WrappingKeyParams } from '@services/crypto/crypto.type';

// Request to register API
export interface RegisterRequest {
	readonly username: string;
	readonly password: string;
	// Data needed to remake the wrapping key
	readonly passphraseKey: WrappingKeyParams;
	// Needs to be unwrapped to be used
	readonly wrappedEncryptionKey: EncryptedData;
};

// Response from register API
export interface RegisterResponse {
	readonly username: string;
	// Data needed to remake the wrapping key
	readonly passphraseKey: WrappingKeyParams;
	// Needs to be unwrapped to be used
	readonly wrappedEncryptionKey: EncryptedData;
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
	readonly passphraseKey: WrappingKeyParams;
	// Needs to be unwrapped to be used
	readonly wrappedEncryptionKey: EncryptedData;
};

// Unlocked user type
export interface UnlockedUser extends LockedUser {
	readonly wrappingKey: CryptoKey;
};

export type UserType = UnlockedUser | LockedUser | undefined;
