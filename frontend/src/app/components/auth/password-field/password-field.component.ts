import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
} from '@angular/core';
import { UserService } from '@services/user/user.service';
import { InputValidation } from '../auth.type';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-password-field',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './password-field.component.html',
	styleUrl: './password-field.component.sass',
})
export class PasswordFieldComponent implements OnChanges {
	constructor(private userService: UserService) {}

	private readonly DEFAULT_ERROR_MESSAGE = 'Senha inválida!';

	@Input({ required: true }) inputId: string = '';
	@Input({ required: true }) inputLabel: string = '';
	@Input() disabled: boolean = false;
	@Input() otherPassword: string | undefined;

	@Output() validatedInput = new EventEmitter<InputValidation>();

	password: string = '';
	passwordValid: boolean = false;
	passwordError: string = '';

	ngOnChanges(): void {
		this.validatePassword();
	}

	validatePassword() {
		try {
			this.userService.validatePassword(
				this.password,
				this.otherPassword,
			);
			this.passwordValid = true;
		} catch (err) {
			this.passwordValid = false;
			this.passwordError = (err instanceof Error && err.message)
			|| this.DEFAULT_ERROR_MESSAGE;
		}

		this.validatedInput.emit({
			input: this.password,
			valid: this.passwordValid,
			validationError:
			!this.passwordValid ? this.passwordError : undefined,
		});
	}
}
