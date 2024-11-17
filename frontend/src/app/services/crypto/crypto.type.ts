export interface EncryptedData {
	readonly iv: ArrayBuffer;
	readonly data: ArrayBuffer;
};

export interface Base64EncryptedData {
	readonly iv: string;
	readonly data: string;
};

export function isValidBase64EncryptedData(
	arg: unknown,
): arg is Base64EncryptedData {
	return !!arg
		&& typeof arg === 'object'
		&& 'iv' in arg && typeof arg.iv === 'string'
		&& 'data' in arg && typeof arg.data === 'string';
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

export function isValidBase64WrappingKeyParams(
	arg: unknown,
): arg is Base64WrappingKeyParams {
	return !!arg
		&& typeof arg === 'object'
		&& 'salt' in arg && typeof arg.salt === 'string'
		&& 'iterationCount' in arg && typeof arg.iterationCount === 'number';
};

// Keys generated for a new user
export interface GeneratedKeys {
	readonly wrappingKeyParams: Base64WrappingKeyParams;
	readonly wrappedEncryptionKey: Base64EncryptedData;
};
