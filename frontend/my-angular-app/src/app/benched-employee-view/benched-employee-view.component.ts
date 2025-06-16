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

// Interface for the expected success response from addSkills
// This matches the EmployeeBodyResponse DTO in your Spring Boot controller
interface EmployeeBodyResponse {
  message: string;
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
  isLoading = false; // Not used currently, but good to have
  isLoadingTasks = false;
  profileData: any = null;

  constructor(
    private benchedEmployeeService: BenchedEmployeeService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    // Validate user has benched employee role
    if (!this.userService.validateTokenForRole('BENCHED_EMPLOYEE')) {
      this.errorMessage = 'Access denied. Benched Employee credentials required.';
      setTimeout(() => {
        this.userService.logout();
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }
    
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
  }

  loadTasks() {
    console.log('Loading assigned tasks for benched employee...');
    this.isLoadingTasks = true;
    this.errorMessage = ''; // Clear previous error
    
    this.benchedEmployeeService.getTasks().subscribe({
      next: (response) => {
        console.log('Tasks response:', response);
        
        // Handle different response formats
        let tasksArray: Task[] = [];
        if (Array.isArray(response)) {
          tasksArray = response;
        } else if (response && (response as any).tasks) { // Using 'any' for flexible property access
          tasksArray = (response as any).tasks;
        } else if (response && (response as any).data) { // Using 'any' for flexible property access
          tasksArray = (response as any).data;
        }
        
        console.log('Raw tasks array for filtering:', tasksArray);
        
        // For benched employee, we expect the backend to return only assigned tasks
        // But let's also filter to be safe
        this.tasks = tasksArray.filter(task => {
          // console.log('Checking task:', task.name, 'Status:', task.status, 'AssignedTo:', task.assignedTo); // Can be noisy
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
    // No error message for profile load as it's not critical for basic functionality
    this.benchedEmployeeService.getProfile().subscribe({
      next: (response) => {
        console.log('Profile response:', response);
        this.profileData = response;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Do not set errorMessage for profile load, it's less critical.
      }
    });
  }

  addSkills() {
    this.clearMessages(); // Clear any existing messages before starting
    console.log('Attempting to add skills:', this.newSkills);

    if (!this.newSkills) {
      this.errorMessage = 'Please enter skills to add.';
      console.warn('Skill input is empty.');
      return;
    }
    
    const skillSet = this.newSkills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    
    if (skillSet.length === 0) {
      this.errorMessage = 'Please enter valid skills (e.g., "Java, Spring, Angular").';
      console.warn('Parsed skill set is empty.');
      return;
    }

    console.log('Sending skillSet to service:', skillSet);
    this.benchedEmployeeService.addSkills(skillSet).subscribe({
      next: (response: EmployeeBodyResponse) => { // Expect EmployeeBodyResponse
        console.log('Skills added successfully response:', response);
        this.newSkills = ''; // Clear input field
        this.successMessage = response.message || 'Skills added successfully!'; // Use message from backend
        this.loadProfile(); // Reload profile to reflect new skills if applicable
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
          console.log('Success message cleared.');
        }, 3000);
      },
      error: (error) => {
        console.error('Error adding skills:', error);
        // Try to get a meaningful message from the error object
        this.errorMessage = 'Failed to add skills: ' + (error.error?.message || error.message || JSON.stringify(error) || 'Unknown error');
        this.successMessage = ''; // Ensure success message is cleared on error
      }
    });
  }

  updateTaskStatus(taskId: number, status: string) {
    console.log('Updating task status:', taskId, 'to', status);
    this.clearMessages(); // Clear any existing messages before starting
    
    this.benchedEmployeeService.updateTaskStatus(taskId, status).subscribe({
      next: (response) => {
        console.log('Task status updated successfully:', response);
        this.successMessage = `Task status updated to ${status}`;
        this.loadTasks(); // Refresh tasks list
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
          console.log('Task status success message cleared.');
        }, 3000);
      },
      error: (error) => {
        console.error('Failed to update task status:', error);
        this.errorMessage = 'Failed to update task status: ' + (error.error?.message || error.message || JSON.stringify(error) || 'Unknown error');
        // Ensure success message is cleared on error
        this.successMessage = ''; 
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
    console.log('Logging out...');
    this.benchedEmployeeService.clearToken();
    this.router.navigate(['/sign-in']);
  }

  clearMessages() {
    console.log('Clearing messages...');
    this.errorMessage = '';
    this.successMessage = '';
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    console.log('Dropdown toggled. showDropdown:', this.showDropdown);
  }
}