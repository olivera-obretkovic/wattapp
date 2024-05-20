import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  

  constructor(
    private auth: AuthService,
    private router : Router){}

  signOut(){
    this.auth.signOut();
  }
}
