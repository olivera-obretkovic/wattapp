import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTableProfileComponent } from './modal-table-profile.component';

describe('ModalTableProfileComponent', () => {
  let component: ModalTableProfileComponent;
  let fixture: ComponentFixture<ModalTableProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalTableProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalTableProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
