import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

interface User {
  userId: string;
  username: string;
  email: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-admin-view',
  standalone: true,
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css'],
  imports: [CommonModule]
})
export class AdminViewComponent implements OnInit {  adminData: User[] = [];
  errorMessage: string = '';
  showDropdown = false;

  constructor(private userService: UserService, private router: Router) {}  ngOnInit() {
    // Check if admin token is valid before loading data
    if (!this.userService.isAdminTokenValid()) {
      this.errorMessage = 'Session expired. Please login again.';
      this.router.navigate(['/admin-login']);
      return;
    }
    
    // Debug: Log the token for verification
    const token = localStorage.getItem('adminToken');
    console.log('Admin token exists:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 50) + '...');
    }
    
    this.loadPendingUsers();
  }
  loadPendingUsers() {
    console.log('Loading pending users...');
    this.userService.getPendingUsers().subscribe({
      next: (response) => {
        console.log('Pending users response:', response);
        this.adminData = response.map((user: any) => ({
          userId: user.employeeId,
          username: user.employeeName,
          email: user.email,
          role: user.hasOwnProperty('project') ? 'team-lead' : 'benched-employee',
          status: 'Pending'
        }));
      },error: (error) => {
        console.error('Error loading pending users:', error);
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          this.router.navigate(['/admin-login']);
        } else {
          this.errorMessage = 'Failed to load pending users';
        }
      }
    });
  }

  approve(user: User) {
    this.userService.approveUser(user.email).subscribe({
      next: () => {
        user.status = 'Approved';
      },      error: (error) => {
        console.error('Error approving user:', error);
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          this.router.navigate(['/admin-login']);
        } else {
          this.errorMessage = 'Failed to approve user';
        }
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
}
