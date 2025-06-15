import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  newProjectName: string = '';
  newTaskName: string = '';
  newTaskSkills: string = '';
  errorMessage: string = '';
  showDropdown = false;

  constructor(private teamLeadService: TeamLeadService, private router: Router) {}
  ngOnInit() {
    console.log('TeamLeadViewComponent initialized');
    console.log('Token in localStorage:', localStorage.getItem('token'));
    this.loadProjects();
    this.loadTasks();
  }
  loadProjects() {
    this.teamLeadService.getProjects().subscribe({
      next: (response) => {
        this.projects = response;
      },
      error: (error) => {
        if (error.status === 401) {
          this.errorMessage = 'Authentication expired. Please login again.';
          localStorage.removeItem('token');
          this.router.navigate(['/sign-in']);
        } else {
          this.errorMessage = 'Failed to load projects';
        }
      }
    });
  }

  loadTasks() {
    this.teamLeadService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response;
      },
      error: (error) => {
        if (error.status === 401) {
          this.errorMessage = 'Authentication expired. Please login again.';
          localStorage.removeItem('token');
          this.router.navigate(['/sign-in']);
        } else {
          this.errorMessage = 'Failed to load tasks';
        }
      }
    });
  }
  createProject() {
    if (!this.newProjectName) return;
    
    this.teamLeadService.createProject(this.newProjectName).subscribe({
      next: () => {
        this.newProjectName = '';
        this.loadProjects();
        this.errorMessage = '';
      },      error: (error) => {
        console.error('Create project error:', error);
        if (error.status === 401) {
          this.errorMessage = 'Authentication expired. Please login again.';
          localStorage.removeItem('token');
          this.router.navigate(['/sign-in']);
        } else {
          // Show the backend error message if available
          this.errorMessage = error.error?.message || error.message || 'Failed to create project';
        }
      }
    });
  }

  createTask() {
    if (!this.newTaskName || !this.newTaskSkills) return;
    
    const skillSet = this.newTaskSkills.split(',').map(skill => skill.trim());
    
    this.teamLeadService.createTask(this.newTaskName, skillSet).subscribe({
      next: () => {
        this.newTaskName = '';
        this.newTaskSkills = '';
        this.loadTasks();
        this.errorMessage = '';
      },      error: (error) => {
        console.error('Create task error:', error);
        if (error.status === 401) {
          this.errorMessage = 'Authentication expired. Please login again.';
          localStorage.removeItem('token');
          this.router.navigate(['/sign-in']);
        } else {
          // Show the backend error message if available
          this.errorMessage = error.error?.message || error.message || 'Failed to create task';
        }
      }
    });
  }

  assignTask(taskId: number) {
    this.teamLeadService.assignTask(taskId).subscribe({
      next: () => {
        this.loadTasks();
      },      error: (error) => {
        console.error('Assign task error:', error);
        this.errorMessage = error.error?.message || error.message || 'Failed to assign task';
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
} 