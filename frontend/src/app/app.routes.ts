import { Routes } from '@angular/router';
import { UserForm } from './components/forms/user-form/user-form';
import { UserLogin } from './components/forms/user-login/user-login';
import { authGuard } from './guards/auth.guard-guard';
import { Chat } from './components/main/chat/chat';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: UserLogin },
  { path: 'create-user', component: UserForm },
  { path: 'chat', canActivate: [authGuard], component: Chat},


  { path: '**', redirectTo: 'login' }
];