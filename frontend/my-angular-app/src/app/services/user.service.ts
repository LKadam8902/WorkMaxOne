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
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getAdminAuthHeaders(): HttpHeaders {
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
    };    return this.http.put(`${this.apiUrl}/employee/create`, requestData);
  }
  
  getPendingUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/view/getApprovalYetUser`, { headers: this.getAdminAuthHeaders() });
  }

  approveUser(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/view/ApproveEmployee/${userId}`, {}, { headers: this.getAdminAuthHeaders() });
  }
  teamLeadLogin(email: string, password: string): Observable<any> {
    const loginData = {
      useremail: email,
      password: password
    };
    console.log('Team lead login request:', loginData);
    return this.http.post(`${this.apiUrl}/auth/teamLead/login`, loginData);  }
  benchedEmployeeLogin(email: string, password: string): Observable<any> {
    const loginData = {
      useremail: email,
      password: password
    };
    console.log('Benched employee login request:', loginData);
    return this.http.post(`${this.apiUrl}/auth/benchedEmployee/login`, loginData);
  }

  // Token validation methods
  extractRoleFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const parsedPayload = JSON.parse(decodedPayload);
      
      let role = parsedPayload.role || parsedPayload.roles || parsedPayload.authority || parsedPayload.authorities;
      
      if (Array.isArray(role)) {
        role = role[0];
      }
      
      if (role) {
        role = role.toString().toUpperCase();
        
        if (role.includes('BENCH') || role.includes('EMPLOYEE')) {
          return 'BENCHED_EMPLOYEE';
        } else if (role.includes('TEAM') && role.includes('LEAD')) {
          return 'TEAM_LEAD';
        } else if (role.includes('ADMIN')) {
          return 'ADMIN';
        }
      }
      
      return role || null;
    } catch (error) {
      console.error('Error extracting role from token:', error);
      return null;
    }
  }
  validateTokenForRole(expectedRole: string): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    const role = this.extractRoleFromToken(token);
    return role === expectedRole;
  }

  validateAdminToken(): boolean {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return false;
    }
    
    const role = this.extractRoleFromToken(token);
    return role === 'ADMIN';
  }

  isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
      try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      const now = Date.now();
      
      return expiration > now;
    } catch (error) {
      console.error('Invalid token format:', error);
      return false;
    }
  }

  isAdminTokenValid(): boolean {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      const now = Date.now();
      
      return expiration > now;
    } catch (error) {
      console.error('Invalid admin token format:', error);
      return false;
    }
  }
  logout(): void {
    localStorage.removeItem('token');
  }

  adminLogout(): void {
    localStorage.removeItem('adminToken');
  }
}