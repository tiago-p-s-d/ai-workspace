import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../app.config';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class UserService {
  private http = inject(HttpClient);

  private baseUrl = inject(API_URL);
  /**
   * Registers a new user.
   * @param userData 
   * @returns Observable of the operation result
   */
  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, userData);
  }
  
  /**
   * Authenticates a user.
   * @param credentials 
   * @returns Observable of the user session data
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }


}