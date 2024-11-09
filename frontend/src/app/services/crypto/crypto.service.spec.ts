import { TestBed } from '@angular/core/testing';

import { CryptoService } from './crypto.service';
import { KeyTypes } from './crypto.type';

describe('CryptoService', () => {
	let service: CryptoService;
	const DATA_LENGTH = 4096;
	const WRAPPING_SECRET = 'passphrase_shouldBe!S3CURE;';
	const WRONG_WRAPPING_SECRET = 'passphrase_shouldBe!S3CURI;';

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CryptoService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should generate, export and import keys', async () => {
		// Generally, we will import just wrapping keys
		// (encryption keys will be only unwrapped)
		const key = await service.generateKey(
			true,
			KeyTypes.WRAPPING_KEY,
		);
		expect(key).toBeTruthy();

		const rawKey = await service.exportKey(key);
		expect(rawKey).toBeTruthy();
		expect(rawKey.byteLength).toBeGreaterThan(0);

		const importedKey = await service.importKey(
			rawKey,
			true,
			KeyTypes.WRAPPING_KEY,
		);
		expect(importedKey).toBeTruthy();

		const rawImportedKey = await service.exportKey(key);
		expect(rawImportedKey).toBeTruthy();
		expect(rawImportedKey.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(rawImportedKey))
			.toEqual(new Uint8Array(rawKey));
	});

	it('should wrap and unwrap keys', async () => {
		const wrappingKey = await service.generateKey(
			false,
			KeyTypes.WRAPPING_KEY,
		);
		expect(wrappingKey).toBeTruthy();

		// Wrapping requires 'extractable' flag
		const key = await service.generateKey(
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(key).toBeTruthy();

		const rawKey = await service.exportKey(key);
		expect(rawKey).toBeTruthy();
		expect(rawKey.byteLength).toBeGreaterThan(0);

		const wrappedKeyData = await service.wrapKey(
			key,
			wrappingKey,
			WRAPPING_SECRET,
		);
		expect(wrappedKeyData).toBeTruthy();
		expect(wrappedKeyData.iv).toBeTruthy();
		expect(wrappedKeyData.iv.byteLength).toBeGreaterThan(0);
		expect(wrappedKeyData.data).toBeTruthy();
		expect(wrappedKeyData.data.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(wrappedKeyData.data))
			.not.toEqual(new Uint8Array(rawKey));

		const unwrappedKey = await service.unwrapKey(
			wrappedKeyData.data,
			wrappingKey,
			wrappedKeyData.iv,
			WRAPPING_SECRET,
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(unwrappedKey).toBeTruthy();

		const rawUnwrappedKey = await service.exportKey(unwrappedKey);
		expect(rawUnwrappedKey).toBeTruthy();
		expect(rawUnwrappedKey.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(rawUnwrappedKey))
			.toEqual(new Uint8Array(rawKey));
	});

	it('should fail key unwrapping if invalid passphrase', async () => {
		const wrappingKey = await service.generateKey(
			false,
			KeyTypes.WRAPPING_KEY,
		);
		expect(wrappingKey).toBeTruthy();

		const key = await service.generateKey(
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(key).toBeTruthy();

		const rawKey = await service.exportKey(key);
		expect(rawKey).toBeTruthy();
		expect(rawKey.byteLength).toBeGreaterThan(0);

		const wrappedKeyData = await service.wrapKey(
			key,
			wrappingKey,
			WRAPPING_SECRET,
		);
		expect(wrappedKeyData).toBeTruthy();
		expect(wrappedKeyData.iv).toBeTruthy();
		expect(wrappedKeyData.iv.byteLength).toBeGreaterThan(0);
		expect(wrappedKeyData.data).toBeTruthy();
		expect(wrappedKeyData.data.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(wrappedKeyData.data))
			.not.toEqual(new Uint8Array(rawKey));

		const invalidPassphrasePromise = (async () => await service.unwrapKey(
			wrappedKeyData.data,
			wrappingKey,
			wrappedKeyData.iv,
			WRONG_WRAPPING_SECRET,
			true,
			KeyTypes.ENCRYPTION_KEY,
		))();
		await expectAsync(invalidPassphrasePromise).toBeRejected();
	});

	it('should encrypt and decrypt data', async () => {
		const key = await service.generateKey(false, KeyTypes.ENCRYPTION_KEY);
		expect(key).toBeTruthy();

		const rawData = crypto.getRandomValues(new Uint8Array(DATA_LENGTH));
		expect(rawData).toBeTruthy();
		expect(rawData.byteLength).toEqual(DATA_LENGTH);

		const encryptedData = await service.encrypt(key, rawData);
		expect(encryptedData).toBeTruthy();
		expect(encryptedData.iv).toBeTruthy();
		expect(encryptedData.iv.byteLength).toBeGreaterThan(0);
		expect(encryptedData.data).toBeTruthy();
		expect(encryptedData.data.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(encryptedData.data))
			.not.toEqual(new Uint8Array(rawData));

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
		const encryptionKey = await service.generateKey(
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(encryptionKey).toBeTruthy();

		const wrongKey = await service.generateKey(
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(wrongKey).toBeTruthy();

		const rawData = crypto.getRandomValues(new Uint8Array(DATA_LENGTH));
		expect(rawData).toBeTruthy();
		expect(rawData.byteLength).toEqual(DATA_LENGTH);

		const encryptedData = await service.encrypt(encryptionKey, rawData);
		expect(encryptedData).toBeTruthy();
		expect(encryptedData.iv).toBeTruthy();
		expect(encryptedData.iv.byteLength).toBeGreaterThan(0);
		expect(encryptedData.data).toBeTruthy();
		expect(encryptedData.data.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(encryptedData.data))
			.not.toEqual(new Uint8Array(rawData));

		const decryptionPromise = (async () => await service.decrypt(
			wrongKey,
			encryptedData.iv,
			encryptedData.data,
		))();
		await expectAsync(decryptionPromise).toBeRejected();
	});

	it('should encrypt into different data every time', async () => {
		const encryptionKey = await service.generateKey(
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		expect(encryptionKey).toBeTruthy();

		const rawData = crypto.getRandomValues(new Uint8Array(DATA_LENGTH));
		expect(rawData).toBeTruthy();
		expect(rawData.byteLength).toEqual(DATA_LENGTH);

		const firstEncryptionData = await service.encrypt(
			encryptionKey,
			rawData,
		);
		expect(firstEncryptionData).toBeTruthy();
		expect(firstEncryptionData.iv).toBeTruthy();
		expect(firstEncryptionData.iv.byteLength).toBeGreaterThan(0);
		expect(firstEncryptionData.data).toBeTruthy();
		expect(firstEncryptionData.data.byteLength).toBeGreaterThan(0);

		const secondEncryptionData = await service.encrypt(
			encryptionKey,
			rawData,
		);
		expect(secondEncryptionData).toBeTruthy();
		expect(secondEncryptionData.iv).toBeTruthy();
		expect(secondEncryptionData.iv.byteLength).toBeGreaterThan(0);
		expect(secondEncryptionData.data).toBeTruthy();
		expect(secondEncryptionData.data.byteLength).toBeGreaterThan(0);

		expect(new Uint8Array(secondEncryptionData.data))
			.not.toEqual(new Uint8Array(firstEncryptionData.data));
		expect(new Uint8Array(secondEncryptionData.iv))
			.not.toEqual(new Uint8Array(firstEncryptionData.iv));
	});
});
