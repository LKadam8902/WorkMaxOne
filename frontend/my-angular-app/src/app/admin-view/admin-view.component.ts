import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class AdminViewComponent implements OnInit {
  adminData: User[] = [];
  errorMessage: string = '';
  showDropdown = false;

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
      }
    });
  }

  approve(user: User) {
    this.userService.approveUser(user.email).subscribe({
      next: () => {
        user.status = 'Approved';
      },
      error: (error) => {
        this.errorMessage = 'Failed to approve user';
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
}
