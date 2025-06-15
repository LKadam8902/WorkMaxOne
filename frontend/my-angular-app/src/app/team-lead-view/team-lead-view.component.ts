import { Component, OnInit } from '@angular/core';
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

  constructor(private teamLeadService: TeamLeadService) {}

  ngOnInit() {
    if (!this.teamLeadService.isLoggedIn()) {
      this.errorMessage = 'Your session has expired. Please log in again.';
      return;
    }
    
    this.checkExistingProject();
  }

  private checkExistingProject() {
    this.isLoading = true;
    this.teamLeadService.getProjects().subscribe({
      next: (response) => {
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

    this.teamLeadService.createTask(this.taskName.trim(), skillSet).subscribe({
      next: (response) => {
        this.currentStep = 'complete';
        this.isLoading = false;
        this.successMessage = 'Task created successfully!';
      },
      error: (error) => {
        this.isLoading = false;
        this.handleError(error, 'Failed to create task');
      }
    });
  }

  createAnotherTask() {
    this.taskName = '';
    this.skills = '';
    this.currentStep = 'task';
    this.clearMessages();
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
