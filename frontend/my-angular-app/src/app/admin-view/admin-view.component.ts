import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-view.component.html',
  styleUrls: ['./admin-view.component.css']
})
export class AdminViewComponent implements OnInit {
  adminData: any[] = [];
  errorMessage: string = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadPendingUsers();
  }

  loadPendingUsers() {
    this.userService.getPendingUsers().subscribe({
      next: (response) => {
        this.adminData = response.map((user: any) => ({
          userId: user.employeeId,
          username: user.employeeName,
          email: user.email,
          role: user.hasOwnProperty('project') ? 'team-lead' : 'benched-employee',
          status: 'Pending'
        }));
      },
      error: (error) => {
        this.errorMessage = 'Failed to load pending users';
        console.error('Error loading pending users:', error);
      }
    });
  }

  approve(user: any) {
    this.userService.approveUser(user.userId).subscribe({
      next: () => {
        user.status = 'Approved';
      },
      error: (error) => {
        this.errorMessage = 'Failed to approve user';
        console.error('Error approving user:', error);
      }
    });
  }
} 