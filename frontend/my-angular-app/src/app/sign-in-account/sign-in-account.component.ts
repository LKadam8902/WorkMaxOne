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
  selectedRole: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  onSubmit() {
    console.log('=== LOGIN ATTEMPT STARTED ===');
    console.log('Email:', this.email);
    console.log('Password length:', this.password.length);
    console.log('Selected role:', this.selectedRole);
    this.errorMessage = '';
    
    // Validate that a role is selected
    if (!this.selectedRole) {
      this.errorMessage = 'Please select your role (Team Lead or Benched Employee)';
      return;
    }
    
    // Clear any existing token first
    localStorage.removeItem('token');
    
    // Attempt login based on selected role
    this.attemptRoleBasedLogin();
  }

  private attemptRoleBasedLogin() {
    console.log('=== STARTING ROLE-BASED LOGIN PROCESS ===');
    console.log('Email being used:', this.email);
    console.log('Password length:', this.password.length);
    console.log('Selected role:', this.selectedRole);
    
    if (this.selectedRole === 'TEAM_LEAD') {
      this.attemptTeamLeadLogin();
    } else if (this.selectedRole === 'BENCHED_EMPLOYEE') {
      this.attemptBenchedEmployeeLogin();
    }
  }

  private attemptTeamLeadLogin() {
    console.log('Attempting team lead login...');
    this.userService.teamLeadLogin(this.email, this.password).subscribe({
      next: (response) => {
        console.log('=== TEAM LEAD LOGIN RESPONSE ===');
        console.log('Full response object:', response);
        
        if (response && response.jwt) {
          const role = this.extractRoleFromToken(response.jwt);
          console.log('Extracted role from token:', role);
          
          if (role === 'TEAM_LEAD') {
            console.log('Role matches - proceeding to team lead view');
            localStorage.setItem('token', response.jwt);
            this.router.navigate(['/team-lead-view']);
          } else {
            console.log('Role mismatch - user is not a team lead');
            this.errorMessage = 'Access denied. You are not authorized as a Team Lead.';
          }
        } else {
          this.errorMessage = 'Invalid response from server';
        }
      },
      error: (error) => {
        console.log('=== TEAM LEAD LOGIN ERROR ===');
        console.log('Error:', error);
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Invalid email or password, or you are not authorized as a Team Lead.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }

  private attemptBenchedEmployeeLogin() {
    console.log('Attempting benched employee login...');
    this.userService.benchedEmployeeLogin(this.email, this.password).subscribe({
      next: (response) => {
        console.log('=== BENCHED EMPLOYEE LOGIN RESPONSE ===');
        console.log('Full response object:', response);
        
        if (response && response.jwt) {
          const role = this.extractRoleFromToken(response.jwt);
          console.log('Extracted role from token:', role);
          
          if (role === 'BENCHED_EMPLOYEE') {
            console.log('Role matches - proceeding to benched employee view');
            localStorage.setItem('token', response.jwt);
            this.router.navigate(['/benched-employee-view']);
          } else {
            console.log('Role mismatch - user is not a benched employee');
            this.errorMessage = 'Access denied. You are not authorized as a Benched Employee.';
          }
        } else {
          this.errorMessage = 'Invalid response from server';
        }
      },
      error: (error) => {
        console.log('=== BENCHED EMPLOYEE LOGIN ERROR ===');
        console.log('Error:', error);
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Invalid email or password, or you are not authorized as a Benched Employee.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
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
      console.log('=== JWT PAYLOAD ANALYSIS ===');
      console.log('Full JWT payload:', parsedPayload);
      
      // Check multiple possible role field names
      let role = parsedPayload.role || parsedPayload.roles || parsedPayload.authority || parsedPayload.authorities;
      console.log('Raw role value:', role);
      
      if (Array.isArray(role)) {
        role = role[0]; // Take the first role if it's an array
        console.log('Extracted first role from array:', role);
      }
      
      if (role) {
        const originalRole = role.toString();
        console.log('Role found:', originalRole);
        
        // Return the exact role as received (case-sensitive)
        if (originalRole === 'TEAM_LEAD') {
          console.log('Detected as TEAM_LEAD');
          return 'TEAM_LEAD';
        } else if (originalRole === 'ADMIN') {
          console.log('Detected as ADMIN');
          return 'ADMIN';
        } else if (originalRole === 'BENCHED_EMPLOYEE' || originalRole === 'BENCH_EMPLOYEE') {
          console.log('Detected as BENCHED_EMPLOYEE');
          return 'BENCHED_EMPLOYEE';
        } else {
          // For any other role variations, try to normalize
          const upperRole = originalRole.toUpperCase();
          if (upperRole.includes('BENCH') || (upperRole.includes('EMPLOYEE') && !upperRole.includes('TEAM'))) {
            console.log('Detected as BENCHED_EMPLOYEE (normalized)');
            return 'BENCHED_EMPLOYEE';
          } else if (upperRole.includes('TEAM') && upperRole.includes('LEAD')) {
            console.log('Detected as TEAM_LEAD (normalized)');
            return 'TEAM_LEAD';
          } else {
            console.log('Unknown role format:', originalRole);
            return originalRole;
          }
        }
      }
      
      console.log('No role found in token');
      return null;
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
