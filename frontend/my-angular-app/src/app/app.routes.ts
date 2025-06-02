import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page.component';
import { CreateAccountComponent } from './create-account/create-acoount';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'create-account', component: CreateAccountComponent }
];
