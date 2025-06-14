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
  projectId?: number;
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
  newProjectName: string = '';
  newTaskName: string = '';
  newTaskSkills: string = '';
  selectedProjectId: number | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  showDropdown = false;
  isLoading = false;

  constructor(private teamLeadService: TeamLeadService) {}

  ngOnInit() {
    this.loadProjects();
    this.loadTasks();
  }

  loadProjects() {
    this.isLoading = true;
    this.teamLeadService.getProjects().subscribe({
      next: (response) => {
        this.projects = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load projects';
        this.isLoading = false;
      }
    });
  }

  loadTasks() {
    this.isLoading = true;
    this.teamLeadService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load tasks';
        this.isLoading = false;
      }
    });
  }

  createProject() {
    if (!this.newProjectName.trim()) {
      this.errorMessage = 'Project name is required';
      return;
    }
    
    this.isLoading = true;
    this.teamLeadService.createProject(this.newProjectName).subscribe({
      next: () => {
        this.newProjectName = '';
        this.successMessage = 'Project created successfully';
        this.loadProjects();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to create project';
        this.isLoading = false;
      }
    });
  }

  createTask() {
    if (!this.newTaskName.trim()) {
      this.errorMessage = 'Task name is required';
      return;
    }
    if (!this.newTaskSkills.trim()) {
      this.errorMessage = 'At least one skill is required';
      return;
    }
    if (!this.selectedProjectId) {
      this.errorMessage = 'Please select a project';
      return;
    }
    
    const skillSet = this.newTaskSkills.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    this.isLoading = true;
    this.teamLeadService.createTask(this.newTaskName, skillSet, this.selectedProjectId).subscribe({
      next: () => {
        this.newTaskName = '';
        this.newTaskSkills = '';
        this.selectedProjectId = null;
        this.successMessage = 'Task created successfully';
        this.loadTasks();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to create task';
        this.isLoading = false;
      }
    });
  }

  assignTask(taskId: number) {
    this.isLoading = true;
    this.teamLeadService.assignTask(taskId).subscribe({
      next: () => {
        this.successMessage = 'Task assigned successfully';
        this.loadTasks();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Failed to assign task';
        this.isLoading = false;
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  clearError() {
    this.errorMessage = '';
  }

  getProjectName(projectId?: number): string {
    if (!projectId) return 'N/A';
    const project = this.projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  }
} 