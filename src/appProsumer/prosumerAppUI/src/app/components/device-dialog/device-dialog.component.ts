import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-device-dialog',
  template: `
    <h2 mat-dialog-title>Edit Device Name</h2>
    <mat-dialog-content>
      <form [formGroup]="deviceForm">
        <mat-form-field>
          <input matInput formControlName="deviceName" placeholder="New Device Name" />
          <mat-error *ngIf="deviceForm.controls['deviceName'].hasError('required')">Device Name is required</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-button color="primary" (click)="save()" [disabled]="deviceForm.invalid">Save</button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./device-dialog.component.css']
})
export class DeviceDialogComponent {
  deviceForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DeviceDialogComponent>,
    private formBuilder: FormBuilder
  ) {
    this.deviceForm = this.formBuilder.group({
      deviceName: ['', Validators.required]
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    if (this.deviceForm.valid) {
      const newDeviceName = this.deviceForm.value.deviceName;
      this.dialogRef.close(newDeviceName);
    }
  }
}
