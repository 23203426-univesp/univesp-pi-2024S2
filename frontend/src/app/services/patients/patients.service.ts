import slug from 'slug';
import { Injectable } from '@angular/core';
import { Patient, PatientsMap } from './patients.type';
import { BehaviorSubject, map, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class PatientsService {
	private readonly patientsMapSubject = new BehaviorSubject<PatientsMap>({});

	constructor() {
		const patientsMap = this.patientsMapSubject.getValue();
		this.generatePatients([
			'Té Brito',
			'Ronaldo Fenômeno',
			'Amélia Di\'Caprio',
		]).forEach((patient) => {
			patientsMap[patient.slug] = patient;
		});
		this.patientsMapSubject.next(patientsMap);
	}

	public getPatients$(): Observable<Patient[]> {
		return this.patientsMapSubject
			.pipe(map(patientsMap => Object.values(patientsMap)));
	}

	public getPatientsMap$(): Observable<PatientsMap> {
		return this.patientsMapSubject.asObservable();
	}

	public getPatient(slug: string): Patient | undefined {
		return this.patientsMapSubject.getValue()[slug];
	}

	public setPatient(patient: Patient) {
		const patientsMap = this.patientsMapSubject.getValue();
		patientsMap[patient.slug] = patient;
		this.patientsMapSubject.next(patientsMap);
	}

	private generatePatients(patientNames: string[]): Patient[] {
		return patientNames.map(name => this.generatePatient(name));
	}

	public generatePatient(patientName: string): Patient {
		const nameSlug = slug(patientName);
		return {
			name: patientName,
			slug: nameSlug,
			link: `/patient/${nameSlug}`,
		};
	}
}
