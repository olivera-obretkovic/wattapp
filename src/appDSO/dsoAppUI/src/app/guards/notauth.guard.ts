import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,  Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AuthService } from 'service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotauthGuard  {

  constructor(
    private router : Router,
    private cookie : CookieService,
    private auth : AuthService
  ){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      if(!this.cookie.check("jwtTokenDso")){
        return true;
      }
      else{
        return this.router.createUrlTree(["home"]); ;
      }
  }

}
