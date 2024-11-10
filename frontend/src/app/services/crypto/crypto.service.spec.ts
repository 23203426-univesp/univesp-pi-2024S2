import { TestBed } from '@angular/core/testing';

import { CryptoService } from './crypto.service';
import { KeyTypes } from './crypto.type';

describe('CryptoService', () => {
	let service: CryptoService;
	const ENCRYPTED_DATA_LENGTH = 4096;
	const USER_PASSPHRASE = 'passphrase_shouldBe!S3CURE;';
	const WRONG_USER_PASSPHRASE = 'passphrase_shouldBe!S3CURe;';

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CryptoService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should derive from passphrase, wrap and unwrap keys', async () => {
		// We import the wrapping key
		const wrappingKeyResult
		= await service.deriveWrappingKeyFromPassphrase(USER_PASSPHRASE);
		expect(wrappingKeyResult).toBeTruthy();
		const wrappingKey = wrappingKeyResult.wrappingKey;
		expect(wrappingKey).toBeTruthy();

		// Generate the encryption key (wrapping requires 'extractable' flag)
		const encryptionKey = await service.generateKey(
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(encryptionKey).toBeTruthy();

		// Export encryption key (for comparison)
		const rawEncryptionKey = await service.exportKey(encryptionKey);
		expect(rawEncryptionKey).toBeTruthy();
		expect(rawEncryptionKey.byteLength).toBeGreaterThan(0);

		// Wrap encryption key
		const wrappedKeyData = await service.wrapKey(
			encryptionKey,
			wrappingKey,
		);
		expect(wrappedKeyData).toBeTruthy();
		expect(wrappedKeyData.iv).toBeTruthy();
		expect(wrappedKeyData.iv.byteLength).toBeGreaterThan(0);
		expect(wrappedKeyData.data).toBeTruthy();
		expect(wrappedKeyData.data.byteLength).toBeGreaterThan(0);

		// Unwrap encrypted key
		const unwrappedKey = await service.unwrapKey(
			wrappedKeyData.data,
			wrappingKey,
			wrappedKeyData.iv,
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(unwrappedKey).toBeTruthy();

		// Export unwrapped encryption key
		const rawUnwrappedKey = await service.exportKey(unwrappedKey);
		expect(rawUnwrappedKey).toBeTruthy();
		expect(rawUnwrappedKey.byteLength).toBeGreaterThan(0);

		// Compare unwrapped encryption key with original exported key
		expect(new Uint8Array(rawUnwrappedKey))
			.toEqual(new Uint8Array(rawEncryptionKey));
	});

	it('should fail to unwrap key on wrong passphrase', async () => {
		// We import the correct wrapping key
		const wrappingKeyResult
		= await service.deriveWrappingKeyFromPassphrase(USER_PASSPHRASE);
		expect(wrappingKeyResult).toBeTruthy();
		const wrappingKey = wrappingKeyResult.wrappingKey;
		expect(wrappingKey).toBeTruthy();

		// Generate the encryption key (wrapping requires 'extractable' flag)
		const encryptionKey = await service.generateKey(
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(encryptionKey).toBeTruthy();

		// Wrap encryption key
		const wrappedKeyData = await service.wrapKey(
			encryptionKey,
			wrappingKey,
		);
		expect(wrappedKeyData).toBeTruthy();
		expect(wrappedKeyData.iv).toBeTruthy();
		expect(wrappedKeyData.iv.byteLength).toBeGreaterThan(0);
		expect(wrappedKeyData.data).toBeTruthy();
		expect(wrappedKeyData.data.byteLength).toBeGreaterThan(0);

		// We import the wrong wrapping key
		const wrongWrappingKeyResult
		= await service.deriveWrappingKeyFromPassphrase(WRONG_USER_PASSPHRASE);
		expect(wrongWrappingKeyResult).toBeTruthy();
		const wrongWrappingKey = wrongWrappingKeyResult.wrappingKey;
		expect(wrongWrappingKey).toBeTruthy();

		// Try to unwrap encrypted key with the wrong wrapping key, should fail
		const unwrappingKeyPromise = (async () => await service.unwrapKey(
			wrappedKeyData.data,
			wrongWrappingKey,
			wrappedKeyData.iv,
			true,
			KeyTypes.ENCRYPTION_KEY,
		))();
		await expectAsync(unwrappingKeyPromise).toBeRejected();
	});

	it('should encrypt and decrypt data', async () => {
		// Generate encryption key for test
		const key = await service.generateKey(false, KeyTypes.ENCRYPTION_KEY);
		expect(key).toBeTruthy();

		// Generate data to be encrypted
		const rawData
		= crypto.getRandomValues(new Uint8Array(ENCRYPTED_DATA_LENGTH));
		expect(rawData).toBeTruthy();
		expect(rawData.byteLength).toEqual(ENCRYPTED_DATA_LENGTH);

		// Encrypt data
		const encryptedData = await service.encrypt(key, rawData);
		expect(encryptedData).toBeTruthy();
		expect(encryptedData.iv).toBeTruthy();
		expect(encryptedData.iv.byteLength).toBeGreaterThan(0);
		expect(encryptedData.data).toBeTruthy();
		expect(encryptedData.data.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(encryptedData.data))
			.not.toEqual(new Uint8Array(rawData));

		// Decrypt data
		const decryptedData = await service.decrypt(
			key,
			encryptedData.iv,
			encryptedData.data,
		);
		expect(decryptedData).toBeTruthy();
		expect(decryptedData.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(decryptedData)).toEqual(new Uint8Array(rawData));
	});

	it('should fail decryption if invalid key', async () => {
		// Generate encryption key
		const encryptionKey = await service.generateKey(
			false,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(encryptionKey).toBeTruthy();

		// Generate data to be encrypted
		const rawData
		= crypto.getRandomValues(new Uint8Array(ENCRYPTED_DATA_LENGTH));
		expect(rawData).toBeTruthy();
		expect(rawData.byteLength).toEqual(ENCRYPTED_DATA_LENGTH);

		// Encrypt data
		const encryptedData = await service.encrypt(encryptionKey, rawData);
		expect(encryptedData).toBeTruthy();
		expect(encryptedData.iv).toBeTruthy();
		expect(encryptedData.iv.byteLength).toBeGreaterThan(0);
		expect(encryptedData.data).toBeTruthy();
		expect(encryptedData.data.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(encryptedData.data))
			.not.toEqual(new Uint8Array(rawData));

		// Generate another different key for decryption
		const wrongKey = await service.generateKey(
			false,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(wrongKey).toBeTruthy();

		// Try to decrypt data
		const decryptionPromise = (async () => await service.decrypt(
			wrongKey,
			encryptedData.iv,
			encryptedData.data,
		))();
		await expectAsync(decryptionPromise).toBeRejected();
	});

	it('should encrypt into different data every time', async () => {
		// Generate encryption key
		const encryptionKey = await service.generateKey(
			false,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(encryptionKey).toBeTruthy();

		// Generate data to be encrypted
		const rawData
		= crypto.getRandomValues(new Uint8Array(ENCRYPTED_DATA_LENGTH));
		expect(rawData).toBeTruthy();
		expect(rawData.byteLength).toEqual(ENCRYPTED_DATA_LENGTH);

		// Encrypt the first time
		const firstEncryptionData = await service.encrypt(
			encryptionKey,
			rawData,
		);
		expect(firstEncryptionData).toBeTruthy();
		expect(firstEncryptionData.iv).toBeTruthy();
		expect(firstEncryptionData.iv.byteLength).toBeGreaterThan(0);
		expect(firstEncryptionData.data).toBeTruthy();
		expect(firstEncryptionData.data.byteLength).toBeGreaterThan(0);

		// Encrypt the second time
		const secondEncryptionData = await service.encrypt(
			encryptionKey,
			rawData,
		);
		expect(secondEncryptionData).toBeTruthy();
		expect(secondEncryptionData.iv).toBeTruthy();
		expect(secondEncryptionData.iv.byteLength).toBeGreaterThan(0);
		expect(secondEncryptionData.data).toBeTruthy();
		expect(secondEncryptionData.data.byteLength).toBeGreaterThan(0);

		// Shouldn't be the same data nor same iv
		expect(new Uint8Array(secondEncryptionData.data))
			.not.toEqual(new Uint8Array(firstEncryptionData.data));
		expect(new Uint8Array(secondEncryptionData.iv))
			.not.toEqual(new Uint8Array(firstEncryptionData.iv));
	});
});
