import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BenchedEmployeeService {
  private apiUrl = 'http://localhost:8000/benchEmployee';

  constructor(private http: HttpClient) { }
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('BenchedEmployee Service - Getting auth headers. Token:', token ? 'exists' : 'not found');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }  getTasks(): Observable<any> {
    console.log('BenchedEmployee Service - Getting tasks from:', `${this.apiUrl}/getTaskAssigned`);
    return this.http.get(`${this.apiUrl}/getTaskAssigned`, { headers: this.getAuthHeaders() });
  }
  addSkills(skillSet: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/addSkills`, { SkillSet: skillSet }, { headers: this.getAuthHeaders() });
  }

  updateTaskStatus(taskId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateTask/${taskId}`, { status }, { headers: this.getAuthHeaders() });
  }
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/details`, { headers: this.getAuthHeaders() });
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }
}