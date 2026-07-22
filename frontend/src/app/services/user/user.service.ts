import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.config';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';


export interface CustomJwtPayload {
  id: number;
  email?: string;
  nome?: string;
  sub?: string;
  exp?: number;
  iat?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_URL);
  private platformId = inject(PLATFORM_ID);

  private readonly TOKEN_KEY = 'auth_token';

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/create`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/users/login`, credentials).pipe(
      tap((response) => {
        if (response?.token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.TOKEN_KEY, response.token);
        }
      })
    );
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Extrai o email diretamente do JWT usando a biblioteca jwt-decode
   */
  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      return decoded.email || decoded.sub || null;
    } catch (error) {
      console.error('Erro ao decodificar JWT:', error);
      return null;
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem('chats_cache');
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}