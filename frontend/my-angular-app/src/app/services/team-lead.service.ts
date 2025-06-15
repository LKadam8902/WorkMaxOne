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
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return headers;
  }

  // Alternative method for testing without Bearer prefix
  private getAuthHeadersAlternative(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token || '',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Method to check if user has a valid token
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Method to get token for debugging
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getProjects(): Observable<any> {
    // No specific GET projects endpoint in backend for individual projects
    // Using details endpoint to get team lead info which includes project
    return this.http.get(`${this.apiUrl}/details`, { headers: this.getAuthHeaders() });
  }

  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/allTasks`, { headers: this.getAuthHeaders() });
  }
  createProject(name: string): Observable<any> {
    const body = { name };
    return this.http.post(`${this.apiUrl}/createProject`, body, { headers: this.getAuthHeaders() });
  }

  // Test method for project creation with alternative headers
  createProjectAlternative(name: string): Observable<any> {
    const body = { name };
    return this.http.post(`${this.apiUrl}/createProject`, body, { headers: this.getAuthHeadersAlternative() });
  }

  createTask(name: string, skillSet: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/createTask`, { name, skillSet }, { headers: this.getAuthHeaders() });
  }  assignTask(taskId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/assignTask/${taskId}`, {}, { headers: this.getAuthHeaders() });
  }
}