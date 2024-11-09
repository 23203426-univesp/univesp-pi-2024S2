import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientListComponent } from './patient-list.component';
import { provideRouter } from '@angular/router';

describe('PatientListComponent', () => {
	let component: PatientListComponent;
	let fixture: ComponentFixture<PatientListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [PatientListComponent],
			providers: [provideRouter([])],
		})
			.compileComponents();

		fixture = TestBed.createComponent(PatientListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
