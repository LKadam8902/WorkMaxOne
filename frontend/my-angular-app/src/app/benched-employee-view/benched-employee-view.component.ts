import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BenchedEmployeeService } from '../services/benched-employee.service';
import { UserService } from '../services/user.service';

interface Task {
  id: number;
  taskId: number;
  name: string;
  skillSet: string[];
  status: string;
  assignedTo?: number;
  assignedBy?: number;
  project?: any;
  assignedDate?: string;
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
  mySkills: string[] = [];
  newSkills: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoadingTasks = false;
  profileData: any = null;

  // Profile menu
  showProfileMenu = false;
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
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('BenchedEmployeeViewComponent initialized');
    
    // Validate user has benched employee role
    if (!this.userService.validateTokenForRole('BENCHED_EMPLOYEE')) {
      this.errorMessage = 'Access denied. Benched Employee credentials required.';
      console.warn('User does not have BENCHED_EMPLOYEE role');
      setTimeout(() => {
        this.userService.logout();
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }
    
    if (!this.isLoggedIn()) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      console.warn('User not logged in');
      setTimeout(() => {
        this.router.navigate(['/sign-in']);
      }, 2000);
      return;
    }
    
    console.log('Starting to load tasks and profile...');
    this.loadTasks();
    this.loadProfile();
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  loadProfile(): void {
    console.log('Loading benched employee profile...');
    
    this.benchedEmployeeService.getProfile().subscribe(
      (res: any) => {
        console.log('Profile response:', res);
        
        // Handle different response formats
        if (res && typeof res === 'object') {
          this.profileData = res;
          this.editProfileData = {
            employeeName: res.employeeName || res.name || 'Employee',
            email: res.email || '',
            password: ''
          };
          
          // Parse skills if they exist
          const skills = res.skillSet ?? res.skills;
          if (skills) {
            if (typeof skills === 'string') {
              this.mySkills = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            } else if (Array.isArray(skills)) {
              this.mySkills = skills;
            }
          }
          
          console.log('Profile loaded:', this.profileData);
          console.log('Skills loaded:', this.mySkills);
        }
      },
      (error: any) => {
        console.error('Error loading profile:', error);
        // Profile loading is not critical, so we don't show error
      }
    );
  }

  loadTasks(): void {
    this.isLoadingTasks = true;
    this.errorMessage = '';
    console.log('Loading tasks for benched employee...');
    
    this.benchedEmployeeService.getTasks().subscribe(
      (res: any) => {
        console.log('Tasks response received:', res);
        console.log('Response type:', typeof res);
        console.log('Is array:', Array.isArray(res));
        
        // Handle different response formats
        let tasksArray: any[] = [];
        
        if (Array.isArray(res)) {
          tasksArray = res;
        } else if (res && res.tasks && Array.isArray(res.tasks)) {
          tasksArray = res.tasks;
        } else if (res && res.data && Array.isArray(res.data)) {
          tasksArray = res.data;
        } else if (res && typeof res === 'object') {
          // Single task or object, convert to array
          tasksArray = [res];
        }
        
        console.log('Raw tasks array:', tasksArray);
        
        // Filter out null/undefined and map to Task interface
        this.tasks = tasksArray
          .filter((t: any) => t && (t.name || t.taskName))
          .map((t: any) => {
            const task: Task = {
              id: t.id || t.taskId || 0,
              taskId: t.taskId || t.id || 0,
              name: t.name || t.taskName || 'Untitled Task',
              skillSet: (t.skillSet && Array.isArray(t.skillSet)) ? t.skillSet : (t.skills ? t.skills.split(',') : []),
              status: t.status || 'TO_DO',
              assignedTo: t.assignedTo || t.assignedToId,
              assignedBy: t.assignedBy || t.assignedById,
              project: t.project || t.projectName,
              assignedDate: t.assignedDate
            };
            console.log('Mapped task:', task);
            return task;
          });
        
        console.log('Processed tasks:', this.tasks);
        console.log('Total tasks:', this.tasks.length);
        
        this.isLoadingTasks = false;
        
        if (this.tasks.length === 0) {
          this.successMessage = 'No tasks assigned yet.';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      },
      (error: any) => {
        console.error('Error loading tasks:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.errorMessage = 'Failed to load tasks. Please try again.';
        this.isLoadingTasks = false;
        this.tasks = [];
      }
    );
  }

  refreshTasksList(): void {
    this.loadTasks();
  }

  getTasksInProgress(): number {
    const count = this.tasks.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'IN_PROGRESS' || status === 'IN-PROGRESS' || status === 'INPROGRESS';
    }).length;
    console.log('Tasks in progress:', count);
    return count;
  }

  getTasksCompleted(): number {
    const count = this.tasks.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'DONE' || status === 'COMPLETED' || status === 'COMPLETE';
    }).length;
    console.log('Tasks completed:', count);
    return count;
  }

  addSkills(): void {
    if (!this.newSkills.trim()) {
      this.errorMessage = 'Please enter at least one skill';
      return;
    }

    this.isLoadingTasks = true;
    // Convert comma-separated string to array
    const skillsArray = this.newSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    this.benchedEmployeeService.addSkills(skillsArray).subscribe(
      (res: any) => {
        this.successMessage = 'Skills added successfully!';
        this.newSkills = '';
        this.loadProfile();
        this.isLoadingTasks = false;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      (error) => {
        console.error('Error adding skills:', error);
        this.errorMessage = 'Failed to add skills. Please try again.';
        this.isLoadingTasks = false;
      }
    );
  }

  /* ===== PROFILE MENU ===== */

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  editProfile(): void {
    this.showProfileMenu = false;
    this.showEditProfileModal = true;
  }

  closeEditProfile(): void {
    this.showEditProfileModal = false;
    this.profileUpdateError = '';
    this.profileUpdateSuccess = '';
  }

  updateProfile(): void {
    if (!this.editProfileData.password) {
      this.profileUpdateError = 'Password is required to update profile';
      return;
    }

    this.isUpdatingProfile = true;
    this.profileUpdateError = '';
    this.profileUpdateSuccess = '';

    const updateData = {
      employeeName: this.editProfileData.employeeName,
      email: this.editProfileData.email,
      password: this.editProfileData.password
    };

    this.benchedEmployeeService.updateProfile(updateData).subscribe(
      (res: any) => {
        this.profileUpdateSuccess = 'Profile updated successfully!';
        this.isUpdatingProfile = false;
        setTimeout(() => {
          this.closeEditProfile();
          this.loadProfile();
        }, 1500);
      },
      (error: any) => {
        console.error('Error updating profile:', error);
        this.profileUpdateError = error.error?.message || 'Failed to update profile';
        this.isUpdatingProfile = false;
      }
    );
  }

  logoutUser(): void {
    this.showProfileMenu = false;
    this.userService.logout();
    this.router.navigate(['/sign-in']);
  }

  /* ===== UTILITY ===== */

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  }
}
