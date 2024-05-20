import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NavComponent } from './components/nav/nav.component'
import { TableComponent } from './components/table/table.component';
import { RequirementsComponent } from './components/requirements/requirements.component';
import { SignupComponent } from './components/signup/signup.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { NotauthGuard } from './guards/notauth.guard';
import { AuthGuard } from './guards/auth.guard';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { ProfileComponent } from './components/profile/profile.component';



const routes: Routes = [
  {
    path: 'signin', component: LoginComponent, canActivate:[NotauthGuard]
  },
  {
    path:'nav',component:NavComponent
  },
  {
    path: 'home', component: HomeComponent, canActivate:[AuthGuard]
  },
  {
    path: 'signup', component: SignupComponent, canActivate:[AuthGuard]
  },
  {
    path: 'table',component: TableComponent, canActivate:[AuthGuard]
  },
  {
    path: 'requirements', component: RequirementsComponent, canActivate:[AuthGuard]
  },
  {
    path:'profile', component:ProfileComponent
  },
  {
    path:'', component:WelcomeComponent
  },
  {
    path:'**', component:ErrorPageComponent
  },
  {
    path:'error-page', component:ErrorPageComponent
  },
 
]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
