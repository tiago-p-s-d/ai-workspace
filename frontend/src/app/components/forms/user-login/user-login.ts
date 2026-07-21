import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-user-login',
  imports: [ReactiveFormsModule],
  templateUrl: './user-login.html',
  styleUrl: './user-login.css',
})
export class UserLogin {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  /**
   * Handles user authentication form submission.
   * Redirects to the chatbot interface upon successful login.
   */
  onLogin(): void {
    if (this.loginForm.valid) {
      this.userService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/chat']);
        },
        error: (err) => {
          console.error('Login failed:', err.error?.error);
          alert(err.error?.error || 'An unexpected error occurred during authentication.');
        }
      });
    }
  }
}