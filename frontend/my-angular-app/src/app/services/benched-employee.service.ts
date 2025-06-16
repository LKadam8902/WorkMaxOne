import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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
    return this.http.get(`${this.apiUrl}/getTaskAssigned`, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' // Get as text to handle malformed JSON
    }).pipe(
      map((response: any) => {
        console.log('BenchedEmployee getTasks - Raw response:', response);
        
        try {
          // Try to parse as JSON
          const parsed = JSON.parse(response);
          console.log('BenchedEmployee getTasks - Successfully parsed JSON:', parsed);
          return parsed;
        } catch (parseError) {
          console.warn('BenchedEmployee getTasks - JSON parse failed:', parseError);
          console.log('BenchedEmployee getTasks - Attempting to extract tasks from malformed JSON');
          
          // Try to extract tasks from malformed JSON
          return this.extractTasksFromMalformedJson(response);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('BenchedEmployee getTasks - HTTP Error:', error);
        
        // If it's a 200 status but parsing failed, try to extract from error body
        if (error.status === 200 && error.error && typeof error.error === 'string') {
          console.log('BenchedEmployee getTasks - Attempting to extract from error body text');
          try {
            return of(this.extractTasksFromMalformedJson(error.error));
          } catch (extractError) {
            console.error('BenchedEmployee getTasks - Failed to extract from error body:', extractError);
          }
        }
        
        // Return empty array as fallback
        console.log('BenchedEmployee getTasks - Returning empty array as fallback');
        return of([]);
      })
    );
  }

  // Helper method to extract tasks from malformed JSON (similar to team lead service)
  private extractTasksFromMalformedJson(malformedJson: string): any[] {
    console.log('BenchedEmployee extractTasksFromMalformedJson - Input length:', malformedJson.length);
    console.log('BenchedEmployee extractTasksFromMalformedJson - Input preview:', malformedJson.substring(0, 500) + '...');
    
    const tasks: any[] = [];
    const foundTaskIds = new Set<number>();
    
    try {
      // Method 1: Look for taskId patterns and extract context
      const taskIdPattern = /"taskId"\s*:\s*(\d+)/g;
      let taskIdMatch;
      
      while ((taskIdMatch = taskIdPattern.exec(malformedJson)) !== null) {
        const taskId = parseInt(taskIdMatch[1]);
        
        if (foundTaskIds.has(taskId)) {
          continue;
        }
        
        // Extract context around this taskId
        const matchIndex = taskIdMatch.index;
        const contextStart = Math.max(0, matchIndex - 1000);
        const contextEnd = Math.min(malformedJson.length, matchIndex + 2000);
        const context = malformedJson.substring(contextStart, contextEnd);
        
        // Extract task details
        let name = '';
        let skillSet: string[] = [];
        let status = 'assigned'; // Default for benched employee tasks
        
        // Extract name
        const nameMatch = context.match(/"name"\s*:\s*"([^"]+)"/);
        if (nameMatch) {
          name = nameMatch[1];
        }
        
        // Extract skillSet
        const skillSetMatch = context.match(/"skillSet"\s*:\s*\[([^\]]*)\]/);
        if (skillSetMatch && skillSetMatch[1]) {
          const skillMatches = skillSetMatch[1].match(/"([^"]+)"/g);
          if (skillMatches) {
            skillSet = skillMatches.map(s => s.replace(/"/g, ''));
          }
        }
        
        // Extract status
        const statusMatch = context.match(/"status"\s*:\s*"([^"]+)"/);
        if (statusMatch) {
          status = statusMatch[1];
        }
        
        if (name) {
          const task = {
            taskId: taskId,
            id: taskId,
            name: name,
            skillSet: skillSet,
            status: status,
            assignedTo: 'current-user' // Since this is for the logged in benched employee
          };
          
          tasks.push(task);
          foundTaskIds.add(taskId);
          console.log('BenchedEmployee extracted task:', task);
        }
      }
      
      // Method 2: Fallback extraction if no tasks found
      if (tasks.length === 0) {
        console.log('BenchedEmployee - Trying fallback task extraction...');
        const simplePattern = /"name"\s*:\s*"([^"]+)"/g;
        let simpleMatch;
        let fallbackId = 1;
        
        while ((simpleMatch = simplePattern.exec(malformedJson)) !== null) {
          const name = simpleMatch[1];
          
          // Only include if it looks like a task name
          if (name && (name.includes('project') || name.includes('task') || name.includes('develop'))) {
            const task = {
              taskId: fallbackId,
              id: fallbackId,
              name: name,
              skillSet: [],
              status: 'assigned',
              assignedTo: 'current-user'
            };
            
            tasks.push(task);
            console.log('BenchedEmployee fallback extracted task:', task);
            fallbackId++;
          }
        }
      }
      
    } catch (error) {
      console.error('BenchedEmployee extractTasksFromMalformedJson error:', error);
    }
    
    console.log('BenchedEmployee extractTasksFromMalformedJson - Total tasks:', tasks.length);
    return tasks;
  }  addSkills(skillSet: string[]): Observable<any> {
    console.log('BenchedEmployee Service - Adding skills:', skillSet);
    
    // Based on backend documentation: PUT /benchEmployee/addSkills with { SkillSet: [...] }
    const requestBody = { SkillSet: skillSet };
    
    return this.http.put(`${this.apiUrl}/addSkills`, requestBody, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json' // Handle potential text response
    }).pipe(
      map((response: any) => {
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch (e) {
          return { message: 'Skills added successfully' };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('BenchedEmployee addSkills - Error:', error);
        throw new Error(`Failed to add skills: ${error.message}`);
      })
    );
  }

  updateProfile(profileData: { employeeName: string; email: string; password?: string }): Observable<any> {
    console.log('BenchedEmployee Service - Updating profile:', profileData);
    
    // Based on backend: PUT /benchEmployee/editProfile with { name, profileUrl }
    const requestBody = {
      name: profileData.employeeName,
      profileUrl: profileData.email // Using email as profile identifier
    };
    
    return this.http.put(`${this.apiUrl}/editProfile`, requestBody, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'
    }).pipe(
      map((response: any) => {
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch (e) {
          return { message: 'Profile updated successfully' };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('BenchedEmployee updateProfile - Error:', error);
        throw new Error(`Failed to update profile: ${error.message}`);
      })
    );
  }  updateTaskStatus(taskId: number, status: string): Observable<any> {
    console.log('BenchedEmployee Service - Updating task status:', taskId, 'to', status);
    
    // Map frontend status to backend enum format
    let backendStatus: string;
    switch (status.toLowerCase()) {
      case 'assigned':
      case 'to-do':
      case 'todo':
        backendStatus = 'TO_DO';
        break;
      case 'in-progress':
      case 'inprogress':
        backendStatus = 'IN_PROGRESS';
        break;
      case 'completed':
      case 'done':
        backendStatus = 'DONE';
        break;
      default:
        backendStatus = 'TO_DO';
    }
    
    // Based on backend documentation: PUT /benchEmployee/updateTask/{id} with { stat: Status }
    const updateData = { stat: backendStatus };
    
    return this.http.put(`${this.apiUrl}/updateTask/${taskId}`, updateData, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json' // Handle potential text response
    }).pipe(
      map((response: any) => {
        try {
          return typeof response === 'string' ? JSON.parse(response) : response;
        } catch (e) {
          return { message: 'Task status updated successfully', status: status };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('BenchedEmployee updateTaskStatus - Error:', error);
        throw new Error(`Failed to update task status: ${error.message}`);
      })
    );
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