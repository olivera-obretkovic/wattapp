import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmPasswordValidator } from 'app/helpers/confirm-password.validator';
import { User } from 'models/User';
import { ConfirmEventType, ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from 'service/auth.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{
  allUsers!: any[];
  userID!: any;
  token!:any;
  firstName!:string;
  lastName!:string;
  phoneNumber!: string;
  address!: string;
  city!: string;
  country!: string;
  email!: string;
  password!:string;
  public emailModal : any;
  public firstNameModal: any;
  public lastNameModal: any;
  public roleModal : any;
  public mobileModal:any;
  public idDisapcher!:string;

  allowAccess = false;
  type: string = "password";
  type2: string = "password";
  type3: string = "password";
  eyeIcon: string = "fa-eye-slash";
  eyeIcon2: string = "fa-eye-slash";
  eyeIcon3: string = "fa-eye-slash";
  isText: boolean = false;
  isText2: boolean = false;
  isText3: boolean = false;
  resetForm!: FormGroup;
  submitted = false;
  requestStatus: string = 'no';
  currentPassword!: string;
  newPassword!: string;

  isValidEmail: boolean = true;
  isEmailModified: boolean = false;
  isValidPhoneNumber: boolean = true;
  isPhoneNumberModified: boolean = false;

  @ViewChild('profile') profile!:ElementRef; 
  @ViewChild ('modelEDIT') modalElementRef!: ElementRef;
  @ViewChild('exampleModal') exampleModal!: ElementRef;
 
  constructor(
    private serv : AuthService,
    private r:Router,
    private elementRef: ElementRef,
    private fb : FormBuilder,
    private messageService : MessageService,
    private confirmationService: ConfirmationService
  ){}

  ngOnInit(): void {
    this.getToken();
    this.resetForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    },{
      validator: ConfirmPasswordValidator("password","confirmPassword")
    });
  }

  getToken(){
    this.token = this.serv.getToken();
    this.serv.getDispecher(this.token).subscribe(
      (response :any)=>{
       this.userID = response;
       this.idDisapcher = response.id;
       this.firstName = response.firstName;
       this.firstNameModal = response.firstName;
       this.lastNameModal = response.lastName;
       this.lastName = response.lastName;
       this.phoneNumber = response.phoneNumber;
       this.mobileModal = this.phoneNumber;
       this.address = response.address;
       this.city = response.city;
       this.country = response.country;
       this.email = response.email;
       this.emailModal = response.email;

      }
    )
  }

  closeModal() {
    const modalElement = this.modalElementRef.nativeElement as HTMLElement;
    modalElement.classList.remove('modal');
    modalElement.classList.remove('modal-dialog');
    modalElement.style.display = 'none';
    this.r.navigate(['profile']);
  }


  ngAfterViewInit(): void {
    this.exampleModal.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.reset();
    });
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

  hideShowPass3(){
    this.isText3 = !this.isText3;
    this.isText3 ? this.eyeIcon3 = "fa-eye" : this.eyeIcon3 = "fa-eye-slash";
    this.isText3 ? this.type3 = "text" : this.type3 = "password";
  }

  get fields(){
    return this.resetForm.controls;
  }

  onReset()
  {
    this.submitted = true;
    if(this.resetForm.valid && (this.resetForm.get('password')?.dirty || this.resetForm.get('confirmPassword')?.dirty)){

      this.confirmationService.confirm({
        message: 'Are you sure you want to change your password? The action cannot be undone and you will need to re-login.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.serv.updatePasswordForDispacher(this.idDisapcher, this.currentPassword, this.newPassword).subscribe(
            (response) => {
              this.messageService.add({ severity: 'success', summary: 'Password updated successfully!'});
              const buttonRef = document.getElementById('closeBtn1');
              buttonRef?.click();
              this.serv.signOut2();
            },
            (error) => {
              this.messageService.add({ severity: 'error', summary: 'Your current password is incorrect!'});
            }
          );
          return;
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
}
    reset(){
      this.resetForm.reset();
      this.resetForm.clearValidators();
      this.resetForm.markAsPristine();
      this.resetForm.markAsUntouched();
      this.type = "password";
      this.type2 = "password";
      this.type3 = "password";
      this.eyeIcon = "fa-eye-slash";
      this.eyeIcon2 = "fa-eye-slash";
      this.eyeIcon3 = "fa-eye-slash";
      this.isText =false;
      this.isText2 = false;
      this.isText3 = false;

      this.clearErrorMessages();
  }

  clearErrorMessages() {
    const currentPasswordControl = this.resetForm.get('currentPassword');
    const passwordControl = this.resetForm.get('password');
    const confirmPasswordControl = this.resetForm.get('confirmPassword');

    if (currentPasswordControl) {
      currentPasswordControl.setErrors(null);
    }

    if (passwordControl) {
      passwordControl.setErrors(null);
    }

    if (confirmPasswordControl) {
      confirmPasswordControl.setErrors(null);
    }
  }

  updateDispacher(){
   
    const profile = {
      firstName : this.firstName,
      lastName : this.lastName,
      email : this.email,
      phoneNumber:this.phoneNumber
    };
    this.serv.updateDispacher(this.idDisapcher, this.firstName, this.lastName, this.phoneNumber, this.email).subscribe({
      next:(response:any)=>{
        this.closeModal();
       
      },
      error:(error : any)=>{
        console.log(error);
      }

    })
  }

  checkValidEmail(): void {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/;
    this.isValidEmail = pattern.test(this.email);
  }

  onEmailInput(): void {
    this.isEmailModified = true;
    this.checkValidEmail();
  }
  checkValidPhoneNumber(): void {
    const pattern = /^(\+381(\s?|-?))?0?[\d]{2}[\d]{3,4}[\d]{3,4}$/;
    this.isValidPhoneNumber = pattern.test(this.phoneNumber);
  }

  onPhoneNumberInput(): void {
    this.isPhoneNumberModified = true;
    this.checkValidPhoneNumber();
  }
 
}
