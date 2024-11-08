import { Injectable, OnDestroy, OnInit } from '@angular/core';
import {
	CanActivate,
	GuardResult,
	MaybeAsync,
	Router,
} from '@angular/router';
import { UserService } from '@services/user/user.service';
import { Subscription } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class LoginGuard implements CanActivate, OnInit, OnDestroy {
	private subscription: Subscription | undefined;
	private username: string | null = null;

	constructor(private router: Router, private userService: UserService) {}

	ngOnInit(): void {
		this.subscription = this.userService.getUsername()
			.subscribe((username) => {
				this.username = username;
			});
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
	}

	canActivate(): MaybeAsync<GuardResult> {
		if (this.username) {
			return this.router.createUrlTree(['/']);
		} else {
			return true;
		}
	}
};
