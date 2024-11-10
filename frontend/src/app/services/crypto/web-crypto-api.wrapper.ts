import { EncryptedData, WrappingKeyParams } from './crypto.type';

enum KeyTypeEnum {
	ENCRYPTION_KEY = 'ENCRYPTION_KEY',
	WRAPPING_KEY = 'WRAPPING_KEY',
	DERIVING_KEY = 'DERIVING_KEY',
};

interface KeyType {
	keyUsages: KeyUsage[];
};

type IKeyType = {
	[key in KeyTypeEnum]: KeyType
};

export const KeyTypes: IKeyType = {
	[KeyTypeEnum.ENCRYPTION_KEY]: {
		keyUsages: ['encrypt', 'decrypt'],
	},
	[KeyTypeEnum.WRAPPING_KEY]: {
		keyUsages: ['wrapKey', 'unwrapKey'],
	},
	[KeyTypeEnum.DERIVING_KEY]: {
		keyUsages: ['deriveBits', 'deriveKey'],
	},
};

export interface WrappingKey {
	readonly params: WrappingKeyParams;
	readonly key: CryptoKey;
};

const BASE64_DATA_URL_PREFIX = 'data:application/octet-stream;base64,';

const TEXT_ENCODING = 'utf-8';
const TEXT_ENCODER = new TextEncoder();

const KEY_FORMAT = 'raw';

const PBKDF2_ALGORITHM = 'PBKDF2';
const PBKDF2_BASE_ITERATION_COUNT = 800_000;
const PBKDF2_ADDITIONAL_ITERATION_COUNT = 100_000;
const PBKDF2_HASH_ALGORITHM = 'SHA-256';
const PBKDF2_SALT_LENGTH = 32;

const AES_GCM_ALGORITHM = 'AES-GCM';
const AES_KEY_LENGTH = 256;
const AES_TAG_LENGTH = 128;

function validateBufferLength(buffer: BufferSource, expectedLength: number) {
	if (!buffer || buffer.byteLength !== expectedLength) {
		throw new Error(`Expected buffer of length ${expectedLength}, `
			+ `but got ${buffer.byteLength || buffer}.`);
	}
}

function validateTruthyBuffer(buffer: BufferSource) {
	if (!buffer || !buffer.byteLength) {
		throw new Error(`Expected buffer of any length, `
			+ `but got ${buffer.byteLength || buffer}`);
	}
}

function encodeTrimmedPassphrase(passphrase: string): Uint8Array {
	// Validates encoding is consistent between all environments
	if (TEXT_ENCODER.encoding !== TEXT_ENCODING) {
		throw new Error(`Expected '${TEXT_ENCODING}' for TextEncoder's `
			+ `encoding, but got '${TEXT_ENCODER.encoding}'.`);
	}
	// Trim and encode
	return TEXT_ENCODER.encode(passphrase.trim());
}

// eslint-disable-next-line @stylistic/max-len
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Window/btoa#converting_arbitrary_binary_data
function bytesToBase64DataUrl(
	buffer: BufferSource,
	type = 'application/octet-stream',
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = Object.assign(new FileReader(), {
			onload: () => {
				if (typeof reader.result === 'string') {
					resolve(reader.result);
				} else {
					reject(`typeof reader.result isn't a string: `
						+ `${typeof reader.result}`);
				}
			},
			onerror: () => reject(reader.error),
		});
		reader.readAsDataURL(new File([buffer], '', { type }));
	});
}

async function dataUrlToBytes(dataUrl: string) {
	const res = await fetch(dataUrl);
	return new Uint8Array(await res.arrayBuffer());
}

export async function bytesToBase64(buffer: BufferSource): Promise<string> {
	const dataUrl = await bytesToBase64DataUrl(buffer);
	if (!dataUrl.startsWith(BASE64_DATA_URL_PREFIX)) {
		throw new Error(`Base64 Data URL didn't start with the expected `
			+ `prefix: ${dataUrl.slice(0, BASE64_DATA_URL_PREFIX.length)}`);
	}
	return dataUrl.slice(BASE64_DATA_URL_PREFIX.length);
}

export function base64ToBytes(base64: string) {
	return dataUrlToBytes(BASE64_DATA_URL_PREFIX + base64);
}

export async function generateKey(
	extractable: boolean,
	keyType: KeyType,
): Promise<CryptoKey> {
	return await crypto.subtle.generateKey(
		{
			name: AES_GCM_ALGORITHM,
			length: AES_KEY_LENGTH,
		},
		extractable,
		keyType.keyUsages,
	);
};

function getIterationCount(): number {
	return PBKDF2_BASE_ITERATION_COUNT + Math.floor(
		Math.random() * PBKDF2_ADDITIONAL_ITERATION_COUNT,
	);
}

export async function deriveWrappingKeyFromPassphrase(
	passphrase: string,
	salt: ArrayBuffer
	= crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LENGTH)),
	iterationCount: number = getIterationCount(),
): Promise<WrappingKey> {
	const encodedPassphrase = encodeTrimmedPassphrase(passphrase);

	// Import the key from password to be used to derive the wrapping key
	const derivingKey = await crypto.subtle.importKey(
		KEY_FORMAT,
		encodedPassphrase,
		// Derives a key from password
		PBKDF2_ALGORITHM,
		// Key from password shouldn't need to be exported
		false,
		// Always used as a deriving key
		KeyTypes.DERIVING_KEY.keyUsages,
	);

	// Generate the wrapping key
	const wrappingKey = await crypto.subtle.deriveKey(
		{
			name: PBKDF2_ALGORITHM,
			salt: salt,
			iterations: iterationCount,
			hash: PBKDF2_HASH_ALGORITHM,
		},
		derivingKey,
		{
			name: AES_GCM_ALGORITHM,
			length: AES_KEY_LENGTH,
		},
		// Key from password shouldn't need to be exported
		false,
		// Always used as a wrapping key
		KeyTypes.WRAPPING_KEY.keyUsages,
	);

	return {
		params: {
			salt: salt,
			iterationCount: iterationCount,
		},
		key: wrappingKey,
	};
};

export async function importKey(
	rawKey: BufferSource,
	extractable: boolean,
	keyType: KeyType,
): Promise<CryptoKey> {
	return await crypto.subtle.importKey(
		KEY_FORMAT,
		rawKey,
		{
			name: AES_GCM_ALGORITHM,
			length: AES_KEY_LENGTH,
		},
		extractable,
		keyType.keyUsages,
	);
};

export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
	return await crypto.subtle.exportKey(KEY_FORMAT, key);
};

export async function wrapKey(
	keyToWrap: CryptoKey,
	wrappingKey: CryptoKey,
): Promise<EncryptedData> {
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const rawWrappedKey = await crypto.subtle.wrapKey(
		KEY_FORMAT,
		keyToWrap,
		wrappingKey,
		{
			name: AES_GCM_ALGORITHM,
			iv: iv,
			tagLength: AES_TAG_LENGTH,
		},
	);
	validateTruthyBuffer(rawWrappedKey);

	return {
		iv: iv,
		data: rawWrappedKey,
	};
};

export async function unwrapKey(
	wrappedKey: BufferSource,
	wrappingKey: CryptoKey,
	iv: BufferSource,
	extractable: boolean,
	keyType: KeyType,
): Promise<CryptoKey> {
	validateBufferLength(iv, 12);

	return await crypto.subtle.unwrapKey(
		KEY_FORMAT,
		wrappedKey,
		wrappingKey,
		// Unwrapping parameters
		{
			name: AES_GCM_ALGORITHM,
			iv: iv,
			tagLength: AES_TAG_LENGTH,
		},
		// Unwrapped key parameters
		{
			name: AES_GCM_ALGORITHM,
			length: AES_KEY_LENGTH,
		},
		extractable,
		keyType.keyUsages,
	);
};

export async function encrypt(
	key: CryptoKey,
	data: BufferSource,
): Promise<EncryptedData> {
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const rawEncryptedData = await crypto.subtle.encrypt(
		{
			name: AES_GCM_ALGORITHM,
			iv: iv,
			tagLength: AES_TAG_LENGTH,
		},
		key,
		data,
	);
	validateTruthyBuffer(rawEncryptedData);

	return {
		iv: iv,
		data: rawEncryptedData,
	};
};

export async function decrypt(
	key: CryptoKey,
	iv: BufferSource,
	encryptedData: BufferSource,
): Promise<ArrayBuffer> {
	validateBufferLength(iv, 12);

	return await crypto.subtle.decrypt(
		{
			name: AES_GCM_ALGORITHM,
			iv: iv,
			tagLength: AES_TAG_LENGTH,
		},
		key,
		encryptedData,
	);
};
