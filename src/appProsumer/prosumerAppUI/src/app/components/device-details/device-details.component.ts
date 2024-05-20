import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {Chart, Plugin } from 'chart.js/auto';
import { ViewChild, ElementRef } from '@angular/core';
import { ConfirmationService, MessageService, ConfirmEventType } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { SettingsService } from 'src/app/services/settings.service';
import { ModalTableComponent } from '../modal-table/modal-table.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DeviceDialogComponent } from '../device-dialog/device-dialog.component';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.css']
})
export class DeviceDetailsComponent implements OnInit {
  device: any;
  groupName: string = '';
  deviceId: any;
  deviceCurrent: any;
  deviceHistoryWeekPower: any = [];
  deviceFutureWeekPower: any = [];
  deviceHistoryWeekDate: any = [];
  deviceFutureWeekDate: any = [];
  deviceFutureMonthPower: any = [];
  deviceFutureMonthDate: any = [];
  deviceHistoryMonthPower: any = [];
  deviceHistoryMonthDate: any = [];
  last24HoursPower: any = [];
  last24HoursDate: any = [];
  next24HoursPower: any = [];
  next24HoursDate: any = [];
  pastday: any = [];
  pastweek: any = [];
  pastmonth: any = [];
  hours: any = [];
  hourly: any = [];
  data: any = [];
  data1: any = [];
  data2: any = [];
  formattedLabels: any = [];
  deviceToday: any = 0;
  chart:any;
  label1: string = '';
  label2: string = '';
  label3: string = '';
  showSpinner: boolean = true;
  allowAccess: boolean = false;
  data24h: any[]=[];
  dataMonth: any[]=[];
  data7days: any[]=[];
  deviceName: string = '';
  isLineChart: boolean = true;
  col1: string = '';
  col2: string = '';
  isStorage: boolean = false;
  percentage: any = 50;

  @ViewChild('myTable') myTable!: ElementRef;
  @ViewChild('ModalTableComponent') modalTableComponent!: ModalTableComponent;
  @ViewChild('ModalTableComponentEditDevice') modalTableComponentEditDevice!: ModalTableComponent;


  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private settings: SettingsService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder
  ) {}

  deviceForm: FormGroup = this.formBuilder.group({
    deviceName: ['', Validators.required]
  });

  ngOnInit() {
    this.spinner.show();
    this.deviceId = this.route.snapshot.paramMap.get('id');

    this.settings.getShareInfo().subscribe(
      (data) => {
        this.allowAccess = data;
      },
      (error) => {
        console.error('Error retrieving share information:', error);
      }
    );

    this.http.get<any[]>(`${environment.apiUrl}/api/Device/devices/info/${this.deviceId}`)
      .subscribe(data => {
        this.device = data;
        this.groupName = this.device.groupName;
        this.deviceForm.patchValue({ deviceName: this.device.deviceName });
        this.deviceName = this.device.deviceName;
        if(this.device.groupName==='Consumer' || this.device.groupName==='Producer'){
          this.isStorage = false;
          this.fetchConsumptionData();
        }
        else if(this.device.groupName==='Storage'){
          /*this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/get-current-user-battery-percentage/${this.deviceId}`)
          .subscribe(data => {
            this.percentage = data;
            this.showSpinner = false;
            this.spinner.hide();
          },
          error => {
            console.error('Error fetching device information:', error);
          })*/
          this.isStorage = true
          this.showSpinner = false;
          this.spinner.hide();
        }
      },
      error => {
        console.error('Error fetching device information:', error);
      });
  }

  fetchConsumptionData(){
    this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/current/device/${this.deviceId}`)
      .subscribe(data => {
        this.deviceCurrent = data;
      },
      error => {
        console.error('Error fetching device information:', error);
      });

      this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/7daysHistory/device/${this.deviceId}`)
        .subscribe((data:any) => {
          this.deviceHistoryWeekDate = data.timestampPowerPairs.map((time:any) => time.timestamp);
          this.deviceHistoryWeekPower = data.timestampPowerPairs.map((time:any) => time.powerUsage);
          this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/7daysFuture/device/${this.deviceId}`)
            .subscribe((data:any) => {
              this.deviceFutureWeekDate = data.timestampPowerPairs.map((time:any) => time.timestamp);
              this.deviceFutureWeekPower = data.timestampPowerPairs.map((time:any) => time.powerUsage);
              this.onOptionSelect();
              this.showSpinner = false;
              this.spinner.hide();
            },
            error => {
              console.error('Error fetching device future:', error);
            })
            this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/today/currentPowerUsage/${this.deviceId}`)
            .subscribe(data => {
              data.forEach(item => {
                this.deviceToday += item.powerUsage;
              });
            },
            error => {
              console.error('Error fetching device today:', error);
            })
        },
        error => {
          console.error('Error fetching device history:', error);
        })

      this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/Next24h/device-usage_per_hour/${this.deviceId}`)
      .subscribe((data:any) =>{
        this.next24HoursDate = data.timestampPowerPairs.map((item: any) => item.timestamp);
        this.next24HoursPower = data.timestampPowerPairs.map((item: any) => item.powerUsage);
      },
      error => {
         console.error('Error fetching todays info:', error);
      })

      this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/Previous24h/device-usage_per_hour/${this.deviceId}`)
      .subscribe((data:any) =>{
        this.last24HoursDate = data.timestampPowerPairs.map((item: any) => item.timestamp);
        this.last24HoursPower = data.timestampPowerPairs.map((item: any) => item.powerUsage);
      },
      error => {
         console.error('Error fetching todays info:', error);
      })

      this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/MonthPast/device/${this.deviceId}`)
      .subscribe((data:any) =>{
        this.deviceHistoryMonthDate = data.timestampPowerPairs.map((item: any) => item.timestamp);
        this.deviceHistoryMonthPower = data.timestampPowerPairs.map((item: any) => item.powerUsage);
      },
      error => {
         console.error('Error fetching months history info:', error);
      })

      this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/MonthFuture/device/${this.deviceId}`)
      .subscribe((data:any) =>{
        this.deviceFutureMonthDate = data.timestampPowerPairs.map((item: any) => item.timestamp);
        this.deviceFutureMonthPower = data.timestampPowerPairs.map((item: any) => item.powerUsage);

      },
      error => {
         console.error('Error fetching months history info:', error);
      })

      this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/pastweek/prediction${this.deviceId}`)
      .subscribe((data:any) =>{
        this.pastweek = data.timestampPowerPairs.map((item: any) => item.powerUsage);

      },
      error => {
         console.error('Error fetching weeks history prediction info:', error);
      })

      this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/past24h/prediction${this.deviceId}`)
      .subscribe((data:any) =>{
        data.timestampPowerPairs = []
        this.pastday = data.timestampPowerPairs.map((item: any) => item.powerUsage);
      },
      error => {
         console.error('Error fetching days history prediction info:', error);
      })

      this.http.get<any[]>(`${environment.apiUrl}/api/PowerUsage/power-usage/pastmonth/prediction${this.deviceId}`)
      .subscribe((data:any) =>{
        this.pastmonth = data.timestampPowerPairs.map((item: any) => item.powerUsage);
      },
      error => {
         console.error('Error fetching months history prediction info:', error);
      })
  }

  updateDeviceName() {
    if(this.deviceForm.valid){
    const deviceName = this.deviceForm.get('deviceName')?.value;
    const headers = new HttpHeaders().set('Content-Type', 'text/json');
    this.http.put(`${environment.apiUrl}/api/Device/update/${this.deviceId}`, JSON.stringify(deviceName), { headers })
    .subscribe((response) => {
      console.log("Success");
      this.deviceName = deviceName;
    },
    (error) => {
      console.log("Fail");
    });}
    else{
      this.messageService.add({ severity: 'error', summary: 'Please add device name!'});
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(DeviceDialogComponent);

    dialogRef.afterClosed().subscribe(newDeviceName => {
      if (newDeviceName) {
        // Perform your logic to update the deviceName using the newDeviceName value
      }
    });
  }

  goBack(){
    this.router.navigate(['/home']);
  }

  del() {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.deleteDevice();
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

  deleteDevice(){
    this.http.delete(`${environment.apiUrl}/api/Device/delete-device/${this.deviceId}`)
    .subscribe(
      () => {
        this.router.navigate(['/home']);
      },
      error => {
        console.log(error)
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
      }
    );
  }

  showPermissions(){
    this.router.navigate(['/permissions', this.deviceId]);
  }

  showDetails = false;

  toggleDetails() {
    this.showDetails = !this.showDetails;
  }

  @ViewChild('chart', {static: true}) chartElement: ElementRef | undefined = undefined;
  selectedOption: string = 'Week';

  onOptionSelect() {
  if (this.selectedOption === 'Today') {
    this.data = [...this.last24HoursPower, this.deviceCurrent, null, null, null, null, null, null, null, null, null, null, null, null,null, null, null, null, null, null,null, null, null, null, null, null];
    this.data1 = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, this.deviceCurrent, ...this.next24HoursPower];
    this.data2 = [...this.pastday, null, null, null, null, null, null, null, null, null, null, null, null, null,null, null, null, null, null, null,null, null, null, null, null, null];
    const currentDate = new Date();
    const offset = currentDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(currentDate.getTime() - offset).toISOString();
    this.formattedLabels = [...this.last24HoursDate, adjustedDate, ...this.next24HoursDate];
    this.formattedLabels = this.formattedLabels.map((date:any) => {
      const parsedDate = new Date(date);
      const hours = parsedDate.getUTCHours();
      const minutes = parsedDate.getMinutes();
      return `${hours < 10 ? '0' + hours : hours}:00`;
    });
    this.label1 = "24 Hour History";
    this.label2 = "24 Hour Prediction";
    this.label3 = "Prediction of Last 24 Hours";
    this.col1 = 'rgba(0, 0, 0, 0)';
    this.col2 = 'rgba(0, 0, 0, 0)';
    this.isLineChart = true;
    this.data24h=[];
    const pom = [...this.last24HoursPower, this.deviceCurrent, ...this.next24HoursPower];
    for (let i = 0; i < this.formattedLabels.length; i++) {
      const pair = {
        timestamp: this.formattedLabels[i],
        powerUsage: pom[i]
      };
      this.data24h.push(pair);
    }
  }
  else if (this.selectedOption === 'Week') {
    this.formattedLabels = [...this.deviceHistoryWeekDate, new Date(), ...this.deviceFutureWeekDate];
    this.formattedLabels = this.formattedLabels.map((date:any) => {
      const parsedDate = new Date(date);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
      ];
      const month = monthNames[parsedDate.getMonth()];
      const day = parsedDate.getDate();
      return `${month} ${day}`;
    });
    this.data = [...this.deviceHistoryWeekPower, this.deviceToday];
    this.data1 = [null, null, null, null, null, null, null, null, ...this.deviceFutureWeekPower];
    this.data2 = [...this.pastweek, null, null, null, null, null, null, null, null];
    this.label1 = "History From Last Week";
    this.label2 = "Prediction For Next Week";
    this.label3 = "Prediction For Last Week";
    this.col1 = 'rgba(255, 136, 17, 0.91)';
    this.col2 = 'rgba(2, 102, 112, 1)';
    this.isLineChart = false;
    this.data7days=[];
    const pom = [...this.deviceHistoryWeekPower, this.deviceToday, ...this.deviceFutureWeekPower];
    for (let i = 0; i < this.formattedLabels.length; i++) {
      const pair = {
        timestamp: this.formattedLabels[i],
        powerUsage: pom[i]
      };
      this.data7days.push(pair);
    }
  }
  else if (this.selectedOption === 'Month'){
    this.formattedLabels = [...this.deviceHistoryMonthDate, new Date(), ...this.deviceFutureMonthDate];
    this.formattedLabels = this.formattedLabels.map((date:any) => {
      const parsedDate = new Date(date);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
      ];
      const month = monthNames[parsedDate.getMonth()];
      const day = parsedDate.getDate();
      return `${month} ${day}`;
    });
    this.data = [...this.deviceHistoryMonthPower, this.deviceToday,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null];
    this.data1 = [null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null, null, this.deviceToday, ...this.deviceFutureMonthPower];
    this.data2 = [...this.pastmonth, null ,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null, null, null, null, null,null];
    this.label1 = "Last Month's History";
    this.label2 = "Next Month's Prediction";
    this.label3 = "Last Month's Prediction";
    this.col1 = 'rgba(0, 0, 0, 0)';
    this.col2 = 'rgba(0, 0, 0, 0)';
    this.dataMonth=[];
    this.isLineChart = true;
    const pom = [...this.deviceHistoryMonthPower, this.deviceToday, ...this.deviceFutureMonthPower];
    for (let i = 0; i < this.formattedLabels.length; i++) {
      const pair = {
        timestamp: this.formattedLabels[i],
        powerUsage: pom[i]
      };
      this.dataMonth.push(pair);
    }
  }
  this.initializeChart();
  }

  initializeChart() {
    if (this.chartElement){

      if (this.chart) {
        this.chart.destroy();
      }
      const ctx = this.chartElement.nativeElement.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, '#FF8811');
      gradient.addColorStop(0.5,'#9747FF');
      gradient.addColorStop(1, '#9FEDD7');
      const chartType = this.isLineChart ? 'line' : 'bar';
      this.chart = new Chart(ctx, {
        data: {
          labels: this.formattedLabels,
          datasets: [{
            type: chartType,
            label: this.label1,
            data: this.data,
            fill: true,
            borderColor: 'rgba(255, 136, 17, 0.91)',
            backgroundColor: this.col1,
            tension: 0.1
          },
          {
            type: chartType,
            label: this.label2,
            data: this.data1,
            fill: true,
            borderColor: 'rgba(2, 102, 112, 1)',
            backgroundColor: this.col2,
            tension: 0.1
          },
          {
            type: 'line',
            label: this.label3,
            data: this.data2,
            fill: true,
            borderColor: 'rgba(2, 102, 112, 1)',
            borderDash: [5, 5],
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2,
          scales: {
            y: {
              title: {
                display: true,
                text: 'Energy [kWh]'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            },


          }
        }

      });
  }
}

}
