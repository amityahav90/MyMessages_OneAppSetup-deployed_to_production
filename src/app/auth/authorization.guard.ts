import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { AuthService } from './auth.service';
import {Observable} from 'rxjs';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot)
  : Observable<boolean> | Promise<boolean> | boolean {
    const user = this.authService.getAuthData();
    if (user.userId === next.url[2].path) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
