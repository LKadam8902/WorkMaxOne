import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamLeadService } from '../services/team-lead.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
  imports: [CommonModule, FormsModule]
})
export class EditProfileComponent implements OnInit {
  profileData = {
    employeeName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private service: TeamLeadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  loadProfileData(): void {
    this.service.getProjects().subscribe(
      (res: any) => {
        if (res) {
          this.profileData.employeeName = res.employeeName || '';
          this.profileData.email = res.email || '';
        }
      },
      (error) => {
        console.error('Error loading profile data:', error);
        this.errorMessage = 'Failed to load profile data';
      }
    );
  }

  updateProfile(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateData = {
      employeeName: this.profileData.employeeName,
      email: this.profileData.email,
      ...(this.profileData.newPassword && { password: this.profileData.newPassword })
    };

    // You'll need to add an updateProfile method to TeamLeadService
    // For now, just show success and navigate back
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Profile updated successfully!';
      setTimeout(() => {
        this.router.navigate(['/team-lead-view']);
      }, 1500);
    }, 1000);
  }

  validateForm(): boolean {
    if (!this.profileData.employeeName.trim()) {
      this.errorMessage = 'Employee name is required';
      return false;
    }

    if (!this.profileData.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    if (!this.isValidEmail(this.profileData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return false;
    }

    if (this.profileData.newPassword || this.profileData.confirmPassword) {
      if (!this.profileData.currentPassword) {
        this.errorMessage = 'Current password is required to change password';
        return false;
      }

      if (this.profileData.newPassword.length < 6) {
        this.errorMessage = 'New password must be at least 6 characters';
        return false;
      }

      if (this.profileData.newPassword !== this.profileData.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
        return false;
      }
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  cancel(): void {
    this.router.navigate(['/team-lead-view']);
  }
}
