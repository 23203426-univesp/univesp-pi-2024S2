import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '@services/user/user.service';
import { InputValidation } from '../auth.type';

@Component({
	selector: 'app-username-field',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './username-field.component.html',
	styleUrl: './username-field.component.sass',
})
export class UsernameFieldComponent implements OnChanges {
	constructor(private userService: UserService) {}

	private readonly DEFAULT_ERROR_MESSAGE = 'Usuário inválido!';

	@Input({ required: true }) inputId: string = '';
	@Input({ required: true }) inputLabel: string = '';
	@Input() disabled: boolean = false;
	@Input() otherPassword: string | undefined;

	@Output() validatedInput = new EventEmitter<InputValidation>();

	username: string = '';
	usernameValid: boolean = false;
	usernameError: string = '';

	ngOnChanges(): void {
		this.validateUsername();
	}

	validateUsername() {
		try {
			this.userService.validateUsername(this.username);
			this.usernameValid = true;
		} catch (err) {
			this.usernameValid = false;
			this.usernameError = (err instanceof Error && err.message)
			|| this.DEFAULT_ERROR_MESSAGE;
		}

		this.validatedInput.emit({
			input: this.username,
			valid: this.usernameValid,
			validationError:
			!this.usernameValid ? this.usernameError : undefined,
		});
	}
}
