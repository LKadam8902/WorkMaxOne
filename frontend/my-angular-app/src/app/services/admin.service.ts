import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiBaseUrl}/admin`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { useremail: email, password: password });
  }

  getAdminDetails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAdminDetails`, { headers: this.getAuthHeaders() });
  }
}
