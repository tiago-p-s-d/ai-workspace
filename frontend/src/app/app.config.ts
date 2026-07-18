import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, InjectionToken} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';



export const API_URL = new InjectionToken<string>('API_URL');

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    {
      provide: API_URL,
      useValue: typeof window === 'undefined' ? 'http://backend:3000/users' : '/api/users'
    }
  ]
};

