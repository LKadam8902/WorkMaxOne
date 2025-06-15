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

  constructor(
    private router: Router,
    private userService: UserService
  ) {}  onSubmit() {
    console.log('Login attempt with:', this.email, this.password);
    this.errorMessage = '';
    
    // Try team lead login first
    this.userService.teamLeadLogin(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Team lead login successful:', response);
        localStorage.setItem('token', response.jwt);
        this.router.navigate(['/team-lead-view']);
      },
      error: (teamLeadError) => {
        console.log('Team lead login failed:', teamLeadError);
        // If team lead login fails, try benched employee login
        this.userService.benchedEmployeeLogin(this.email, this.password).subscribe({
          next: (response) => {
            console.log('Benched employee login successful:', response);
            localStorage.setItem('token', response.jwt);
            this.router.navigate(['/benched-employee-view']);
          },
          error: (benchedError) => {
            console.log('Benched employee login failed:', benchedError);
            this.errorMessage = 'Invalid email or password';
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
