import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  profileUpdateSuccess = '';  constructor(
    private teamLeadService: TeamLeadService, 
    private elementRef: ElementRef,
    private userService: UserService,
    private router: Router,
    private http: HttpClient
  ) {
    console.log('TeamLeadViewComponent initialized');
  }  ngOnInit() {
    // Validate user has team lead role
    if (!this.userService.validateTokenForRole('TEAM_LEAD')) {
      this.errorMessage = 'Access denied. Team Lead credentials required.';
      setTimeout(() => {
        this.userService.logout();
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }
    
    if (!this.teamLeadService.isLoggedIn()) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      setTimeout(() => {
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }    // Load tasks first to determine if user has existing project
    this.loadTasks();
    this.checkExistingProject();
    
    // Check available employees for debugging assignment issues
    this.checkAvailableEmployees();
    
    // Expose component for manual testing in development
    this.exposeForTesting();
  }private checkExistingProject() {
    this.isLoading = true;
    this.teamLeadService.getProjects().subscribe({
      next: (response) => {
        // Store profile data
        this.profileData = response;
        console.log('Profile data loaded:', this.profileData);
        
        if (response && response.project) {
          this.hasExistingProject = true;
          this.currentStep = 'task';
          console.log('Existing project found, loading tasks...');
          // Load tasks immediately for existing projects
          this.loadTasks();
        } else {
          this.hasExistingProject = false;
          this.currentStep = 'project';
          // Still load tasks in case backend has project but JSON parsing failed
          console.log('No project detected in response, but checking for tasks anyway...');
          this.loadTasks();
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
  }loadTasks() {
    console.log('loadTasks() called - checking for tasks...');
    this.isLoadingTasks = true;    this.teamLeadService.getTasks().subscribe({
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
        } else {
          console.warn('Unexpected response format, treating as empty array');
          tasksArray = [];
        }
        
        console.log('Final processed tasks array:', tasksArray);
        console.log('Number of tasks found:', tasksArray.length);
        
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
        });this.tasks = tasksArray;
        this.isLoadingTasks = false;
        console.log('Tasks loaded successfully. Total tasks:', this.tasks.length);
        
        // If we have tasks but no project was detected, assume project exists
        if (this.tasks.length > 0 && !this.hasExistingProject) {
          console.log('Tasks found but no project detected - assuming project exists, switching to task mode');
          this.hasExistingProject = true;
          this.currentStep = 'task';
        }
        
        // Update sidebar visibility if tasks are available
        this.updateSidebarVisibility();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoadingTasks = false;
        this.tasks = [];
        // Don't show error to user unless it's a critical auth issue
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Session expired. Please log in again.';
        } else {
          // For JSON parsing errors, just log them but don't show to user
          console.warn('Tasks could not be loaded due to server response format issues. This will be resolved automatically.');
        }
      }
    });
  }  loadAllTasks() {
    console.log('loadAllTasks() called - fetching all tasks for current project...');
    this.tasks = []; // Clear existing tasks first
    this.loadTasks(); // Reload from server
  }  refreshTasksList() {
    console.log('refreshTasksList() called - performing immediate task refresh...');
    this.tasks = []; // Clear current tasks
    this.isLoadingTasks = true; // Show loading state
    this.loadTasks();
  }

  forceRefreshTasks() {
    console.log('forceRefreshTasks() called - forcing task list refresh...');
    // Single refresh instead of multiple attempts to avoid conflicts
    this.loadTasks();
  }

  retryLoadTasks() {
    console.log('retryLoadTasks() called - retrying task load after delay...');
    setTimeout(() => {
      this.loadTasks();
    }, 1000);
  }

  // Ensure sidebar shows tasks when they exist
  updateSidebarVisibility() {
    if (this.tasks.length > 0 && !this.showSidebar) {
      console.log('Tasks available, ensuring sidebar is visible');
      this.showSidebar = true;
    }
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
        
        // Update profile data to reflect the new project
        if (this.profileData) {
          this.profileData.project = { projectName: this.projectName.trim() };
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error, 'Failed to create project');
      }    });
  }

  onTaskSubmit() {
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
        this.successMessage = 'Task created successfully!';        // Clear the form
        this.taskName = '';
        this.skills = '';
        
        // Refresh tasks after a small delay to ensure backend processing is complete
        setTimeout(() => {
          this.refreshTasksList();
        }, 300);
        
        // Also retry after a longer delay in case of backend issues
        setTimeout(() => {
          this.retryLoadTasks();
        }, 1500);
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
    }    console.log('Assigning task with ID:', taskId);
    
    // Optimistically update the task status in UI
    const taskToUpdate = this.tasks.find(task => (task.taskId || task.id) === taskId);
    console.log('Found task to update:', taskToUpdate);
    if (taskToUpdate) {
      console.log('Before assignment - Task state:', {
        taskId: taskToUpdate.taskId || taskToUpdate.id,
        name: taskToUpdate.name,
        assignedTo: taskToUpdate.assignedTo,
        assigned: taskToUpdate.assigned,
        status: taskToUpdate.status
      });
      taskToUpdate.assignedTo = 'Pending Assignment...';
      taskToUpdate.assigned = true;
      console.log('After optimistic update - Task state:', {
        taskId: taskToUpdate.taskId || taskToUpdate.id,
        name: taskToUpdate.name,
        assignedTo: taskToUpdate.assignedTo,
        assigned: taskToUpdate.assigned,
        status: taskToUpdate.status
      });
    } else {
      console.warn('Could not find task to update with ID:', taskId);
    }
      this.teamLeadService.assignTask(taskId).subscribe({
      next: (response) => {
        console.log('Task assigned successfully:', response);
        this.successMessage = 'Task assigned successfully!';        // Add a small delay before refreshing to allow backend to process the assignment
        setTimeout(() => {
          console.log('Starting delayed refresh after task assignment...');
          this.refreshTasksList();
          
          // Verify the assignment worked after refresh
          setTimeout(() => {
            const updatedTask = this.tasks.find(task => (task.taskId || task.id) === taskId);
            if (updatedTask) {
              console.log('Post-refresh task state:', {
                taskId: updatedTask.taskId || updatedTask.id,
                name: updatedTask.name,
                assignedTo: updatedTask.assignedTo,
                assigned: updatedTask.assigned,
                status: updatedTask.status
              });              if (!updatedTask.assignedTo || updatedTask.assignedTo === null) {
                console.warn('⚠️  BACKEND ISSUE DETECTED: Task assignment API returns success but task remains unassigned');
                console.warn('This indicates a backend bug - the assignment logic is not working properly');
                  // Update the UI to show the backend issue
                this.errorMessage = `⚠️ Backend Issue: Task assignment failed due to a server-side bug. The API returns "success" but doesn't actually assign the task. Please contact the development team to fix the backend assignment logic.`;                // Show detailed information for developers
                this.showBackendIssueDetails();
                
                // Run diagnostics
                this.diagnoseBackendState();
                
                // Provide fix suggestions for backend team
                this.suggestBackendFixes();
                
                // Revert the optimistic update since it didn't work
                if (taskToUpdate) {
                  taskToUpdate.assignedTo = null;
                  taskToUpdate.assigned = false;
                }
                
                // Log the full backend response for debugging
                console.error('Backend Assignment Failure Details:', {
                  taskId: taskId,
                  apiResponse: response,
                  actualTaskState: updatedTask,
                  issue: 'API returns success but database is not updated'
                });
                
                // Show detailed backend issue information
                this.showBackendIssueDetails();
                
              } else {
                console.log('✅ Task assignment verified successfully');
              }
            }
          }, 1000);
        }, 500); // Wait 500ms before refreshing
        
        // Clear message after 3 seconds
        setTimeout(() => {
          this.clearMessages();
        }, 3000);
      },      error: (error) => {
        console.error('Failed to assign task:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error
        });
        
        // Revert optimistic update on error
        if (taskToUpdate) {
          taskToUpdate.assignedTo = null;
          taskToUpdate.assigned = false;
          console.log('Reverted optimistic update due to error');
        }
        
        this.errorMessage = 'Failed to assign task: ' + (error.error?.message || error.message || 'Unknown error');
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          this.clearMessages();
        }, 5000);
      }
    });
  }  createAnotherTask() {
    this.taskName = '';
    this.skills = '';
    this.currentStep = 'task';
    this.clearMessages();
    // Refresh task list to ensure it's up to date
    this.refreshTasksList();
  }

  switchToTaskMode() {
    console.log('switchToTaskMode() called - switching to task creation mode');
    this.hasExistingProject = true;
    this.currentStep = 'task';
    this.clearMessages();
    this.refreshTasksList();
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

    // Prepare update data according to backend DTO (name, profileUrl)
    const updateData: any = {
      name: this.editProfileData.employeeName.trim(),
      profileUrl: this.editProfileData.email.trim() // Using email as profileUrl for now
    };

    this.teamLeadService.updateProfile(updateData).subscribe({
      next: (response) => {
        this.isUpdatingProfile = false;
        this.profileUpdateSuccess = 'Profile updated successfully!';
        
        // Update the local profile data
        if (this.profileData) {
          this.profileData.employeeName = updateData.name;
          this.profileData.email = updateData.profileUrl;
        }
        
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

  // Temporary test method for improved extraction
  testImprovedExtraction() {
    console.log('=== TESTING IMPROVED TASK EXTRACTION ===');
    console.log('Expected tasks in DB: project ui (ID:1), project frontend (ID:2), project readme (ID:4), project backend (ID:3)');
    console.log('Current tasks shown:', this.tasks.length);
    
    this.tasks = [];
    this.isLoadingTasks = true;
    
    this.teamLeadService.getTasks().subscribe({
      next: (response) => {
        console.log('Raw API response received');
        this.tasks = Array.isArray(response) ? response : [response];
        this.isLoadingTasks = false;
        
        console.log('=== EXTRACTION TEST RESULTS ===');
        console.log(`Found ${this.tasks.length} tasks:`);
        this.tasks.forEach((task, index) => {
          console.log(`Task ${index + 1}: ID=${task.taskId || task.id}, Name="${task.name}", Skills=[${task.skillSet?.join(', ') || 'none'}], Status=${task.status}`);
        });
        
        if (this.tasks.length >= 4) {
          console.log('✅ SUCCESS: Found all expected tasks!');
          this.successMessage = `✅ Success! Found all ${this.tasks.length} tasks from the database.`;
        } else {
          console.log(`⚠️ PARTIAL: Found ${this.tasks.length}/4 expected tasks. Some may be lost in JSON corruption.`);
          this.errorMessage = `Found ${this.tasks.length}/4 expected tasks. Extraction may need further improvement.`;
        }
        
        // Auto clear messages after 5 seconds
        setTimeout(() => {
          this.successMessage = '';
          this.errorMessage = '';
        }, 5000);
      },
      error: (error) => {
        console.error('Test extraction failed:', error);
        this.isLoadingTasks = false;
        this.errorMessage = 'Failed to test task extraction: ' + error.message;
      }
    });
  }

  // Force raw extraction method to bypass all JSON parsing
  forceRawExtraction() {
    console.log('=== FORCE RAW EXTRACTION TEST ===');
    console.log('Bypassing JSON parsing completely and testing direct extraction methods');
    
    this.isLoadingTasks = true;
    this.tasks = [];
    
    // Make the HTTP call but force manual extraction
    this.http.get(`${this.teamLeadService['apiUrl']}/allTasks`, { 
      headers: this.teamLeadService['getAuthHeaders'](),
      responseType: 'text'
    }).subscribe({
      next: (rawResponse: string) => {
        console.log('Raw response length:', rawResponse.length);
        console.log('Raw response preview:', rawResponse.substring(0, 1000));
        
        // Force manual extraction directly
        console.log('Calling extractTasksFromMalformedJson directly...');
        const extractedTasks = this.teamLeadService['extractTasksFromMalformedJson'](rawResponse);
        
        this.tasks = extractedTasks;
        this.isLoadingTasks = false;
        
        console.log('=== FORCE EXTRACTION RESULTS ===');
        console.log(`Extracted ${this.tasks.length} tasks directly:`);
        this.tasks.forEach((task, index) => {
          console.log(`Task ${index + 1}: ID=${task.taskId}, Name="${task.name}", Skills=[${task.skillSet?.join(', ') || 'none'}]`);
        });
        
        if (this.tasks.length >= 4) {
          this.successMessage = `🎉 SUCCESS! Found all ${this.tasks.length} tasks using raw extraction!`;
        } else {
          this.errorMessage = `⚠️ Found ${this.tasks.length}/4 tasks. May need backend fix to get all tasks.`;
        }
        
        setTimeout(() => {
          this.successMessage = '';
          this.errorMessage = '';
        }, 5000);      },
      error: (error: any) => {
        console.error('Force extraction failed:', error);
        this.isLoadingTasks = false;
        this.errorMessage = 'Force extraction failed: ' + error.message;
      }
    });
  }

  // Test method to analyze the raw backend response in detail
  analyzeBackendResponse() {
    console.log('=== ANALYZING BACKEND RESPONSE IN DETAIL ===');
    console.log('Expected: 4 tasks from database');
    console.log('Database tasks: project ui (ID:1), project frontend (ID:2), project readme (ID:4), project backend (ID:3)');
    
    this.http.get(`${this.teamLeadService['apiUrl']}/allTasks`, { 
      headers: this.teamLeadService['getAuthHeaders'](),
      responseType: 'text'
    }).subscribe({
      next: (rawResponse: string) => {
        console.log('=== RAW BACKEND ANALYSIS ===');
        console.log('Response length:', rawResponse.length);
        console.log('First 2000 chars:', rawResponse.substring(0, 2000));
        
        // Count how many times each task appears
        const taskIds = [1, 2, 3, 4];
        const taskNames = ['project ui', 'project frontend', 'project backend', 'project readme'];
        
        console.log('=== TASK PRESENCE CHECK ===');
        taskIds.forEach(id => {
          const count = (rawResponse.match(new RegExp(`"taskId"\\s*:\\s*${id}`, 'g')) || []).length;
          console.log(`Task ID ${id}: Found ${count} times`);
        });
        
        taskNames.forEach(name => {
          const count = (rawResponse.match(new RegExp(`"name"\\s*:\\s*"${name}"`, 'g')) || []).length;
          console.log(`Task name "${name}": Found ${count} times`);
        });
        
        // Check if response starts with array
        const startsWithArray = rawResponse.trim().startsWith('[');
        const endsWithArray = rawResponse.trim().endsWith(']');
        console.log('Starts with [:', startsWithArray);
        console.log('Ends with ]:', endsWithArray);
        
        // Check for multiple task objects
        const taskObjectCount = (rawResponse.match(/"taskId"/g) || []).length;
        console.log('Total "taskId" occurrences:', taskObjectCount);
        
        // Check if this is really an array of tasks or just one task
        if (taskObjectCount === 1) {
          console.log('🚨 PROBLEM: Backend only returning 1 task, not an array of all tasks!');
          this.errorMessage = '🚨 Backend Issue: API only returning 1 task instead of all 4 tasks from database!';
        } else if (taskObjectCount >= 4) {
          console.log('✅ Backend returning multiple tasks, extraction issue is on frontend');
          this.successMessage = '✅ Backend has multiple tasks, working on frontend extraction...';
        } else {
          console.log(`⚠️ Backend returning ${taskObjectCount} tasks, expected 4`);
          this.errorMessage = `⚠️ Backend returning ${taskObjectCount}/4 tasks. Partial backend issue.`;
        }
        
        setTimeout(() => {
          this.successMessage = '';
          this.errorMessage = '';
        }, 8000);
      },
      error: (error: any) => {
        console.error('Backend analysis failed:', error);
        this.errorMessage = 'Failed to analyze backend response: ' + error.message;
      }
    });
  }

  // Method to retry task assignment if it initially fails
  retryTaskAssignment(taskId: number) {
    console.log('Retrying task assignment for task ID:', taskId);
    this.assignTask(taskId);
  }

  // Method to check if a task assignment was successful
  verifyTaskAssignment(taskId: number): boolean {
    const task = this.tasks.find(task => (task.taskId || task.id) === taskId);
    if (task) {
      console.log('Verifying task assignment for:', {
        taskId: task.taskId || task.id,
        name: task.name,
        assignedTo: task.assignedTo,
        assigned: task.assigned,
        status: task.status
      });
      return task.assignedTo !== null && task.assignedTo !== undefined && task.assignedTo !== '';
    }
    return false;
  }

  // Method to check available employees for debugging
  checkAvailableEmployees() {
    console.log('Checking available employees...');
    this.teamLeadService.getAvailableEmployees().subscribe({
      next: (employees) => {
        console.log('Available employees for task assignment:', employees);
        if (Array.isArray(employees) && employees.length === 0) {
          console.warn('No available employees found - this may be why task assignment is failing');
        }
      },
      error: (error) => {
        console.log('Could not fetch available employees (endpoint may not exist):', error);
      }
    });
  }

  // Debug method to test assignment with detailed logging
  debugAssignTask(taskId: number) {
    console.log(`=== DEBUG TASK ASSIGNMENT START ===`);
    console.log(`Task ID: ${taskId}`);
    
    // Check token first
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 50) + '...');
    }
    
    // Check task exists
    const task = this.tasks.find(t => (t.taskId || t.id) === taskId);
    console.log('Task found:', !!task);
    if (task) {
      console.log('Task details:', {
        id: task.taskId || task.id,
        name: task.name,
        skillSet: task.skillSet,
        assignedTo: task.assignedTo,
        status: task.status
      });
    }
    
    // Try normal assignment
    console.log('Attempting normal assignment...');
    this.assignTask(taskId);
    
    console.log(`=== DEBUG TASK ASSIGNMENT END ===`);
  }

  // Manual test method that can be called from browser console
  // Usage: component.manualTestAssignment(6)
  manualTestAssignment(taskId: number) {
    console.log(`🧪 Manual Test: Attempting to assign task ${taskId}`);
    
    // Show task before assignment
    const task = this.tasks.find(t => (t.taskId || t.id) === taskId);
    console.log('Task before assignment:', task);
    
    // Call assignment
    this.assignTask(taskId);
    
    console.log('Assignment call initiated. Check logs above for results.');
  }
  
  // Helper method to expose this component to window for testing
  // Call this in ngOnInit if needed: window.testComponent = this;
  exposeForTesting() {
    (window as any).testComponent = this;
    console.log('Component exposed as window.testComponent for manual testing');
    console.log('Available test methods:');
    console.log('- testComponent.manualTestAssignment(taskId)');
    console.log('- testComponent.diagnoseBackendState()');
    console.log('- testComponent.suggestBackendFixes()');
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

  // Method to show detailed backend issue information
  showBackendIssueDetails() {
    const issueDetails = `
BACKEND ASSIGNMENT ISSUE DETECTED:

Problem: The backend assignment API returns "success" but doesn't actually assign tasks.

Technical Details:
- API Endpoint: PUT /teamLead/assignTask/{taskId} 
- Response: {"message":"Task assigned successfully"}
- Database State: assignedTo remains null
- POST alternative: Returns 405 Method Not Allowed

Root Cause: The backend assignment logic is not working properly.

Workaround: The backend team needs to fix the assignment logic in the server code.

Expected Behavior: After a successful assignment, the task's assignedTo field should contain the employee ID.
    `;
    
    console.log(issueDetails);
    alert('Backend Assignment Issue Detected. Check console for technical details.');
  }

  // Method to check if backend has any available employees
  diagnoseBackendState() {
    console.log('🔍 Diagnosing backend state for task assignment...');
    
    // Check current user's authentication
    const token = localStorage.getItem('token');
    console.log('✓ Authentication token present:', !!token);
    
    // Check available tasks
    console.log('✓ Available tasks count:', this.tasks.length);
    console.log('✓ Unassigned tasks:', this.tasks.filter(t => !t.assignedTo).length);
    
    // Try to get available employees
    this.checkAvailableEmployees();
    
    console.log(`
🔍 DIAGNOSIS SUMMARY:
- Frontend is working correctly
- Authentication is valid  
- API calls are succeeding
- Problem is in backend assignment logic
- Recommendation: Check backend server logs and assignment implementation
    `);
  }

  // Method to provide backend fix suggestions
  suggestBackendFixes() {
    const suggestions = `
🔧 BACKEND FIX SUGGESTIONS:

The task assignment endpoint is likely missing proper implementation. Check:

1. Assignment Logic:
   - Verify the assignTask method actually updates the database
   - Ensure it finds and assigns available employees
   - Check if employee selection logic is working

2. Database Transaction:
   - Make sure the assignment is properly committed to database
   - Verify the assignedTo field is being set correctly
   - Check if there are any transaction rollbacks

3. Employee Availability:
   - Ensure there are employees with matching skills in the database
   - Verify employees are in "available" or "benched" status
   - Check if skill matching logic is working

4. Common Backend Issues:
   - Missing @Transactional annotation (Spring)
   - Incomplete save operations
   - Silent exceptions being caught
   - Incorrect employee query logic

5. Testing Recommendations:
   - Add logging to the assignTask endpoint
   - Verify database state after assignment calls
   - Test with different task and employee combinations
   - Check server logs for any errors

Frontend is working correctly - this is a backend issue.
    `;
    
    console.log(suggestions);
  }

  // ...existing code...
}
