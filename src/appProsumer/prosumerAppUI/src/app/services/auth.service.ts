import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CookieService } from "ngx-cookie-service"
import { newDeviceDTO } from 'src/app/models/newDeviceDTO'
import jwt_decode from 'jwt-decode';
import { decode } from 'jsonwebtoken';
import { Token } from '@angular/compiler';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  decoded! : Token;
  constructor(
    private http: HttpClient,
    private router:Router,
    private cookie: CookieService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService) { }

  login(email : string, password : string) : Observable<string>{
    return this.http.post<string>(environment.apiUrl + "/api/User/signin", {
      email : email,
      password : password
    })
  }

  register(firstName: string, lastName: string, email: string, address: string, phoneNumber: string, password: string): Observable<string> {
    return this.http.post<string>(environment.apiUrl + "/api/User/signup", {
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      address: address,
      email: email,
      password: password
    }).pipe(
      catchError((error) => {
        if (error.status === 500) {
          return of('Email already exists');
        } else {
          throw error;
        }
      })
    );
  }

  validateJwt(token : string) : Observable<boolean>{
    var headers = new HttpHeaders().set("Authorization", "Bearer " + token);
    return this.http.post<boolean>(environment.apiUrl + "/api/User/validate-token", {}, {
      headers : headers
    });
  }
  getData(){
    return this.http.get<any>(environment.apiUrl +"/api/User/username", { headers: new HttpHeaders().set('Authorization', `Bearer ${this.cookie.get('jwtToken')}`) });
  }

  getDeviceData(){
    return this.http.get<any>(`${environment.apiUrl}/api/Device/devices/info`, { headers: new HttpHeaders().set('Authorization', `Bearer ${this.cookie.get('jwtToken')}`) });
  }


  getToken() {

    const jwtToken = this.cookie.get('jwtToken');
     const decoded :any = jwt_decode(jwtToken);
     return decoded.unique_name;
  }

  getRole() {

    const jwtToken = this.cookie.get('jwtToken');
     const decoded :any = jwt_decode(jwtToken);
     return decoded.role;
  }

  getFullToken() {
    const jwtToken = this.cookie.get('jwtToken');
    return jwtToken;
  }

  signOut() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to log out?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cookie.delete('jwtToken');
        this.router.navigate(['/signin']);
      },
      reject: (type: any) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            break;
          case ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
            break;
        }
      },
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary'
    });
  }

  signOut2()
  {
    this.cookie.delete('jwtToken');
    this.router.navigate(['/signin']);
  }

  getWeather():Observable<any>{
    return this.http.get<any>(`https://api.open-meteo.com/v1/forecast?latitude=44.02&longitude=20.91&hourly=temperature_2m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`);
  }

  getDevicesInfoByID(deviceID : string){
    return this.http.get<any>(environment.apiUrl + "/api/Device/devices/info/"+deviceID);
  }

  changeState(id:any):Observable<any>{
    return this.http.get<any>(environment.apiUrl + "/api/Device/change-state/"+id);
  }
  isOn(id:any):Observable<any>{
    return this.http.get<any>(environment.apiUrl + "/api/Device/is-turned-on/"+id);
  }
}
