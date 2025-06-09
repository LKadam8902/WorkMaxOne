import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CreateAccountComponent {
  userData = {
    username: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
  };
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.userService.createAccount(this.userData).subscribe({
      next: (response) => {
        this.successMessage = 'Account created successfully! Waiting for admin approval.';
        setTimeout(() => {
          this.router.navigate(['/sign-in']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Failed to create account. Please try again.';
      }
    });
  }
} 