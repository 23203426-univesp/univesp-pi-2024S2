import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { RegisterRequest, UserType } from './user.type';
import { CryptoService } from '@services/crypto/crypto.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private readonly USERNAME_REGEX = /^[a-z0-9_]{4,16}$/;
	private readonly MIN_PASSWORD_LENGTH = 8;
	private readonly MAX_PASSWORD_LENGTH = 128;

	private readonly user
		= new BehaviorSubject<UserType>(undefined);

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

		const newKeys = await this.cryptoService.generateNewUserKeys(
			passphrase,
		);

		const registerRequest: RegisterRequest = {
			username: username,
			password: password,
			wrappingKeyParams: newKeys.wrappingKeyParams,
			wrappedEncryptionKey: newKeys.wrappedEncryptionKey,
		};
		console.log(JSON.stringify(registerRequest));

		const response = await firstValueFrom(
			this.http.post('http://localhost:8080/register', registerRequest),
		);
		console.log('response =', response);
		throw response;
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
