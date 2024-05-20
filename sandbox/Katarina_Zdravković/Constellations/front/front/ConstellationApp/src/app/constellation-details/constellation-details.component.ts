import { Component, OnInit } from '@angular/core';
import { Toast, ToastrService } from 'ngx-toastr';
import { ConstellationDetail } from '../shared/constellation-detail.model';
import { ConstellationDetailService } from '../shared/constellation-detail.service';

@Component({
  selector: 'app-constellation-details',
  templateUrl: './constellation-details.component.html',
  styleUrls: ['./constellation-details.component.css']
})
export class ConstellationDetailsComponent implements OnInit {
  constructor(public service: ConstellationDetailService, private toastr:ToastrService)
  {
  }

  ngOnInit(): void {
    this.service.refreshlist();
  }

  populateForm(selectedRecord:ConstellationDetail)
  {
    this.service.formData= Object.assign({}, selectedRecord);
  }

  onDelete(id:number)
  {
    if(confirm('Are you sure to delete this record?'))
    {
    this.service.deleteConstellationDetail(id)
    .subscribe(
      {
        next:(res)=>{
        this.service.refreshlist();
        this.toastr.error("Deleted succesfully", 'Constellation Detail Register');

      },
      error: (err:any) => {console.log("Greska")}
    })
  }
}
}
