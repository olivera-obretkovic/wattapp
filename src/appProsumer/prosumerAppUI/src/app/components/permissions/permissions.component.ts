import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SettingsService } from 'src/app/services/settings.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit{
  device: any;
  deviceId: any;
  allowControl: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private settings: SettingsService
  )
  {}

  ngOnInit() {
    this.deviceId = this.route.snapshot.paramMap.get('id');

    this.http.get<any[]>(`${environment.apiUrl}/api/Device/devices/info/${this.deviceId}`)
      .subscribe(data => {
        this.device = data;
      },
      error => {
        console.error('Error fetching device information:', error);
      });

    this.settings.getControlInfo(this.deviceId).subscribe(
      (data) => {
        this.allowControl = data;
        console.log(data);
      },
      (error) => {
        console.error('Error retrieving control information:', error);
      }
    );
  }

  goBack(){
    this.router.navigate(['/device-details', this.deviceId]);
  }

  toggleControl(){
    this.allowControl = !this.allowControl;
    this.settings.updateDeviceControl(this.deviceId, this.allowControl).subscribe(
      (response) => {
        console.log("Success");
      },
      (error) => {
        console.log("Fail");
      }
    );
  }
}
