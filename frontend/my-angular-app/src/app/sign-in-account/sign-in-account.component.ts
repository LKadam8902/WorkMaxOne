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
  ) {}

  onSubmit() {
    console.log('Login attempt with:', this.email, this.password);
    this.errorMessage = '';
    
    // Try benched employee login first
    this.userService.benchedEmployeeLogin(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Benched employee login successful:', response);
        const role = this.extractRoleFromToken(response.jwt);
        console.log('Extracted role from token:', role);
        
        localStorage.setItem('token', response.jwt);
        
        if (role === 'BENCHED_EMPLOYEE') {
          this.router.navigate(['/benched-employee-view']);
        } else {
          // If role is not benched employee, try team lead login instead
          this.tryTeamLeadLogin();
          return;
        }
      },
      error: (benchedError) => {
        console.log('Benched employee login failed:', benchedError);
        // If benched employee login fails, try team lead login
        this.tryTeamLeadLogin();
      }
    });
  }

  private tryTeamLeadLogin() {
    this.userService.teamLeadLogin(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Team lead login successful:', response);
        const role = this.extractRoleFromToken(response.jwt);
        console.log('Extracted role from token:', role);
        
        localStorage.setItem('token', response.jwt);
        
        if (role === 'TEAM_LEAD') {
          this.router.navigate(['/team-lead-view']);
        } else {
          // Fallback to team lead view
          this.router.navigate(['/team-lead-view']);
        }
      },
      error: (teamLeadError) => {
        console.log('Team lead login also failed:', teamLeadError);
        if (teamLeadError.error && teamLeadError.error.messagge) {
          this.errorMessage = teamLeadError.error.messagge;
        } else if (teamLeadError.error && teamLeadError.error.message) {
          this.errorMessage = teamLeadError.error.message;
        } else {
          this.errorMessage = 'Invalid email or password';
        }
      }
    });
  }

  private extractRoleFromToken(token: string): string | null {
    try {
      // JWT has 3 parts separated by dots: header.payload.signature
      const payload = token.split('.')[1];
      // Decode base64 payload
      const decodedPayload = atob(payload);
      const parsedPayload = JSON.parse(decodedPayload);
      console.log('JWT payload:', parsedPayload);
      return parsedPayload.role || null;
    } catch (error) {
      console.error('Error extracting role from token:', error);
      return null;
    }
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
