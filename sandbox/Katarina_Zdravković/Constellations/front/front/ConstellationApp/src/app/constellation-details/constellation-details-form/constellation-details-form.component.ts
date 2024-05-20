import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConstellationDetail } from 'src/app/shared/constellation-detail.model';
import { ConstellationDetailService } from 'src/app/shared/constellation-detail.service';

@Component({
  selector: 'app-constellation-details-form',
  templateUrl: './constellation-details-form.component.html',
  styleUrls: ['./constellation-details-form.component.css']
})
export class ConstellationDetailsFormComponent {
  constructor(public service:ConstellationDetailService, private toastr:ToastrService)
  {

  }

  onSubmit(form:NgForm)
  {

        this.insertRecord(form);

        this.updateRecord(form);

  }

  insertRecord(form:NgForm)
  {
    this.service.postConstellationDetail().subscribe(
     { next:(res) => {
        this.resetForm(form);
        this.service.refreshlist();
        this.toastr.success('Submitted successfully','Constellation Detail Register');
        },
        error:  (err:any) => { console.log(err); }
      });
  }

  updateRecord(form: NgForm)
  {
    this.service.putConstellationDetail().subscribe({
      next:(res)=> {
        this.resetForm(form);
        this.service.refreshlist();
        this.toastr.info('Updated successfully','Constellation Detail Register')
        },
        error:(err:any) => { console.log(err); }
      });
  }



  resetForm(form:NgForm)
  {
    form.form.reset();
    this.service.formData = new ConstellationDetail();
  }
}
