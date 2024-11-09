import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '@services/user/user.service';

export const unauthenticatedGuard: CanActivateFn = () => {
	const userService = inject(UserService);
	const router = inject(Router);

	if (userService.getUser()) {
		return router.parseUrl('/');
	} else {
		return true;
	}
};
