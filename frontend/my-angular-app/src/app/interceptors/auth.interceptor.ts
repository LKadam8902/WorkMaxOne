import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Get the token from localStorage
  const token = localStorage.getItem('token');

  // If token exists, add it to the request headers
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // If unauthorized, clear token and redirect to login
        localStorage.removeItem('token');
        router.navigate(['/sign-in']);
      }
      return throwError(() => error);
    })
  );
}; 