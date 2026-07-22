import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user/user.service';

/**
 * Functional guard that checks whether a user is authenticated via JWT token.
 * Validates execution environment to avoid SSR hydration drops and redirects unauthenticated users to the login page.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // If executing on the server (SSR), allow passage so hydration completes in the browser
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Synchronously verify if the user has an active session token in browser storage
  if (userService.isLoggedIn()) {
    return true;
  }

  // Redirect to login if user is not authenticated
  return router.createUrlTree(['/login']);
};