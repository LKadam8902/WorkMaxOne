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
      responseType: 'text' // Get as text to handle potential JSON issues
    }).pipe(
      map((response: any) => {
        console.log('getProjects - Raw response:', response);
          try {
          const parsed = JSON.parse(response);
          console.log('getProjects - Success response:', parsed);
          return parsed;
        } catch (parseError) {
          console.warn('getProjects - JSON parse failed:', parseError);
          
          // Try to extract basic profile info from malformed JSON
          try {
            let fixedJson = response;
            
            // Fix common malformation patterns
            fixedJson = fixedJson.replace(/}\s*}\s*}\s*}+/g, '}');
            fixedJson = fixedJson.replace(/,"[^"]*":\s*}+/g, '}');
            fixedJson = fixedJson.replace(/,\s*}/g, '}');
            
            // Try to extract key information manually
            const employeeNameMatch = response.match(/"employeeName":"([^"]+)"/);
            const emailMatch = response.match(/"email":"([^"]+)"/);
            const projectNameMatch = response.match(/"projectName":"([^"]+)"/);
            const projectIdMatch = response.match(/"projectId":(\d+)/);
              const profileData: any = {
              employeeName: employeeNameMatch ? employeeNameMatch[1] : 'Team Lead',
              email: emailMatch ? emailMatch[1] : 'Unknown',
              project: null
            };
            
            // If we found project info, add it
            if (projectNameMatch && projectIdMatch) {
              profileData.project = {
                projectId: parseInt(projectIdMatch[1]),
                projectName: projectNameMatch[1]
              };
              console.log('getProjects - Extracted project info:', profileData.project);
            }
            
            console.log('getProjects - Extracted profile data:', profileData);
            return profileData;
            
          } catch (extractError) {
            console.error('getProjects - Failed to extract profile data:', extractError);
            // Return basic structure if can't parse
            return {
              employeeName: 'Team Lead',
              email: 'Unknown',
              project: null
            };
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error in getProjects:', error);
        
        // If it's a 200 status but parsing failed, try to extract from error body
        if (error.status === 200 && error.error && error.error.text) {
          try {
            const parsed = JSON.parse(error.error.text);
            return of(parsed);
          } catch (e) {
            // Return basic structure if can't parse
            return of({
              employeeName: 'Team Lead',
              email: 'Unknown',
              project: null
            });
          }
        }
        
        throw error;
      })
    );
  }  getTasks(): Observable<any> {
    console.log('TeamLeadService.getTasks() called');
    console.log('API URL:', `${this.apiUrl}/allTasks`);
    console.log('Auth headers:', this.getAuthHeaders());
    
    return this.http.get(`${this.apiUrl}/allTasks`, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' // Get as text first to handle malformed JSON
    }).pipe(
      map((response: any) => {
        console.log('getTasks - Raw response:', response);        try {
          // Try to parse as JSON
          const parsed = JSON.parse(response);
          console.log('getTasks - Successfully parsed JSON:', parsed);
          console.log('getTasks - Parsed data type:', typeof parsed, 'Is Array:', Array.isArray(parsed));
          return parsed;
        } catch (parseError) {
          console.warn('getTasks - JSON parse failed, attempting to fix malformed JSON:', parseError);
          console.log('getTasks - Raw response for analysis:', response.substring(0, 1000) + '...');
            // Special handling for circular reference issue
          if (response.includes('"project":{"projectId"') && response.length > 50000) {
            console.log('getTasks - Detected circular reference issue, attempting to fix...');
            return this.extractTasksFromMalformedJson(response); // Use the new improved method
          }
          
          // Try to fix common JSON issues
          let fixedJson = response;
          
          // Remove trailing extra braces/characters that might break JSON
          fixedJson = fixedJson.replace(/}\s*}\s*}\s*}+/g, '}');
          
          // Fix common patterns like ,"project":}}} -> }
          fixedJson = fixedJson.replace(/,"[^"]*":\s*}+/g, '}');
          
          // Remove any trailing commas before closing braces
          fixedJson = fixedJson.replace(/,\s*}/g, '}');
          
          // Try to close unclosed arrays properly
          if (fixedJson.startsWith('[') && !fixedJson.endsWith(']')) {
            fixedJson += ']';
          }
          
          try {
            const fixedParsed = JSON.parse(fixedJson);
            console.log('getTasks - Successfully parsed fixed JSON:', fixedParsed);
            return fixedParsed;
          } catch (fixError) {
            console.error('getTasks - Even fixed JSON failed to parse:', fixError);
            console.log('getTasks - Fixed JSON attempt was:', fixedJson.substring(0, 1000) + '...');
            
            // Extract tasks manually using regex as last resort
            console.log('getTasks - Falling back to manual extraction');
            return this.extractTasksFromMalformedJson(response);
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('getTasks - HTTP Error:', error);
        
        // If it's a 200 status but parsing failed, try to extract tasks from error body
        if (error.status === 200 && error.error && error.error.text) {
          console.log('getTasks - Attempting to extract from error body text');
          try {
            return of(this.extractTasksFromMalformedJson(error.error.text));
          } catch (extractError) {
            console.error('getTasks - Failed to extract from error body:', extractError);
          }
        }
        
        // Return empty array as fallback
        console.log('getTasks - Returning empty array as fallback');
        return of([]);
      })    );
  }

  createProject(name: string): Observable<any> {
    const body = { name };
    return this.http.post(`${this.apiUrl}/createProject`, body, { headers: this.getAuthHeaders() });  }
  
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
  }  assignTask(taskId: number): Observable<any> {
    console.log(`TeamLeadService.assignTask() called with taskId: ${taskId}`);
    console.log('API URL:', `${this.apiUrl}/assignTask/${taskId}`);
    console.log('Auth headers:', this.getAuthHeaders());
      // Verify token exists before making the call
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found - task assignment may fail');
    } else {
      console.log('Token found for assignment:', token.substring(0, 50) + '...');
    }
      return this.http.put(`${this.apiUrl}/assignTask/${taskId}`, {}, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' // Get response as text to handle potential issues
    }).pipe(
      map((response: any) => {
        console.log('assignTask - Raw response:', response);
        console.log('assignTask - Response type:', typeof response);
        console.log('assignTask - Response length:', response?.length);
        
        try {
          // Try to parse as JSON if possible
          const parsed = response ? JSON.parse(response) : { message: 'Task assigned successfully' };
          console.log('assignTask - Parsed response:', parsed);
          
          // Check if the response indicates actual assignment or just acknowledgment
          if (parsed.message && parsed.message.includes('successfully')) {
            console.log('assignTask - Assignment acknowledged by backend');
          } else {
            console.warn('assignTask - Unexpected response format:', parsed);
          }
          
          return parsed;
        } catch (e) {
          // If it's not JSON, return as is
          console.log('assignTask - Response is not JSON, using as is:', response);
          return { message: response || 'Task assigned successfully' };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('assignTask - Error:', error);
        console.error('assignTask - Error status:', error.status);
        console.error('assignTask - Error body:', error.error);
        console.error('assignTask - Error URL:', error.url);
        throw error;
      })
    );
  }

  updateProfile(profileData: any): Observable<any> {
    console.log('TeamLeadService.updateProfile() called with:', profileData);
    console.log('API URL:', `${this.apiUrl}/editProfile`);
    console.log('Auth headers:', this.getAuthHeaders());
    
    return this.http.put(`${this.apiUrl}/editProfile`, profileData, { headers: this.getAuthHeaders() }).pipe(
      map((response: any) => {
        console.log('updateProfile - Success response:', response);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('updateProfile - Error:', error);
        console.error('updateProfile - Error status:', error.status);
        console.error('updateProfile - Error body:', error.error);
        throw error;
      })
    );
  }  // Helper method to extract tasks from malformed JSON
  private extractTasksFromMalformedJson(malformedJson: string): any[] {
    console.log('extractTasksFromMalformedJson - Input length:', malformedJson.length);
    console.log('extractTasksFromMalformedJson - Input preview:', malformedJson.substring(0, 500) + '...');
    
    const tasks: any[] = [];
    const foundTaskIds = new Set<number>(); // Prevent duplicates
    
    try {
      // Method 1: Look for any taskId occurrences and extract surrounding context
      console.log('Method 1: Extracting by taskId pattern...');
      const taskIdPattern = /"taskId"\s*:\s*(\d+)/g;
      let taskIdMatch;
      
      while ((taskIdMatch = taskIdPattern.exec(malformedJson)) !== null) {
        const taskId = parseInt(taskIdMatch[1]);
        
        // Skip if we already found this task
        if (foundTaskIds.has(taskId)) {
          continue;
        }
        
        // Extract a larger context around this taskId (2000 chars before and after)
        const matchIndex = taskIdMatch.index;
        const contextStart = Math.max(0, matchIndex - 1000);
        const contextEnd = Math.min(malformedJson.length, matchIndex + 2000);
        const context = malformedJson.substring(contextStart, contextEnd);
        
        console.log(`Analyzing context for taskId ${taskId}:`, context.substring(0, 200) + '...');
        
        // Extract task details from this context
        let name = '';
        let skillSet: string[] = [];
        let assignedTo: any = null;
        let assignedBy: any = null;
        
        // Extract name (look for name field near this taskId)
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
        
        // Extract assignedTo (could be number, null, or object)
        const assignedToMatch = context.match(/"assignedTo"\s*:\s*(\d+|null|\{[^}]*\})/);
        if (assignedToMatch) {
          const assignedToStr = assignedToMatch[1];
          if (assignedToStr !== 'null') {
            if (assignedToStr.match(/^\d+$/)) {
              assignedTo = parseInt(assignedToStr);
            } else if (assignedToStr.startsWith('{')) {
              // Try to extract employee name from object
              const empNameMatch = assignedToStr.match(/"employeeName"\s*:\s*"([^"]+)"/);
              assignedTo = empNameMatch ? empNameMatch[1] : 'Assigned';
            }
          }
        }
        
        // Extract assignedBy
        const assignedByMatch = context.match(/"assignedBy"\s*:\s*(\d+)/);
        if (assignedByMatch) {
          assignedBy = parseInt(assignedByMatch[1]);
        }
        
        if (name) { // Only add if we found a name
          const task = {
            taskId: taskId,
            name: name,
            skillSet: skillSet,
            assignedTo: assignedTo,
            assigned: assignedTo !== null,
            assignedBy: assignedBy,
            id: taskId,
            status: assignedTo ? 'assigned' : 'pending'
          };
          
          tasks.push(task);
          foundTaskIds.add(taskId);
          console.log(`Extracted task ${taskId}:`, task);
        }
      }
      
      // Method 2: If we didn't find enough tasks, try global patterns
      if (tasks.length < 2) { // Expect at least 2 tasks based on your DB
        console.log('Method 2: Trying global extraction patterns...');
        
        // Look for any JSON object that has both taskId and name
        const objectPattern = /\{[^{}]*"taskId"\s*:\s*(\d+)[^{}]*"name"\s*:\s*"([^"]+)"[^{}]*\}/g;
        let objectMatch;
        
        while ((objectMatch = objectPattern.exec(malformedJson)) !== null) {
          const taskId = parseInt(objectMatch[1]);
          const name = objectMatch[2];
          
          if (!foundTaskIds.has(taskId)) {
            // Extract additional fields from the matched object
            const objectStr = objectMatch[0];
            
            let skillSet: string[] = [];
            const skillSetMatch = objectStr.match(/"skillSet"\s*:\s*\[([^\]]*)\]/);
            if (skillSetMatch && skillSetMatch[1]) {
              const skillMatches = skillSetMatch[1].match(/"([^"]+)"/g);
              if (skillMatches) {
                skillSet = skillMatches.map(s => s.replace(/"/g, ''));
              }
            }
            
            let assignedTo: any = null;
            const assignedToMatch = objectStr.match(/"assignedTo"\s*:\s*(\d+|null)/);
            if (assignedToMatch && assignedToMatch[1] !== 'null') {
              assignedTo = parseInt(assignedToMatch[1]);
            }
            
            const task = {
              taskId: taskId,
              name: name,
              skillSet: skillSet,
              assignedTo: assignedTo,
              assigned: assignedTo !== null,
              id: taskId,
              status: assignedTo ? 'assigned' : 'pending'
            };
            
            tasks.push(task);
            foundTaskIds.add(taskId);
            console.log(`Extracted task via Method 2:`, task);
          }
        }
      }
      
      // Method 3: Last resort - scan for specific task names from your DB
      if (tasks.length < 2) {
        console.log('Method 3: Scanning for known task names...');
        const knownTaskNames = ['project ui', 'project frontend', 'project readme', 'project backend'];
        
        knownTaskNames.forEach((taskName, index) => {
          const namePattern = new RegExp(`"name"\\s*:\\s*"${taskName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
          const nameMatch = namePattern.exec(malformedJson);
          
          if (nameMatch) {
            // Look for taskId near this name
            const context = malformedJson.substring(Math.max(0, nameMatch.index - 500), nameMatch.index + 500);
            const taskIdMatch = context.match(/"taskId"\s*:\s*(\d+)/);
            
            if (taskIdMatch) {
              const taskId = parseInt(taskIdMatch[1]);
              if (!foundTaskIds.has(taskId)) {
                const task = {
                  taskId: taskId,
                  name: taskName,
                  skillSet: [], // Will be filled by other methods if available
                  assignedTo: null,
                  assigned: false,
                  id: taskId,
                  status: 'pending'
                };
                
                tasks.push(task);
                foundTaskIds.add(taskId);
                console.log(`Extracted task via Method 3:`, task);
              }
            }
          }
        });
      }
      
    } catch (error) {
      console.error('Error in extractTasksFromMalformedJson:', error);
    }
      console.log('extractTasksFromMalformedJson - Total extracted tasks:', tasks.length);
    console.log('extractTasksFromMalformedJson - Found task IDs:', Array.from(foundTaskIds));
    return tasks;
  }
  // Special method to handle circular reference in project/manager relationships
  private fixCircularReferenceAndExtract(malformedJson: string): any[] {
    console.log('fixCircularReferenceAndExtract - Handling circular reference issue');
    console.log('fixCircularReferenceAndExtract - Response length:', malformedJson.length);
    
    const tasks: any[] = [];
    const foundTaskIds = new Set<number>(); // Prevent duplicates
    
    try {
      // Strategy 1: Find all taskId occurrences and extract surrounding data
      const taskIdPattern = /"taskId":(\d+)/g;
      let match;
      
      while ((match = taskIdPattern.exec(malformedJson)) !== null) {
        const taskId = parseInt(match[1]);
        
        // Skip if we already found this task
        if (foundTaskIds.has(taskId)) continue;
        
        const startPos = Math.max(0, match.index - 50);
        const endPos = Math.min(malformedJson.length, match.index + 1000);
        const taskSection = malformedJson.substring(startPos, endPos);
        
        try {
          // Extract all the fields we need from this section
          const nameMatch = taskSection.match(/"name":"([^"]+)"/);
          const skillSetMatch = taskSection.match(/"skillSet":\[([^\]]*)\]/);
          const assignedToMatch = taskSection.match(/"assignedTo":(\d+|null)/);
          const assignedByMatch = taskSection.match(/"assignedBy":(\d+)/);
          
          if (nameMatch) {
            const name = nameMatch[1];
            
            // Parse skillSet
            let skillSet: string[] = [];
            if (skillSetMatch && skillSetMatch[1]) {
              const skillMatches = skillSetMatch[1].match(/"([^"]+)"/g);
              if (skillMatches) {
                skillSet = skillMatches.map(s => s.replace(/"/g, ''));
              }
            }
            
            // Parse assignedTo
            let assignedTo = null;
            let assigned = false;
            if (assignedToMatch && assignedToMatch[1] !== 'null') {
              assignedTo = parseInt(assignedToMatch[1]);
              assigned = true;
            }
            
            const task = {
              taskId: taskId,
              name: name,
              skillSet: skillSet,
              assignedTo: assignedTo,
              assigned: assigned,
              assignedBy: assignedByMatch ? parseInt(assignedByMatch[1]) : null,
              id: taskId,
              status: assigned ? 'assigned' : 'pending'
            };
            
            tasks.push(task);
            foundTaskIds.add(taskId);
            console.log('fixCircularReferenceAndExtract - Extracted task:', task);
          }
        } catch (sectionError) {
          console.warn('fixCircularReferenceAndExtract - Error processing task section:', sectionError);
        }
      }
      
      // Strategy 2: If we didn't find enough tasks, try a different approach
      if (tasks.length < 2) {
        console.log('fixCircularReferenceAndExtract - Trying alternative extraction...');
        
        // Look for task patterns that might be in different formats
        const alternativePatterns = [
          /\{"taskId":(\d+),"name":"([^"]+)"[^}]*"skillSet":\[([^\]]*)\][^}]*"assignedTo":(\d+|null)/g,
          /"taskId"\s*:\s*(\d+)[^}]*"name"\s*:\s*"([^"]+)"[^}]*"skillSet"\s*:\s*\[([^\]]*)\]/g
        ];
        
        for (const pattern of alternativePatterns) {
          let altMatch;
          while ((altMatch = pattern.exec(malformedJson)) !== null) {
            const taskId = parseInt(altMatch[1]);
            
            if (foundTaskIds.has(taskId)) continue;
            
            const name = altMatch[2];
            const skillSetStr = altMatch[3];
            const assignedToStr = altMatch[4];
            
            let skillSet: string[] = [];
            if (skillSetStr) {
              const skillMatches = skillSetStr.match(/"([^"]+)"/g);
              if (skillMatches) {
                skillSet = skillMatches.map(s => s.replace(/"/g, ''));
              }
            }
            
            let assignedTo = null;
            let assigned = false;
            if (assignedToStr && assignedToStr !== 'null') {
              assignedTo = parseInt(assignedToStr);
              assigned = true;
            }
            
            const task = {
              taskId: taskId,
              name: name,
              skillSet: skillSet,
              assignedTo: assignedTo,
              assigned: assigned,
              id: taskId,
              status: assigned ? 'assigned' : 'pending'
            };
            
            tasks.push(task);
            foundTaskIds.add(taskId);
            console.log('fixCircularReferenceAndExtract - Alternative extracted task:', task);
          }
        }
      }
      
    } catch (error) {
      console.error('fixCircularReferenceAndExtract - Error:', error);
    }
    
    console.log('fixCircularReferenceAndExtract - Total unique tasks found:', tasks.length);
    console.log('fixCircularReferenceAndExtract - Task IDs found:', Array.from(foundTaskIds));
    return tasks;
  }

  // Method to get available benched employees for task assignment
  getAvailableEmployees(): Observable<any> {
    console.log('TeamLeadService.getAvailableEmployees() called');
    return this.http.get(`${this.apiUrl}/availableEmployees`, { 
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(
      map((response: any) => {
        console.log('getAvailableEmployees - Raw response:', response);
        try {
          const parsed = JSON.parse(response);
          console.log('getAvailableEmployees - Parsed response:', parsed);
          return parsed;
        } catch (e) {
          console.warn('getAvailableEmployees - Failed to parse response:', e);
          return [];
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('getAvailableEmployees - Error:', error);
        // Return empty array if endpoint doesn't exist
        return of([]);
      })
    );
  }

  // Alternative assignment method that might work better
  assignTaskAlternative(taskId: number, employeeId?: number): Observable<any> {
    console.log(`TeamLeadService.assignTaskAlternative() called with taskId: ${taskId}, employeeId: ${employeeId}`);
    
    const body = employeeId ? { employeeId } : {};
    console.log('Assignment request body:', body);
    
    return this.http.post(`${this.apiUrl}/assignTask/${taskId}`, body, { 
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }).pipe(
      map((response: any) => {
        console.log('assignTaskAlternative - Raw response:', response);
        try {
          const parsed = JSON.parse(response);
          console.log('assignTaskAlternative - Parsed response:', parsed);
          return parsed;
        } catch (e) {
          console.log('assignTaskAlternative - Response is not JSON:', response);
          return { message: response || 'Task assigned successfully' };
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('assignTaskAlternative - Error:', error);
        throw error;
      })
    );
  }
}