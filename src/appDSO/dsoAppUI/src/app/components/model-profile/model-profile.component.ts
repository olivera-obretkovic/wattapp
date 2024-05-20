import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-model-profile',
  templateUrl: './model-profile.component.html',
  styleUrls: ['./model-profile.component.css']
})
export class ModelProfileComponent {
  @ViewChild('profileDispacher') profileDispacher!:ElementRef;
  
  constructor(
  ){}

  @Input() firstName:any;
  @Input() lastName : any;
  @Input() email : any;
  @Input() role : any;
  @Input() phoneNumber : any;
}
