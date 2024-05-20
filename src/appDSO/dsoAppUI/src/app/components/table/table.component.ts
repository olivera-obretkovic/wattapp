import { AfterViewInit, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { Device, ExportSelected, Info, Root, Root2, User } from 'models/User';
import { AuthService } from 'service/auth.service';
import { MatTableModule } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Chart, ChartOptions } from 'chart.js';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'app/environments/environment';
import { ConfirmEventType, ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],

})
export class TableComponent implements OnInit, AfterViewInit {

  @ViewChild('powerUsageGraph') powerUsageGraph!: ElementRef;
  @ViewChild('prev24DeviceID') prev24DeviceID!: ElementRef;
  @ViewChild('myTable') myTable!: ElementRef;
  @ViewChild('perHourDevice') perHourDevice!: ElementRef;
  @ViewChild('consumptionPrevMonthGraph') consumptionPrevMonthGraph!: ElementRef;
  @ViewChild('consumptionNextMonthGraph') consumptionNextMonthGraph!: ElementRef;
  @ViewChild('consumptionPrev7DAYS') consumptionPrev7DAYS!: ElementRef;
  @ViewChild('consumptionNext7daysGraph') consumptionNext7daysGraph!: ElementRef;
  @ViewChild('previous24ConsumptionGraph') previous24ConsumptionGraph!: ElementRef;
  @ViewChild('next24ConsumptionGraph') next24ConsumptionGraph!: ElementRef;
  @ViewChild('productionNextMonthUSER') productionNextMonthUSER!: ElementRef;
  @ViewChild('previous24ProductionGraph') previous24ProductionGraph!: ElementRef;
  @ViewChild('productionPrevMonthGraph') productionPrevMonthGraph!: ElementRef;
  @ViewChild('productionPrev7daysGraph') productionPrev7daysGraph!: ElementRef;
  @ViewChild('next24ProductionGraph') next24ProductionGraph!: ElementRef;
  @ViewChild('productionNext7daysGraph') productionNext7daysGraph!: ElementRef;
  @ViewChild('productionNextMonthGraph') productionNextMonthGraph!: ElementRef;
  @ViewChild('allDevicesUserGraph') allDevicesUserGraph!: ElementRef;

  // zelena, narandzasta, crvena, deep sky blue, zuta
  backgroundColorsGraphs = ['#62C370', '#EC7357', '#e3170a', '#30C5FF', '#ffc800'];
  backgroundColorsRGB = ['rgb(98, 195, 112)', 'rgb(236, 115, 87)', 'rgb(227, 23, 10)', 'rgb(48, 197, 255)', 'rgb(255, 200, 0)'];
  backgroundColorsRGBA4 = ['rgba(98, 195, 112,0.4)', 'rgba(236, 115, 87,0.4)', 'rgba(227, 23, 10,0.4)', 'rgba(48, 197, 255,0.4)', 'rgba(255, 200, 0,0.4)'];
  backgroundColorsRGBA7 = ['rgba(98, 195, 112,0.7)', 'rgba(236, 115, 87,0.7)', 'rgba(227, 23, 10,0.7)', 'rgba(48, 197, 255,0.7)', 'rgba(255, 200, 0,0.7)'];

  chartInstance!: Chart;
  subscription!: Subscription;

  public deviceStatus!: boolean;

  consumptionNext7days: any;

  timestampConsumptionPrevious24h!: any[];
  powerusageConsumptionPrevious24h!: any[];
  chartPrev24h: any;
  chartNext24h: any;
  graph24next: any;
  // filtriranje
  _searchByName: string = '';
  _searchByCity: string = '';
  _searchByAddress: string = '';
  exportData: any[] = [];

  allUserDevices!: Info[];
  userIDCoords!: any[];

  // export 
  filtered!: User[];
  activeItem: any;
  exportSelected: boolean = false;

  showAllUsersOnMap!: boolean;

  lengthOfUsers!: number;
  allUsers!: User[];

  private userCoords!: any[];

  public toggleTable: boolean = false;
  public showDevGraph: boolean = true;

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private latlng: L.LatLng[] = [];

  selected: string = "";
  pageSizeOptions = [5, 10, 25, 50];

  powerUsage!: string;
  deviceGroup!: any[];
  values!: any[];

  // device type
  producers!: any[];
  consumers!: any[];
  storage!: any[];

  todayPowerUsageDevice!: any;
  userPopUp!: any;

  // graph-sys
  consumptionPrevMonthUser!: [];
  consumptionNextMonthUser!: [];
  cPrevMonthUser!: string[];

  timeStampConsumption = [];
  powerUsageConsumption = [];

  timeStrampConsumptionNextMonth!: any;
  powerUsageConsumptionNextMonth!: any;

  timeStrampProductionPrev7days = [];
  powerUsageProductionPrev7days = [];

  timestampConsumptionNext24h!: any[];
  powerusageConsumptionNext24h!: any[];
  // graoh
  productionNextMonthUser = [];
  productionPrevMonthUser = [];




  timestampListProductionPrev24h!: any[];
  powerUsageListProductionPrev24h!: any[];

  graphProduction24prev!: any;
  chartProductionPrev24!: any;

  timestampListProductionNext24h!: any[];
  powerUsageListProductionNext24h!: any[];
  graphProduction24next!: any;

  id!: any;

  selectedDevice!: Device | any;
  device24h!: any[];
  valueDevice24h!: any[];
  percentage: any;
  http: any;




  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  constructor(
    private auth: AuthService,
    private table: MatTableModule,
    private spinner: NgxSpinnerService,
    private loader: NgxUiLoaderService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router : Router,
  ) { }
  selectedGraphHistoryConsumption = '24h';
  selectedGraphHistoryProduction = '24h';
  selectedGraphFutureProduction = '24h';
  selectedGraphFutureConsumption = '24h';
  ngAfterViewInit(): void {
    this.popUp(this.id);
    this.displayGraph(this.selectedDevice);
    this.HistoryConsumption(this.selectedGraphHistoryConsumption);
    this.HistoryProduction(this.selectedGraphHistoryProduction);
    this.FutureConsumption(this.selectedGraphFutureConsumption);
    this.FutureProduction(this.selectedGraphFutureProduction);

  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes) {
      const currentValue = changes.toString();
      this.HistoryConsumption(this.selectedGraphHistoryConsumption);
    }
  }


  ngOnInit(): void {

    this.spinner.show();
    setTimeout(() => {
      this.spinner.hide();
    }, 5000);
    this.getAllUsers();
    this.onInitMap();

    this.showCoordsForEveryUser();
    this.getDeviceGroup();
    // this.savedEnergy(this.id);
    


  }
  exportedUsers: ExportSelected[] = [];
  selectedUsers: User[] = [];
  toggleExportSelected(user: any): void {
    this.exportSelected = !this.exportSelected;
    user.selected = !user.selected;
    if (user.selected) {
      this.selectedUsers.push(user);
    } else {
      const index = this.selectedUsers.findIndex(u => u.id === user.id);
      if (index >= 0) {
        this.selectedUsers.splice(index, 1);
      }
    }
    this.makeDataForExportSelectedUsers(this.selectedUsers);
  }

  makeDataForExportSelectedUsers(users: User[]) {
    this.exportedUsers = users.map(user => {
      const exportUser: ExportSelected = {
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        consumption: user.consumption,
        production: user.production,
        city: user.city,
        country: user.country,
        email: user.email
      };
      return exportUser;
    });
  }
  SystemUsers!: User[];
  allUsersExport!: ExportSelected[];
  // consUser!:any;
  // proUser!:any;
  makeDataForExportAllUsers() {
    // this.auth.getAllUserInfo().subscribe({
    //   next: (response  : any)=>{
    //     this.SystemUsers = response;
    //   },
    //   error:(err : any)=>{
    //     console.log("Error get all users");
    //   }
    // });
    // if(this.SystemUsers.length != 0){
    // this.allUsersExport = this.SystemUsers.map(user => {
    //   let consumption = 0;
    //   this.auth.UserConsumptionSummary(user.id).subscribe(
    //     (response :any)=>{
    //       this.consUser =  response.toFixed(2);
    //     }
    //   )
    //   let production = 0;
    //   this.auth.UserProductionSummary(user.id).subscribe(
    //     (response:any)=>{
    //       this.proUser = response.toFixed(2);
    //     }
    //   )
    this.allUsersExport = this.allUsers.map(user => {
      const exportUser: ExportSelected = {
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        consumption: user.consumption,
        production: user.production,
        city: user.city,
        country: user.country,
        email: user.email
      };
      return exportUser;
    });

  }
  activeColIndex: number = -1;
  setActiveCol(index: number): void {
    this.activeColIndex = index;
  }
  export(): void {
    if (this.selectedUsers) {
      this.exportSelectedData();
    } else {
      this.exportToExcel();
    }
  }

  exportToExcel(): void {
    this.makeDataForExportAllUsers();
    if (this.allUsersExport && this.allUsersExport.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(this.allUsersExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Exported Data');

      const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'exported-data.xlsx');
    }
  }

  exportSelectedData(): void {
   
  if (this.selectedUsersTable && this.selectedUsersTable.length > 0) {
    const modifiedData = this.selectedUsersTable.map(user => {
      return {
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        city: user.city,
        country: user.country,
        consumption: user.consumption,
        production: user.production
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(modifiedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Data');

    const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'selected-data.xlsx');
  }
  }

  exportToExcelSelectedFutureConsumption(select: any): void {

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Sample Data']]);


    const worksheetName = 'Custom Worksheet Name';
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    let fileNameFuture = 'Custom_File_Name.xlsx';
    fileNameFuture = "Consumption  for the Next " + select;
    this.saveFile(data, fileNameFuture);
  }
  exportToExcelSelectedHistoryConsumption(select: any): void {

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Sample Data']]);
    const worksheetName = 'Custom Worksheet Name';
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);


    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    let fileNameHistory = 'Custom_File_Name.xlsx';
    fileNameHistory = "Consumption for the Previous " + select;
    this.saveFile(data, fileNameHistory);
  }

  exportToExcelSelectedFutureProduction(select: any): void {

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Sample Data']]);


    const worksheetName = 'Custom Worksheet Name';
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);




    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    let fileNameFuture = 'Custom_File_Name.xlsx';
    fileNameFuture = "Production  for the Next " + select;
    this.saveFile(data, fileNameFuture);
  }
  exportToExcelSelectedHistoryProduction(select: any): void {

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Sample Data']]);
    const worksheetName = 'Custom Worksheet Name';
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);


    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    let fileNameHistory = 'Custom_File_Name.xlsx';
    fileNameHistory = "Production for the Previous " + select;
    this.saveFile(data, fileNameHistory);
  }

  saveFile(data: Blob, filename: string): void {
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(data);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }


  showFilterOptions = false;
  selectedFilterOption: string = "All Devices";
  devicesConsumers: Info[] = [];
  devicesProducers: Info[]  = [];
  allUserDevicesPOM: Info[]  = [];
  devicesStorage:Info[] = [];
  toggleFilterOptions(): void {
    this.showFilterOptions = !this.showFilterOptions;
    
  }

  applyFilter(): void {
   
    if (this.selectedFilterOption === "Consumers") {
      this.allUserDevices = this.devicesConsumers;
    } else if (this.selectedFilterOption === "Prosumers") {
      this.allUserDevices = this.devicesProducers;
    } else if (this.selectedFilterOption === "All Devices") {
      this.allUserDevices = this.allUserDevicesPOM;
    } else if (this.selectedFilterOption === "Storages") {
      this.allUserDevices = this.devicesStorage;
    }else{
    this.allUserDevices = this.allUserDevicesPOM;
    this.selectedFilterOption = "All Devices";
  }
  
    this.showFilterOptions = false;
    if(this.showFilterOptions == false){
      this.selectedFilterOption = "All Devices";
    }
  }
  selectedColumn: any = null;
  selectedColumn1: any = null;
  selectedUsersTable: any[] = [];
  toggleSelection(user: User, index: number) {
    if (user.selected) {
      this.selectedUsersTable.push(user);
    } else {
      const selectedIndex = this.selectedUsersTable.findIndex((selectedUsersTable) => selectedUsersTable.id === user.id)
      if (selectedIndex !== -1) {
        this.selectedUsersTable.splice(selectedIndex, 1);
      }
    }
    this.selectedColumn = index;
  }
  deselectUsers() {
    this.selectedUsersTable = [];
    this.selectedColumn = -1;
  }

  getAllUsers() {
    this.auth.getAllUserInfo().subscribe(
      (response: any) => {
        this.allUsers = response;
        for (let user of this.allUsers) {
          user.selected = false;
          this.auth.UserConsumptionSummary(user.id).subscribe({
            next: (response: any) => {
              user.consumption = response.toFixed(2);
            },
            error: (err: any) => {
              user.consumption = 0;
            }
          });

          this.auth.UserProductionSummary(user.id).subscribe({
            next: (response: any) => {
              user.production = response.toFixed(2);
            },
            error: (err: any) => {
              user.production = 0;
            }
          });
        }
      }
    );
  }

  applyFilters(): void {
    this.filtered = this.allUsers.filter((user: User) => {
      const nameMatch = user.firstName.toLowerCase().includes(this._searchByName.toLowerCase());
      const addressMatch = user.address.toLowerCase().includes(this._searchByAddress.toLowerCase());
      return nameMatch && addressMatch;
    });
  }

  public onInitMap() {
    this.map = L.map('map').setView([44.0165, 21.0069], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);
  }
  marker!: any;
  public showCoordsForEveryUser() {
    var greenIcon = L.icon({
      iconUrl: this.urlGREEN
    });
    var orangeIcon = L.icon({
      iconUrl: this.urlORANGE
    });
    var redIcon = L.icon({
      iconUrl: this.urlRED
    });
    this.showAllUsersOnMap = true;
    this.auth.getCoords().subscribe(
      (response: any) => {
        this.lengthOfUsers = response.length;
        this.userCoords = response;
        this.userCoords.forEach((user) => {
          const matchingUser = this.allUsers.find((us) => us.address === user.address.address);
          if (matchingUser) {
            const firstName = matchingUser.firstName;
            const lastName = matchingUser.lastName;
            const address = matchingUser.address;
            const latlng = L.latLng(JSON.parse(user.coordinates));
            let power: number = matchingUser.consumption;

            if (power <= 300) {
              this.marker = L.marker(latlng, { icon: greenIcon }).addTo(this.map);
            } else if (power > 300 && power <= 750) {
              this.marker = L.marker(latlng, { icon: orangeIcon }).addTo(this.map);
            } else if (power > 750) {
              this.marker = L.marker(latlng, { icon: redIcon }).addTo(this.map);
            }
            this.marker.bindPopup(`<b>${firstName} ${lastName} <br>${address}`);
            this.markers.push(this.marker);

          }
        });
      });

  }

  urlRED = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAACCElEQVR4nO2Wy2pUQRCGK+k6Y7LxtjTGbAIyp+pkkGyylPgIStZe9sGlqHmcmE2IASEovoFBFEUICFHQjRh0PF0zySLS0nEmE8J0d82FceMPDWfR1V9XdfV/GuC/AqrncFE4u2sJN4XMjiUUP1rfT4WzO/UCLsCw5BZgUggfCeMvYXTRQVgXwoc+ZiBo4ypcsmxeJYGnhmXzppnDlf6gBVy2hF97hR7DCb80ajDVE9QtwKQl87pfaAdutt0MTKjBrTONlBL3LWdzyg08UEH/dm+ikQhXjzaoARPWVd0ulN1LljA3i2qwH0V2Owk+uqfxc9t1AOO9gC3hRjpjNh8TpXvcmavMmMyOAoxlZOeHTYLpbnElVaoReJkuNeNBBLwViitzcysS19SAP4cW8IsH4wi3In3xKQ0m3AiCqVLtFuPL748hUup1RcbjS9qmaccI40psXknmZhLsZuGMMH7Xgv3V8lcscgu+uRwqSbDWRNpgW5gbA5tHWw5gTAhfasDC+CTYVIzP/VrHC2vk/VXYfIiB7VzG/ocRMI33P2twHvpRowZTQuadttk6mZq3/hEBg+jHPJyzjM/UUMLNvVk4C8OQAxizhPeDZW25k2Vc7vlMNfIG4l2oizPthsxlaGoU2bxl/H0i00OpZtdgFBLGtdOvkZHI5mbxRJmvjwzsfLMxvujLIP61/gAUUjTlemPA2QAAAABJRU5ErkJggg==';
  urlGREEN = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAACDklEQVR4nO2Wz0tUURTHry1KN/1aarYPIoj+gbA/IceNoHPPiCAy75znptBi/hp1IyUIkrgY5x57RBFFFgiBCrqRNiZRLZSRM+Q46Lx7z/xg3PSFC2/xzvnce873nveM+a8U5ZL4NjACMC5aR5vA+EuWPFum19bFdoInbpl2KZPEPdbhDDj6CUxl37KMB+BoWmJagsL6ZC84eh8CXliOPo1zdLcp6Fgxfwcc7jUMrZ6edkeSuK8haCaJe4DxY7PQKtzhh9FioVsNrvTUmxT/5Fz0QHny5ypoxb0BI1mHs/KuDowHKrdbjnKhZNkSDWjBlVXCbBAs9zRQuq1CuXClIbDDV5r+fg/098XZJrUmo00N+NCT5ChbmuqvF5dbw3seTxyGwUx/00tGy+kbpkFPqX9rTrzjKdlgWpxsylOp7SBYjJCWQMpZL0bKL23wGHIhfGKmIa1pamJe+q9T9DQIzi/nr1nGH1qwXC25Yp7+7me+Fq4GwdohcgoGFz1peXhUVTZdwLiqAjPNed55I7nOEisk8xWYvnnhb6P78sFIuQEbo0W8aZrRSBL3AeMXrdlq+vpZfiJMKxpffXYDmJb0YFwcfpe/btqisumyjJRW1tPpZB1GDfdUo3/zeLvOgNhKGy5t0xhHj6zD4xrwEaxNPTSdkGWcP/830hFlSzRQnd+MjzsGNmI2hytNDYjL1gkX7ekz5cmu0gAAAABJRU5ErkJggg==';
  urlORANGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAACB0lEQVR4nO2Wz0tUURTHry20Nlku09oLIYT/QOimnYu85zxy0a+1ju9cS0lj/ppqEyoIYvQfFFEUwVCgom7qnhlHkWphPLna2FBz7z3zZpg2feHu3rmf+Z5z3neeUv/lUTXVfUz6HhMsM2GJCQ5ODpbY4BIbuFudu3VRtUtbqT7HhPPWwB4bzELHElaZ8JGraQlqHySXmPBVDPjXIXxbmdVXckH54cSANbjTNPTUPWxzqvvztPdNXujvA683irfPyt0SzodbCd8rM8mQzDnOiaBue6OLRPDk+AfKwFXRtrPB+9HLTDIiBf9atjuCNsNyxMF6ViyeaQZsCRYljj9HFmah7lmp45LAMe77W4yHZcLLDesKOBgA70sc/wi0bNVfl4wHXH+Lgi3Bpv+CZDxQt+rvFGxIwItecAEHG9W49rsxBEb0PAouGw3SpanVMOHj4LMp3IyCP03e6LEGrBTsXi33ivkXC75kRd0dBUtDpAa2hKMth0dNmVJdlvClBMwGnwZmu+buOr1YIpevlvBjCFw2cNX9YTR+9fDDbmHsgsojTnW/Nfheumx1Tt+5jwjViiqzupcNrIjBLusnJ86rdihTqotnYNrX1lo6sUmmmp6pRC5AXAo1mOe6L1zaJmv0sCX4WTfPw6+UXFOdEBM++/NrpCOyJhmpc3y9Y+DsOGDgRa6A+Nc6AulDHXQUoZSqAAAAAElFTkSuQmCC';
  marker1!: any;
  public showMeOnMap(id: string) {

    for (const mark of this.markers) {
      this.map.removeLayer(mark);
    }

    var greenIcon = L.icon({
      iconUrl: this.urlGREEN,
    });
    var orangeIcon = L.icon({
      iconUrl: this.urlORANGE
    });
    var redIcon = L.icon({
      iconUrl: this.urlRED
    });

    if (this.selectedUsersTable.length > 0) {
      // Select all users on the map
      for (const user of this.selectedUsersTable) {
        this.auth.getCoordsByUserID(user.id).subscribe((response: any) => {
          const latlng = L.latLng(JSON.parse(response['coordinates']));
          let power = user.consumption;
          let marker = L.marker(latlng, { icon: greenIcon }).addTo(this.map);

          if (power > 350 && power <= 750) {
            marker = L.marker(latlng, { icon: orangeIcon }).addTo(this.map);
          } else if (power > 750) {
            marker = L.marker(latlng, { icon: redIcon }).addTo(this.map);
          }

          marker.bindPopup(`<b>${user.firstName} ${user.lastName} <br>${user.address}`).openPopup();
          this.markers.push(marker);
          this.map.setView(latlng, 8);
        });
      }
    } else {

      this.auth.getCoordsByUserID(id).subscribe(
        (response: any) => {
          const latlng = L.latLng(JSON.parse(response['coordinates']));
          const user = this.allUsers.find(u => u.id === id);
          let power = 0;
          if (user)
            power = user.consumption;
          if (power <= 300) {
            this.marker1 = L.marker(latlng, { icon: greenIcon }).addTo(this.map);
          } else if (power > 300 && power <= 750) {
            this.marker1 = L.marker(latlng, { icon: orangeIcon }).addTo(this.map);
          } else if (power > 750) {
            this.marker1 = L.marker(latlng, { icon: redIcon }).addTo(this.map);

          }
          this.marker1.bindPopup(`<b>${user?.firstName} ${user?.lastName} <br>${user?.address}`).openPopup();
          this.markers.push(this.marker1);
          this.map.setView(latlng, 15);
        }
      );
    }

    this.showMeDevices(id);
    this.id = id;
    if(id)
      this.popUp(id);
  }


  numberOfProsumers: number = 0;
  numberOfConsumers: number = 0;
  numberOfStorage: number = 0;
  devices!: Info;
  public status!: any;
  showMeDevicesLoader = false;
  showMeDevices(id: string) {
    
    this.showDevGraph = !this.showDevGraph;
    this.getDeviceGroup();
    this.toggleTable = true;
    this.spinner.show();
    this.showMeDevicesLoader = true;
    this.auth.getDeviceInfoUserByID(id).subscribe(
      (response: any) => {
        console.log(this.allUserDevices);
        this.allUserDevices = response;
        this.allUserDevicesPOM = response;
        
        for (let us of this.allUserDevices) {
          this.auth.currentPowerUsageDeviceID(us.deviceId).subscribe(
            {
              next: (response: any) => {
                if (response != 0) {
                  this.todayPowerUsageDevice = (response);
                  us.powerusage = response.toFixed(2);
                  us.statusOfDevice = "ON";
                }
                else {
                  us.powerusage = 0;
                  us.statusOfDevice = "OFF"
                }
              },
              error: (error: any) => {
                us.powerusage = 0;
                console.log(error)
              }
            }
          )
          this.auth.getBatteryPre(us.deviceId).subscribe(
            (response :any)=>{
              this.percentage = response;
              us.powerusage = response;
              console.log(response);
            },
            (error:any)=>{
              this.percentage = 0;
            }
          );

          this.auth.dsoHasControl(us.deviceId).subscribe({
            next: (response: any) => {
              us.dsoHasControl = response;
              

              this.router.navigate(['/table'],{skipLocationChange:false}).then(()=>{

                this.router.navigate(['/table']);

              });



            },
            error: (error: any) => {
              this.deviceStatus = false;
              console.log(error);
            }
          })
          this.auth.stateOfDevice(us.deviceId).subscribe({
            next:(response:any)=>{
              if(response === true){
                us.statusOfDevice = "ON"
              }else{
                us.statusOfDevice = "OFF"
              }
            },
            error:(err:any)=>{
              console.log(err);
            }
          })
          this.numberOfConsumers = 0;
          this.numberOfProsumers = 0;
          this.numberOfStorage = 0;
          this.devicesConsumers = [];
          this.devicesProducers = [];
          this.devicesStorage = [];
          this.auth.getDevicesInfoByID(us.deviceId).subscribe({
            next: (response: any) => {
              us.typeOfDevice = response.groupName;
              if (response.groupName === "Consumer") {
                this.numberOfConsumers++;
                this.devicesConsumers.push(us);
              } else if (response.groupName === "Producer") {
                this.numberOfProsumers++;
                this.devicesProducers.push(us);
              } else if (response.groupName === "Storage") {
                this.numberOfStorage++;
                this.devicesStorage.push(us);
              }
              this.spinner.hide();
        this.showMeDevicesLoader = false;
            },
            error: (err: any) => {
              console.log("det device info by id" + err);
            }
          });
        }
        
      }
      
    )


  }
  getDeviceGroup() {
    this.auth.getDeviceGroup().subscribe(
      (response: any) => {
        this.deviceGroup = response;
        for (let group of this.deviceGroup) {
          this.auth.getDeviceGroupID(group.id).subscribe(
            (response: any) => {
              if (group.id === "77cbc929-1cf2-4750-900a-164de4abe28b") {
                this.producers = response;
              }
              else if (group.id === "18f30035-59de-474f-b9db-987476de551f") {
                this.consumers = response;
              }
              else if (group.id === "b17c9155-7e6f-4d37-8a86-ea1abb327bb2") {
                this.storage = response;
              }
            }
          )
        }
      }
    )
  }


  toggleColumn() {
    this.toggleTable = !this.toggleTable;
  }
  // pop-up
  openModel() {
    this.selectedUsersTable = [];
    this.selectedColumn = null;
    const modelDiv = document.getElementById('myModal');
    const background = document.getElementById('myBack');
    if (modelDiv != null) {
      modelDiv.style.display = 'block';
      background!.style.opacity = '40%';
    }
  }

  closeModel() {
    const modelDiv = document.getElementById('myModal');
    const background = document.getElementById('myBack');
    if (modelDiv != null) {
      modelDiv.style.display = 'none';
      background!.style.opacity = '100%';
    }
  }

  public userShareData: boolean = false;
  powerUsagePopUp!: number;
  productionNextMonthUserLoader = false;
  productionPrevMonthUserLoader = false;
  popUp(id: string) {

    this.auth.getUserInformation(id).subscribe(
      (response: any) => {
        this.userPopUp = response;
      
        if (this.userPopUp['sharesDataWithDso'] === true) {
          this.userPopUp.sharesDataWithDso = true;
        } else {
          this.userPopUp.sharesDataWithDso = false;
        }


        this.auth.UserConsumptionSummary(this.userPopUp.id).subscribe(
          (response: any) => {
            this.userPopUp.consumption = response.toFixed(2);
        });

        this.auth.UserProductionSummary(this.userPopUp.id).subscribe({
          next: (response: any) => {
            this.userPopUp.production = response.toFixed(2);
          },
          error: (err: any) => {
            this.userPopUp.production = 0;
          }


        });

        this.savedEnergy(id);
        this.HistoryConsumption(this.selectedGraphHistoryConsumption);
        this.HistoryProduction(this.selectedGraphHistoryProduction);
        this.FutureConsumption(this.selectedGraphFutureConsumption);
        this.FutureProduction(this.selectedGraphFutureProduction);
        this.productionNextMonth(this.userPopUp.id);
        this.productionPrevMonth(this.userPopUp.id);
        
        this.dsoShareData(this.userPopUp.id);
      },
      (error : any)=>{
        console.log(error);
      }
    );
  }









  isActiveUser = false;
  isActiveDevice = true;
  isActiveSystem = false;


  isActiveProsumer = false;
  isActioveConsumer = true;
  // buttons - popUP
  showDevicePage = true;
  showSystemPage = false;
  showMeGeneral = false;

  showMeConsumptionProduction = false;

  public showMeConsumption = true;
  public showMeProduction = false;


  toggleActiveCP(button: string) {
    this.isActiveProsumer = button === 'prosumer';
    this.isActioveConsumer = button === 'consumer';
    if (this.showSystemPage) {
      if (this.isActioveConsumer) {
        this.isActioveConsumer = true;
        this.isActiveProsumer = false;
        this.showMeProduction = false;
        this.showMeConsumption = true;
        this.HistoryConsumption(this.selectedGraphHistoryConsumption);
        this.FutureConsumption(this.selectedGraphFutureConsumption);
      }
      else {
        this.isActioveConsumer = false;
        this.isActiveProsumer = true;
        this.showMeProduction = true;
        this.showMeConsumption = false;
        this.HistoryProduction(this.selectedGraphHistoryProduction);
        this.FutureProduction(this.selectedGraphFutureProduction);


      }
    }
  }

  toggleActive(button: string) {
    if (button === 'user') {
      this.isActiveUser = true;
      this.isActiveDevice = false;
      this.isActiveSystem = false;
      this.showDevicePage = false;
      this.showSystemPage = false;
      this.showMeGeneral = true;


    } else if (button === 'device') {
      this.isActiveUser = false;
      this.isActiveDevice = true;
      this.isActiveSystem = false;
      this.showDevicePage = true;
      this.showSystemPage = false;
      this.showMeGeneral = false;


    } else if (button === 'system') {
      this.isActiveUser = false;
      this.isActiveDevice = false;
      this.isActiveSystem = true;
      this.showDevicePage = false;
      this.showSystemPage = true;
      this.showMeGeneral = false;
      this.toggleActiveCP('consumption')


    }
  }





  graph24prev!: any[];
  selectDevice = false;
  graphDeviceLoader = false;
  public deviceDETAILID!:any;
  displayGraph(device: Device) {
    this.selectDevice = true;
    this.selectedDevice = device;
    
      if(device.typeOfDevice === "Storage"){
      this.auth.getBatteryPre(device.deviceId).subscribe(
        (response :any)=>{
          this.percentage = response;
          console.log(response);
        },
        (error:any)=>{
          this.percentage = 0;
        }
      );
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    this.spinner.show();
    this.graphDeviceLoader = true;
    if(this.selectedDevice){
      this.auth.devicePrevious24h(this.selectedDevice.deviceId).subscribe(
        {
          next:(reposnse:any)=>{
            
              this.graph24prev = reposnse['timestampPowerPairs'];
              this.makeDataGraph12(this.graph24prev);
              this.deviceGraphPrev12();
              this.spinner.hide();
              this.graphDeviceLoader = false;
            
          },
          error:(error:any)=>{
            console.log(error);
          }
        }
      )
    }
  }
  deselectDevice() {
    this.selectedDevice = null;
  }
  timeStampDevice24h!: any[];
  powerUsageDevice24h!: any[];
  makeDataGraph12(dataGraph: any) {
    this.timeStampDevice24h = [];
    this.powerUsageDevice24h = [];
    for (let i = 0; i < dataGraph.length; i++) {
      this.timeStampDevice24h.push(this.graph24prev[i]['timestamp']);
      this.powerUsageDevice24h.push(this.graph24prev[i]['powerUsage']);
    }
  }
  extractedDatesDevice24h!: string[];

  deviceGraphPrev12() {
    this.extractedDatesDevice24h = [];
    for (let i = 0; i < this.timeStampDevice24h.length; i++) {
      this.extractedDatesDevice24h.push(this.timeStampDevice24h[i].split("T")[1].split(":00Z")[0]);

    }
    if (this.prev24DeviceID) {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      const data = {
        labels: this.extractedDatesDevice24h,
        datasets: [{
          label: 'Previous 12h',
          data: this.powerUsageDevice24h,
          fill: true,
          borderColor: 'rgb(73, 190, 170)',
          backgroundColor: 'rgba(73, 190, 170,0.4)',
          pointBackgroundColor: 'rgba(73, 190, 170,0.7)',
          borderWidth: 1,
          pointBorderColor: 'rgba(73, 190, 170,0.4)',
          pointBorderWidth: 5,
          pointRadius: 5,
        }]
      }
      const options: ChartOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date and Time',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Power Consuming in (kw/day)',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
        },
      };
      this.chartInstance = new Chart(this.prev24DeviceID.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }
  consumptionNextMonthLoader = false;
  consumptionNextMonth(id: any) {
    this.spinner.show();
    this.consumptionNextMonthLoader = true;
    this.auth.consumptionNextMonth(id).subscribe(
      {
        next: (response: any) => {
          this.consumptionNextMonthUser = response[0]['timestampPowerPairs'];
          this.makeDataGraphMonthConsumptionNextMonth(this.consumptionNextMonthUser);
          this.chartConsumptionNextMonthChart();
          this.spinner.hide();
          this.consumptionNextMonthLoader = false;


        },
        error: (err: any) => {
          console.log("error consumption next month" + err);
          this.spinner.hide();
          this.consumptionNextMonthLoader = false;
        }
      })
  }
  dataconsumptionNextMonth!: any[];
  makeDataGraphMonthConsumptionNextMonth(dataGraph: any) {
    this.timeStrampConsumptionNextMonth = [];
    this.powerUsageConsumptionNextMonth = [];
    this.dataconsumptionNextMonth = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.consumptionNextMonthUser[i]['timestamp']);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();
      const dateString = '' + month + ' ' + day;
      this.timeStrampConsumptionNextMonth.push(dateString);
      this.powerUsageConsumptionNextMonth.push(this.consumptionNextMonthUser[i]['powerUsage']);
    }
    for (let i = 0; i < this.timeStrampConsumptionNextMonth.length; i++) {
      const pair = {
        timestamp: this.timeStrampConsumptionNextMonth[i],
        powerUsage: this.powerUsageConsumptionNextMonth[i].toFixed(2),
      };
      this.dataconsumptionNextMonth.push(pair);
    }


  }


  consumptionPrevMonthLoader = false;
  consumptionPrevMonth(id: any) {
    this.spinner.show();
    this.consumptionPrevMonthLoader = true
    this.auth.consumptionPrevMonth(id).subscribe(
      {
        next: (response: any) => {
          this.consumptionPrevMonthUser = response[0]['timestampPowerPairs'];
          this.makeDataForConsumptionPrevMonth(this.consumptionPrevMonthUser);
          this.chartConsumptionPrevMonth();
          this.spinner.hide();
          this.consumptionPrevMonthLoader = false;

        },
        error: (err: any) => {
          console.log("error consumption prev month" + err);
          this.spinner.hide();
          this.consumptionPrevMonthLoader = false;
        }
      }
    );
  }

  timeStampConsumptionPrevMonth!: any[];
  powerUsageConsumptionPrevMonth!: any[];
  dataConsumptionPrevMonth: any[] = [];
  makeDataForConsumptionPrevMonth(dataGraph: any) {
    this.timeStampConsumptionPrevMonth = [];
    this.powerUsageConsumptionPrevMonth = [];
    this.dataconsumptionNextMonth = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.consumptionPrevMonthUser[i]['timestamp']);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();
      const dateString = '' + month + ' ' + day;
      this.timeStampConsumptionPrevMonth.push(dateString);
      this.powerUsageConsumptionPrevMonth.push(this.consumptionPrevMonthUser[i]['powerUsage']);
    }
    for (let i = 0; i < this.timeStampConsumptionPrevMonth.length; i++) {
      const pair = {
        timestamp: this.timeStampConsumptionPrevMonth[i],
        powerUsage: this.powerUsageConsumptionPrevMonth[i].toFixed(2),
      };
      this.dataConsumptionPrevMonth.push(pair);
    }


  }


  graphConsumptionPrevMonth!: any;
  chartConsumptionPrevMonth() {
    if (this.consumptionPrevMonthGraph) {
      if (this.graphConsumptionPrevMonth) {
        this.graphConsumptionPrevMonth.destroy();
      }
      const data = {
        labels: this.timeStampConsumptionPrevMonth,
        datasets: [{
          label: 'Previous Month',
          data: this.powerUsageConsumptionPrevMonth,
          fill: true,
          borderColor: this.backgroundColorsGraphs[1],
          backgroundColor: this.backgroundColorsRGBA4[1],
          pointBackgroundColor: this.backgroundColorsRGBA7[1],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsRGB[1],
          pointStyle: 'circle',
          pointRadius: 3,
          pointHoverRadius: 5,
        }]
      }
      const options: ChartOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date ',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Power Consuming in (kw/day)',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
        },
      };
      this.graphConsumptionPrevMonth = new Chart(this.consumptionPrevMonthGraph.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }


  chartConsumptionNextMonth!: any;
  chartConsumptionNextMonthChart() {
    if (this.consumptionNextMonthGraph) {
      if (this.chartConsumptionNextMonth) {
        this.chartConsumptionNextMonth.destroy();
      }
      const data = {
        labels: this.timeStrampConsumptionNextMonth,
        datasets: [{
          label: 'Power Consumption for the Next Month',
          data: this.powerUsageConsumptionNextMonth,
          fill: true,
          borderColor: this.backgroundColorsGraphs[0],
          backgroundColor: this.backgroundColorsRGBA4[0],
          pointBackgroundColor: this.backgroundColorsRGBA7[0],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsGraphs[0],
          pointStyle: 'circle',
          pointRadius: 3,
          pointHoverRadius: 5,
        }]
      }
      const options: ChartOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date ',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Power Consuming (kw)',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
        },
      };
      this.chartConsumptionNextMonth = new Chart(this.consumptionNextMonthGraph.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }

  productionPreviousMonthUser(id: any) {
    this.spinner.show();
    this.productionPrevMonthUserLoader = false;
    this.auth.productionPrevMonthUser(this.userPopUp.id).subscribe({
      next: (response: any) => {
        this.productionPrevMonthUser = response[0]['timestampPowerPairs'];
        this.spinner.hide();
        this.productionPrevMonthUserLoader = false;
      },
      error: (err: any) => {
        console.log("error production prev month" + err);
        this.spinner.hide();
        this.productionPrevMonthUserLoader = false;
      }
    })
  }

  productionNextMonth(id: any) {
    this.spinner.show();
    this.productionNextMonthUserLoader = true;
    this.auth.productionNextMonthUser(this.userPopUp.id).subscribe({
      next: (response: any) => {
        this.productionNextMonthUser = response[0]['timestampPowerPairs'];
        this.makeDataProductionNextMonth(this.productionNextMonthUser);
        this.chartProductionNextMonthChart();
        this.spinner.hide();
        this.productionNextMonthUserLoader = false;
      },
      error: (err: any) => {
        console.log("error procustion next month user" + err);
        this.spinner.hide();
        this.productionNextMonthUserLoader = false;
      }
    })
  }
  timestampListNextMonthProduction!: any;
  powerUsageListNextMonthProduction!: any;
  dataProductionNextMonth: any[] = [];
  makeDataProductionNextMonth(dataGraph: any) {
    this.timestampListNextMonthProduction = [];
    this.powerUsageListNextMonthProduction = [];
    this.dataProductionNextMonth = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.productionNextMonthUser[i]['timestamp']);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();
      const dateString = '' + month + ' ' + day;
      this.timestampListNextMonthProduction.push(dateString);
      this.powerUsageListNextMonthProduction.push(this.productionNextMonthUser[i]['powerUsage']);
    }
    for (let i = 0; i < this.timestampListNextMonthProduction.length; i++) {
      const pair = {
        timestamp: this.timestampListNextMonthProduction[i],
        powerUsage: this.powerUsageListNextMonthProduction[i].toFixed(2),
      };
      this.dataProductionNextMonth.push(pair);
    }

  }
  chartNextMonthProduction!: any;
  chartProductionNextMonthChart() {
    if (this.productionNextMonthUSER) {
      if (this.chartNextMonthProduction) {
        this.chartNextMonthProduction.distroy();
      }
      const data = {
        labels: this.timestampListNextMonthProduction,
        datasets: [{
          label: 'Power Production for the Next Month',
          data: this.powerUsageListNextMonthProduction,
          fill: true,
          borderColor: this.backgroundColorsGraphs[4],
          backgroundColor: this.backgroundColorsRGBA4[4],
          pointBackgroundColor: this.backgroundColorsRGBA7[4],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsGraphs[4],
          pointStyle: 'circle',
          pointRadius: 3,
          pointHoverRadius: 5,
        }]
      }
      const options: ChartOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date (month & day)',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Power Production (kw)',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
        },
      };
      this.chartNextMonthProduction = new Chart(this.productionNextMonthUSER.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }

  timeStrampConsumptionPrev7days!: any;
  powerUsageConsumptionPrev7days!: any;
  data7daysHistoryConsumption: any[] = [];
  makeDataGraphPrev7DaysConsumption(dataGraph: any) {
    this.timeStrampConsumptionPrev7days = [];
    this.powerUsageConsumptionPrev7days = [];
    this.data7daysHistoryConsumption = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.consPrev7Days[i]['timestamp']);
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeek = daysOfWeek[date.getUTCDay()];
      this.timeStrampConsumptionPrev7days.push(dayOfWeek);
      this.powerUsageConsumptionPrev7days.push(this.consPrev7Days[i]['powerUsage']);
    }
    for (let i = 0; i < this.timeStrampConsumptionPrev7days.length; i++) {
      const pair = {
        timestamp: this.timeStrampConsumptionPrev7days[i],
        powerUsage: this.powerUsageConsumptionPrev7days[i].toFixed(2),

      };
      this.data7daysHistoryConsumption.push(pair);
    }
  }
  consPrev7Days = [];
  consumptionPrev7DaysLoader = false;
  consumptionPrev7Days(id: any) {
    this.spinner.show();
    this.consumptionPrev7DaysLoader = true;
    this.auth.consumptionPrev7days(id).subscribe({
      next: (response: any) => {
        this.consPrev7Days = response[0]['timestampPowerPairs'];
        this.makeDataGraphPrev7DaysConsumption(this.consPrev7Days);
        this.chartConsumptionPrev7Days();
        this.spinner.hide();
        this.consumptionPrev7DaysLoader = false;

      },
      error: (err: any) => {
        console.log("error consumptio previous 7 days" + err);
        this.spinner.hide();
        this.consumptionPrev7DaysLoader = false;
      }
    })
  }

  chartPrev7days: any;
  extractedDatesPrev7Days!: string[]
  chartConsumptionPrev7Days() {

    if (this.consumptionPrev7DAYS) {

      if (this.chartPrev7days) {
        this.chartPrev7days.destroy();
      }

      const data = {
        labels: this.timeStrampConsumptionPrev7days,
        datasets: [{
          label: 'Consumption For The Previous 7 days',
          data: this.powerUsageConsumptionPrev7days,
          fill: true,
          borderColor: this.backgroundColorsGraphs[1],
          backgroundColor: this.backgroundColorsRGBA4[1],
          pointBackgroundColor: this.backgroundColorsRGBA7[1],
          borderWidth: 2,
          pointBorderColor: this.backgroundColorsGraphs[1],
          borderRadius: 5,
          borderSkipped: false,
        }]
      }

      this.chartPrev7days = new Chart(this.consumptionPrev7DAYS.nativeElement, {
        type: 'bar',
        data: data,
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Energy Consumption [kWh]',
                font: {
                  size: 9,
                },
              }
            }
          }
        }
      });
    }
  }
  consNext7Days = [];
  chartNext7days!: any;
  consumptionNext7DaysLoader = false;
  consumptionNext7Days(id: any) {
    this.spinner.show();
    this.consumptionNext7DaysLoader = true;
    this.consumptionNext7DaysLoader = true;
    this.auth.getConsumptionNext7days(id).subscribe({
      next: (response: any) => {
        this.consNext7Days = response[0]['timestampPowerPairs'];
        this.makeDataGraphNext7DaysConsumption(this.consNext7Days);
        this.chartConsumptionNext7Days();
        this.spinner.hide();
        this.consumptionNext7DaysLoader = false;
      },
      error: (err: any) => {
        this.spinner.hide();
        this.consumptionNext7DaysLoader = false;
      }
    })
  }
  timeStrampConsumptionNext7days!: any[];
  powerUsageConsumptionNext7days!: any[];
  dataConsumption7daysFuture: any[] = [];
  makeDataGraphNext7DaysConsumption(dataGraph: any) {
    this.timeStrampConsumptionNext7days = [];
    this.powerUsageConsumptionNext7days = [];
    this.dataConsumption7daysFuture = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.consNext7Days[i]['timestamp']);
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeek = daysOfWeek[date.getUTCDay()];
      this.timeStrampConsumptionNext7days.push(dayOfWeek);
      this.powerUsageConsumptionNext7days.push(this.consNext7Days[i]['powerUsage']);
    }

    for (let i = 0; i < this.timeStrampConsumptionNext7days.length; i++) {
      const pair = {
        timestamp: this.timeStrampConsumptionNext7days[i],
        powerUsage: this.powerUsageConsumptionNext7days[i].toFixed(2),
      };
      this.dataConsumption7daysFuture.push(pair);
    }
  }
  extractedDatesNext7Days!: string[];
  chartConsumptionNext7Days() {
    if (this.consumptionNext7daysGraph) {
      if (this.chartNext7days) {
        this.chartNext7days.destroy();
      }
      const data = {
        labels: this.timeStrampConsumptionNext7days,
        datasets: [{
          label: 'Consumption For The Next 7 days',
          data: this.powerUsageConsumptionNext7days,
          fill: true,
          borderColor: this.backgroundColorsGraphs[0],
          backgroundColor: this.backgroundColorsRGBA4[0],
          pointBackgroundColor: this.backgroundColorsRGBA7[0],
          borderWidth: 2,
          pointBorderColor: this.backgroundColorsGraphs[0],
          borderRadius: 5,
          borderSkipped: false,

        }]
      }
      this.chartNext7days = new Chart(this.consumptionNext7daysGraph.nativeElement, {
        type: 'bar',
        data: data,
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: ''
              }
            },
            y: {
              title: {
                display: true,
                text: 'Energy Consumption [kWh]',
                font: {
                  size: 9,
                },
              }
            }
          }
        }
      });
    }
  }



  HistoryConsumption(graph: any) {
    switch (graph) {
      case '24h':
        this.consumptionPrevious24h(this.id);
        break;
      case 'month':
        this.consumptionPrevMonth(this.id);
        break;
      case '7days':
        this.consumptionPrev7Days(this.id);
        break;

    }
  }



  FutureConsumption(graph: any) {
    switch (graph) {
      case 'month':
        this.consumptionNextMonth(this.id);
        break;
      case '7days':
        this.consumptionNext7Days(this.id);
        break;
      case '24h':
        this.consumptionNext24h(this.id);
        break;
    }
  }

  consumptionPrevious24hLoader = false;
  consumptionPrevious24hData!: any;
  consumptionPrevious24h(id: any) {
    this.spinner.show();
    this.consumptionPrevious24hLoader = true;
    this.auth.getConsumptionPrevious24Hours(id).subscribe(
      (response: any) => {
        this.consumptionPrevious24hData = response[0]['timestampPowerPairs'];
        this.makeDataconsumptionPrevious24h(this.consumptionPrevious24hData);
        this.previous24Graph();
        this.spinner.hide();
        this.consumptionPrevious24hLoader = false;
      },
      (error : any)=>{
        console.log(error);
      }
    );
  }
  dataConsumptionPrevious24h: any[] = [];
  makeDataconsumptionPrevious24h(dataGraph: any) {
    this.timestampConsumptionPrevious24h = [];
    this.powerusageConsumptionPrevious24h = [];
    this.dataConsumptionPrevious24h = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.consumptionPrevious24hData[i]['timestamp']);
      const hour = date.getUTCHours().toString().padStart(2, "0");
      const minute = date.getUTCMinutes().toString().padStart(2, "0");
      const stringHourMinute = hour + ":" + minute;
      this.timestampConsumptionPrevious24h.push(stringHourMinute);
      this.powerusageConsumptionPrevious24h.push(this.consumptionPrevious24hData[i]['powerUsage']);
    }
    for (let i = 0; i < this.timestampConsumptionPrevious24h.length; i++) {
      const pair = {
        timestamp: this.timestampConsumptionPrevious24h[i],
        powerUsage: this.powerusageConsumptionPrevious24h[i].toFixed(2),
      };
      this.dataConsumptionPrevious24h.push(pair);

    }
  }

  previous24Graph() {
    if (this.previous24ConsumptionGraph) {
      if (this.chartPrev24h) {
        this.chartPrev24h.destroy();
      }
      const data = {
        markerType: "square",
        type: "line",
        lineDashType: 'dot',
        labels: this.timestampConsumptionPrevious24h,
        datasets: [{
          label: 'Consumption For The Previous 24h',
          data: this.powerusageConsumptionPrevious24h,
          fill: true,
          borderColor: this.backgroundColorsGraphs[1],
          backgroundColor: this.backgroundColorsRGBA4[1],
          pointBackgroundColor: this.backgroundColorsRGBA7[1],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsRGB[1],
          pointStyle: 'circle',
          pointRadius: 3,
          pointHoverRadius: 5,
        }]
      }
      const options: ChartOptions = {

        scales: {
          x: {
            title: {
              display: true,
              text: 'Time (hour)',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Power consumption (kW)',
              font: {
                size: 10,
              }
            },
            ticks: {
              font: {
                size: 9,
              },
            },
          },
        },
      };
      this.chartPrev24h = new Chart(this.previous24ConsumptionGraph.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }
  consumptionNext24hLoader = false;
  consumptionNext24hData!: any;
  consumptionNext24h(id: any) {
    this.spinner.show();
    this.consumptionNext24hLoader = true;
    this.auth.getConsumptionNext24Hours(id).subscribe(
      (response: any) => {
        this.consumptionNext24hData = response[0]['timestampPowerPairs'];
        this.makeDataConsumptionNext24h(this.consumptionNext24hData);
        this.consumptionNext24hGraph();
        this.spinner.hide();
        this.consumptionNext24hLoader = false;
      },
      (error:any)=>{
        console.log(error);
      }
    );
  }
  dataConsumptionNext24h: any[] = [];
  makeDataConsumptionNext24h(dataGraph: any) {
    this.timestampConsumptionNext24h = [];
    this.powerusageConsumptionNext24h = [];
    this.dataConsumptionPrevious24h = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.consumptionNext24hData[i]['timestamp']);
      const hour = date.getUTCHours().toString().padStart(2, "0");
      const minute = date.getUTCMinutes().toString().padStart(2, "0");
      const stringHourMinute = hour + ":" + minute;
      this.timestampConsumptionNext24h.push(stringHourMinute);
      this.powerusageConsumptionNext24h.push(this.consumptionNext24hData[i]['powerUsage']);
    }
    for (let i = 0; i < this.timestampConsumptionNext24h.length; i++) {
      const pair = {
        timestamp: this.timestampConsumptionNext24h[i],
        powerUsage: this.powerusageConsumptionNext24h[i].toFixed(2),
      };
      this.dataConsumptionNext24h.push(pair);
    }
  }

  consumptionNext24hGraph() {
    if (this.next24ConsumptionGraph) {

      if (this.chartNext24h) {
        this.chartNext24h.destroy();
      }
      const data = {
        labels: this.timestampConsumptionNext24h,
        datasets: [{
          label: 'Consumption For The Next 24h',
          data: this.powerusageConsumptionNext24h,
          fill: true,
          borderColor: this.backgroundColorsGraphs[0],
          backgroundColor: this.backgroundColorsRGBA4[0],
          pointBackgroundColor: this.backgroundColorsRGBA7[0],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsRGB[0],
          pointStyle: 'circle',
          pointRadius: 3,
          pointHoverRadius: 5,
        }]
      }
      const options: ChartOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time [h]',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Energy Consumption [kWh]',
              font: {
                size: 10
              }
            },
            ticks: {
              font: {
                size: 9,
              },
            },
          },
        },
      };
      this.chartNext24h = new Chart(this.next24ConsumptionGraph.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }


  HistoryProduction(graph: any) {
    switch (graph) {
      case 'month':
        this.productionPrevMonth(this.id);
        break;
      case '7days':
        this.productionPrev7Days(this.id);
        break;
      case '24h':
        this.productionPrevious24h(this.id);
        break;
    }
  }


  FutureProduction(graph: any) {

    switch (graph) {
      case 'month':
        this.productionNextMonth(this.id);
        break;
      case '7days':
        this.productionNext7Days(this.id);
        break;
      case '24h':
        this.productionNext24h(this.id);
        break;
    }
  }
  productionPrevious24hLoader = false;
  productionPrevious24h(id: any) {
    this.spinner.show();
    this.productionPrevious24hLoader = true;
    this.auth.getProductionPrevious24Hours(id).subscribe(
      (response: any) => {
        this.graphProduction24prev = response[0]['timestampPowerPairs'];
        this.makeDataProductionPrevious24h(this.graphProduction24prev);
        this.previousProduction24Graph();
        this.spinner.hide();
        this.productionPrevious24hLoader = false;
      }
    );
  }
  dataProduction24hPrevious: any[] = [];
  makeDataProductionPrevious24h(dataGraph: any) {
    this.timestampListProductionPrev24h = [];
    this.powerUsageListProductionPrev24h = [];

    this.dataProduction24hPrevious = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.graphProduction24prev[i]['timestamp']);
      const hour = date.getUTCHours().toString().padStart(2, "0");
      const minute = date.getUTCMinutes().toString().padStart(2, "0");
      const stringHourMinute = '' + hour + ":" + minute;
      this.timestampListProductionPrev24h.push(stringHourMinute);
      this.powerUsageListProductionPrev24h.push(this.graphProduction24prev[i]['powerUsage']);
    }
    for (let i = 0; i < this.timestampListProductionPrev24h.length; i++) {
      const pair = {
        timestamp: this.timestampListProductionPrev24h[i],
        powerUsage: this.powerUsageListProductionPrev24h[i].toFixed(2),
      };
      this.dataProduction24hPrevious.push(pair);
    }
  }

  previousProduction24Graph() {
    if (this.previous24ProductionGraph) {
      if (this.chartProductionPrev24) {
        this.chartProductionPrev24.destroy();
      }

      const data = {
        labels: this.timestampListProductionPrev24h,
        datasets: [{
          label: 'Production For The Previous 24h',
          data: this.powerUsageListProductionPrev24h,
          fill: true,
          borderColor: this.backgroundColorsGraphs[3],
          backgroundColor: this.backgroundColorsRGBA4[3],
          pointBackgroundColor: this.backgroundColorsRGBA7[3],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsGraphs[3],
          pointStyle: 'circle',
          pointRadius: 3,
          pointHoverRadius: 5,
        }]
      }
      const options: ChartOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time [h]',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Energy Production [kWh]',
              font: {
                size: 10,
              }
            },
            ticks: {
              font: {
                size: 9,
              },
            },
          },
        },
      };
      this.chartProductionPrev24 = new Chart(this.previous24ProductionGraph.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }


  productionPrevMonthLoader = false;
  productionPrevMonth(id: any) {
    this.spinner.show();
    this.productionPrevMonthLoader = true;
    this.auth.getProductionPrevMonth(id).subscribe(
      {
        next: (response: any) => {
          this.productionPrevMonthUser = response[0]['timestampPowerPairs'];
          this.makeDataForPreviousMonthProduction(this.productionPrevMonthUser)
          this.chartProductionPreviousMonth();
          this.spinner.hide();
          this.productionPrevMonthLoader = false;
        },
        error: () => {
          this.spinner.hide();
          this.productionPrevMonthLoader = false;
        }
      }
    );
  }
  timeStampProductionPrevMonth!: any[];
  powerUsageProductionPrevMonth!: any[];
  dataproductionPreviousMonth: any[] = [];
  makeDataForPreviousMonthProduction(dataGraph: any) {
    this.timeStampProductionPrevMonth = [];
    this.powerUsageProductionPrevMonth = [];
    this.dataproductionPreviousMonth = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.productionPrevMonthUser[i]['timestamp']);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();
      const dateString = '' + month + ' ' + day;
      this.timeStampProductionPrevMonth.push(dateString);
      this.powerUsageProductionPrevMonth.push(this.productionPrevMonthUser[i]['powerUsage']);
    }

    for (let i = 0; i < this.timeStampProductionPrevMonth.length; i++) {
      const pair = {
        timestamp: this.timeStampProductionPrevMonth[i],
        powerUsage: this.powerUsageProductionPrevMonth[i].toFixed(2),
      };
      this.dataproductionPreviousMonth.push(pair);
    }
  }

  chartProductionPrevMonth!: any;
  chartProductionPreviousMonth() {
    if (this.productionPrevMonthGraph) {
      if (this.chartProductionPrevMonth) {
        this.chartProductionPrevMonth.destroy();
      }
      const data = {
        labels: this.timeStampProductionPrevMonth,
        datasets: [{
          label: 'Production For The Previous Month',
          data: this.powerUsageProductionPrevMonth,
          fill: true,
          borderColor: this.backgroundColorsGraphs[3],
          backgroundColor: this.backgroundColorsRGBA4[3],
          pointBackgroundColor: this.backgroundColorsRGBA7[3],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsGraphs[3],
          pointStyle: 'circle',
          pointRadius: 3,
          pointHoverRadius: 5,
        }]
      }
      const options: ChartOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
            },
            ticks: {
              font: {
                size: 10,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Energy Production [kWh]'
            },
            ticks: {
              font: {
                size: 9,
              },
            },
          },
        },
      };
      this.chartProductionPrevMonth = new Chart(this.productionPrevMonthGraph.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }

  prodPrev7Days = [];
  productionPrev7DaysLoader = false;

  productionPrev7Days(id: any) {
    this.spinner.show();
    this.productionPrev7DaysLoader = true;
    this.auth.getProductionPrev7days(id).subscribe({
      next: (response: any) => {
        this.prodPrev7Days = response[0]['timestampPowerPairs'];
        this.makeDataGraphPrev7DaysProduction(this.prodPrev7Days);
        this.chartProductionPrev7Days();
        this.spinner.hide();
        this.productionPrev7DaysLoader = false;

      },
      error: (err: any) => {
        this.spinner.hide();
        this.productionPrev7DaysLoader = false;
      }
    })
  }

  timestampListPrev7DaysProduction!: any;
  powerUsageListPrev7DaysProduction!: any;
  data7daysHistoryProduction: any[] = [];
  makeDataGraphPrev7DaysProduction(dataGraph: any) {
    this.timestampListPrev7DaysProduction = [];
    this.powerUsageListPrev7DaysProduction = [];
    this.data7daysHistoryProduction = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.prodPrev7Days[i]['timestamp']);
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeek = daysOfWeek[date.getUTCDay()];
      this.timestampListPrev7DaysProduction.push(dayOfWeek);
      this.powerUsageListPrev7DaysProduction.push(this.prodPrev7Days[i]['powerUsage']);
    }
    for (let i = 0; i < this.timestampListPrev7DaysProduction.length; i++) {
      const pair = {
        timestamp: this.timestampListPrev7DaysProduction[i],
        powerUsage: this.powerUsageListPrev7DaysProduction[i].toFixed(2),
      };
      this.data7daysHistoryProduction.push(pair);
    }
  }

  chartPrev7daysProduction!: any;
  chartProductionPrev7Days() {
    if (this.productionPrev7daysGraph) {
      if (this.chartPrev7daysProduction) {
        this.chartPrev7daysProduction.destroy();
      }

      const data = {
        labels: this.timestampListPrev7DaysProduction,
        datasets: [{
          label: 'Production For The Previous 7 days',
          data: this.powerUsageListPrev7DaysProduction,
          fill: true,
          borderColor: this.backgroundColorsGraphs[3],
          backgroundColor: this.backgroundColorsRGBA4[3],
          pointBackgroundColor: this.backgroundColorsRGBA7[3],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsGraphs[3],
          borderRadius: 5,
          borderSkipped: false,

        }]
      }

      this.chartPrev7daysProduction = new Chart(this.productionPrev7daysGraph.nativeElement, {
        type: 'bar',
        data: data,
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Power Production (kW)',
                font: {
                  size: 9,
                },
              }
            }
          }
        }
      });
    }
  }
  productionNext24hLoader = false;
  productionNext24h(id: any) {
    this.spinner.show();
    this.productionNext24hLoader = true;
    this.auth.getProductionNext24Hours(id).subscribe(
      (response: any) => {
        this.graphProduction24next = response[0]['timestampPowerPairs'];
        this.makeDataProductionNext24(this.graphProduction24next);
        this.nextProduction24Graph();
        this.spinner.hide();
        this.productionNext24hLoader = false;

      }
    );
  }
  timestampListNext24hProduction!: any;
  powerUsageListNext24hProduction!: any;
  data24FutureProduction: any[] = [];
  makeDataProductionNext24(dataGraph: any) {
    this.timestampListNext24hProduction = [];
    this.powerUsageListNext24hProduction = [];
    this.data24FutureProduction = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.graphProduction24next[i]['timestamp']);
      const hour = date.getUTCHours().toString().padStart(2, "0");
      const minute = date.getUTCMinutes().toString().padStart(2, "0");
      const stringHourMinute = '' + hour + ":" + minute;
      this.timestampListNext24hProduction.push(stringHourMinute);
      this.powerUsageListNext24hProduction.push(this.graphProduction24next[i]['powerUsage']);
    }
    for (let i = 0; i < this.timestampListNext24hProduction.length; i++) {
      const pair = {
        timestamp: this.timestampListNext24hProduction[i],
        powerUsage: this.powerUsageListNext24hProduction[i].toFixed(2),
      };
      this.data24FutureProduction.push(pair);
    }
  }
  chartProductionNext24!: any;
  nextProduction24Graph() {
    if (this.next24ProductionGraph) {
      if (this.chartProductionNext24) {
        this.chartProductionNext24.destroy();
      }
      const data = {
        labels: this.timestampListNext24hProduction,
        datasets: [{
          label: 'Production For The Next 24h',
          data: this.powerUsageListNext24hProduction,
          fill: true,
          borderColor: this.backgroundColorsGraphs[4],
          backgroundColor: this.backgroundColorsRGBA4[4],
          pointBackgroundColor: this.backgroundColorsRGBA7[4],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsGraphs[4],
          pointStyle: 'circle',
          pointRadius: 3,
          pointHoverRadius: 5,
        }]
      }
      const options: ChartOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time [h]',
            },
            ticks: {
              font: {
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Energy Production [kWh]',
              font: {
                size: 10,
              }
            },
            ticks: {
              font: {
                size: 9,
              },
            },
          },
        },
      };
      this.chartProductionNext24 = new Chart(this.next24ProductionGraph.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }
  prodNext7Days = [];
  productionNext7DaysLoader = false;
  productionNext7Days(id: any) {
    this.spinner.show();
    this.productionNext7DaysLoader = true;
    this.auth.getProductionNext7days(id).subscribe({
      next: (response: any) => {
        this.prodNext7Days = response[0]['timestampPowerPairs'];
        this.makeDataGraphNext7DaysProduction(this.prodNext7Days);
        this.chartProductionNext7Days();
        this.spinner.hide();
        this.productionNext7DaysLoader = false;
      },
      error: (err: any) => {
        this.spinner.hide();
        this.productionNext7DaysLoader = false;
      }
    })
  }

  timeStrampProductionNext7days!: any[];
  powerUsageProductionNext7days!: any[];
  dataProductionNext7days: any[] = [];
  makeDataGraphNext7DaysProduction(dataGraph: any) {
    this.timeStrampProductionNext7days = [];
    this.powerUsageProductionNext7days = [];
    this.dataProductionNext7days = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.prodNext7Days[i]['timestamp']);
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayOfWeek = daysOfWeek[date.getUTCDay()];
      this.timeStrampProductionNext7days.push(dayOfWeek);
      this.powerUsageProductionNext7days.push(this.prodNext7Days[i]['powerUsage']);
    }
    for (let i = 0; i < this.timeStrampProductionNext7days.length; i++) {
      const pair = {
        timestamp: this.timeStrampProductionNext7days[i],
        powerUsage: this.powerUsageProductionNext7days[i].toFixed(2),
      };
      this.dataProductionNext7days.push(pair);
    }
  }

  chartNext7daysProduction!: any;
  chartProductionNext7Days() {
    if (this.productionNext7daysGraph) {
      if (this.chartNext7daysProduction) {
        this.chartNext7daysProduction.destroy();
      }
      const data = {
        labels: this.timeStrampProductionNext7days,
        datasets: [{
          label: 'Production For The Next 7 days',
          data: this.powerUsageProductionNext7days,
          fill: true,
          borderColor: this.backgroundColorsGraphs[4],
          backgroundColor: this.backgroundColorsRGBA4[4],
          pointBackgroundColor: this.backgroundColorsRGBA7[4],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsGraphs[4],
          borderRadius: 5,
          borderSkipped: false,
        }]
      }
      this.chartNext7daysProduction = new Chart(this.productionNext7daysGraph.nativeElement, {
        type: 'bar',
        data: data,
        options: {
          scales: {
            x: {
              title: {
                display: true,
                text: ''
              }
            },
            y: {
              title: {
                display: true,
                text: 'Energy Production [kWh]',
                font: {
                  size: 9,
                },
              }
            }
          }
        }
      });
    }
  }

  productionNextMonthLoader = false;
  nextMonthProduction(id: any) {
    this.spinner.show();
    this.productionNextMonthLoader = true;
    this.auth.getProductionNextMonth(id).subscribe(
      {
        next: (response: any) => {
          this.productionNextMonthUser = response[0]['timestampPowerPairs'];
          this.makeDataForNextMonthProduction(this.productionNextMonthUser);
          this.chartProductionNextMonth();
          this.spinner.hide();
          this.productionNextMonthLoader = false;
        },
        error: () => {
          this.spinner.hide();
          this.productionNextMonthLoader = false;
        }
      }
    );
  }

  timeStampProductionNextMonth!: any[];
  powerUsageProductionNextMonth!: any[];
  dataproductionNextMonth: any[] = [];
  makeDataForNextMonthProduction(dataGraph: any) {
    this.timeStampProductionNextMonth = [];
    this.powerUsageProductionNextMonth = [];
    this.dataproductionNextMonth = [];
    for (let i = 0; i < dataGraph.length; i++) {
      const date = new Date(this.productionPrevMonthUser[i]['timestamp']);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();
      const dateString = '' + month + ' ' + day;
      this.timeStampProductionNextMonth.push(dateString);
      this.powerUsageProductionNextMonth.push(this.productionPrevMonthUser[i]['powerUsage']);
    }
    for (let i = 0; i < this.timeStampProductionNextMonth.length; i++) {
      const pair = {
        timestamp: this.timeStampProductionNextMonth[i],
        powerUsage: this.powerUsageProductionNextMonth[i],
      };
      this.dataproductionNextMonth.push(pair);

    }

  }

  chartProdNextMonth!: any;
  chartProductionNextMonth() {
    if (this.productionNextMonthGraph) {
      if (this.chartProdNextMonth) {
        this.chartProdNextMonth.destroy();
      }
      const data = {
        labels: this.timeStampProductionNextMonth,
        datasets: [{
          label: 'Production For The Next Month',
          data: this.powerUsageProductionNextMonth,
          borderColor: this.backgroundColorsGraphs[4],
          backgroundColor: this.backgroundColorsRGBA4[4],
          pointBackgroundColor: this.backgroundColorsRGBA7[4],
          borderWidth: 1,
          pointBorderColor: this.backgroundColorsGraphs[4],
          pointStyle: 'circle',
          pointRadius: 3,
          pointHoverRadius: 5,
        }]
      }
      const options: ChartOptions = {
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
            },
            ticks: {
              font: {
                size: 10,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: 'Energy Production [kWh]'
            },
            ticks: {
              font: {
                size: 9,
              },
            },
          },
        },
      };
      this.chartProdNextMonth = new Chart(this.productionNextMonthGraph.nativeElement, {
        type: 'line',
        data: data,
        options: options,
      });
    }
  }

  public savedEnergyUser!: any;
  savedEnergy(userID: any) {
    this.auth.savedEnergyConsumptionUser(userID).subscribe({
      next: (response: any) => {
        this.savedEnergyUser = (response).toFixed(2);
      },
      error: (err: any) => {
        this.savedEnergyUser = 0;
      }
    });
    this.auth.savedEnergyProductionUser(userID).subscribe({
      next: (response: any) => {
        this.savedEnergyUser += response.toFixed(2);
      },
      error: (err: any) => {
        this.savedEnergyUser += 0;
      }
    })
  }


  sharedDataWithDSO: any;
  dsoShareData(userID: any) {
    this.auth.userShareDataWithDSO(userID).subscribe({
      next: (response: any) => {
      
        this.sharedDataWithDSO = response;

      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }
  public isChecked!: boolean;
  public isDisabled!: boolean;
  public btnStatus: boolean = false;
  toggleDeviceStatus(device: Info) {
    if (device.dsoHasControl == true) {
      if (device.dsoHasControl) {
        if (device.statusOfDevice === "OFF") {
          this.auth.changeStateOfDevice(device.deviceId, true).subscribe({
           next:(repose:any)=>{
              device.statusOfDevice = "ON";
              console.log("menjam")
              this.showMeDevices(this.userPopUp.id)
            },
            error: (error: any) => {
              console.log(error);
            }
          }
          );
        } else {
          this.auth.changeStateOfDevice(device.deviceId, false).subscribe({
            next: (response: any) => {
              device.statusOfDevice = "OFF";
              console.log("menjam")
              this.showMeDevices(this.userPopUp.id)
            },
            error: (error: any) => {
              console.log(error);
            }
          }

          );
          
        }
      }
      

    }
  }
  
}












