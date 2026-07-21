import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user/user.service';

/**
 * Functional guard that checks whether a user is authenticated via JWT token.
 * Redirects unauthenticated users back to the login page.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isLoggedIn()) {
    return true;
  }

  // Redirect to login if user is not authenticated
  return router.createUrlTree(['/login']);
};