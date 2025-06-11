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
  newProjectName: string = '';
  newTaskName: string = '';
  newTaskSkills: string = '';
  errorMessage: string = '';
  showDropdown = false;

  constructor(private teamLeadService: TeamLeadService) {}

  ngOnInit() {
    this.loadProjects();
    this.loadTasks();
  }

  loadProjects() {
    this.teamLeadService.getProjects().subscribe({
      next: (response) => {
        this.projects = response;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load projects';
      }
    });
  }

  loadTasks() {
    this.teamLeadService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load tasks';
      }
    });
  }

  createProject() {
    if (!this.newProjectName) return;
    
    this.teamLeadService.createProject(this.newProjectName).subscribe({
      next: () => {
        this.newProjectName = '';
        this.loadProjects();
      },
      error: (error) => {
        this.errorMessage = 'Failed to create project';
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
      },
      error: (error) => {
        this.errorMessage = 'Failed to create task';
      }
    });
  }

  assignTask(taskId: number) {
    this.teamLeadService.assignTask(taskId).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage = 'Failed to assign task';
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
} 