import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { GoogleMapsModule } from '@angular/google-maps';

import { ConfirmationService, SharedModule } from 'primeng/api';

import { NgChartsModule } from 'ng2-charts';
import * as CanvasJSAngularChart from '../assets/canvasjs.angular.component';
import { NavComponent } from './components/nav/nav.component';
import { HomeComponent } from './components/home/home.component';
import {MatTableModule} from '@angular/material/table';
import { TableComponent } from './components/table/table.component';
import { SignupComponent } from './components/signup/signup.component';
import { FormsModule } from '@angular/forms';
import { RequirementsComponent } from './components/requirements/requirements.component';
import { PaginatorModule } from 'primeng/paginator';
import { FilterPipe } from './components/table/filer.pipe';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { MessageService } from 'primeng/api';
import { TokenInterceptor } from './interceptors/interceptor';
import { ToastModule } from 'primeng/toast';
import { ModalTableComponent } from './components/modal-table/modal-table.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ProfileComponent } from './components/profile/profile.component';
import { ModalTableProfileComponent } from './components/modal-table-profile/modal-table-profile.component';
import { ModelProfileComponent } from './components/model-profile/model-profile.component';
import { DeviceDetailsComponent } from './components/device-details/device-details.component';




var CanvasJSChart = CanvasJSAngularChart.CanvasJSChart;


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CanvasJSChart,
    NavComponent,
    HomeComponent,
    TableComponent,
    SignupComponent,
    RequirementsComponent,
    FilterPipe,
    WelcomeComponent,
    ModalTableComponent,
    ErrorPageComponent,
    ProfileComponent,
    ModalTableProfileComponent,
    ModelProfileComponent,
    DeviceDetailsComponent,
   


],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    BrowserAnimationsModule,
    GoogleMapsModule,
    NgChartsModule,
    FormsModule,
    MatTableModule,
    PaginatorModule,
    NgxSpinnerModule,
    ToastModule,
    MatDialogModule,
    ConfirmDialogModule,
    TableModule,
    SharedModule
  ],
  providers: [MessageService,{provide:HTTP_INTERCEPTORS,useClass:TokenInterceptor,multi:true}, MatDialog, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
