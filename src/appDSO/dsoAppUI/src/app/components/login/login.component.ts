import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'service/auth.service';
import { MessageService } from 'primeng/api';
import { CookieService } from "ngx-cookie-service";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  
  submitted = false;
  type: string = "password";
  eyeIcon: string = "fa-eye-slash";
  isText: boolean = false;
  loginForm!: FormGroup;
  showsignin!:boolean;

  constructor(
    private fb: FormBuilder, 
    private router : Router,
    private auth: AuthService,
    private cookie: CookieService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
   ){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email : ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })

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
    this.spinner.show();
    this.showsignin = true;
    if(this.loginForm.valid){
      this.auth.login(this.loginForm.get('email')?.value, this.loginForm.get('password')?.value)
      .subscribe(
        (response) => {
          this.cookie.set('jwtTokenDso', response);
          this.messageService.add({ severity: 'success', summary: 'Logged in', detail: 'Welcome back', life: 3000 });
          
          setTimeout(() => {
            this.spinner.hide();
            this.showsignin = false;
            this.router.navigate(['home']);
          }, 1000);
        },
        (error) => {
          this.spinner.hide();
          this.showsignin = false;
          if (error.status === 400) {
            this.messageService.add({ severity: 'error', summary: 'Invalid credentials', detail: error.error, life: 3000 });
            this.router.navigate(['/signin'])
            this.spinner.hide();
            this.showsignin = false;
          }
        }
      );
    }else{
      this.messageService.add({ severity: 'error', summary: 'Invalid credentials', detail: 'Invalid data format', life: 3000 });
      this.router.navigate(['/signin']);
      this.spinner.hide();
      this.showsignin = false;
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
}



