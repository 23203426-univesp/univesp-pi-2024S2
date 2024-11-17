import {
	Base64EncryptedData,
	Base64WrappingKeyParams,
	EncryptedData,
	isValidBase64EncryptedData,
	isValidBase64WrappingKeyParams,
	WrappingKeyParams,
} from '@services/crypto/crypto.type';

// Request to register API
export interface RegisterRequest {
	readonly username: string;
	// Password needs to be a base64-encoded string
	readonly password: string;
	// Data needed to remake the wrapping key
	readonly wrappingKeyParams: Base64WrappingKeyParams;
	// Needs to be unwrapped to be used
	readonly wrappedEncryptionKey: Base64EncryptedData;
};

// Response from register API
export interface RegisterResponse {
	readonly username: string;
	// Data needed to remake the wrapping key
	readonly wrappingKeyParams: Base64WrappingKeyParams;
	// Needs to be unwrapped to be used
	readonly wrappedEncryptionKey: Base64EncryptedData;
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
	readonly wrappingKeyParams: WrappingKeyParams;
	// Needs to be unwrapped to be used
	readonly wrappedEncryptionKey: EncryptedData;
};

// Unlocked user type
export interface UnlockedUser extends LockedUser {
	readonly wrappingKey: CryptoKey;
};

export type UserType = UnlockedUser | LockedUser | undefined;

export function isValidLoginResponse(arg: unknown): arg is RegisterResponse {
	return !!arg
		&& typeof arg === 'object'
		&& 'username' in arg && typeof arg.username === 'string'
		&& 'wrappingKeyParams' in arg
		&& isValidBase64WrappingKeyParams(arg.wrappingKeyParams)
		&& 'wrappedEncryptionKey' in arg
		&& isValidBase64EncryptedData(arg.wrappedEncryptionKey);
}
