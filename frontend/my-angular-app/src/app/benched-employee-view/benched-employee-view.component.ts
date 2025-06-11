import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BenchedEmployeeService } from '../services/benched-employee.service';

interface Task {
  id: number;
  name: string;
  skillSet: string[];
  status: string;
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
  newSkills: string = '';
  errorMessage: string = '';
  showDropdown = false;

  constructor(private benchedEmployeeService: BenchedEmployeeService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.benchedEmployeeService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load tasks';
      }
    });
  }

  addSkills() {
    if (!this.newSkills) return;
    
    const skillSet = this.newSkills.split(',').map(skill => skill.trim());
    
    this.benchedEmployeeService.addSkills(skillSet).subscribe({
      next: () => {
        this.newSkills = '';
        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage = 'Failed to add skills';
      }
    });
  }

  updateTaskStatus(taskId: number, status: string) {
    this.benchedEmployeeService.updateTaskStatus(taskId, status).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage = 'Failed to update task status';
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
} 