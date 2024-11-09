import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-patient',
	standalone: true,
	imports: [],
	templateUrl: './patient.component.html',
	styleUrl: './patient.component.sass',
})
export class PatientComponent implements OnInit {
	private patientSlug: string | null = null;
	public patientName: string | null = null;

	constructor(private route: ActivatedRoute) {
	}

	ngOnInit(): void {
		this.patientSlug = this.route.snapshot.paramMap.get('patientSlug');
		this.patientName = this.patientSlug;
	}
}
