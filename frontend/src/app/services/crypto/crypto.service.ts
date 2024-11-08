import { Injectable } from '@angular/core';
import { EncryptionResult, KeyType } from './crypto.type';

/**
 * Provides cryptographic operations
 *
 * Encryption key is used for data encryption. It should NOT be stored 'as is'
 * in the backend. It is wrapped by another key with an user's passphrase.
 *
 * This other key
 */
@Injectable({
	providedIn: 'root',
})
export class CryptoService {
	private readonly ALGORITHM = 'AES-GCM';
	private readonly KEY_LENGTH = 256;
	private readonly TAG_LENGTH = 128;

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
				name: this.ALGORITHM,
				length: this.KEY_LENGTH,
			},
			extractable,
			keyType.keyUsages,
		);
	}

	public async importKey(
		rawKey: BufferSource,
		extractable: boolean,
		keyType: KeyType,
	): Promise<CryptoKey> {
		return await crypto.subtle.importKey(
			'raw',
			rawKey,
			{
				name: this.ALGORITHM,
				length: this.KEY_LENGTH,
			},
			extractable,
			keyType.keyUsages,
		);
	}

	public async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
		return await crypto.subtle.exportKey('raw', key);
	}

	public async wrapKey(
		keyToWrap: CryptoKey,
		wrappingKey: CryptoKey,
		passphrase: string,
	): Promise<EncryptionResult> {
		const additionalData = this.encodeTrimmedPassphrase(passphrase);
		const iv = crypto.getRandomValues(new Uint8Array(12));

		const rawWrappedKey = await crypto.subtle.wrapKey(
			'raw',
			keyToWrap,
			wrappingKey,
			{
				name: this.ALGORITHM,
				iv: iv,
				additionalData: additionalData,
				tagLength: this.TAG_LENGTH,
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
		passphrase: string,
		extractable: boolean,
		keyType: KeyType,
	): Promise<CryptoKey> {
		const additionalData = this.encodeTrimmedPassphrase(passphrase);
		this.validateBufferLength(iv, 12);

		return await crypto.subtle.unwrapKey(
			'raw',
			wrappedKey,
			wrappingKey,
			// Unwrapping parameters
			{
				name: this.ALGORITHM,
				iv: iv,
				additionalData: additionalData,
				tagLength: this.TAG_LENGTH,
			},
			// Unwrapped key parameters
			{
				name: this.ALGORITHM,
				length: this.KEY_LENGTH,
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
				name: this.ALGORITHM,
				iv: iv,
				tagLength: this.TAG_LENGTH,
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
				name: this.ALGORITHM,
				iv: iv,
				tagLength: this.TAG_LENGTH,
			},
			key,
			encryptedData,
		);
	}
}
