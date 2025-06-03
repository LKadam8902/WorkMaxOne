import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class LandingPageComponent {
  constructor(private router: Router) {}

  navigateToCreateAccount() {
    this.router.navigate(['/create-account']);
  }
}
