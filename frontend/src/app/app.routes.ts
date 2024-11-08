import { Routes } from '@angular/router';
import { LoginComponent } from '@components/login/login.component';
import { HomeComponent } from '@components/home/home.component';
import { AuthGuard } from '@guards/auth/auth.guard';
import { LoginGuard } from '@guards/login/login.guard';

export const routes: Routes = [
	{
		path: 'login',
		canActivate: [LoginGuard],
		component: LoginComponent,
	},
	{
		path: '',
		canActivateChild: [AuthGuard],
		children: [
			{
				path: '',
				component: HomeComponent,
			},
		],
	},
];
