import { TestBed } from '@angular/core/testing';

import { PatientsService } from './patients.service';

describe('PatientsService', () => {
	let service: PatientsService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PatientsService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('patient update should update subscription', async () => {
		const subscriptionFn = jasmine.createSpy('subscriptionFn');

		const subscription
			= service.getPatientsMap$().subscribe(subscriptionFn);
		// The first time for the subscription
		expect(subscriptionFn).toHaveBeenCalledTimes(1);

		const patient = service.generatePatient('teste');
		expect(patient).toBeTruthy();

		expect(subscriptionFn).toHaveBeenCalledTimes(1);
		service.setPatient(patient);
		// Second time for the update
		expect(subscriptionFn).toHaveBeenCalledTimes(2);

		subscription.unsubscribe();
	});
});
