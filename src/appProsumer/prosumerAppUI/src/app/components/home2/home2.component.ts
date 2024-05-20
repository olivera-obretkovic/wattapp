import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartOptions } from 'chart.js';
import { Info, User } from 'src/app/models/user';
import { Root } from 'src/app/models/weather';
import { AuthUserService } from 'src/app/services/auth-user.service';
import { AuthService } from 'src/app/services/auth.service';
import { DatePipe } from '@angular/common';
import { Observable, map, timer } from 'rxjs';

@Component({
  selector: 'app-home2',
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.css']
})
export class Home2Component implements OnInit, AfterViewInit {
  currentUsage! : any;
  currentProduction! : any;
  userID!: any;
  token!:any;
  weather! : Root;
  devices!: any;
  id!:any;
  graph24prev!:any;
  powerUsageList: any = [];
  timestampList: any = [];
  allUserDevices!: Info[];
  currentDate!: Observable<Date>;
  savedEnergyMonthConsumption!: number;
  electricityBill!: number;
  electricityRate = 7.584;

  constructor(
		private auth : AuthService,
    private auth1 : AuthUserService
	){}


  @ViewChild('myChart') myChart!: ElementRef;
  @ViewChild('previous24ConsumptionGraph') previous24ConsumptionGraph!:ElementRef;

  ngAfterViewInit(): void {
    this.showWeatherDetails();

  }



  ngOnInit(): void {
    this.getToken();

    this.currentDate = timer(0,1000).pipe(
      map(()=>{
        return new Date();
      })
    )
  }


  getToken(){
    this.token = this.auth.getToken();
    this.auth1.getThisUser(this.token).subscribe(
      (response :any)=>{
       this.userID = response.id;
       this.getConsumptionSevedEnergyMonth(this.userID);
       this.currentUsageUser(this.userID);
       this.currentProductionUser(this.userID);
       this.auth1.getConsumptionPrevious24Hours(this.userID).subscribe(
        (response : any) => {
          this.graph24prev = response;
          this.makeData(this.graph24prev);
        }
       );
       this.ElectricityBillCurrentMonth(this.userID);
      }
    )
  }

  ElectricityBillCurrentMonth(id:any)
  {
    this.auth1.getElectricityBill(id, this.electricityRate).subscribe(
         (response: any) =>{
             this.electricityBill = response.toFixed(2);
         },
         (error) => {
          this.electricityBill = 0;
        }
    )
  }

  getConsumptionSevedEnergyMonth(id:any)
  {
    this.auth1.getConsumptionSavedEnergyMonth(id).subscribe(
      (response:any)=>{
        this.savedEnergyMonthConsumption = response.toFixed(2);
      },
      (error) => {
       this.savedEnergyMonthConsumption = 0;
     }

    )
  }


  currentUsageUser(id:any){
    this.auth1.getCurrentConsumptionSummary(id).subscribe(
      (response : any) => {
        this.currentUsage = response.toFixed(2);
      }
    )
  }

  currentProductionUser(id:any)
  {
    this.auth1.getCurrentProductionSummary(id).subscribe(
      (response : any) => {
        this.currentProduction = response.toFixed(2);
      }
    )
  }


showWeatherDetails()
{
  this.auth.getWeather().subscribe(
    (response: any) => {
      this.weather = response;
      });
}


makeData(dataGraph:any){
  dataGraph.forEach((obj:any) => {
    obj.timestampPowerPairs.forEach((pair:any) => {
      const time = pair.timestamp.split('T')[1].split(':')[0];
      this.timestampList.push(time);
      this.powerUsageList.push(pair.powerUsage);
    });
  });


  this.previous24Graph(this.timestampList, this.powerUsageList);
}

previous24Graph(list:any, valueList:any){
  const data = {
    labels: list,
    datasets: [{
      label: 'Consumption For The Previous 24h',
      data: valueList,
      fill: true,
      borderColor: 'rgb(255, 200, 0)',
      backgroundColor:'rgba(255, 200, 0,0.4)',
      pointBackgroundColor: 'rgba(255, 200, 0,0.7)',
      borderWidth: 1,
      pointBorderColor:'rgb(255, 200, 0)'
    }]
  }
  const options: ChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time (hour)',
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Energy Consumption [kWh]',
          font:{
            size: 10
          }
        },
        ticks: {
          font: {
            size: 14,
          },
        },
      },
    },
  };
  const graph = new Chart(this.previous24ConsumptionGraph.nativeElement, {
    type: 'line',
    data: data,
    options: options,
  });
}

}




