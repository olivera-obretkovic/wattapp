import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstellationDetailsFormComponent } from './constellation-details-form.component';

describe('ConstellationDetailsFormComponent', () => {
  let component: ConstellationDetailsFormComponent;
  let fixture: ComponentFixture<ConstellationDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstellationDetailsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstellationDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
