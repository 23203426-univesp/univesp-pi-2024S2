import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '@services/user/user.service';
import { InputValidation } from '../auth.type';
import { PasswordFieldComponent }
	from '../password-field/password-field.component';
import { UsernameFieldComponent }
	from '../username-field/username-field.component';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [
		FormsModule,
		CommonModule,
		UsernameFieldComponent,
		PasswordFieldComponent,
	],
	templateUrl: './login.component.html',
	styleUrl: './login.component.sass',
})
export class LoginComponent {
	constructor(private userService: UserService) {}

	private readonly LOGIN_ERROR_MESSAGE
		= 'Erro desconhecido ao realizar login.';

	@Input() callingApi: boolean = false;
	@Output() callingApiChange = new EventEmitter<boolean>();

	username: string = '';
	usernameValid: boolean = false;

	password: string = '';
	passwordValid: boolean = false;

	loginError: string | undefined;

	changedUsername(inputValidation: InputValidation) {
		this.username = inputValidation.input;
		this.usernameValid = inputValidation.valid;
	}

	changedPassword(inputValidation: InputValidation) {
		this.password = inputValidation.input;
		this.passwordValid = inputValidation.valid;
	}

	private setIsCallingApi(loggingIn: boolean) {
		this.callingApi = loggingIn;
		this.callingApiChange.emit(this.callingApi);
	}

	async submitLogin(): Promise<void> {
		if (!this.passwordValid || !this.usernameValid) {
			throw new Error(`Usuário ou senha inválidos.`);
		}

		this.setIsCallingApi(true);
		try {
			await this.userService.login(this.username, this.password);
			this.loginError = undefined;
		} catch (err) {
			this.loginError = (err instanceof Error && err.message)
			|| this.LOGIN_ERROR_MESSAGE;
			this.setIsCallingApi(false);
			throw err;
		}
	}
}
