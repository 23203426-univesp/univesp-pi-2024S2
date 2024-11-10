import { Injectable } from '@angular/core';
import {
	bytesToBase64,
	deriveWrappingKeyFromPassphrase,
	generateKey,
	KeyTypes,
	wrapKey,
} from './web-crypto-api.wrapper';
import { GeneratedKeys } from './crypto.type';

/**
 * Cryptographic operations services
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
	constructor() {
		if (!crypto || !crypto.subtle) {
			throw new Error(`Web Crypto API is not available!`);
		}
	}

	private async sha256(buffer: BufferSource) {
		const digest = await crypto.subtle.digest('SHA-256', buffer);
		return Array.from(new Uint8Array(digest))
			.map(item => item.toString(16).padStart(2, '0'))
			.join('');
	}

	public async generateNewUserKeys(
		passphrase: string,
	): Promise<GeneratedKeys> {
		const wrappingKey = await deriveWrappingKeyFromPassphrase(passphrase);

		const encryptionKey = await generateKey(true, KeyTypes.ENCRYPTION_KEY);
		const wrappedEncryptionKey = await wrapKey(
			encryptionKey,
			wrappingKey.key,
		);
		console.log(
			'wrappingKey.params.salt: ',
			await this.sha256(wrappingKey.params.salt),
		);
		console.log(
			'wrappedEncryptionKey.iv: ',
			await this.sha256(wrappedEncryptionKey.iv),
		);
		console.log(
			'wrappedEncryptionKey.data: ',
			await this.sha256(wrappedEncryptionKey.data),
		);

		return {
			wrappingKeyParams: {
				salt: await bytesToBase64(wrappingKey.params.salt),
				iterationCount: wrappingKey.params.iterationCount,
			},
			wrappedEncryptionKey: {
				iv: await bytesToBase64(wrappedEncryptionKey.iv),
				data: await bytesToBase64(wrappedEncryptionKey.data),
			},
		};
	}
}
