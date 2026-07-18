import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.userForm.valid) {
      const data = this.userForm.value;

      this.userService.createUser(data).subscribe({
        next: (response) => {
          this.userForm.reset();
        },
        error: (err) => {
          console.error('Erro detalhado:', err); 
        }
      });
    }
  }
}