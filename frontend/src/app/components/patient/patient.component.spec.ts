import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientComponent } from './patient.component';
import { provideRouter } from '@angular/router';

describe('PatientComponent', () => {
	let component: PatientComponent;
	let fixture: ComponentFixture<PatientComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [PatientComponent],
			providers: [provideRouter([])],
		})
			.compileComponents();

		fixture = TestBed.createComponent(PatientComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
