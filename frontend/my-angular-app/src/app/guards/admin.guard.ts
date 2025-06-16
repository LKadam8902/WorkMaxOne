import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      this.router.navigate(['/admin-login']);
      return false;
    }

    if (!this.userService.isAdminTokenValid()) {
      this.userService.adminLogout();
      this.router.navigate(['/admin-login']);
      return false;
    }

    if (!this.userService.validateAdminToken()) {
      // User has a valid token but wrong role
      alert('Access denied. Admin credentials required.');
      this.userService.adminLogout();
      this.router.navigate(['/admin-login']);
      return false;
    }

    return true;
  }
}
