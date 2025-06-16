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
  isLoading = false;
  isLoadingTasks = false;
  profileData: any = null;

  // Sidebar properties
  showSidebar = true;
  
  // Profile dropdown properties
  showProfileDropdown = false;
  
  // Edit profile modal properties
  showEditProfileModal = false;
  editProfileData: any = {
    employeeName: '',
    email: '',
    password: ''
  };
  profileUpdateError = '';
  profileUpdateSuccess = '';
  isUpdatingProfile = false;

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
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      if (this.showProfileDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-dropdown')) {
          this.showProfileDropdown = false;
        }
      }
    });
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
        } else if (response && (response as any).tasks) {
          tasksArray = (response as any).tasks;
        } else if (response && (response as any).data) {
          tasksArray = (response as any).data;
        } else if (response && typeof response === 'object') {
          // Single task object
          tasksArray = [response];
        }
        
        console.log('Raw tasks array for filtering:', tasksArray);
        
        // For benched employee, show tasks that are assigned to them
        this.tasks = tasksArray.filter(task => {
          return task && (
            task.assignedTo || 
            task.status === 'assigned' || 
            task.status === 'In Progress' ||
            task.status === 'in-progress' || 
            task.status === 'completed'
          );
        });
        
        console.log('Filtered assigned tasks:', this.tasks);
        this.isLoadingTasks = false;
        
        if (this.tasks.length === 0) {
          this.successMessage = 'No tasks currently assigned to you.';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        
        // Better error message handling
        let errorMsg = 'Failed to load assigned tasks';
        if (error.status === 200) {
          errorMsg += ' (Response parsing issue - server sent malformed data)';
        } else if (error.status === 401) {
          errorMsg = 'Session expired. Please log in again.';
        } else if (error.status === 403) {
          errorMsg = 'Access denied. Benched employee credentials required.';
        } else if (error.error?.message) {
          errorMsg += ': ' + error.error.message;
        } else if (error.message) {
          errorMsg += ': ' + error.message;
        }
        
        this.errorMessage = errorMsg;
        this.isLoadingTasks = false;
        this.tasks = [];
        
        // Auto-clear error after 8 seconds
        setTimeout(() => {
          this.errorMessage = '';
        }, 8000);
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
    return ['to-do', 'in-progress', 'done'];
  }

  getStatusDisplay(status: string): string {
    switch (status?.toLowerCase()) {
      case 'assigned':
      case 'to_do':
      case 'to-do':
      case 'todo':
        return 'To Do';
      case 'in_progress':
      case 'in-progress':
      case 'inprogress':
        return 'In Progress';
      case 'completed':
      case 'done':
        return 'Done';
      default: 
        return status || 'To Do';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'assigned':
      case 'to_do':
      case 'to-do':
      case 'todo':
        return 'status-assigned';
      case 'in_progress':
      case 'in-progress':
      case 'inprogress':
        return 'status-in-progress';
      case 'completed':
      case 'done':
        return 'status-completed';
      default: 
        return 'status-assigned';
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

  // Debug method to test task loading
  debugTaskLoading() {
    console.log('=== BENCHED EMPLOYEE TASK DEBUG ===');
    console.log('Current tasks:', this.tasks.length);
    
    this.isLoadingTasks = true;
    this.tasks = [];
    this.errorMessage = '';
    
    this.benchedEmployeeService.getTasks().subscribe({
      next: (response) => {
        console.log('Debug - Raw response:', response);
        console.log('Debug - Response type:', typeof response);
        console.log('Debug - Is array:', Array.isArray(response));
        
        this.tasks = Array.isArray(response) ? response : [response].filter(t => t);
        this.isLoadingTasks = false;
        
        console.log('Debug - Final tasks:', this.tasks);
        this.successMessage = `✅ Loaded ${this.tasks.length} tasks successfully!`;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Debug - Task loading error:', error);
        this.isLoadingTasks = false;
        this.errorMessage = 'Task loading failed: ' + error.message;
      }
    });
  }

  // Sidebar methods
  openSidebar() {
    this.showSidebar = true;
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  // Profile dropdown methods
  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    console.log('Profile dropdown toggled. showProfileDropdown:', this.showProfileDropdown);
  }

  // Edit profile methods
  openEditProfile() {
    this.editProfileData = {
      employeeName: this.profileData?.employeeName || '',
      email: this.profileData?.email || '',
      password: ''
    };
    this.showEditProfileModal = true;
    this.showProfileDropdown = false;
    this.profileUpdateError = '';
    this.profileUpdateSuccess = '';
  }

  closeEditProfile() {
    this.showEditProfileModal = false;
    this.profileUpdateError = '';
    this.profileUpdateSuccess = '';
  }
  updateProfile() {
    this.isUpdatingProfile = true;
    this.profileUpdateError = '';
    this.profileUpdateSuccess = '';

    console.log('Updating profile with data:', this.editProfileData);

    this.benchedEmployeeService.updateProfile(this.editProfileData).subscribe({
      next: (response) => {
        console.log('Profile updated successfully:', response);
        this.profileUpdateSuccess = response.message || 'Profile updated successfully!';
        this.isUpdatingProfile = false;
        
        // Update local profile data
        if (this.profileData) {
          this.profileData.employeeName = this.editProfileData.employeeName;
          this.profileData.email = this.editProfileData.email;
        }

        // Close modal after delay
        setTimeout(() => {
          this.closeEditProfile();
        }, 1500);
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
        this.profileUpdateError = error.message || 'Failed to update profile. Please try again.';
        this.isUpdatingProfile = false;
      }
    });
  }

  // Task helper methods
  trackByTaskId(index: number, task: Task): any {
    return task.taskId || task.id || index;
  }

  getTaskSkills(task: Task): string {
    return task.skillSet ? task.skillSet.join(', ') : 'No skills specified';
  }

  getTaskStatus(task: Task): string {
    return task.status || 'assigned';
  }

  getTaskStatusDisplay(task: Task): string {
    return this.getStatusDisplay(task.status || 'assigned');
  }

  refreshTasksList() {
    this.loadTasks();
  }

  retryLoadTasks() {
    this.loadTasks();
  }

  redirectToLogin() {
    this.router.navigate(['/sign-in']);
  }
}