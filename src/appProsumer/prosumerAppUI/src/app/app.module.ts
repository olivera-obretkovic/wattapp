import { NgModule } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ModalTableComponent } from './components/modal-table/modal-table.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';


//import {NgToastModule} from 'ng-angular-popup'
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { ResetComponent } from './components/reset/reset.component';

import { ProfileProsumerComponent } from './components/profile-prosumer/profile-prosumer.component';
import { AddDeviceComponent } from './components/add-device/add-device.component';

import { EditDeviceComponent } from './components/edit-device/edit-device.component';

import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { NavComponent } from './components/nav/nav.component';
import { MyDevicesComponent } from './components/my-devices/my-devices.component';
import { TooltipModule } from 'primeng/tooltip';

import { MobNavComponent } from './components/mob-nav/mob-nav.component';
import { Home2Component } from './components/home2/home2.component';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { DeviceDetailsComponent } from './components/device-details/device-details.component';
import { CommonModule } from '@angular/common';
import { PermissionsComponent } from './components/permissions/permissions.component';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FilterPipe } from './filter.pipe';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DeviceEditPopupComponent } from './components/device-edit-popup/device-edit-popup.component';

import { NgxSpinnerModule } from 'ngx-spinner';
import { SettingsComponent } from './components/settings/settings.component';
import { DeviceDialogComponent } from './components/device-dialog/device-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    HomeComponent,
    ProfileProsumerComponent,
    AddDeviceComponent,
    ResetComponent,
    ProfileProsumerComponent,
    EditDeviceComponent,
    EditProfileComponent,
    MobNavComponent,
    NavComponent,
    EditProfileComponent,
    MyDevicesComponent,
    Home2Component,
    DeviceDetailsComponent,
    PermissionsComponent,
    FilterPipe,
    WelcomeComponent,
    DashboardComponent,
    DeviceEditPopupComponent,
    ModalTableComponent,
    SettingsComponent,
    DeviceDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastModule,
    MatToolbarModule,
    CommonModule,
    ConfirmDialogModule,
    Ng2SearchPipeModule,
    [MatProgressSpinnerModule],
    MatSnackBarModule,
    NgxSpinnerModule,
    TooltipModule
  ],
  providers: [MessageService,ConfirmationService, {provide:HTTP_INTERCEPTORS,useClass:TokenInterceptor,multi:true}, MatDialog],
  bootstrap: [AppComponent]
})
export class AppModule { }
