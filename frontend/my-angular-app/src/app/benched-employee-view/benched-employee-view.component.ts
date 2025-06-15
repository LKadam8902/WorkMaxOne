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

  // For drag-and-drop
  draggedTask!: Task;

  // Computed properties for filtered tasks
  get todoTasks(): Task[] {
    return this.tasks.filter(task => task.status === 'To Do');
  }

  get inProgressTasks(): Task[] {
    return this.tasks.filter(task => task.status === 'In Progress');
  }

  get completedTasks(): Task[] {
    return this.tasks.filter(task => task.status === 'Completed');
  }

  constructor(private benchedEmployeeService: BenchedEmployeeService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.benchedEmployeeService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response;
      },
      error: () => {
        this.errorMessage = 'Failed to load tasks';
      }
    });
  }

  addSkills() {
    if (!this.newSkills.trim()) return;

    const skillSet = this.newSkills.split(',').map(skill => skill.trim());

    this.benchedEmployeeService.addSkills(skillSet).subscribe({
      next: () => {
        this.newSkills = '';
        this.loadTasks();
      },
      error: () => {
        this.errorMessage = 'Failed to add skills';
      }
    });
  }

  updateTaskStatus(taskId: number, status: string) {
    this.benchedEmployeeService.updateTaskStatus(taskId, status).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: () => {
        this.errorMessage = 'Failed to update task status';
      }
    });
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // Drag-and-drop logic
  onDragStart(event: DragEvent, task: Task) {
    this.draggedTask = task;
    event.dataTransfer?.setData('text/plain', task.id.toString());
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, newStatus: string) {
    event.preventDefault();

    if (this.draggedTask && this.draggedTask.status !== newStatus) {
      this.updateTaskStatus(this.draggedTask.id, newStatus);
    }
  }
}
