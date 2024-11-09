enum KeyTypeEnum {
	ENCRYPTION_KEY = 'ENCRYPTION_KEY',
	WRAPPING_KEY = 'WRAPPING_KEY',
};

export interface KeyType {
	keyUsages: KeyUsage[];
};

export interface EncryptionResult {
	readonly iv: ArrayBuffer;
	readonly data: ArrayBuffer;
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
};
