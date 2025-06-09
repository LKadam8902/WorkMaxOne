import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

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
    return this.http.get(`${this.apiUrl}/employee/pending`);
  }

  approveUser(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/employee/approve/${userId}`, {});
  }
} 