import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileProsumerComponent } from './profile-prosumer.component';

describe('ProfileProsumerComponent', () => {
  let component: ProfileProsumerComponent;
  let fixture: ComponentFixture<ProfileProsumerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileProsumerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileProsumerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
