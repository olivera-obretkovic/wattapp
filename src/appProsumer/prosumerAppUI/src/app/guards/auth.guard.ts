import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,  Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CookieService } from "ngx-cookie-service"

@Injectable({
  providedIn: 'root'
})
export class AuthGuard  {
  constructor(
    private router : Router,
    private cookie : CookieService,
    private auth : AuthService){};


    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if(this.cookie.check("jwtToken")){
          var token = this.cookie.get("jwtToken");
          return true
        }
        else{
          this.router.navigate(["signin"]);
          return false;
        }
    }
  }


