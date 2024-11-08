import { Injectable } from '@angular/core';
import {
	ActivatedRouteSnapshot,
	CanActivateChild,
	GuardResult,
	MaybeAsync,
	Router,
	RouterStateSnapshot,
} from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivateChild {
	constructor(private router: Router) {}

	canActivateChild(
		childRoute: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): MaybeAsync<GuardResult> {
		// return true;
		return this.router.createUrlTree(['login']);
	}
};
