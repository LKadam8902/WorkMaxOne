import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-sign-in-account',
  templateUrl: './sign-in-account.component.html',
  styleUrls: ['./sign-in-account.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SignInAccountComponent {
  showForgotPasswordMessage = false;
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Try team lead login first
    this.userService.teamLeadLogin(this.email, this.password).subscribe({
      next: (response) => {
        if (response && response.accessToken) {
          localStorage.setItem('token', response.accessToken);
          this.router.navigate(['/team-lead-view']);
        } else {
          this.errorMessage = 'Invalid response from server';
        }
        this.isLoading = false;
      },
      error: (teamLeadError) => {
        // If team lead login fails, try benched employee login
        this.userService.benchedEmployeeLogin(this.email, this.password).subscribe({
          next: (response) => {
            if (response && response.accessToken) {
              localStorage.setItem('token', response.accessToken);
              this.router.navigate(['/benched-employee-view']);
            } else {
              this.errorMessage = 'Invalid response from server';
            }
            this.isLoading = false;
          },
          error: (benchedError) => {
            this.errorMessage = 'Invalid email or password';
            this.isLoading = false;
          }
        });
      }
    });
  }

  navigateToCreateAccount() {
    this.router.navigate(['/create-account']);
  }

  handleForgotPassword() {
    this.showForgotPasswordMessage = true;
    // Hide the message after 5 seconds
    setTimeout(() => {
      this.showForgotPasswordMessage = false;
    }, 5000);
  }
}
