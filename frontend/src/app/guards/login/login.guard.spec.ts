import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { LoginGuard } from './login.guard';

describe('loginGuard', () => {
	const executeGuard: CanDeactivateFn = (...guardParameters) =>
		TestBed.runInInjectionContext(() => LoginGuard(...guardParameters));

	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it('should be created', () => {
		expect(executeGuard).toBeTruthy();
	});
});
