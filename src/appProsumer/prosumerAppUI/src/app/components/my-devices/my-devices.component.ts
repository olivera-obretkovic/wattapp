import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { ConfirmEventType, ConfirmationService, MessageService } from 'primeng/api';
import { AuthUserService } from 'src/app/services/auth-user.service';
import { Info } from 'src/app/models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-devices',
  templateUrl: './my-devices.component.html',
  styleUrls: ['./my-devices.component.css']
})
export class MyDevicesComponent implements OnInit {
  devices: any = [];
  deviceToday: {[key: string]: any} = {};
  searchName: string = '';
  typeOfDevices: {[key: string]: any} = {};
  selectedGroups: string[] = [];

  @ViewChild('myTable') myTable!: ElementRef;


  constructor(
    private auth: AuthService,
    private cookie: CookieService,
    private http: HttpClient,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.getDeviceData().subscribe(
      (data) => {
        const deviceObservables = data.map((device: any) => {
          return this.auth.isOn(device.deviceId).pipe(
            tap((isOn: boolean) => {
              device.isToggled = isOn;
            }),
            catchError((error) => {
              device.isToggled = false;
              return of(null);
            })
          );
        });

        forkJoin(deviceObservables).subscribe(
          () => {
            this.devices = data;
            this.devices.forEach((device: any) => {
              device.filtered = true;
              this.http
                .get<any[]>(
                  `${environment.apiUrl}/api/PowerUsage/power-usage/current/device/${device.deviceId}`)
                .subscribe(
                  (data) => {
                    this.deviceToday[device.deviceId] = data;
                  },
                  (error) => {
                    this.deviceToday[device.deviceId] = 0;
                  }
                );
            });
            this.devices.forEach((device: any) => {
              this.http
                .get<any[]>(
                  `${environment.apiUrl}/api/Device/devices/info/${device.deviceId}`)
                .subscribe(
                  (response:any) => {
                    this.typeOfDevices[device.deviceId] = response.groupName;
                    this.filterDevices();
                  },
                  (error) => {
                  }
                );
            });

          },
          (error) => {
            console.log(error);
          }
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }

  isSelectedGroup(device: any): boolean {
    const groupName = this.typeOfDevices[device.deviceId];
    return this.selectedGroups.includes(groupName);
  }



  updateSelectedGroups(event: any, group: string) {
    const checked = event.target.checked;
    if (checked) {
      this.selectedGroups.push(group);
    } else {
      const index = this.selectedGroups.indexOf(group);
      if (index > -1) {
        this.selectedGroups.splice(index, 1);
      }
    }
    this.filterDevices();
  }



  filteredDevices: any[] = [];



  filterDevices() {
    if (this.selectedGroups.length === 0) {
      this.filteredDevices = this.devices;
    } else {
      this.filteredDevices = this.devices.filter((device: any) => {
        const groupName = this.typeOfDevices[device.deviceId];
        return this.selectedGroups.includes(groupName);
      });
    }
  }


  exportToExcel(): void {
    const tableData = this.myTable.nativeElement.cloneNode(true);
    const columnToRemoveIndex = 0;


    const rows = tableData.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      if (cells.length > columnToRemoveIndex) {
        cells[columnToRemoveIndex].remove();
      }
    }


    const headerRow = tableData.getElementsByTagName('tr')[0];
    const headerCell = headerRow.getElementsByTagName('th')[columnToRemoveIndex];
    if (headerCell) {
      headerCell.remove();
    }

    const worksheet = XLSX.utils.table_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'devices.xlsx');
  }



  confirmStateChange(device: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to change the state of the device?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.changeState(device.deviceId);
        this.router.navigate(['/dashboard'],{skipLocationChange:true}).then(()=>{

          this.router.navigate(['/home']);

        });
      },
      reject: (type: any) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            this.router.navigate(['/dashboard'],{skipLocationChange:true}).then(()=>{

              this.router.navigate(['/home']);

            });
            break;
          case ConfirmEventType.CANCEL:
            this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
            this.router.navigate(['/dashboard'],{skipLocationChange:true}).then(()=>{

              this.router.navigate(['/home']);

            });
            break;
        }
      },
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary'
    });
  }

  changeState(id: any) {
    this.auth.changeState(id).subscribe(() => {

    });
  }

}
