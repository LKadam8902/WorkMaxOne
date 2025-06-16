import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page.component';
import { CreateAccountComponent } from './create-account/create-account.component';
import { SignInAccountComponent } from './sign-in-account/sign-in-account.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminViewComponent } from './admin-view/admin-view.component';
import { TeamLeadViewComponent } from './team-lead-view/team-lead-view.component';
import { BenchedEmployeeViewComponent } from './benched-employee-view/benched-employee-view.component';
import { TeamLeadGuard } from './guards/team-lead.guard';
import { BenchedEmployeeGuard } from './guards/benched-employee.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'sign-in', component: SignInAccountComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'admin-view', component: AdminViewComponent, canActivate: [AdminGuard] },
  { path: 'team-lead-view', component: TeamLeadViewComponent, canActivate: [TeamLeadGuard] },
  { path: 'benched-employee-view', component: BenchedEmployeeViewComponent, canActivate: [BenchedEmployeeGuard] }
];
