import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [FormsModule, CommonModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.sass',
})
export class LoginComponent {
	username: string = '';
	isUsernameValid: boolean = false;

	validateUsername(): void {
		this.isUsernameValid = /[A-Za-z0-9_]{4,16}/.test(this.username);
	}
}
