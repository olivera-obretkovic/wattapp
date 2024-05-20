import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
//import { NgToastService } from 'ng-angular-popup';
import { AuthService } from 'src/app/services/auth.service';
import { CookieService } from "ngx-cookie-service"
import { MessageService } from 'primeng/api';
import { ConfirmPasswordValidator } from 'src/app/helpers/confirm-password.validator';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent  implements OnInit{
  submitted = false;
  type: string = "password";
  eyeIcon: string = "fa-eye-slash";
  isText: boolean = false;
  type2: string = "password";
  eyeIcon2: string = "fa-eye-slash";
  isText2: boolean = false;
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router : Router,
    //private toast : NgToastService,
    private messageService:MessageService,
    private auth: AuthService,
    private cookie: CookieService
    ){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email : ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      address: ['', [Validators.required, Validators.pattern('^[\\w\\s]+,\\s*[\\w\\s]+,\\s*[\\w]+$')]],
      phonenumber: ['', [Validators.required, Validators.pattern('^(\\+381(\\s?|-?))?0?[\\d]{2}[\\d]{3,4}[\\d]{3,4}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]},
      {
        validator: ConfirmPasswordValidator("password","confirmPassword")
      }
      )

  }

  hideShowPass(){
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }

  hideShowPass2(){
    this.isText2 = !this.isText2;
    this.isText2 ? this.eyeIcon2 = "fa-eye" : this.eyeIcon2 = "fa-eye-slash";
    this.isText2 ? this.type2 = "text" : this.type2 = "password";
  }


  get fields(){
    return this.loginForm.controls;
  }

  onSubmit(){
    this.submitted = true;
    if(this.loginForm.invalid){

      this.messageService.add({ severity: 'error', summary: 'Invalid data', detail: 'Invalid data format' });
      this.validateAllFormFields(this.loginForm);
      this.router.navigate(['signup']);
      return;
    }else if(this.loginForm.valid){
      this.auth.register(this.loginForm.get('firstName')?.value, this.loginForm.get('lastName')?.value, this.loginForm.get('email')?.value,this.loginForm.get('address')?.value, this.loginForm.get('phonenumber')?.value, this.loginForm.get('password')?.value,)
      .subscribe((message) =>
    {
      if (message === 'Email already exists') {
        this.messageService.add({ severity: 'error', summary: 'Registration failed', detail: 'Email already exists' });
      } else {
        const fullName = this.loginForm.get('firstName')?.value + ' ' + this.loginForm.get('lastName')?.value;
        this.loginForm.reset();
        this.messageService.add({ severity: 'success', summary: 'Registration success', detail: 'Welcome ' + fullName });
        this.router.navigate(['signin'])
      }
    }
  );
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
