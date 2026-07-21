import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.config';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);
  private platformId = inject(PLATFORM_ID);

  private readonly TOKEN_KEY = 'auth_token';

  /**
   * Registers a new user.
   * @param userData Object containing user registration fields
   * @returns Observable with the server response
   */
  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/create`, userData);
  }

  /**
   * Authenticates a user and stores the returned JWT token in LocalStorage.
   * @param credentials Object containing email and password
   * @returns Observable with user session data and token
   */
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/login`, credentials).pipe(
      tap((response) => {
        if (response?.token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  /**
   * Retrieves the stored JWT token from LocalStorage if executing in the browser.
   * @returns The JWT string token or null if not present/SSR environment
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Clears the user authentication session by removing the token from LocalStorage.
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Checks if the user is currently authenticated based on token availability.
   * @returns True if a valid token exists, false otherwise
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}