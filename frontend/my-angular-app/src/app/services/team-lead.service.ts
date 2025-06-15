import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamLeadService {
  private apiUrl = 'http://localhost:8000/teamLead';

  constructor(private http: HttpClient) { }  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    
    return headers;
  }
  // Method to check if user has a valid token
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      if (expiration <= now) {
        console.log('Token has expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Invalid token format:', error);
      return false;
    }
  }
  // Method to get token for debugging
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Method to clear expired token
  clearToken(): void {
    localStorage.removeItem('token');
  }  getProjects(): Observable<any> {
    // Using details endpoint to get team lead info which includes project
    return this.http.get(`${this.apiUrl}/details`, { 
      headers: this.getAuthHeaders(),
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map((response: any) => {
        console.log('Full HTTP response:', response);
        try {
          const parsedBody = JSON.parse(response.body);
          console.log('Successfully parsed response body:', parsedBody);
          return parsedBody;
        } catch (error) {
          console.error('Failed to parse response body:', error);
          console.log('Raw response body:', response.body);
          return response.body;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error in getProjects:', error);
        throw error;
      })
    );
  }

  getTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/allTasks`, { 
      headers: this.getAuthHeaders(),
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map((response: any) => {
        console.log('Full HTTP response:', response);
        try {
          const parsedBody = JSON.parse(response.body);
          console.log('Successfully parsed response body:', parsedBody);
          return parsedBody;
        } catch (error) {
          console.error('Failed to parse response body:', error);
          console.log('Raw response body:', response.body);
          return response.body;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error in getTasks:', error);
        throw error;
      })
    );
  }createProject(name: string): Observable<any> {
    const body = { name };
    return this.http.post(`${this.apiUrl}/createProject`, body, { headers: this.getAuthHeaders() });
  }

  createTask(name: string, skillSet: string[]): Observable<any> {
    const body = { name, skillSet };
    return this.http.post(`${this.apiUrl}/createTask`, body, { headers: this.getAuthHeaders() });
  }

  assignTask(taskId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/assignTask/${taskId}`, {}, { headers: this.getAuthHeaders() });
  }
}