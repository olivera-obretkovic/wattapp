import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from 'service/auth.service';
import { Request } from 'models/Request';


@Component({
  selector: 'app-requirements',
  templateUrl: './requirements.component.html',
  styleUrls: ['./requirements.component.css']
})
export class RequirementsComponent implements OnInit{

  allRequests: any[] = [];
  allUsersRequest: Request[] = [];

  constructor(
    private auth : AuthService,
  ){}

  ngOnInit(): void {
    this.loadReq();
  }

  acceptRequest(reqID: any){
    this.auth.acceptReq(reqID).subscribe(
      response => {
      
        this.loadReq();
      }
    );
  }
  declineRequest(reqID:any){
    this.auth.declineRequest(reqID).subscribe(
      response => {
        this.loadReq();
      }
    );
  }

  loadReq(){
    this.auth.getAllRequests().subscribe((response) => {
      this.allRequests = response;
      this.allUsersRequest = []
      this.allRequests.forEach((element) => {
        let r = new Request(element.id, element.userID);
        this.auth.getUserInformation(r.UserID).subscribe((response) => {
          r.FirstName = response.firstName;
          r.LastName = response.lastName;
          r.Address =
            response.address + ", " + response.city + ", " + response.country;
        });
        this.allUsersRequest.push(r);
      });
    });
  }

}
