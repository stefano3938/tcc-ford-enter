import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const AUTH_KEY = 'redmindme_auth_session';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const storage = inject(StorageService);

  const session = authService.session();
  if (!session || !session.token || typeof session.token !== 'string' || !session.token.startsWith('jwt-')) {
    storage.removeItem(AUTH_KEY);

    if (session) {
      authService.session.set(null);
    }
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
  if (!session.createdAt) {
    storage.removeItem(AUTH_KEY);
    authService.session.set(null);
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const createdTime = new Date(session.createdAt).getTime();
  if (Number.isNaN(createdTime) || Date.now() - createdTime > SESSION_MAX_AGE_MS) {
    storage.removeItem(AUTH_KEY);
    authService.session.set(null);
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  return true;
};
