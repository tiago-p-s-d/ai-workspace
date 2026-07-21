import { Routes } from '@angular/router';
import { UserForm } from './components/forms/user-form/user-form';
import { UserLogin } from './components/forms/user-login/user-login';
import { authGuard } from './guards/auth.guard-guard';
import { ChatLayout } from './components/main/chat-layout/chat-layout';
import { ChatWindow } from './components/main/chat-window/chat-window';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: UserLogin },
  { path: 'create-user', component: UserForm },
  {
    path: 'chat',
    component: ChatLayout, 
    canActivate: [authGuard],
    children: [
      { path: '', component: ChatWindow },          
      { path: ':id', component: ChatWindow }
    ]
  },


  { path: '**', redirectTo: 'login' }
];