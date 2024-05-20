import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddDeviceComponent } from './components/add-device/add-device.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';

import { ResetComponent } from './components/reset/reset.component';

import { ProfileProsumerComponent } from './components/profile-prosumer/profile-prosumer.component';
import { MobNavComponent } from './components/mob-nav/mob-nav.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthGuard } from './guards/auth.guard';
import { NotauthGuard } from './guards/notauth.guard';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { EditDeviceComponent } from './components/edit-device/edit-device.component';
import { NavComponent } from './components/nav/nav.component';
import { MyDevicesComponent } from './components/my-devices/my-devices.component';
import { Home2Component } from './components/home2/home2.component';
import { DeviceDetailsComponent } from './components/device-details/device-details.component';
import { PermissionsComponent } from './components/permissions/permissions.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';



const routes: Routes = [
  {
    path: 'signin', component: LoginComponent //canActivate:[NotauthGuard] ne radi dobro
  },
  {
    path:'signup', component: SignupComponent
  },
  {
    path:'reset', component: ResetComponent
  },
  {
    path:'home',component:HomeComponent,canActivate:[AuthGuard]
  },
  {
    path: 'add-device', component: AddDeviceComponent,canActivate:[AuthGuard]
  },
  {
    path: 'edit-profile', component: EditProfileComponent,canActivate:[AuthGuard]
  },
  {
    path: 'edit-device', component: EditDeviceComponent,canActivate:[AuthGuard]
  },

  {
    path:'mob-nav', component:MobNavComponent,canActivate:[AuthGuard]
  },
  {
    path:'nav', component:NavComponent,canActivate:[AuthGuard]
  },
  {
    path:'my-devices', component:MyDevicesComponent,canActivate:[AuthGuard]
  },
  {
    path:'profile-prosumer', component:ProfileProsumerComponent
  },
  {
    path: 'device-details/:id', component: DeviceDetailsComponent
  },
  {
    path: 'permissions/:id', component: PermissionsComponent
  },
  {
    path:'', component:WelcomeComponent
  },
  {
    path:'dashboard', component: DashboardComponent
  },
  {
    path: 'settings', component: SettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
