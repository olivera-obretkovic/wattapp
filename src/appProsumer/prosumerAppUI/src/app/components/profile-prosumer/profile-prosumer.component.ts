import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

import jwt_decode from 'jwt-decode';
import { AuthUserService } from 'src/app/services/auth-user.service';
import { AuthService } from 'src/app/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-profile-prosumer',
  templateUrl: './profile-prosumer.component.html',
  styleUrls: ['./profile-prosumer.component.css']
})
export class ProfileProsumerComponent implements OnInit{

  allUsers!: any[];
  userID!: User;
  token!:any;
  firstName!:string;
  lastName!:string;
  phoneNumber!: string;
  address!: string;
  city!: string;
  country!: string;
  email!: string;
  image:any;
  defaultImage: string = 'assets/icons/images.jpg';


  constructor(
    private auth : AuthUserService,
    private serv : AuthService
  ){}

  ngOnInit(): void {
    this.getUser();
    this.getToken();
  }

  getUser(){
    this.auth.getAllUsers().subscribe(
      (response : any)=>{
      }
    )
  }

  getToken(){
    this.token = this.serv.getToken();
    this.auth.getThisUser(this.token).subscribe(
      (response :any)=>{
       this.userID = response;
       this.firstName = response.firstName;
       this.firstName = response.firstName;
       this.lastName = response.lastName;
       this.phoneNumber = response.phoneNumber;
       this.address = response.address;
       this.city = response.city;
       this.country = response.country;
       this.email = response.email;
       if (response.profilePicture) {
        this.convertBase64ToImage(response.profilePicture)
          .then((imageUrl: string) => {
            this.image = imageUrl;
          })
          .catch((error) => {
            console.error('Error converting Base64 to image:', error);
            this.image = this.defaultImage;
          });
      } else {
        this.image = this.defaultImage;
      }
    }
    );
  }


  convertBase64ToImage(base64String: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.src);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = 'data:image/jpeg;base64,' + base64String;
    });
  }

}


