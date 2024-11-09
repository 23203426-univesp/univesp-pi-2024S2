import { Component } from '@angular/core';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';

@Component({
	selector: 'app-auth',
	standalone: true,
	imports: [RegisterComponent, LoginComponent],
	templateUrl: './auth.component.html',
	styleUrl: './auth.component.sass',
})
export class AuthComponent {
	// Prevents registering and logging in at the same time
	callingApi: boolean = false;
}
