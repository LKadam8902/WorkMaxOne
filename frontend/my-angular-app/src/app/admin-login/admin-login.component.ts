import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}  onSubmit() {
    this.adminService.login(this.email, this.password).subscribe({
      next: (response) => {
        // Store the token in localStorage - handle both accessToken and jwt field names
        const token = response.accessToken || response.jwt;
        if (token) {
          localStorage.setItem('token', token);
          // Navigate to admin view
          this.router.navigate(['/admin-view']);
        } else {
          this.errorMessage = 'Login failed - no access token received';
        }
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Login failed. Please try again.';
      }
    });
  }
}

