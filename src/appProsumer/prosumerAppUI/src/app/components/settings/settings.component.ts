import { AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmPasswordValidator } from 'src/app/helpers/confirm-password.validator';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';
import { BackgroundService } from 'src/app/services/background.service';import { Router } from '@angular/router';
import { AuthUserService } from 'src/app/services/auth-user.service';
import { User } from 'src/app/models/user';
import { ConfirmEventType, ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, AfterViewInit{
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
  userID!: User;
  token!:any;
  currentPassword!: string;
  newPassword!: string;

  constructor(private apiService: SettingsService, private auth: AuthService, private auth1: AuthUserService, private messageService:MessageService, private fb: FormBuilder,private backgroundService:BackgroundService,private router : Router, private confirmationService: ConfirmationService) { }

  @ViewChild('exampleModal') exampleModal!: ElementRef;

  ngOnInit(): void {
    this.resetForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    },{
      validator: ConfirmPasswordValidator("password","confirmPassword")
    }
    );

    this.getToken();

    this.apiService.alreadyHasReq().subscribe(
      (response) => {
        if(response == true)
          this.requestStatus = 'pending';
      }
    )
    this.apiService.statusOfReq().subscribe(
      response => {
        if (response != null && response == true) {
          this.requestStatus = 'accepted';
          this.apiService.getShareInfo().subscribe(
            (data) => {
              this.allowAccess = data;
            },
            (error) => {
              console.error('Error retrieving share information:', error);
            }
          );
        }
      }
    )

    this.backgroundService.startBackgroundProcess();
    this.backgroundService.subscribeToStatusUpdate().subscribe(status => {
      this.requestStatus = status;
    });
  }

  getToken(){
    this.token = this.auth.getToken();
    this.auth1.getThisUser(this.token).subscribe(
      (response :any)=>{
       this.userID = response.id;
      }
    )
  }

  ngOnDestroy() {
    this.backgroundService.ngOnDestroy();
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
      const passwordData = {
        oldPassword: this.currentPassword,
        newPassword: this.newPassword
      };

      this.confirmationService.confirm({
        message: 'Are you sure you want to change your password? The action cannot be undone and you will need to re-login.',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.auth1.changePassword(this.userID, passwordData).subscribe(
            (response) => {
              this.messageService.add({ severity: 'success', summary: 'Password updated successfully!'});
              const buttonRef = document.getElementById('closeBtn');
              buttonRef?.click();
              this.auth.signOut2();
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



  reset()
  {
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


  toggleAccess(){
    this.allowAccess = !this.allowAccess;
    this.apiService.updateUserDataSharing(this.allowAccess).subscribe(
      (response) => {
        console.log("Success");
      },
      (error) => {
        console.log("Fail");
      }
    );
  }

  sendReq() {
    this.apiService.sendRequest().subscribe(
      (info) => {
      },
      (error) => {
        console.log(error);
      });
    this.requestStatus = 'pending'
  }

  cancelReq(){
    this.apiService.cancelRequest().subscribe(
      (info) => {
      },
      (error) => {
        console.log(error);
      });
      this.requestStatus = 'no'
  }

  disconnectDSO(){
    this.apiService.disconnectDSO().subscribe(
      (info) => {
      },
      (error) => {
        console.log(error);
      });
      this.requestStatus = 'no'
  }
  signOut(){
    this.auth.signOut();
  }

}
