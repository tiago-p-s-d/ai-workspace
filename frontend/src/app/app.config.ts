import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, InjectionToken } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'; // 👈 Adicionado withInterceptors aqui
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './interceptors/auth/auth.interceptor-interceptor';

export const API_URL = new InjectionToken<string>('API_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    {
      provide: API_URL,
      useValue: typeof window === 'undefined' ? 'http://backend:3000' : '/api'
    }
  ]
};