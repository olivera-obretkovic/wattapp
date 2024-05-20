import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'service/auth.service';
import jwt_decode from 'jwt-decode';
import { CookieService } from "ngx-cookie-service"
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent{
  constructor(
    private auth: AuthService,
    private router : Router,
    private cookie:CookieService){}

  signOut(){
    this.auth.signOut();
  }

  getRole() {
    const jwtToken = this.cookie.get('jwtTokenDso');
     const decoded :any = jwt_decode(jwtToken);
     return decoded.role;
  }
}
