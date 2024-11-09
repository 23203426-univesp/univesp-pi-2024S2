import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { UserService } from '@services/user/user.service';

export const authenticatedGuard: CanActivateChildFn = () => {
	const userService = inject(UserService);
	const router = inject(Router);

	if (userService.getUser()) {
		return true;
	} else {
		return router.parseUrl('/auth');
	}
};
