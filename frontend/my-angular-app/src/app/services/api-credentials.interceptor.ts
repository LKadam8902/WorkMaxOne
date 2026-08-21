import { HttpInterceptorFn } from '@angular/common/http';

/** Sends the HttpOnly refresh-token cookie on API calls without affecting external requests. */
export const apiCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('http://localhost:8000')) {
    return next(request);
  }

  return next(request.clone({ withCredentials: true }));
};
