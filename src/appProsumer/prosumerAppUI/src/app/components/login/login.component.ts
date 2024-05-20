import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
//import { NgToastService } from 'ng-angular-popup';
import { MessageService } from 'primeng/api';
import { AuthUserService } from 'src/app/services/auth-user.service';
import { AuthService } from 'src/app/services/auth.service';
import { CookieService } from "ngx-cookie-service";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations:[]
})
export class LoginComponent implements OnInit{
  submitted = false;
  type: string = "password";
  eyeIcon: string = "fa-eye-slash";
  isText: boolean = false;
  loginForm!: FormGroup;
  public resetPasswordEmail !: string;
  public isValidEmail !: boolean;
  show!:boolean;

  constructor(
    private fb: FormBuilder,
    private router : Router,
    //private toast : NgToastService,
    private auth: AuthService,
    private cookie: CookieService,
    private messageService: MessageService,
    private snackBar: MatSnackBar,
    private spinner: NgxSpinnerService
    ){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email : ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    })

    const loginInfo = JSON.parse(this.cookie.get('loginInfo') || '{}');

    this.loginForm.setValue({
      email: loginInfo.email || '',
      password: loginInfo.password || '',
      rememberMe: loginInfo.rememberMe || false
    });

    }

  hideShowPass(){
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }

  get fields(){
    return this.loginForm.controls;
  }

  onSubmit(){
    this.submitted = true;
    if(this.loginForm.valid){
      this.spinner.show();
      this.show = true;
      this.auth.login(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value)
      .subscribe(
        (response) => {
          this.cookie.set('jwtToken', response);
          this.messageService.add({ severity: 'success', summary: 'Logged in', detail: 'Welcome back' });
          if (this.loginForm.get('rememberMe')?.value) {
            const loginInfo = { email: this.loginForm.get('email')?.value, password: this.loginForm.get('password')?.value, rememberMe: this.loginForm.get('rememberMe')?.value};
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30); // 30 days from now
            this.cookie.set('loginInfo', JSON.stringify(loginInfo), expirationDate);
          }
          else if(this.cookie.get('loginInfo')){
            this.cookie.delete('loginInfo');
          }
          setTimeout(() => {
            this.spinner.hide();
            this.show = false;
            this.router.navigate(['home'])
          }, 1000);
        },
        (error) => {
          if (error.status === 400) {
            this.spinner.hide();
            this.show = false;
            this.messageService.add({ severity: 'error', summary: 'Invalid credentials', detail: error.error });
            this.router.navigate(['signin'])
          }
        }
      );
    }else{
      this.messageService.add({ severity: 'error', summary: 'Invalid credentials', detail: 'Invalid data format' });
      this.router.navigate(['signin'])
    }
  }

  private validateAllFormFields(formGroup : FormGroup){
    Object.keys(formGroup.controls).forEach(
      field => {
        const control = formGroup.get(field);
        if(control instanceof FormControl){

          control?.markAsDirty({onlySelf: true})
        }else if(control instanceof FormGroup){
          this.validateAllFormFields(control);
        }
      })
    }


    checkValidEmail(event:string)
    {
      const value = event;
      const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/;
      this.isValidEmail = pattern.test(value);
      return this.isValidEmail;
    }

    confirmToSend()
    {
      if(this.checkValidEmail(this.resetPasswordEmail))
      {
        this.resetPasswordEmail = "";
        const buttnoRef = document.getElementById("closeBtn");
        buttnoRef?.click();

        //API call to be done
      }
    }
}


