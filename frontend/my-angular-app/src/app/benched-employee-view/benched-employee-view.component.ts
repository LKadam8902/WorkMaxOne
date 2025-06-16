import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BenchedEmployeeService } from '../services/benched-employee.service';
import { UserService } from '../services/user.service';

interface Task {
  id: number;
  taskId?: number;
  name: string;
  skillSet: string[];
  status: string;
  assignedTo?: string;
  project?: any;
}

@Component({
  selector: 'app-benched-employee-view',
  standalone: true,
  templateUrl: './benched-employee-view.component.html',
  styleUrls: ['./benched-employee-view.component.css'],
  imports: [CommonModule, FormsModule]
})
export class BenchedEmployeeViewComponent implements OnInit {
  tasks: Task[] = [];
  newSkills: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  showDropdown = false;
  isLoading = false;
  isLoadingTasks = false;
  profileData: any = null;
  constructor(
    private benchedEmployeeService: BenchedEmployeeService,
    private router: Router,
    private userService: UserService
  ) {}  ngOnInit() {
    console.log('BenchedEmployeeViewComponent - Initializing with role validation');
    
    // First check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found - redirecting to sign-in');
      this.errorMessage = 'No authentication token found. Please log in.';
      setTimeout(() => {
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }

    // Check if token is valid (not expired)
    if (!this.userService.isTokenValid()) {
      console.log('Token is invalid or expired - redirecting to sign-in');
      this.errorMessage = 'Your session has expired. Please log in again.';
      setTimeout(() => {
        this.userService.logout();
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }

    // Extract and validate role from token
    const tokenRole = this.userService.extractRoleFromToken(token);
    console.log('Token role extracted:', tokenRole);
    
    if (tokenRole !== 'BENCHED_EMPLOYEE') {
      console.log(`Access denied - Expected BENCHED_EMPLOYEE but got ${tokenRole}`);
      this.errorMessage = `Access denied. This view requires Benched Employee credentials. Your account has role: ${tokenRole || 'unknown'}`;
      setTimeout(() => {
        this.userService.logout();
        this.router.navigate(['/sign-in']);
      }, 3000);
      return;
    }

    // Double-check with service validation
    if (!this.userService.validateTokenForRole('BENCHED_EMPLOYEE')) {
      console.log('Service validation failed for BENCHED_EMPLOYEE role');
      this.errorMessage = 'Access denied. Benched Employee credentials required.';
      setTimeout(() => {
        this.userService.logout();
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }
    
    console.log('All validations passed - proceeding with component initialization');
    
    if (!this.isLoggedIn()) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      setTimeout(() => {
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }
    
    this.loadTasks();
    this.loadProfile();
  }
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    console.log('Checking login status. Token:', token ? 'exists' : 'not found');
    return !!token;
  }  loadTasks() {
    console.log('Loading assigned tasks for benched employee...');
    this.isLoadingTasks = true;
    this.errorMessage = '';
    
    this.benchedEmployeeService.getTasks().subscribe({
      next: (response) => {
        console.log('Tasks response:', response);
        
        // Handle different response formats
        let tasksArray: Task[] = [];
        if (Array.isArray(response)) {
          tasksArray = response;
        } else if (response && response.tasks) {
          tasksArray = response.tasks;
        } else if (response && response.data) {
          tasksArray = response.data;
        }
        
        console.log('Raw tasks array:', tasksArray);
        
        // For benched employee, we expect the backend to return only assigned tasks
        // But let's also filter to be safe
        this.tasks = tasksArray.filter(task => {
          console.log('Checking task:', task.name, 'Status:', task.status, 'AssignedTo:', task.assignedTo);
          return task.assignedTo || 
                 task.status === 'assigned' || 
                 task.status === 'in-progress' || 
                 task.status === 'completed';
        });
        
        console.log('Filtered assigned tasks:', this.tasks);
        this.isLoadingTasks = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.errorMessage = 'Failed to load assigned tasks: ' + (error.error?.message || error.message || 'Unknown error');
        this.isLoadingTasks = false;
        this.tasks = [];
      }
    });
  }

  loadProfile() {
    console.log('Loading benched employee profile...');
    this.benchedEmployeeService.getProfile().subscribe({
      next: (response) => {
        console.log('Profile response:', response);
        this.profileData = response;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Profile loading is not critical, so don't show error to user
      }
    });
  }

  addSkills() {
    if (!this.newSkills) return;
    
    const skillSet = this.newSkills.split(',').map(skill => skill.trim());
    
    this.benchedEmployeeService.addSkills(skillSet).subscribe({
      next: () => {
        this.newSkills = '';
        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage = 'Failed to add skills';
      }
    });
  }
  updateTaskStatus(taskId: number, status: string) {
    console.log('Updating task status:', taskId, 'to', status);
    this.errorMessage = '';
    this.successMessage = '';
    
    this.benchedEmployeeService.updateTaskStatus(taskId, status).subscribe({
      next: (response) => {
        console.log('Task status updated successfully:', response);
        this.successMessage = `Task status updated to ${status}`;
        this.loadTasks(); // Refresh tasks list
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Failed to update task status:', error);
        this.errorMessage = 'Failed to update task status: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  getStatusOptions(): string[] {
    return ['assigned', 'in-progress', 'completed'];
  }

  getStatusDisplay(status: string): string {
    switch (status) {
      case 'assigned': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'assigned': return 'status-assigned';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      default: return 'status-unknown';
    }
  }

  logout() {
    this.benchedEmployeeService.clearToken();
    this.router.navigate(['/sign-in']);
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
} 