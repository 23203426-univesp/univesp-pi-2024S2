import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientsService } from '@services/patients/patients.service';
import { Patient } from '@services/patients/patients.type';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-patient-list',
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		FormsModule,
	],
	templateUrl: './patient-list.component.html',
	styleUrl: './patient-list.component.sass',
})
export class PatientListComponent implements OnInit, OnDestroy {
	constructor(private patientsService: PatientsService) {}

	private subscription: Subscription | undefined;

	patients: Patient[] | undefined;
	newPatientName: string = '';

	ngOnInit(): void {
		this.subscription = this.patientsService.getPatients$()
			.subscribe((patients) => {
				this.patients = patients;
			});
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
	}

	submitNewPatient() {
		if (this.newPatientName.length === 0) {
			throw new Error(`Empty patient name submitted`);
		}
		const patient
			= this.patientsService.generatePatient(this.newPatientName);
		this.patientsService.setPatient(patient);
	}
}
