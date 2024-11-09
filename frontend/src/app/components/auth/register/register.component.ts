import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '@services/user/user.service';
import { InputValidation } from '../auth.type';
import { PasswordFieldComponent }
	from '../password-field/password-field.component';
import { UsernameFieldComponent }
	from '../username-field/username-field.component';

@Component({
	selector: 'app-register',
	standalone: true,
	imports: [FormsModule, UsernameFieldComponent, PasswordFieldComponent],
	templateUrl: './register.component.html',
	styleUrl: './register.component.sass',
})
export class RegisterComponent {
	constructor(private userService: UserService) {}

	private readonly REGISTER_ERROR_MESSAGE
		= 'Erro desconhecido ao realizar login.';

	@Input() callingApi: boolean = false;
	@Output() callingApiChange = new EventEmitter<boolean>();

	username: string = '';
	usernameValid: boolean = false;

	password: string = '';
	password1Valid: boolean = false;
	password2Valid: boolean = false;

	passphrase: string = '';
	passphrase1Valid: boolean = false;
	passphrase2Valid: boolean = false;

	registerError: string | undefined;

	changedUsername(inputValidation: InputValidation) {
		this.username = inputValidation.input;
		this.usernameValid = inputValidation.valid;
	}

	changedPassword1(inputValidation: InputValidation) {
		this.password = inputValidation.input;
		this.password1Valid = inputValidation.valid;
	}

	changedPassword2(inputValidation: InputValidation) {
		this.password2Valid = inputValidation.valid;
	}

	changedPassphrase1(inputValidation: InputValidation) {
		this.passphrase = inputValidation.input;
		this.passphrase1Valid = inputValidation.valid;
	}

	changedPassphrase2(inputValidation: InputValidation) {
		this.passphrase2Valid = inputValidation.valid;
	}

	private setIsCallingApi(loggingIn: boolean) {
		this.callingApi = loggingIn;
		this.callingApiChange.emit(this.callingApi);
	}

	async submitRegister(): Promise<void> {
		if (!this.password1Valid
			|| !this.password2Valid
			|| !this.passphrase1Valid
			|| !this.passphrase2Valid
			|| !this.usernameValid) {
			throw new Error(`Usuário ou senhas inválidos.`);
		}

		this.setIsCallingApi(true);
		try {
			await this.userService.register(
				this.username,
				this.password,
				this.passphrase,
			);
			this.registerError = undefined;
		} catch (err) {
			this.registerError = (err instanceof Error && err.message)
			|| this.REGISTER_ERROR_MESSAGE;
			this.setIsCallingApi(false);
			throw err;
		}
	}
}
