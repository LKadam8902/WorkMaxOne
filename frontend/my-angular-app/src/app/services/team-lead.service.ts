import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamLeadService {
  private apiUrl = 'http://localhost:8000/teamLead';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`, { headers: this.getAuthHeaders() });
  }

  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks`, { headers: this.getAuthHeaders() });
  }

  createProject(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/createProject`, { name }, { headers: this.getAuthHeaders() });
  }

  createTask(name: string, skillSet: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/createTask`, { name, skillSet }, { headers: this.getAuthHeaders() });
  }
  assignTask(taskId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/assignTask?taskId=${taskId}`, {}, { headers: this.getAuthHeaders() });
  }
} 