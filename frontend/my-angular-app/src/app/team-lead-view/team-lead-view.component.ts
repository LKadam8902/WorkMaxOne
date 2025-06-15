import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamLeadService } from '../services/team-lead.service';

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

  constructor(private teamLeadService: TeamLeadService, private elementRef: ElementRef) {
    console.log('TeamLeadViewComponent initialized');
  }  ngOnInit() {
    if (!this.teamLeadService.isLoggedIn()) {
      this.errorMessage = 'Your session has expired. Please log in again.';
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
        
        // Handle different response formats
        if (Array.isArray(response)) {
          this.tasks = response;
          console.log('Using response as array directly');
        } else if (response && Array.isArray(response.tasks)) {
          this.tasks = response.tasks;
          console.log('Using response.tasks array');
        } else if (response && response.data && Array.isArray(response.data)) {
          this.tasks = response.data;
          console.log('Using response.data array');
        } else {
          this.tasks = [];
          console.warn('Unexpected tasks response format:', response);
          console.warn('Setting tasks to empty array');
        }
        
        this.isLoadingTasks = false;
        console.log('Final processed tasks array:', this.tasks);
        console.log('Number of tasks:', this.tasks.length);
        
        // Log each task for debugging
        this.tasks.forEach((task, index) => {
          console.log(`Task ${index}:`, {
            id: this.getTaskId(task),
            name: task.name,
            skills: this.getTaskSkills(task),
            status: this.getTaskStatusDisplay(task),
            isPending: this.isTaskPending(task)
          });
        });
      },
      error: (error) => {
        console.error('Failed to load tasks - ERROR:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        this.tasks = [];
        this.isLoadingTasks = false;
        
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Your session has expired. Please log in again.';
          console.error('Authentication error - session expired');
        } else {
          this.errorMessage = 'Failed to load tasks. Please try refreshing.';
          console.error('Other error loading tasks');
        }
      }
    });  }

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

    console.log('Creating task:', { name: this.taskName.trim(), skillSet });

    this.teamLeadService.createTask(this.taskName.trim(), skillSet).subscribe({
      next: (response) => {
        console.log('Task created successfully:', response);
        this.currentStep = 'complete';
        this.isLoading = false;
        this.successMessage = 'Task created successfully!';
        
        // Reload tasks to show the new task in sidebar
        console.log('Reloading tasks after task creation...');
        this.loadTasks();
      },
      error: (error) => {
        console.error('Task creation failed:', error);
        this.isLoading = false;
        this.handleError(error, 'Failed to create task');
      }
    });
  }
  assignTask(taskId: number) {
    if (!taskId) {
      this.errorMessage = 'Invalid task ID';
      return;
    }

    this.teamLeadService.assignTask(taskId).subscribe({
      next: (response) => {
        this.successMessage = 'Task assigned successfully!';
        // Reload tasks to update status
        this.loadTasks();
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
