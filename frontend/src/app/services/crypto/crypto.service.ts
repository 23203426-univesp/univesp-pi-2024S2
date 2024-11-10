import { Injectable } from '@angular/core';
import {
	EncryptionResult,
	KeyType,
	KeyTypes,
	DerivedWrappingKey,
} from './crypto.type';

/**
 * Wrapper for cryptographic operations
 *
 * Encryption key is used for data encryption. It should NOT be stored 'as is'
 * in the backend. It is wrapped by another key, the wrapping key, that is
 * derived from an user's passphrase.
 *
 * The wrapping key isn't stored in the backend, but its salt is random and must
 * be stored along the iteration count in order to be derived again.
 */
@Injectable({
	providedIn: 'root',
})
export class CryptoService {
	private readonly KEY_FORMAT = 'raw';

	private readonly PBKDF2_ALGORITHM = 'PBKDF2';
	private readonly PBKDF2_BASE_ITERATION_COUNT = 800_000;
	private readonly PBKDF2_ADDITIONAL_ITERATION_COUNT = 100_000;
	private readonly PBKDF2_HASH_ALGORITHM = 'SHA-256';
	private readonly PBKDF2_SALT_LENGTH = 32;

	private readonly AES_GCM_ALGORITHM = 'AES-GCM';
	private readonly AES_KEY_LENGTH = 256;
	private readonly AES_TAG_LENGTH = 128;

	private readonly TEXT_ENCODER: TextEncoder;

	constructor() {
		// Should use UTF-8 by default, there is no param at this time
		this.TEXT_ENCODER = new TextEncoder();
	}

	private encodeTrimmedPassphrase(passphrase: string): Uint8Array {
		// Validates encoding is consistent between all environments
		if (this.TEXT_ENCODER.encoding !== 'utf-8') {
			throw new Error(`Expected 'utf-8' for TextEncoder's encoding, `
				+ `but got '${this.TEXT_ENCODER.encoding}'.`);
		}
		// Trim and encode
		return this.TEXT_ENCODER.encode(passphrase.trim());
	}

	private validateBufferLength(buffer: BufferSource, expectedLength: number) {
		if (buffer.byteLength !== expectedLength) {
			throw new Error(`Expected buffer of size ${expectedLength}, `
				+ `but got ${buffer.byteLength}.`);
		}
	}

	public async generateKey(
		extractable: boolean,
		keyType: KeyType,
	): Promise<CryptoKey> {
		return await crypto.subtle.generateKey(
			{
				name: this.AES_GCM_ALGORITHM,
				length: this.AES_KEY_LENGTH,
			},
			extractable,
			keyType.keyUsages,
		);
	}

	private getIterationCount(): number {
		return this.PBKDF2_BASE_ITERATION_COUNT + Math.floor(
			Math.random() * this.PBKDF2_ADDITIONAL_ITERATION_COUNT,
		);
	}

	public async deriveWrappingKeyFromPassphrase(
		passphrase: string,
		salt: ArrayBuffer
		= crypto.getRandomValues(new Uint8Array(this.PBKDF2_SALT_LENGTH)),
		iterationCount: number = this.getIterationCount(),
	): Promise<DerivedWrappingKey> {
		const encodedPassphrase = this.encodeTrimmedPassphrase(passphrase);

		// Import the key from password to be used to derive the wrapping key
		const derivingKey = await crypto.subtle.importKey(
			this.KEY_FORMAT,
			encodedPassphrase,
			// Derives a key from password
			this.PBKDF2_ALGORITHM,
			// Key from password shouldn't need to be exported
			false,
			// Always used as a deriving key
			KeyTypes.DERIVING_KEY.keyUsages,
		);

		// Generate the wrapping key
		const wrappingKey = await crypto.subtle.deriveKey(
			{
				name: this.PBKDF2_ALGORITHM,
				salt: salt,
				iterations: iterationCount,
				hash: this.PBKDF2_HASH_ALGORITHM,
			},
			derivingKey,
			{
				name: this.AES_GCM_ALGORITHM,
				length: this.AES_KEY_LENGTH,
			},
			// Key from password shouldn't need to be exported
			false,
			// Always used as a wrapping key
			KeyTypes.WRAPPING_KEY.keyUsages,
		);

		return {
			iterationCount: iterationCount,
			salt: salt,
			wrappingKey: wrappingKey,
		};
	}

	public async importKey(
		rawKey: BufferSource,
		extractable: boolean,
		keyType: KeyType,
	): Promise<CryptoKey> {
		return await crypto.subtle.importKey(
			this.KEY_FORMAT,
			rawKey,
			{
				name: this.AES_GCM_ALGORITHM,
				length: this.AES_KEY_LENGTH,
			},
			extractable,
			keyType.keyUsages,
		);
	}

	public async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
		return await crypto.subtle.exportKey(this.KEY_FORMAT, key);
	}

	public async wrapKey(
		keyToWrap: CryptoKey,
		wrappingKey: CryptoKey,
	): Promise<EncryptionResult> {
		const iv = crypto.getRandomValues(new Uint8Array(12));

		const rawWrappedKey = await crypto.subtle.wrapKey(
			this.KEY_FORMAT,
			keyToWrap,
			wrappingKey,
			{
				name: this.AES_GCM_ALGORITHM,
				iv: iv,
				tagLength: this.AES_TAG_LENGTH,
			},
		);

		return {
			iv: iv,
			data: rawWrappedKey,
		};
	}

	public async unwrapKey(
		wrappedKey: BufferSource,
		wrappingKey: CryptoKey,
		iv: BufferSource,
		extractable: boolean,
		keyType: KeyType,
	): Promise<CryptoKey> {
		this.validateBufferLength(iv, 12);

		return await crypto.subtle.unwrapKey(
			this.KEY_FORMAT,
			wrappedKey,
			wrappingKey,
			// Unwrapping parameters
			{
				name: this.AES_GCM_ALGORITHM,
				iv: iv,
				tagLength: this.AES_TAG_LENGTH,
			},
			// Unwrapped key parameters
			{
				name: this.AES_GCM_ALGORITHM,
				length: this.AES_KEY_LENGTH,
			},
			extractable,
			keyType.keyUsages,
		);
	}

	public async encrypt(
		key: CryptoKey,
		data: BufferSource,
	): Promise<EncryptionResult> {
		const iv = crypto.getRandomValues(new Uint8Array(12));

		const rawEncryptedData = await crypto.subtle.encrypt(
			{
				name: this.AES_GCM_ALGORITHM,
				iv: iv,
				tagLength: this.AES_TAG_LENGTH,
			},
			key,
			data,
		);

		return {
			iv: iv,
			data: rawEncryptedData,
		};
	}

	public async decrypt(
		key: CryptoKey,
		iv: BufferSource,
		encryptedData: BufferSource,
	): Promise<ArrayBuffer> {
		this.validateBufferLength(iv, 12);

		return await crypto.subtle.decrypt(
			{
				name: this.AES_GCM_ALGORITHM,
				iv: iv,
				tagLength: this.AES_TAG_LENGTH,
			},
			key,
			encryptedData,
		);
	}
}
