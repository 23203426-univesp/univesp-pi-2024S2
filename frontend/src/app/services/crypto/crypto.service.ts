import { Injectable } from '@angular/core';
import {
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

	public async generateNewUserKeys(
		passphrase: string,
	): Promise<GeneratedKeys> {
		const wrappingKey = await deriveWrappingKeyFromPassphrase(passphrase);

		const encryptionKey = await generateKey(true, KeyTypes.ENCRYPTION_KEY);
		const wrappedEncryptionKey = await wrapKey(
			encryptionKey,
			wrappingKey.key,
		);

		return {
			wrappingKeyParams: wrappingKey.params,
			wrappedEncryptionKey: wrappedEncryptionKey,
		};
	}
}
