import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('AuthGuard: Checking authentication...');
    if (authService.isAuthenticated()) {
        console.log('AuthGuard: User is authenticated');
        return true;
    }

    console.log('AuthGuard: User is NOT authenticated, redirecting to login');
    return router.createUrlTree(['/login']);
};
