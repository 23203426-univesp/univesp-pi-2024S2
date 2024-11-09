import { Component, OnDestroy, OnInit } from '@angular/core';
import { PatientListComponent } from
	'@components/patient-list/patient-list.component';
import { UserService } from '@services/user/user.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [PatientListComponent],
	templateUrl: './home.component.html',
	styleUrl: './home.component.sass',
})
export class HomeComponent implements OnInit, OnDestroy {
	private subscription: Subscription | undefined;

	username: string | undefined;

	constructor(private userService: UserService) {}

	ngOnInit(): void {
		// this.subscription = this.userService.getUsername$()
		// 	.subscribe((username) => {
		// 		this.username = username;
		// 	});
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
	}
}
