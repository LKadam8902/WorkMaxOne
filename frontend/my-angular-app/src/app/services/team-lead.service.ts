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
    console.log('TeamLeadService.getTasks() called');
    console.log('API URL:', `${this.apiUrl}/allTasks`);
    console.log('Auth headers:', this.getAuthHeaders());
    
    return this.http.get(`${this.apiUrl}/allTasks`, { 
      headers: this.getAuthHeaders(),
      observe: 'response',
      responseType: 'text'
    }).pipe(      map((response: any) => {
        console.log('getTasks - Full HTTP response:', response);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Response body (raw):', response.body);
        
        try {
          const parsedBody = JSON.parse(response.body);
          console.log('getTasks - Successfully parsed response body:', parsedBody);
          return parsedBody;
        } catch (error) {
          console.error('getTasks - Failed to parse response body:', error);
          console.log('getTasks - Raw response body:', response.body);
          
          // Try to extract task data from malformed JSON
          try {
            const tasks = this.extractTasksFromMalformedJson(response.body);
            console.log('getTasks - Extracted tasks from malformed JSON:', tasks);
            return tasks;
          } catch (extractError) {
            console.error('getTasks - Failed to extract tasks from malformed JSON:', extractError);
            return [];
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('getTasks - Error in getTasks:', error);
        console.error('getTasks - Error status:', error.status);
        console.error('getTasks - Error message:', error.message);
        console.error('getTasks - Error body:', error.error);
        throw error;
      })
    );
  }createProject(name: string): Observable<any> {
    const body = { name };
    return this.http.post(`${this.apiUrl}/createProject`, body, { headers: this.getAuthHeaders() });
  }
  createTask(name: string, skillSet: string[]): Observable<any> {
    const body = { name, skillSet };
    console.log('TeamLeadService.createTask() called with:', body);
    console.log('API URL:', `${this.apiUrl}/createTask`);
    console.log('Auth headers:', this.getAuthHeaders());
    
    return this.http.post(`${this.apiUrl}/createTask`, body, { headers: this.getAuthHeaders() }).pipe(
      map((response: any) => {
        console.log('createTask - Success response:', response);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('createTask - Error:', error);
        console.error('createTask - Error status:', error.status);
        console.error('createTask - Error body:', error.error);
        throw error;
      })
    );
  }

  assignTask(taskId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/assignTask/${taskId}`, {}, { headers: this.getAuthHeaders() });
  }
  // Helper method to extract tasks from malformed JSON
  private extractTasksFromMalformedJson(malformedJson: string): any[] {
    console.log('extractTasksFromMalformedJson - Input:', malformedJson);
    
    // Try to find task objects in the malformed JSON
    const tasks: any[] = [];
    
    // Look for task patterns in the string - updated pattern for backend response
    const taskPattern = /"taskId":\s*(\d+),"name":"([^"]+)","skillSet":\s*\[([^\]]*)\],"assignedTo":(null|"[^"]*"),"assignedBy":\s*(\d+)/g;
    let match;
    
    while ((match = taskPattern.exec(malformedJson)) !== null) {
      const taskId = parseInt(match[1]);
      const name = match[2];
      const skillSetStr = match[3];
      const assignedTo = match[4] === 'null' ? null : match[4];
      const assignedBy = parseInt(match[5]);
      
      // Parse skill set
      let skillSet: string[] = [];
      if (skillSetStr) {
        try {
          // Extract skills from the skillSet string
          const skillPattern = /"([^"]+)"/g;
          let skillMatch;
          while ((skillMatch = skillPattern.exec(skillSetStr)) !== null) {
            skillSet.push(skillMatch[1]);
          }
        } catch (skillError) {
          console.warn('Failed to parse skillSet for task', taskId, skillError);
        }
      }
      
      const task = {
        taskId: taskId,
        name: name,
        skillSet: skillSet,
        assignedTo: assignedTo,
        assignedBy: assignedBy,
        assigned: assignedTo !== null // Task is assigned if assignedTo is not null
      };
      
      tasks.push(task);
      console.log('extractTasksFromMalformedJson - Extracted task:', task);
    }
    
    // If no tasks found with the detailed pattern, try a simpler pattern
    if (tasks.length === 0) {
      console.log('No tasks found with detailed pattern, trying simpler pattern...');
      const simpleTaskPattern = /"taskId":\s*(\d+),"name":"([^"]+)"/g;
      let simpleMatch;
      
      while ((simpleMatch = simpleTaskPattern.exec(malformedJson)) !== null) {
        const taskId = parseInt(simpleMatch[1]);
        const name = simpleMatch[2];
        
        // Try to find skillSet for this task
        const skillSetPattern = new RegExp(`"taskId":\\s*${taskId}.*?"skillSet":\\s*\\[([^\\]]*)\\]`, 'g');
        const skillSetMatch = skillSetPattern.exec(malformedJson);
        
        let skillSet: string[] = [];
        if (skillSetMatch && skillSetMatch[1]) {
          const skillPattern = /"([^"]+)"/g;
          let skillMatch;
          while ((skillMatch = skillPattern.exec(skillSetMatch[1])) !== null) {
            skillSet.push(skillMatch[1]);
          }
        }
        
        const task = {
          taskId: taskId,
          name: name,
          skillSet: skillSet,
          assignedTo: null,
          assignedBy: null,
          assigned: false
        };
        
        tasks.push(task);
        console.log('extractTasksFromMalformedJson - Extracted task (simple):', task);
      }
    }
    
    console.log('extractTasksFromMalformedJson - Total extracted tasks:', tasks.length);
    return tasks;
  }
}