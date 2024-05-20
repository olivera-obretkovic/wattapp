import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceEditPopupComponent } from './device-edit-popup.component';

describe('DeviceEditPopupComponent', () => {
  let component: DeviceEditPopupComponent;
  let fixture: ComponentFixture<DeviceEditPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceEditPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceEditPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
