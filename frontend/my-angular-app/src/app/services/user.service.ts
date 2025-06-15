import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createAccount(userData: any): Observable<any> {
    // Convert role to isTeamLead boolean
    const requestData = {
      employeeName: userData.username,
      email: userData.email,
      password: userData.password,
      isTeamLead: userData.role === 'team-lead'
    };
    return this.http.put(`${this.apiUrl}/employee/create`, requestData);
  }
  getPendingUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/view/getApprovalYetUser`, { headers: this.getAuthHeaders() });
  }

  approveUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/view/ApproveEmployee/${userId}`, {}, { headers: this.getAuthHeaders() });
  }

  teamLeadLogin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/teamLead/login`, {
      useremail: email,
      password: password
    });
  }

  benchedEmployeeLogin(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/benchedEmployee/login`, {
      useremail: email,
      password: password
    });
  }
} 