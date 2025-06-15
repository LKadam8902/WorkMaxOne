import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
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
  ) {
    // Subscribe to router events to debug navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('Navigation completed to:', event.url);
      }
    });
  }  onSubmit() {
    console.log('Attempting login with email:', this.email);
    this.errorMessage = ''; // Clear previous errors
    
    // Try team lead login first
    this.userService.teamLeadLogin(this.email, this.password).subscribe({      next: (response) => {
        console.log('Team lead login successful:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response));
        if (response && (response.accessToken || response.jwt)) {
          const token = response.accessToken || response.jwt;
          localStorage.setItem('token', token);
          console.log('Token stored, navigating to team-lead-view');
          this.router.navigate(['/team-lead-view']).then(
            success => console.log('Navigation to team-lead-view successful:', success),
            error => console.error('Navigation to team-lead-view failed:', error)
          );
        } else {
          console.error('No access token in response:', response);
          this.errorMessage = 'Login failed - no access token received';
        }
      },
      error: (teamLeadError) => {
        console.log('Team lead login failed:', teamLeadError);
        console.log('Error status:', teamLeadError.status);
        console.log('Error message:', teamLeadError.message);
        
        // Check if it's a network error (backend not running)
        if (teamLeadError.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
          return;
        }
        
        // If team lead login fails, try benched employee login
        console.log('Attempting benched employee login...');
        this.userService.benchedEmployeeLogin(this.email, this.password).subscribe({          next: (response) => {
            console.log('Benched employee login successful:', response);
            console.log('Benched employee response type:', typeof response);
            console.log('Benched employee response keys:', Object.keys(response));
            if (response && (response.accessToken || response.jwt)) {
              const token = response.accessToken || response.jwt;
              localStorage.setItem('token', token);
              console.log('Token stored, navigating to benched-employee-view');
              this.router.navigate(['/benched-employee-view']).then(
                success => console.log('Navigation to benched-employee-view successful:', success),
                error => console.error('Navigation to benched-employee-view failed:', error)
              );
            } else {
              console.error('No access token in benched employee response:', response);
              this.errorMessage = 'Login failed - no access token received';
            }
          },
          error: (benchedError) => {
            console.log('Benched employee login failed:', benchedError);
            console.log('Benched employee error status:', benchedError.status);
            console.log('Benched employee error details:', benchedError);
            
            if (benchedError.status === 0) {
              this.errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
            } else {
              this.errorMessage = 'Invalid email or password';
            }
          }
        });
      }
    });
  }navigateToCreateAccount() {
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
