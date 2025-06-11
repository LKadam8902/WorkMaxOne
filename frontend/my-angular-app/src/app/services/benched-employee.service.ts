import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BenchedEmployeeService {
  private apiUrl = 'http://localhost:8000/benchEmployee';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks`);
  }

  addSkills(skillSet: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/addSkills`, { skillSet });
  }

  updateTaskStatus(taskId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateTask/${taskId}`, { status });
  }
} 