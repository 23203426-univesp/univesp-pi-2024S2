import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
	provideRouter,
	withHashLocation,
	withRouterConfig,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({
			eventCoalescing: true,
		}),
		provideRouter(
			routes,
			// Hashing allows manipulating URL manually without page reloads
			withHashLocation(),
			// Do reject so we don't have too much complex handlers
			withRouterConfig({
				resolveNavigationPromiseOnError: false,
			}),
		),
		provideHttpClient(
			withFetch(),
		),
	],
};
