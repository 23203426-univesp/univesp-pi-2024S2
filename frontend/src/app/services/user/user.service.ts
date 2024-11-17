import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import {
	isValidLoginResponse,
	LockedUser,
	LogInRequest,
	RegisterRequest,
	UserType,
} from './user.type';
import { CryptoService } from '@services/crypto/crypto.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly USERNAME_REGEX = /^[a-z0-9_]{4,16}$/;
	private readonly MIN_PASSWORD_BYTES_LENGTH = 8;
	private readonly MAX_PASSWORD_BYTES_LENGTH = 72;

	private readonly user = new BehaviorSubject<UserType>(undefined);

	constructor(
		private router: Router,
		private http: HttpClient,
		private cryptoService: CryptoService,
	) {}

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

	public validatePassword(
		password: string,
		otherPassword?: string,
	): Uint8Array {
		if (otherPassword !== undefined && otherPassword !== password) {
			throw new Error('Senhas não correspondem!');
		}
		if (password.trim() !== password) {
			throw new Error('Não pode começar ou terminar com espaços.');
		}
		const encodedPassword
			= this.cryptoService.encodeTrimmedPassphrase(password);
		if (encodedPassword.byteLength > this.MAX_PASSWORD_BYTES_LENGTH) {
			throw new Error('Excedeu o comprimento máximo.');
		}
		if (!/[A-Z]/.test(password)) {
			throw new Error('Deve conter pelo menos uma maiúscula');
		}
		if (!/[\W\d]/.test(password)) {
			throw new Error('Deve conter pelo menos um caractere especial e/ou '
				+ 'dígito.');
		}
		if (encodedPassword.byteLength < this.MIN_PASSWORD_BYTES_LENGTH) {
			throw new Error('Não satisfaz comprimento mínimo');
		}
		return encodedPassword;
	}

	public async register(
		username: string,
		accountPassword: string,
		unlockingPassphrase: string,
	): Promise<void> {
		this.validateUsername(username);
		this.validatePassword(unlockingPassphrase);
		const encodedPassword = await this.cryptoService.encodeBase64(
			this.validatePassword(accountPassword),
		);

		const newKeys = await this.cryptoService.generateNewUserKeys(
			unlockingPassphrase,
		);

		const registerRequest: RegisterRequest = {
			username: username,
			password: encodedPassword,
			wrappingKeyParams: newKeys.wrappingKeyParams,
			wrappedEncryptionKey: newKeys.wrappedEncryptionKey,
		};
		const response = await firstValueFrom(
			this.http.post('http://localhost:8080/register', registerRequest),
		);
		if (!isValidLoginResponse(response)) {
			throw new Error('Falha ao interpretar resposta do servidor.');
		}

		const user: LockedUser = {
			username: response.username,
			wrappingKeyParams: {
				salt: await this.cryptoService.decodeBase64(
					response.wrappingKeyParams.salt,
				),
				iterationCount: response.wrappingKeyParams.iterationCount,
			},
			wrappedEncryptionKey: {
				iv: await this.cryptoService.decodeBase64(
					response.wrappedEncryptionKey.iv,
				),
				data: await this.cryptoService.decodeBase64(
					response.wrappedEncryptionKey.data,
				),
			},
		};
		this.user.next(user);

		const succeeded = await this.router.navigateByUrl('/');
		if (!succeeded) {
			throw new Error('Falha ao redirecionar.');
		}
	}

	public async login(username: string, password: string): Promise<void> {
		this.validateUsername(username);
		const encodedPassword = await this.cryptoService.encodeBase64(
			this.validatePassword(password),
		);

		const loginRequest: LogInRequest = {
			username: username,
			password: encodedPassword,
		};
		const response = await firstValueFrom(
			this.http.post('http://localhost:8080/login', loginRequest),
		);
		if (!isValidLoginResponse(response)) {
			throw new Error('Falha ao interpretar resposta do servidor.');
		}

		const user: LockedUser = {
			username: response.username,
			wrappingKeyParams: {
				salt: await this.cryptoService.decodeBase64(
					response.wrappingKeyParams.salt,
				),
				iterationCount: response.wrappingKeyParams.iterationCount,
			},
			wrappedEncryptionKey: {
				iv: await this.cryptoService.decodeBase64(
					response.wrappedEncryptionKey.iv,
				),
				data: await this.cryptoService.decodeBase64(
					response.wrappedEncryptionKey.data,
				),
			},
		};
		this.user.next(user);

		const succeeded = await this.router.navigateByUrl('/');
		if (!succeeded) {
			throw new Error('Falha ao redirecionar.');
		}
	}
}
