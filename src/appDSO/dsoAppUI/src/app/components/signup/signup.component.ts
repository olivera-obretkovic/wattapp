import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'service/auth.service';
import { ConfirmEventType, ConfirmationService, MessageService } from 'primeng/api';
import { CookieService } from "ngx-cookie-service";
import { ConfirmPasswordValidator } from 'app/helpers/confirm-password.validator';
import { Role } from 'models/User';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  submitted = false;
  type: string = "password";
  type2: string = "password";
  eyeIcon: string = "fa-eye-slash";
  eyeIcon2: string = "fa-eye-slash";
  isText: boolean = false;
  isText2: boolean = false;
  signupForm!: FormGroup;
  allWorkers!: Role[];
  workers!: Role[];
  disp!:Role;
  public emailModal : any;
  public firstNameModal: any;
  public lastNameModal: any;
  public roleModal : any;
  public mobileModal:any;
  public id!:any;
  @ViewChild('profileDispacher') profileDispacher!: ElementRef;
  constructor(
    private fb: FormBuilder,
    private router : Router,
    private auth: AuthService,private cookie: CookieService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
    ){}

    ngOnInit(): void {
      this.signupForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email : ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
        phonenumber: ['', [Validators.required, Validators.pattern('^(\\+381(\\s?|-?))?0?[\\d]{2}[\\d]{3,4}[\\d]{3,4}$')]] ,
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
      },{
        validator: ConfirmPasswordValidator("password","confirmPassword")
      }
      )
      this.getAllDispachers();

    }

    getAllDispachers(){
      this.auth.getAllDispechers().subscribe(
        (response) => {
          this.allWorkers = response;

        }
      )

    }


    get fields(){
      return this.signupForm.controls;
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
    firstName!: string;
    lastName!:string;
    onSubmit(){
      this.submitted = true;
      if(this.signupForm.invalid){

        this.messageService.add({ severity: 'error', summary: 'Invalid data', detail: 'Invalid data format', life:1000 });
        this.router.navigate(['signup']);
        return;
      }else if(this.signupForm.valid){
        if( this.signupForm.get('firstName')?.value != null  && this.signupForm.get('lastName') != null){
           this.firstName = this.signupForm.get('firstName')?.value;
           this.lastName = this.signupForm.get('lastName')?.value;
        }
        this.auth.register(this.signupForm.get('firstName')?.value,this.signupForm.get('lastName')?.value,"Dispatcher",this.signupForm.get('phonenumber')?.value,this.signupForm.get('email')?.value,this.signupForm.get('password')?.value)
        .subscribe((message) =>
          {
              this.signupForm.reset();
              this.messageService.add({ severity: 'success', summary: 'Register success'});
              this.router.navigate(['/home'],{skipLocationChange:false}).then(()=>{

                this.router.navigate(['/signup']);

              });
          }
        );
      }
    }
    deleteDispecher(id : any){

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.auth.deleteDispathcer(id).subscribe({
          next:(response : any) => {
            this.messageService.add({ severity: 'success', summary: 'Register deleted'});
            this.router.navigate(['/home'],{skipLocationChange:false}).then(()=>{

              this.router.navigate(['/signup']);

            });
          },
          error:(err : any)=>{
            console.log("ERRROR delete" + err);
          }
        })
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
    giveMeWorker(id : any){
      this.auth.getDispacher(id).subscribe({
        next:(response : any) => {
          this.disp = response;
          this.id = this.disp.id;
          console.log("ID",this.disp.id);
          this.firstNameModal = this.disp.firstName;
          this.lastNameModal = this.disp.lastName;
          this.emailModal = this.disp.email;
          this.mobileModal = this.disp.phoneNumber;
          this.roleModal = this.disp.role;
        }
      })
    }

}
