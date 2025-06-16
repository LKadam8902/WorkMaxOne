import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamLeadService } from '../services/team-lead.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-team-lead-view',
  standalone: true,
  templateUrl: './team-lead-view.component.html',
  styleUrls: ['./team-lead-view.component.css'],
  imports: [CommonModule, FormsModule]
})
export class TeamLeadViewComponent implements OnInit {
  // Form data
  projectName = '';
  taskName = '';
  skills = '';
  
  // UI state
  currentStep = 'project'; // 'project', 'task', 'complete'
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  hasExistingProject = false;
  
  // Tasks for sidebar
  tasks: any[] = [];
  isLoadingTasks = false;
  showSidebar = true;

  // Profile dropdown
  showProfileDropdown = false;
  profileData: any = null;

  // Edit profile modal
  showEditProfileModal = false;
  editProfileData: any = {
    employeeName: '',
    email: '',
    password: ''
  };
  isUpdatingProfile = false;
  profileUpdateError = '';
  profileUpdateSuccess = '';
  constructor(
    private teamLeadService: TeamLeadService, 
    private elementRef: ElementRef,
    private userService: UserService,
    private router: Router
  ) {
    console.log('TeamLeadViewComponent initialized');
  }  ngOnInit() {
    console.log('TeamLeadViewComponent - Initializing with role validation');
    
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
    
    if (tokenRole !== 'TEAM_LEAD') {
      console.log(`Access denied - Expected TEAM_LEAD but got ${tokenRole}`);
      this.errorMessage = `Access denied. This view requires Team Lead credentials. Your account has role: ${tokenRole || 'unknown'}`;
      setTimeout(() => {
        this.userService.logout();
        this.router.navigate(['/sign-in']);
      }, 3000);
      return;
    }

    // Double-check with service validation
    if (!this.userService.validateTokenForRole('TEAM_LEAD')) {
      console.log('Service validation failed for TEAM_LEAD role');
      this.errorMessage = 'Access denied. Team Lead credentials required.';
      setTimeout(() => {
        this.userService.logout();
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }
    
    console.log('All validations passed - proceeding with component initialization');
    
    if (!this.teamLeadService.isLoggedIn()) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      setTimeout(() => {
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }
    
    this.checkExistingProject();
    this.loadTasks();
  }
  private checkExistingProject() {
    this.isLoading = true;
    this.teamLeadService.getProjects().subscribe({
      next: (response) => {
        // Store profile data
        this.profileData = response;
        console.log('Profile data loaded:', this.profileData);
        
        if (response && response.project) {
          this.hasExistingProject = true;
          this.currentStep = 'task';
        } else {
          this.hasExistingProject = false;
          this.currentStep = 'project';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Your session has expired. Please log in again.';
        } else {
          this.errorMessage = 'Failed to load project information.';
        }
      }
    });
  }  loadTasks() {
    console.log('loadTasks() called - checking for tasks...');
    this.isLoadingTasks = true;
    this.teamLeadService.getTasks().subscribe({
      next: (response) => {
        console.log('RAW Tasks API response:', response);
        console.log('Response type:', typeof response);
        console.log('Is Array:', Array.isArray(response));
        
        let tasksArray: any[] = [];
        
        if (Array.isArray(response)) {
          console.log('Using response as array directly');
          tasksArray = response;
        } else if (response && typeof response === 'object' && response.tasks) {
          console.log('Using response.tasks property');
          tasksArray = response.tasks;
        } else if (response && typeof response === 'object' && response.data) {
          console.log('Using response.data property');
          tasksArray = response.data;
        } else if (response && typeof response === 'string') {
          console.log('Response is string, attempting to parse...');
          try {
            const parsed = JSON.parse(response);
            tasksArray = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.error('Failed to parse string response:', e);
            tasksArray = [];
          }
        }
          console.log('Final processed tasks array:', tasksArray);
        console.log('Number of tasks:', tasksArray.length);
        
        // Log each task for debugging
        tasksArray.forEach((task, index) => {
          console.log(`Task ${index + 1}:`, {
            taskId: task.taskId || task.id,
            name: task.name,
            skillSet: task.skillSet,
            assignedTo: task.assignedTo,
            assigned: task.assigned,
            status: task.status || (task.assigned ? 'assigned' : 'pending')
          });
        });
        
        this.tasks = tasksArray;
        this.isLoadingTasks = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoadingTasks = false;
        this.tasks = [];
      }
    });
  }

  loadAllTasks() {
    console.log('loadAllTasks() called - fetching all tasks for current project...');
    this.loadTasks(); // For now, this does the same as loadTasks, but can be extended for project-specific filtering
  }

  forceRefreshTasks() {
    console.log('forceRefreshTasks() called - forcing task list refresh...');
    // Force a complete refresh with multiple attempts
    setTimeout(() => this.loadTasks(), 100);
    setTimeout(() => this.loadTasks(), 1000);
    setTimeout(() => this.loadTasks(), 2000);
  }

  onProjectSubmit() {
    if (!this.projectName.trim()) {
      this.errorMessage = 'Please enter a project name.';
      return;
    }

    this.clearMessages();
    this.isLoading = true;

    this.teamLeadService.createProject(this.projectName.trim()).subscribe({
      next: (response) => {
        this.hasExistingProject = true;
        this.currentStep = 'task';
        this.isLoading = false;
        this.successMessage = 'Project created! Now add a task.';
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error, 'Failed to create project');
      }
    });
  }  onTaskSubmit() {
    if (!this.taskName.trim()) {
      this.errorMessage = 'Please enter a task name.';
      return;
    }

    if (!this.skills.trim()) {
      this.errorMessage = 'Please enter at least one skill.';
      return;
    }

    const skillSet = this.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    if (skillSet.length === 0) {
      this.errorMessage = 'Please enter valid skills separated by commas.';
      return;
    }

    this.clearMessages();
    this.isLoading = true;

    console.log('Creating task:', { name: this.taskName.trim(), skillSet });    this.teamLeadService.createTask(this.taskName.trim(), skillSet).subscribe({
      next: (response) => {
        console.log('Task created successfully:', response);
        this.currentStep = 'complete';
        this.isLoading = false;
        this.successMessage = 'Task created successfully!';
        
        // Clear the form
        this.taskName = '';
        this.skills = '';
        
        // Reload tasks to show the new task in sidebar with a slight delay
        console.log('Reloading tasks after task creation...');
        setTimeout(() => {
          this.loadTasks();
        }, 500); // 500ms delay to ensure backend has processed the new task
        
        // Also force refresh task count
        this.forceRefreshTasks();
      },
      error: (error) => {
        console.error('Task creation failed:', error);
        this.isLoading = false;
        this.handleError(error, 'Failed to create task');
      }
    });
  }  assignTask(taskId: number) {
    if (!taskId) {
      this.errorMessage = 'Invalid task ID';
      return;
    }

    console.log('Assigning task with ID:', taskId);
    
    this.teamLeadService.assignTask(taskId).subscribe({
      next: (response) => {
        console.log('Task assigned successfully:', response);
        this.successMessage = 'Task assigned successfully!';
        
        // Reload tasks to update status with delay
        setTimeout(() => {
          this.loadTasks();
        }, 500);
        
        // Force multiple refreshes to ensure status updates
        this.forceRefreshTasks();
        
        // Clear message after 3 seconds
        setTimeout(() => {
          this.clearMessages();
        }, 3000);
      },
      error: (error) => {
        console.error('Failed to assign task:', error);
        this.errorMessage = 'Failed to assign task: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }
  createAnotherTask() {
    this.taskName = '';
    this.skills = '';
    this.currentStep = 'task';
    this.clearMessages();
    // Keep the task list updated
    this.loadTasks();
  }
  toggleSidebar() {
    console.log('toggleSidebar called, current showSidebar:', this.showSidebar);
    this.showSidebar = !this.showSidebar;
    console.log('toggled to showSidebar:', this.showSidebar);
  }
  openSidebar() {
    console.log('openSidebar called');
    this.showSidebar = true;
  }

  closeSidebar() {
    console.log('closeSidebar called');
    this.showSidebar = false;
  }  // Profile dropdown methods
  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeProfileDropdown() {
    this.showProfileDropdown = false;
  }

  openEditProfile() {
    // Pre-populate the edit form with current profile data
    if (this.profileData) {
      this.editProfileData = {
        employeeName: this.profileData.employeeName || '',
        email: this.profileData.email || '',
        password: '' // Always start with empty password
      };
    }
    this.showEditProfileModal = true;
    this.showProfileDropdown = false; // Close the dropdown
    this.profileUpdateError = '';
    this.profileUpdateSuccess = '';
  }

  closeEditProfile() {
    this.showEditProfileModal = false;
    this.profileUpdateError = '';
    this.profileUpdateSuccess = '';
  }

  updateProfile() {
    if (!this.editProfileData.employeeName.trim() || !this.editProfileData.email.trim()) {
      this.profileUpdateError = 'Name and email are required.';
      return;
    }

    this.isUpdatingProfile = true;
    this.profileUpdateError = '';
    this.profileUpdateSuccess = '';

    // Prepare update data - only include password if it's provided
    const updateData: any = {
      employeeName: this.editProfileData.employeeName.trim(),
      email: this.editProfileData.email.trim()
    };

    if (this.editProfileData.password && this.editProfileData.password.trim()) {
      updateData.password = this.editProfileData.password.trim();
    }

    this.teamLeadService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.isUpdatingProfile = false;
        this.profileUpdateSuccess = 'Profile updated successfully!';
        
        // Update the local profile data
        this.profileData = { ...this.profileData, ...updateData };
        
        // Close modal after a short delay
        setTimeout(() => {
          this.closeEditProfile();
        }, 1500);
      },
      error: (error) => {
        this.isUpdatingProfile = false;
        console.error('Profile update error:', error);
        this.profileUpdateError = error?.error?.message || 'Failed to update profile. Please try again.';
      }
    });
  }

  logout() {
    this.teamLeadService.clearToken();
    this.redirectToLogin();
  }

  // Host listener for clicking outside dropdown
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = this.elementRef.nativeElement.querySelector('.profile-dropdown');
    
    if (dropdown && !dropdown.contains(target)) {
      this.showProfileDropdown = false;
    }
  }

  // Track function for ngFor to handle complex objects
  trackByTaskId(index: number, task: any): any {
    return task?.taskId || task?.id || index;
  }

  // Helper methods to safely access task properties
  getTaskId(task: any): number {
    return task?.taskId || task?.id || 0;
  }

  getTaskSkills(task: any): string {
    if (task?.skillSet && Array.isArray(task.skillSet)) {
      return task.skillSet.join(', ');
    }
    return 'No skills specified';
  }

  getTaskStatus(task: any): string {
    const status = task?.assignedTo ? 'assigned' : 'pending';
    return status.toLowerCase();
  }

  getTaskStatusDisplay(task: any): string {
    return task?.assignedTo ? 'Assigned' : 'Pending';
  }

  isTaskPending(task: any): boolean {
    return !task?.assignedTo;
  }

  // Debug method to safely display task info
  debugTask(task: any): string {
    try {
      return JSON.stringify({
        taskId: task?.taskId,
        name: task?.name,
        skillSet: task?.skillSet,
        assignedTo: task?.assignedTo ? 'Assigned' : 'Pending'
      }, null, 2);
    } catch (error) {
      return 'Complex object - cannot display';
    }
  }

  private handleError(error: any, defaultMessage: string) {
    if (error.status === 401 || error.status === 403) {
      this.errorMessage = 'Your session has expired. Please log in again.';
    } else if (error.status === 500 && error.error?.includes('already')) {
      this.errorMessage = 'You already have a project. You can only add tasks.';
      this.hasExistingProject = true;
      this.currentStep = 'task';
    } else {
      this.errorMessage = error.error?.message || defaultMessage;
    }
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  redirectToLogin() {
    window.location.href = '/';
  }
}
