enum KeyTypeEnum {
	ENCRYPTION_KEY = 'ENCRYPTION_KEY',
	WRAPPING_KEY = 'WRAPPING_KEY',
	DERIVING_KEY = 'DERIVING_KEY',
};

export interface KeyType {
	keyUsages: KeyUsage[];
};

export interface EncryptionResult {
	readonly iv: ArrayBuffer;
	readonly data: ArrayBuffer;
};

export interface DerivedWrappingKey {
	readonly salt: ArrayBuffer;
	readonly iterationCount: number;
	readonly wrappingKey: CryptoKey;
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
