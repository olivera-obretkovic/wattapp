import { Component, OnInit } from '@angular/core';
import { AuthUserService } from 'src/app/services/auth-user.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  isLoading = false;
  showMeHome:boolean = false;
  showMeHome2:boolean = false;
  data:any;
  devices!:[];
  num!: number;



  constructor(
    private auth: AuthService,
    private serv : AuthUserService
    ){}

    ngOnInit(): void {/*
    this.auth.getData().subscribe((data) => {
      this.data = "Welcome, " + data;
    });*/
    
    this.numberOfDevices();

  }


  numberOfDevices(){
    this.auth.getDeviceData().subscribe(
    (res:any)=>{
      this.num = res.length;
      if(this.num > 0){
        this.showMeHome2 = true;
        this.showMeHome = false;
      }else{
        this.showMeHome = true;
        this.showMeHome2 = false;
      }
    }
    );
  }
}
