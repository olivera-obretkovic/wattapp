import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { CookieService } from "ngx-cookie-service"

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private auth : AuthService,
    private router : Router,
    private msg : MessageService,
    private cookie:CookieService

  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.endsWith('/signin') || request.url.endsWith('/signup') || request.url.startsWith('https://api.open-meteo.com') ) {
      return next.handle(request);
    }


    const myToken = this.auth.getFullToken();

    if(myToken){
      request = request.clone({
        setHeaders: {Authorization:`Bearer ${myToken}`}
      })
    }
    return next.handle(request).pipe(
      catchError((err : any) =>{
        if(err instanceof HttpErrorResponse){
          if(err.status === 401){
            this.cookie.delete('jwtToken');
            this.msg.add({severity: 'error', summary: "Error", detail: "Your token has expired", styleClass:'expired-token'});
            this.router.navigate(['signin']);
          }
        }
        return throwError(() => new Error("Some other error occour."));
      })
    );
  }
}
