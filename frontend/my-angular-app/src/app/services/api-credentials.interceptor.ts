import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** Sends the HttpOnly refresh-token cookie on API calls without affecting external requests. */
export const apiCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const isSameOriginApi = request.url.startsWith('/');
  const isConfiguredApi = environment.apiBaseUrl !== '' && request.url.startsWith(environment.apiBaseUrl);
  if (!isSameOriginApi && !isConfiguredApi) {
    return next(request);
  }

  return next(request.clone({ withCredentials: true }));
};
