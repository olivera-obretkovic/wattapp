import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthService } from 'service/auth.service';
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
    if (request.url.endsWith('/signin')  || request.url.endsWith('/signup') || request.url.startsWith('https://api.open-meteo.com') || request.url.startsWith('https://maps.googleapis.com') || request.url.startsWith('https://maps.googleapis.com')) {
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
            this.cookie.delete('jwtTokenDso');
            this.msg.add({severity: 'Error', summary: "Error", detail: "Your token has expired"});
            this.router.navigate(['/signin']);
          }
          // Log the error to the console or send it to a logging service
          console.error(`HTTP Error: ${err.message}`);
          
        }
        return throwError(() => new Error("Some other error occurred."));
      }),
      tap(() => {
        // Log the success of the HTTP request
        console.log(`HTTP request successful`);
      })
    );
  }
}