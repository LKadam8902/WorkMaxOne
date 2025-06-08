import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page.component';
import { CreateAccountComponent } from './create-account/create-acoount';
import { SignInAccountComponent } from './sign-in-account/sign-in-account.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'sign-in', component: SignInAccountComponent },
  { path: 'admin-login', component: AdminLoginComponent }
];
