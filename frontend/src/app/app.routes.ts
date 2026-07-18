import { Routes } from '@angular/router';
import { UserForm } from './components/forms/user-form/user-form';
import { UserLogin } from './components/forms/user-login/user-login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: UserLogin },
  { path: 'create-user', component: UserForm },
];