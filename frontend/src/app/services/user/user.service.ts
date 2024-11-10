import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { RegisterRequest, UserType } from './user.type';
import { CryptoService } from '@services/crypto/crypto.service';
import { KeyTypes } from '@services/crypto/crypto.type';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly USERNAME_REGEX = /^[a-z0-9_]{4,16}$/;
	private readonly MIN_PASSWORD_LENGTH = 8;
	private readonly MAX_PASSWORD_LENGTH = 128;

	private readonly user
		= new BehaviorSubject<UserType>(undefined);

	constructor(private router: Router, private cryptoService: CryptoService) {}

	public getUser$(): Observable<UserType> {
		return this.user.asObservable();
	}

	public getUser(): UserType {
		return this.user.getValue();
	}

	public validateUsername(username: string): void {
		if (!this.USERNAME_REGEX.test(username)) {
			throw new Error('Deve ter comprimento entre 4 e 16 caracteres '
				+ 'e não utilizar caracteres maiúsculos ou especiais.');
		}
	}

	public validatePassword(password: string, otherPassword?: string): void {
		if (otherPassword !== undefined && otherPassword !== password) {
			throw new Error('Senhas não correspondem!');
		}
		if (password.length >= this.MAX_PASSWORD_LENGTH) {
			throw new Error('Excedeu o tamanho máximo.');
		}
		if (password.trim() !== password) {
			throw new Error('Não pode começar ou terminar com espaços.');
		}
		if (!/[A-Z]/.test(password)) {
			throw new Error('Deve conter pelo menos uma maiúscula');
		}
		if (!/[\W\d]/.test(password)) {
			throw new Error('Deve conter pelo menos um caractere especial e/ou '
				+ 'dígito.');
		}
		if (password.length < this.MIN_PASSWORD_LENGTH) {
			throw new Error('Não satisfaz comprimento mínimo');
		}
	}

	public async register(
		username: string,
		password: string,
		passphrase: string,
	): Promise<void> {
		this.validateUsername(username);
		this.validatePassword(password);
		this.validatePassword(passphrase);

		const encryptionKey = await this.cryptoService.generateKey(
			true,
			KeyTypes.ENCRYPTION_KEY,
		);
		const wrappingKey
		= await this.cryptoService.deriveWrappingKeyFromPassphrase(passphrase);

		const wrappedEncryptionKey
		= await this.cryptoService.wrapKey(
			encryptionKey,
			wrappingKey.wrappingKey,
		);

		const registerRequest: RegisterRequest = {
			username: username,
			password: password,
			wrappingKeySalt: wrappingKey.salt,
			wrappingKeyIterationCount: wrappingKey.iterationCount,
			wrappedEncryptionKey: wrappedEncryptionKey,
		};
	}

	public async login(username: string, password: string): Promise<void> {
		this.validateUsername(username);
		this.validatePassword(password);

		// this.user.next(username);

		const succeeded = await this.router.navigateByUrl('/');
		if (!succeeded) {
			throw new Error('Falha ao redirecionar.');
		}
	}
}
