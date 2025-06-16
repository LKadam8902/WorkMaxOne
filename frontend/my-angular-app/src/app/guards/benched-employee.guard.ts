import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class BenchedEmployeeGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/sign-in']);
      return false;
    }

    if (!this.userService.isTokenValid()) {
      this.userService.logout();
      this.router.navigate(['/sign-in']);
      return false;
    }

    if (!this.userService.validateTokenForRole('BENCHED_EMPLOYEE')) {
      // User has a valid token but wrong role
      alert('Access denied. Benched Employee credentials required.');
      this.userService.logout();
      this.router.navigate(['/sign-in']);
      return false;
    }

    return true;
  }
}
