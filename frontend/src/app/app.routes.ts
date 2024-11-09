import { Routes } from '@angular/router';
import { AuthComponent } from '@components/auth/auth.component';
import { HomeComponent } from '@components/home/home.component';
import { PatientComponent } from '@components/patient/patient.component';
import { NotFoundComponent } from '@components/not-found/not-found.component';
import { unauthenticatedGuard } from '@guards/unauthenticated.guard';
import { authenticatedGuard } from '@guards/authenticated.guard';

export const routes: Routes = [
	{
		path: 'auth',
		canActivate: [unauthenticatedGuard],
		component: AuthComponent,
	},
	{
		path: '',
		canActivateChild: [authenticatedGuard],
		children: [
			{
				path: '',
				component: HomeComponent,
			},
			{
				path: 'patient/:patientSlug',
				component: PatientComponent,
			},
		],
	},
	{
		path: 'not-found',
		component: NotFoundComponent,
	},
	{
		path: '**',
		redirectTo: 'not-found',
	},
];
