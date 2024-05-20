import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'app/environments/environment';
import { Info } from 'models/User';
import { Observable } from 'rxjs';
import { CookieService } from "ngx-cookie-service"
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private router:Router,
    private cookie:CookieService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  getCoords():Observable<any>{
    return this.http.get<any>(environment.apiUrl + "/api/User/coordinatesForEveryUser");
  }

  login(email : string, password : string) : Observable<string>{
    return this.http.post<string>(environment.apiUrl + "/api/Dispatcher/signin", {
      email : email,
      password : password
    })
  }

  register(firstName: string, lastName: string, role:string, phonenumber: string, email: string,password : string) : Observable<string>{
    return this.http.post<string>(environment.apiUrl + "/api/Dispatcher/signup", {
      firstName: firstName,
      lastName:lastName,
      Role: role,
      phonenumber : phonenumber,
      Email : email,
      password: password
    })
  }

  getFullToken() {
    const jwtToken = this.cookie.get('jwtTokenDso');
    return jwtToken;
  }

  signOut() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to log out?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cookie.delete('jwtTokenDso');
        this.router.navigate(['/signin']);
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

  signOut2()
  {
    this.cookie.delete('jwtTokenDso');
    this.router.navigate(['/signin']);
  }

  getPagination(pageNumber : number, pageSize : number) : Observable<any>{
    return this.http.get<any>(environment.apiUrl + "/api/User/users", {
      params: {
        pageSize : pageSize,
        pageNumber : pageNumber
      }
    })
  }

  getCoordsByUserID(id : string):Observable<any>{
    return this.http.get<any>(environment.apiUrl + "/api/User/coordinates/"+id);
  }

  getWeather():Observable<any>{
    return this.http.get<any>('https://api.open-meteo.com/v1/forecast?latitude=44.02&longitude=20.91&hourly=temperature_2m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto');
  }
// DEVICES

  getDevices(userID: string):Observable<Info>{
    return this.http.get<Info>(environment.apiUrl + "/api/Device/devices/info/"+userID);
  }

  getDevicesInfoByID(deviceID : string){
    return this.http.get<any>(environment.apiUrl + "/api/Device/devices/info/"+deviceID);
  }

  getDeviceGroup():Observable<any>{
    return this.http.get<any>(environment.apiUrl + "/api/Device/groups");
  }

  getUserPowerUsageByID(userID : string){
    return this.http.get<any>(environment.apiUrl+ "/api/PowerUsage/power-usage/currentUsageUser/summary/"+userID);
  }
  getDeviceManifactureByGroup(groupID : string):Observable<any>{
    return this.http.get<any>(environment.apiUrl + "/api/Device/manufacturers/" + groupID);
  }

  getDeviceManifaturers():Observable<any>{
    return this.http.get<any>(environment.apiUrl + '/api/Device/manufacturers');
  }

  getDeviceGroupManufacturer(groupID :string, manufID: string):Observable<any>{
    return this.http.get<any>(environment.apiUrl+ "/api/Device/"+groupID+"/"+manufID);
  }

  getDeviceGroupID(groupID: string):Observable<any>{
    return this.http.get<any>(environment.apiUrl + "/api/Device/groups/"+groupID);
  }



// USERS
  getAllUserInfo(){
    return this.http.get(environment.apiUrl + '/api/User/allUserInfo')
  }

  getUserNumber(){
    return this.http.get(environment.apiUrl+'/api/User/userNumber');
  }

  getDeviceInfoUserByID(userID : any){
    return this.http.get(environment.apiUrl + '/api/Device/devices/info/user/'+userID);
  }

  currentPowerUsageDeviceID(deviceID: any) :Observable<any>{
    return this.http.get(environment.apiUrl + '/api/PowerUsage/power-usage/current/device/'+deviceID);
  }


  currentProcustionSystem() : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/current-production/system");
  }

  currentConsumptionSystem() : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/current-consumption/system");
  }

  prevMonthConsumptionSystem() : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousMonth/consumption/system");
  }

  nextMonthConsumtionSystem() : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextMonth/consumption/system");
  }

  eachDevicePrevMonthConsumption():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousMonth/consumption/each-device");
  }
  eachDeviceNextMonthConsumption():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextMonth/consumption/each-device");
  }

  prevMonthProductionSystem():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousMonth/production/system");
  }

  nextMonthProductionSystem():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextMonth/production/system");
  }

  AllDevices():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/Device/devices/info");
  }

  deviceInfoByID(deviceID : any) : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/Device/devices/info/"+ deviceID);
  }

  devicePrevious24h(deviceID : any) : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/Previous24h/device-usage_per_hour/"+deviceID);
  }

  groupDevice():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/Device/groups");
  }

  // table - USER ID pozivi
  UserConsumptionSummary(id : any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/currentUsageUser/consumption-summary/"+id);
  }
  UserProductionSummary(id : any) : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/currentUsageUser/production-summary/" + id);
  }
  // popup
  getUserInformation(id : string):Observable<any>{
    return this.http.get(environment.apiUrl + '/api/User/users/' + id);
  }
  getConsumptionPrevious24Hours(userID : any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previous24Hours/consumption/user-every-day-device-usage/"+userID);
  }

  getConsumptionNext24Hours(userID : any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/next24Hours/consumption/user-every-day-device-usage/"+userID);

  }

  getBatteryPre(deviceID : any):Observable<any>{
    return this.http.get<any[]>(environment.apiUrl+"/api/PowerUsage/power-usage/get-current-user-battery-percentage/"+deviceID);
  }
  consumptionPrevMonth(userID : string) : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousMonth/consumption/user-every-day-device-usage/"+userID);
  }
  consumptionNextMonth(userID: string):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextMonth/consumption/user-every-day-device-usage/" + userID);
  }
  productionPrevMonthUser(userID : string):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousMonth/production/user-every-day-device-usage/" + userID);
  }
  productionNextMonthUser(userID : string):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextMonth/production/user-every-day-device-usage/"+ userID);
  }
  consumptionPrev7days(userID : string):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previous7Days/consumption/user-every-day-device-usage/" + userID);
  }
  getConsumptionNext7days(userID : string):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/next7Days/consumption/user-every-day-device-usage/"+userID)
  }

  deviceTypeInfo():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/Device/devices/deviceType-info");
  }

  getProductionPrevious24Hours(userID : any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previous24Hours/production/user-every-day-device-usage/"+userID);
  }

  getProductionNext24Hours(userID:any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/next24Hours/production/user-every-day-device-usage/" +userID);
  }

  getProductionNext7days(userID:any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/next7Days/production/user-every-day-device-usage/" +userID);
  }
  getProductionPrev7days(userID:any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previous7Days/production/user-every-day-device-usage/" +userID);
  }
  getProductionNextMonth(userID:any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextMonth/production/user-every-day-device-usage/" +userID);
  }
  getProductionPrevMonth(userID:any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousMonth/production/user-every-day-device-usage/" +userID);
  }




// SAVED ENERGY
  savedEnergyConsumption():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/saved-energy/consumer/system");
  }
  savedEnergyProduction():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/saved-energy/producer/system");
  }
  savedEnergyConsumptionUser(userID : any) : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/user-usage-saved-energy-month/consumer/"+userID);
  }
  savedEnergyProductionUser(userID : any) : Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/user-usage-saved-energy-month/production/"+userID);
  }

  getDeviceConsumption(deviceID : any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/today/currentPowerUsage/" +deviceID);
  }


  getAllDispechers():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/Dispatcher/get-all-dispatchers");
  }


  getDispecher(id:any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/Dispatcher/get-single/"+id);
  }

// HOME
  currentConsumptionDay():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/currentDay/consumption/system");
  }
  currentProductionDay():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/currentDay/production/system");
  }

  consumptionPrev24h():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previous24h/consumption/every-hour-usage/system");
  }

  consumptionPrev7Days():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousWeek/consumption/every-day-usage/system");

  }
  consumptionPreviousMonth():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousMonth/consumption/every-day-usage/system");
  }

  productionPrev24h():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previous24h/production/every-hour-usage/system");
  }

  productionPrev7Days():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousWeek/production/every-day-usage/system");

  }
  productionPreviousMonth():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/previousMonth/production/every-day-usage/system");
  }

  consumptionNext24h():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/next24h/consumption/every-hour-usage/system");
  }

  consumptionNext7Days():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextWeek/consumption/every-day-usage/system");

  }
  consumptionNexxtMonth():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextMonth/consumption/every-day-usage/system");
  }

  productionNext24h():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/next24h/production/every-hour-usage/system");
  }

  productionNext7Days():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextWeek/production/every-day-usage/system");

  }
  productionNextMonth():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/nextMonth/production/every-day-usage/system");
  }

  getToken() {

    const jwtToken = this.cookie.get('jwtTokenDso');
     const decoded :any = jwt_decode(jwtToken);
     return decoded.unique_name;
  }

  getAllRequests():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/User/get-users-that-applied-to-dso");
  }

  acceptReq(reqID: any):Observable<any> {
    return this.http.post<string>(environment.apiUrl + "/api/User/approve-request-to-dso/"+reqID,{});
  }

  deleteDispathcer(dispatcherID : any):Observable<any>{
    return this.http.delete<any>(environment.apiUrl + "/api/Dispatcher/delete-dispathcer/"+dispatcherID);
  }

  getDispacher(id : any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/Dispatcher/get-single/" + id);
  }
  declineRequest(reqID:any):Observable<any> {
    return this.http.post<string>(environment.apiUrl + "/api/User/decline-request-to-dso/"+reqID,{});
  }

  userShareDataWithDSO(userID : any){
    return this.http.get(environment.apiUrl + "/api/User/user-shares-with-DSO/" + userID);
  }

  dsoHasControl(deviceID : any){
    return this.http.get(environment.apiUrl +"/api/Device/DSO-has-control/"+deviceID);
  }

  updateDispacher(dispID:string, firstName : string, lastName:string,  phoneNumber:string,email:string):Observable<any>{
    const data = {
      firstName:firstName,
      lastName:lastName,
      phoneNumber:phoneNumber,
      email:email,
    }
    return this.http.put(environment.apiUrl + "/api/Dispatcher/update-dispatcher/"+dispID,data);
  }

  changeStateOfDevice(deviceID : any, status: boolean):Observable<any>{
    const data = {
      id:deviceID,
      isOn:status
    }
    return this.http.post(environment.apiUrl+"/api/Device/update-device-state",data);
  }
  stateOfDevice(deviceID:any):Observable<any>{
    return this.http.get(environment.apiUrl + "/api/Device/is-turned-on/"+deviceID);
  }

  updatePasswordForDispacher(dispID:any, old:string, newpass:string):Observable<any>{
    const data = {
      oldPassword:old,
      newPassword:newpass,
    }
    return this.http.put(environment.apiUrl+'/api/Dispatcher/update-password-for-dispatcher/'+dispID, data)
  }

  differenceForPreviousHourConsumption():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/percentage-difference-for-previous-hour/consumption/system");
  }

  differenceForPreviousHourProduction():Observable<any>{
    return this.http.get(environment.apiUrl + "/api/PowerUsage/power-usage/percentage-difference-for-previous-hour/production/system");
  }
}
