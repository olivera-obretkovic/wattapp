import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Device } from '../../models/device.model';
import { Storage } from '../../models/storage.model';
import { newDeviceDTO } from 'src/app/models/newDeviceDTO';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.css']
})
export class AddDeviceComponent {
  submitted: boolean = false;
  groups: any[] = [];
  selectedGroup!: string;
  selectedGroupValue: boolean = false;

  manufacturers: any[] = [];
  selectedManufacturerId: any;
  devices: any[] = [];
  selectedDevice: any;
  selectedWattage: any;


  constructor(
    private fb: FormBuilder,
    private router : Router,
    private http : HttpClient,
    private messageService: MessageService,
    private cookie: CookieService
  ){}

  addDeviceForm: FormGroup = this.fb.group({
    type:['', Validators.required],
    manufacturer: [{value:'', disabled:true}, Validators.required],
    device: [{value:'', disabled:true}, Validators.required],
    deviceName: ['', Validators.required],
    macAddress: ['', [Validators.required, Validators.pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)]]
  });

  ngOnInit() {
    this.http.get<any[]>(environment.apiUrl + '/api/Device/groups')
      .subscribe(groups => this.groups = groups);
  }

  get fields(){
    return this.addDeviceForm.controls;
  }

  onGroupSelected(event: any) {
    this.addDeviceForm.get('manufacturer')?.enable();
    this.addDeviceForm.get('device')?.disable();
    this.selectedGroupValue = true;
    const selectElement = event.target as HTMLSelectElement;
    this.selectedGroup = selectElement.value;

      this.http.get<any[]>(`${environment.apiUrl}/api/Device/manufacturers/${this.selectedGroup}`)
      .subscribe({
        next: data => {
          this.manufacturers = data;
        },
        error: err => {
          console.error(err);
        }
      });
  }

  onManufacturerChange(event: any) {
    this.addDeviceForm.get('device')?.enable();
    const manSelect = event.target as HTMLSelectElement;
    this.selectedManufacturerId = manSelect.value;

      this.http.get<any[]>(`${environment.apiUrl}/api/Device/${this.selectedGroup}/${this.selectedManufacturerId}`)
      .subscribe({
        next: data => {
          this.devices = data;
        },
        error: err => {
          console.error(err);
        }
      });
  }

  onDeviceChange(event: any){
    const deviceSelect = event.target as HTMLSelectElement;
    this.selectedDevice = deviceSelect.value;
    this.selectedWattage = this.devices.find(device => device.id === deviceSelect.value);
  }

  onSubmit() {
    this.submitted = true;
    if (this.addDeviceForm.valid) {
      const formData = this.addDeviceForm.value;
  
      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${this.cookie.get('jwtToken')}`);
  
      this.http.post(environment.apiUrl + '/api/Device/devices/add-new', new newDeviceDTO(this.selectedDevice, formData.macAddress, formData.deviceName), { headers })
        .subscribe(response => {
          this.router.navigate(['home']);
        });
    } else {
      this.messageService.add({ severity: 'error', summary: 'Fill out all information first!'});     
      this.router.navigate(['add-device']);
    }
  }

  goBack(){
    this.router.navigate(['/home']);
  }
}
