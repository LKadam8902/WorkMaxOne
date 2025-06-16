import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { SignInAccountComponent } from './sign-in-account/sign-in-account.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminViewComponent } from './admin-view/admin-view.component';
import { TeamLeadViewComponent } from './team-lead-view/team-lead-view.component';
import { BenchedEmployeeViewComponent } from './benched-employee-view/benched-employee-view.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'sign-in', component: SignInAccountComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin-view', component: AdminViewComponent },
  { path: 'team-lead-view', component: TeamLeadViewComponent },
  { path: 'benched-employee-view', component: BenchedEmployeeViewComponent }
];
