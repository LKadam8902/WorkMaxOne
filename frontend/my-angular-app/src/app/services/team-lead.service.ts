import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamLeadService {
  private apiUrl = 'http://localhost:8000/teamLead';

  constructor(private http: HttpClient) { }

  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`);
  }

  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks`);
  }

  createProject(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/createProject`, { name });
  }

  createTask(name: string, skillSet: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/createTask`, { name, skillSet });
  }

  assignTask(taskId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/assignTask/${taskId}`, {});
  }
} 