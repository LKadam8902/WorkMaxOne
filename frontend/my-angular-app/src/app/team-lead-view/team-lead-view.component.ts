import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamLeadService } from '../services/team-lead.service';

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  name: string;
  skillSet: string[];
  status: string;
}

@Component({
  selector: 'app-team-lead-view',
  standalone: true,
  templateUrl: './team-lead-view.component.html',
  styleUrls: ['./team-lead-view.component.css'],
  imports: [CommonModule, FormsModule]
})
export class TeamLeadViewComponent implements OnInit {
  projects: Project[] = [];
  tasks: Task[] = [];

  newProjectName = '';
  newTaskName = '';
  newTaskSkills = '';

  showCreateForm = false;
  showTaskForm = false;
  showDropdown = false;
  errorMessage = '';

  constructor(private teamLeadService: TeamLeadService) {}
  
  ngOnInit() {
    // Check if user is logged in before making API calls
    if (!this.teamLeadService.isLoggedIn()) {
      this.errorMessage = 'You are not logged in. Please log in to continue.';
      return;
    }
    
    this.loadProjects();
    this.loadTasks();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }  loadProjects() {
    // Load team lead details to get project information
    this.teamLeadService.getProjects().subscribe({
      next: (teamLeadDetails) => {
        if (teamLeadDetails.project) {
          this.projects = [teamLeadDetails.project];
        } else {
          this.projects = [];
        }
      },
      error: () => this.errorMessage = 'Failed to load team lead details'
    });
  }
  loadTasks() {
    this.teamLeadService.getTasks().subscribe({
      next: (res) => this.tasks = res,
      error: () => this.errorMessage = 'Failed to load tasks'
    });
  }
  checkOrCreateProject() {
    // Since team lead can only have one project, check if they already have one
    if (this.projects.length > 0) {
      this.errorMessage = 'You already have a project! Team leads can only create one project.';
      return;
    }

    if (!this.newProjectName.trim()) {
      this.errorMessage = 'Please enter a project name.';
      return;
    }

    this.errorMessage = '';
    this.showTaskForm = true;
  }submitProjectAndTask() {
    const projectName = this.newProjectName.trim();
    const taskName = this.newTaskName.trim();
    const skillSet = this.newTaskSkills.split(',').map(s => s.trim());
    const token = this.teamLeadService.getToken();
    console.log('Token exists:', !!token);
    console.log('Token preview:', token?.substring(0, 50) + '...');
    console.log('Creating project with name:', projectName);

    // First try with Bearer prefix
    this.teamLeadService.createProject(projectName).subscribe({
      next: (response) => {
        this.errorMessage = 'Project created successfully!';
        this.loadProjects();
        this.createTaskAfterProject(taskName, skillSet);
      },      error: (projectError) => {
        console.error('Project creation error with Bearer:', projectError);
        console.error('Error details:', {
          status: projectError.status,
          message: projectError.error,
          url: projectError.url
        });
        
        // Try to get more specific error message
        let errorMsg = 'Failed to create project';
        if (
          projectError.status === 409 &&
          projectError.error &&
          typeof projectError.error === 'string' &&
          projectError.error.includes('Only one project per team lead is allowed')
        ) {
          errorMsg = 'You already have a project! Showing your project and tasks.';
          this.loadProjects();
          this.loadTasks();
        } else if (projectError.error && typeof projectError.error === 'string') {
          errorMsg += ': ' + projectError.error;
        } else if (projectError.error && projectError.error.message) {
          errorMsg += ': ' + projectError.error.message;
        } else if (projectError.message) {
          errorMsg += ': ' + projectError.message;
        }
        this.errorMessage = errorMsg;
      }
    });
  }

  private createTaskAfterProject(taskName: string, skillSet: string[]) {
    this.teamLeadService.createTask(taskName, skillSet).subscribe({
      next: (taskResponse) => {
        console.log('Task created successfully:', taskResponse);
        this.resetForm();
        // Reload data from backend after successful creation
        this.loadProjects();
        this.loadTasks();
      },
      error: (taskError) => {
        console.error('Task creation error:', taskError);
        this.errorMessage = 'Project created but failed to create task: ' + (taskError.error?.message || taskError.message);
        // Still reload to show the created project
        this.loadProjects();
        this.loadTasks();
      }
    });
  }  assignTask(taskId: number) {
    this.teamLeadService.assignTask(taskId).subscribe({
      next: () => {
        // Reload tasks to get updated status
        this.loadTasks();
      },
      error: () => this.errorMessage = 'Failed to assign task'
    });
  }

  resetForm() {
    this.newProjectName = '';
    this.newTaskName = '';
    this.newTaskSkills = '';
    this.showTaskForm = false;
    this.showCreateForm = false;
  }
}
