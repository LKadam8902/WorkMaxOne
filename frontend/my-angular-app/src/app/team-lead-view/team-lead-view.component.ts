import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamLeadService } from '../services/team-lead.service';
import { UserService } from '../services/user.service';

type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'DONE';

interface Task {
  id: number;
  name: string;
  assignedTo?: number | null;
  status?: TaskStatus;
  skillSet?: string[];
}

interface Employee {
  id: number;
  employeeName: string;
}

interface Project {
  projectId: number;
  projectName: string;
}

@Component({
  selector: 'app-team-lead-view',
  standalone: true,
  templateUrl: './team-lead-view.component.html',
  styleUrls: ['./team-lead-view.component.css'],
  imports: [CommonModule, FormsModule]
})
export class TeamLeadViewComponent implements OnInit {

  taskName = '';
  skills = '';
  projectName = '';
  isSavingProject = false;
  isSavingTask = false;
  assigningTaskId: number | null = null;
  actionMessage = '';
  actionIsError = false;

  currentProject: Project | null = null;
  hasProject = false;

  tasks: Task[] = [];
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;
  selectedTaskId: number | null = null;

  draggedTask: Task | null = null;

  showAssignModal = false;
  showDropdown = false;
  showProfileMenu = false;
  showEmployeeModal = false;

  profileData: any = {};
  selectedEmployeeInfo: any = null;
  dataLoaded = false;

  employeeMap: Map<number, string> = new Map();

  constructor(
    private service: TeamLeadService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.userService.isTokenValid() || !this.userService.validateTokenForRole('TEAM_LEAD')) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.loadProjects();
    this.loadTasks();
    this.loadEmployees();
    
    // Retry loading employees after a delay in case tasks populate first
    setTimeout(() => {
      if (this.employeeMap.size === 0) {
        console.warn('Employee map is still empty, retrying...');
        this.loadEmployees();
      }
    }, 2000);
  }

  loadProjects(): void {
    this.service.getProjects().subscribe((res: any) => {
      this.profileData = res;

      if (res?.projectId && res?.projectName) {
        this.currentProject = {
          projectId: res.projectId,
          projectName: res.projectName
        };
        this.hasProject = true;
      } else {
        this.currentProject = null;
        this.hasProject = false;
      }
    }, () => this.setActionMessage('Unable to load your project details. Refresh and try again.', true));
  }

  loadEmployees(): void {
    this.service.allAssignees().subscribe(
      (res: any) => {
        console.log('allAssignees response:', res);
        if (res && Array.isArray(res) && res.length > 0) {
          this.employees = (res || []).map((emp: any) => ({
            id: emp.employeeId || emp.id,
            employeeName: emp.employeeName
          }));
          // Build employee name map
          this.employees.forEach(emp => {
            this.employeeMap.set(emp.id, emp.employeeName);
          });
          console.log('Employee map after allAssignees:', this.employeeMap);
        } else {
          console.warn('allAssignees returned empty, will use fallback');
          this.loadEmployeesFallback();
        }
      },
      (error: any) => {
        console.error('allAssignees failed:', error);
        this.loadEmployeesFallback();
      }
    );
  }

  loadEmployeesFallback(): void {
    // Hardcoded mapping for now - in production this should come from backend
    const hardcodedEmployees = [
      { id: 2, employeeName: 'nippon' },
      { id: 3, employeeName: 'anamika' }
    ];
    this.employees = hardcodedEmployees;
    this.employees.forEach(emp => {
      this.employeeMap.set(emp.id, emp.employeeName);
    });
    console.log('Using fallback employee mapping:', this.employeeMap);
  }

  loadTasks(): void {
    this.service.getTasks().subscribe((res: Task[]) => {
      const tasks = (res || []).map((task: any) => ({
        ...task,
        id: task.id ?? task.taskId
      }));

      this.tasks = tasks;

      // Build employee map from task data if available
      tasks.forEach(task => {
        if (task.assignedTo && task.assignedTo > 0) {
          // Try to extract employee name from task if available
          console.log('Task data:', task);
        }
      });

      this.todoTasks = tasks.filter(t => !t.assignedTo);
      this.inProgressTasks = tasks.filter(t => t.assignedTo && t.status !== 'DONE');
      this.doneTasks = tasks.filter(t => t.status === 'DONE');

      this.dataLoaded = true;
    });
  }

  createTask(): void {
    if (!this.hasProject || !this.taskName.trim()) return;

    const skillSet = this.skills.split(',').map(s => s.trim()).filter(Boolean);
    this.isSavingTask = true;
    this.setActionMessage('');

    this.service.createTask(this.taskName, skillSet).subscribe(() => {
      this.taskName = '';
      this.skills = '';
      this.isSavingTask = false;
      this.setActionMessage('Task added. Use Auto-assign best match when it is ready.');
      this.loadTasks();
    }, (error: any) => {
      this.isSavingTask = false;
      this.setActionMessage(this.getErrorMessage(error, 'Unable to add the task.'), true);
    });
  }

  createProject(): void {
    const name = this.projectName.trim();
    if (!name) return;

    this.isSavingProject = true;
    this.setActionMessage('');
    this.service.createProject(name).subscribe(() => {
      this.projectName = '';
      this.isSavingProject = false;
      this.setActionMessage('Project created. You can now add tasks.');
      this.loadProjects();
    }, (error: any) => {
      this.isSavingProject = false;
      this.setActionMessage(this.getErrorMessage(error, 'Unable to create the project.'), true);
    });
  }

  /* ===== DRAG LOGIC ===== */

  onDragStart(task: Task): void {
    this.draggedTask = task;
  }

  onDrop(status: TaskStatus): void {
    if (!this.draggedTask) return;

    this.draggedTask.status = status;

    // Update task status on backend
    this.service.updateTaskStatus(this.draggedTask.id, status).subscribe(
      () => {
        this.loadTasks();
      },
      (error: any) => {
        console.error('Error updating task status:', error);
        this.loadTasks();
      }
    );

    this.draggedTask = null;
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  /* ===== ASSIGN ===== */

  assignTask(taskId: number): void {
    this.assigningTaskId = taskId;
    this.setActionMessage('');
    this.service.assignTask(taskId).subscribe((response: any) => {
      this.assigningTaskId = null;
      this.setActionMessage(response?.message || 'Task assigned to the best available match.');
      this.loadTasks();
      this.loadEmployees();
    }, (error: any) => {
      this.assigningTaskId = null;
      const message = error?.status === 401 || error?.status === 403
        ? 'Your current session is not a Team Lead session. Sign in as the Team Lead, then try assigning again.'
        : this.getErrorMessage(error, 'No eligible employee is available for this task.');
      this.setActionMessage(message, true);
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  logout(): void {
    this.router.navigate(['/sign-in']);
  }

  /* ===== PROFILE MENU ===== */

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  editProfile(): void {
    this.showProfileMenu = false;
    // Navigate to edit profile page
    this.router.navigate(['/edit-profile']);
  }

  logoutUser(): void {
    this.showProfileMenu = false;
    // Clear token from localStorage
    this.userService.logout();
    // Redirect to sign-in page
    this.router.navigate(['/sign-in']);
  }

  /* ===== EMPLOYEE INFO ===== */

  viewEmployeeInfo(employee: Employee): void {
    this.selectedEmployeeInfo = {
      ...employee,
      assignedTasksCount: this.tasks.filter(t => t.assignedTo === employee.id).length
    };
    this.showEmployeeModal = true;
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false;
    this.selectedEmployeeInfo = null;
  }

  /* ===== UTILITY ===== */

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  }

  getEmployeeName(employeeId: number | null | undefined): string {
    if (!employeeId) return 'Unassigned';
    const name = this.employeeMap.get(employeeId);
    console.log(`getEmployeeName(${employeeId}) -> ${name || 'NOT FOUND'}`);
    return name || `Employee #${employeeId}`;
  }

  getEmployeeTaskCount(employeeId: number): number {
    return this.tasks.filter(t => t.assignedTo === employeeId).length;
  }

  private setActionMessage(message: string, isError = false): void {
    this.actionMessage = message;
    this.actionIsError = isError;
  }

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.detail || error?.error?.message || fallback;
  }
}
