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
    // Backend doesn't have GET endpoints for projects and tasks
    // Starting with empty arrays and showing create form
    this.projects = [];
    this.tasks = [];
    
    // Comment out the API calls since endpoints don't exist
    // this.loadProjects();
    // this.loadTasks();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  loadProjects() {
    // Backend doesn't have GET /teamLead/projects endpoint
    // Commenting out this call to prevent 404 errors
    /*
    this.teamLeadService.getProjects().subscribe({
      next: (res) => this.projects = res,
      error: () => this.errorMessage = 'Failed to load projects'
    });
    */
  }

  loadTasks() {
    // Backend doesn't have GET /teamLead/tasks endpoint  
    // Commenting out this call to prevent 404 errors
    /*
    this.teamLeadService.getTasks().subscribe({
      next: (res) => this.tasks = res,
      error: () => this.errorMessage = 'Failed to load tasks'
    });
    */
  }

  checkOrCreateProject() {
    const projectNameLower = this.newProjectName.trim().toLowerCase();
    const exists = this.projects.some(p => p.name.toLowerCase() === projectNameLower);

    if (exists) {
      this.errorMessage = 'Project already exists!';
      return;
    }

    this.errorMessage = '';
    this.showTaskForm = true;
  }
  submitProjectAndTask() {
    const projectName = this.newProjectName.trim().toLowerCase();
    const taskName = this.newTaskName.trim().toLowerCase();
    const skillSet = this.newTaskSkills.split(',').map(s => s.trim().toLowerCase());

    this.teamLeadService.createProject(projectName).subscribe({
      next: () => {
        // Add the project to local array since we can't fetch from API
        const newProject = {
          id: this.projects.length + 1, // Simple ID generation
          name: projectName
        };
        this.projects.push(newProject);

        this.teamLeadService.createTask(taskName, skillSet).subscribe({
          next: () => {
            // Add the task to local array since we can't fetch from API
            const newTask = {
              id: this.tasks.length + 1, // Simple ID generation
              name: taskName,
              skillSet: skillSet,
              status: 'Pending'
            };
            this.tasks.push(newTask);
            
            this.resetForm();
            // Remove the API reload calls since endpoints don't exist
            // this.loadProjects();
            // this.loadTasks();
          },
          error: () => this.errorMessage = 'Failed to create task'
        });
      },
      error: () => this.errorMessage = 'Failed to create project'
    });
  }
  assignTask(taskId: number) {
    this.teamLeadService.assignTask(taskId).subscribe({
      next: () => {
        // Update the task status locally instead of reloading from API
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
          task.status = 'Assigned';
        }
        // this.loadTasks(); // Commented out since endpoint doesn't exist
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
