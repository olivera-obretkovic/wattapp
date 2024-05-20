import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Chart, ChartOptions } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthUserService } from 'src/app/services/auth-user.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalTableComponent } from '../modal-table/modal-table.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit{
  token!:any;
  userID!: any;
  timeStampConsumption =[];
  powerUsageConsumption = [];
  timeStampConsumptionNextMonth = [];
  powerUsageConsumptionNextMonth = [];
  extractedDatesPrevMonth:string[] = [];
  extractedDatesNextMonth:string[] = [];
  consumptionPrevMonthUser!:[];
  consumptionNextMonthUser!:[];
  consPrev7Days = [];
  consNext7Days = [];
  timeStrampConsumptionPrev7days = [];
  powerUsageConsumptionPrev7days = [];
  timeStrampConsumptionNext7days = [];
  powerUsageConsumptionNext7days = [];
  timestampListPrev24h!:any[];
  powerUsageListPrev24h!:any[];
  extractedDatesPrev24h:string[]  = [];
  timestampListNext24h!:any[];
  powerUsageListNext24h!:any[];
  extractedDatesNext24h:string[]  = [];
  consumption24prev!:any;
  consumption24next!:any;
  extractedDatesPrev7Days:string[]  = [];
  extractedDatesNext7Days:string[]  = [];
  id!:any;
  chartPrevMonth!:any;
  chartNextMonth!:any;
  chartPrev7days!:any;
  chartNext7days!:any;
  chartPrev24h!:any;
  chartNext24h!:any;
  timestampListProductionPrev24h!:any[];
  powerUsageListProductionPrev24h!:any[];
  chartProductionPrev24!:any;
  graphProduction24prev!:any;
  extractedDatesProductionPrevMonth:string[] = [];
  productionPrevMonthUser!:[];
  timeStampProductionPrevMonth = [];
  powerUsageProductionPrevMonth = [];
  chartProductionPrevMonth!:any;
  timeStrampProductionPrev7days = [];
  powerUsageProductionPrev7days = [];
  chartPrev7daysProduction!:any;
  extractedDatesProductionPrev7Days:string[]  = [];
  prodPrev7Days = [];
  timestampListProductionNext24h!:any[];
  powerUsageListProductionNext24h!:any[];
  chartProductionNext24!:any;
  graphProduction24next!:any;
  timeStrampProductionNext7days = [];
  powerUsageProductionNext7days = [];
  chartNext7daysProduction!:any;
  extractedDatesProductionNext7Days:string[] = [];
  prodNext7Days = [];
  extractedDatesProductionNextMonth:string[] = [];
  productionNextMonthUser!:[];
  timeStampProductionNextMonth = [];
  powerUsageProductionNextMonth = [];
  chartProdNextMonth!:any;
  data24h: any[]=[];
  dataMonth: any[]=[];
  data7days: any[]=[];
  dataNext24h: any[]=[];
  dataNextMonth: any[]=[];
  dataNext7days: any[]=[];
  public data24hProd: any[]=[];
  public dataMonthProd: any[]=[];
  public data7daysProd: any[]=[];
  dataNext24hProd: any[]=[];
  dataNextMonthProd: any[]=[];
  dataNext7daysProd: any[]=[];
  showPreviousMonth!:boolean;
  showPrevious7days!:boolean;
  showPrevious24h!:boolean;
  showNextMonth!:boolean;
  showNext24h!:boolean;
  showNext7days!:boolean;
  showProdPrevious24h!:boolean;
  showProdPreviousMonth!:boolean;
  showProdPrevious7days!:boolean;
  showProdNextMonth!:boolean;
  showProdNext24h!:boolean;
  showProdNext7days!:boolean;

  constructor(
		private auth : AuthService,
    private auth1 : AuthUserService,
    public dialog : MatDialog,
    private spinner: NgxSpinnerService

	){}

  @ViewChild('consumptionPrevMonthGraph') consumptionPrevMonthGraph!:ElementRef;
  @ViewChild('consumptionNextMonthGraph') consumptionNextMonthGraph!:ElementRef;
  @ViewChild('consumptionPrev7daysGraph') consumptionPrev7daysGraph!:ElementRef;
  @ViewChild('previous24ConsumptionGraph') previous24ConsumptionGraph!:ElementRef;
  @ViewChild('next24ConsumptionGraph') next24ConsumptionGraph!:ElementRef;
  @ViewChild('consumptionNext7daysGraph') consumptionNext7daysGraph!:ElementRef;
  @ViewChild('previous24ProductionGraph') previous24ProductionGraph!:ElementRef;
  @ViewChild('productionPrevMonthGraph') productionPrevMonthGraph!:ElementRef;
  @ViewChild('productionPrev7daysGraph')  productionPrev7daysGraph!:ElementRef;
  @ViewChild('next24ProductionGraph') next24ProductionGraph!:ElementRef;
  @ViewChild('productionNextMonthGraph') productionNextMonthGraph!:ElementRef;
  @ViewChild('productionNext7daysGraph')  productionNext7daysGraph!:ElementRef;
  @ViewChild('myTable') myTable!: ElementRef;
  @ViewChild('ModalTableComponentHistoryConsumption') modalTableComponentHistoryConsumption!: ModalTableComponent;
  @ViewChild('ModalTableComponentFutureConsumption') modalTableComponentFutureConsumption!: ModalTableComponent;
  @ViewChild('ModalTableComponentHistoryProduction') modalTableComponentHistoryProduction!: ModalTableComponent;
  @ViewChild('ModalTableComponentFutureProduction') modalTableComponentFutureProduction!: ModalTableComponent;

 // zelena, narandzasta, crvena, deep sky blue, zuta
 backgroundColorsGraphs =  ['#62C370', '#EC7357', '#e3170a', '#30C5FF', '#ffc800'];
 backgroundColorsRGB = ['rgb(98, 195, 112)','rgb(236, 115, 87)','rgb(227, 23, 10)', 'rgb(48, 197, 255)', 'rgb(255, 200, 0)'];
 backgroundColorsRGBA4 = ['rgba(98, 195, 112,0.4)','rgba(236, 115, 87,0.4)','rgba(227, 23, 10,0.4)', 'rgba(48, 197, 255,0.4)', 'rgba(255, 200, 0,0.4)'];
 backgroundColorsRGBA7 = ['rgba(98, 195, 112,0.7)','rgba(236, 115, 87,0.7)','rgba(227, 23, 10,0.7)', 'rgba(48, 197, 255,0.7)', 'rgba(255, 200, 0,0.7)'];


  ngAfterViewInit(): void {
  }


  ngOnInit(): void {
    this.getToken();

  }


  getToken(){
    this.token = this.auth.getToken();
    this.auth1.getThisUser(this.token).subscribe(
      (response :any)=>{
       this.userID = response.id;
       this.HistoryConsumption(this.selectedGraphHistoryConsumption, this.userID);
       this.FutureConsumption(this.selectedGraphFutureConsumption, this.userID);
       this.HistoryProduction(this.selectedGraphHistoryProduction, this.userID);
       this.FutureProduction(this.selectedGraphFutureProduction, this.userID);
      }

    )

  }



  selectedGraphHistoryConsumption = '24h';
  HistoryConsumption(graph: string, userID: any) {
  this.selectedGraphHistoryConsumption = graph;
  switch (graph) {
    case 'month':
      this.consumptionPrevMonth(userID);

    break;
    case '7days':
      this.consumptionPrev7Days(userID);
    break;
    case '24h':
      this.consumptionPrevious24h(userID);
    break;
  }
  }

  selectedGraphFutureConsumption = '24h';
  FutureConsumption(graph: string, userID: any) {
  this.selectedGraphFutureConsumption = graph;
  switch (graph) {
    case 'month':
      this.consumptionNextMonth(userID);
    break;
    case '7days':
      this.consumptionNext7Days(userID);
    break;
    case '24h':
      this.consumptionNext24h(userID);
    break;
  }
}

  selectedGraphHistoryProduction = '24h';
  HistoryProduction(graph: string, userID: any) {
  this.selectedGraphHistoryProduction = graph;
  switch (graph) {
    case 'month':
      this.productionPrevMonth(userID);

    break;
    case '7days':
      this.productionPrev7Days(userID);
    break;
    case '24h':
      this.productionPrevious24h(userID);
    break;
  }
  }



  selectedGraphFutureProduction = '24h';
  FutureProduction(graph: string, userID: any) {
  this.selectedGraphFutureProduction = graph;
  switch (graph) {
    case 'month':
      this.productionNextMonth(userID);
    break;
    case '7days':
      this.productionNext7Days(userID);
    break;
    case '24h':
      this.productionNext24h(userID);
    break;
  }
  }






  consumptionPrevious24h(id:any)
  {
    this.timestampListPrev24h=[];
    this.powerUsageListPrev24h=[];
    this.spinner.show();
    this.showPrevious24h = true;
    this.auth1.getConsumptionPrevious24Hours(id).subscribe(
      (response : any) => {
        this.consumption24prev = response[0]['timestampPowerPairs'];
        this.makeData(this.consumption24prev);
        this.previous24Graph();
        this.spinner.hide();
        this.showPrevious24h = false;
      }
     );
  }

  makeData(dataGraph:any){
    this.timestampListPrev24h = [];
    this.powerUsageListPrev24h = [];

    for(let i = 0; i < dataGraph.length; i++){
      const date = new Date(this.consumption24prev[i]['timestamp']);
      const hour = date.getUTCHours().toString().padStart(2,"0");
      const minute = date.getUTCMinutes().toString().padStart(2, "0");
      const stringHourMinute = hour+":"+minute;
      this.timestampListPrev24h.push(stringHourMinute);
      this.powerUsageListPrev24h.push(this.consumption24prev[i]['powerUsage']);
      }



    this.data24h=[];
    for (let i = 0; i < this.timestampListPrev24h.length; i++) {
      const pair = {
        timestamp: this.timestampListPrev24h[i],
        powerUsage: this.powerUsageListPrev24h[i]
      };
      this.data24h.push(pair);
    }


  }

  previous24Graph(){
    if (this.previous24ConsumptionGraph){

      if (this.chartPrev24h) {
        this.chartPrev24h.destroy();
      }

    const data = {
      labels: this.timestampListPrev24h,
      datasets: [{
        label: 'Consumption For The Previous 24h',
        data: this.powerUsageListPrev24h,
        fill: true,
        borderColor: this.backgroundColorsGraphs[1],
        backgroundColor:this.backgroundColorsRGBA4[1],
        pointBackgroundColor: this.backgroundColorsRGBA7[1],
        borderWidth: 1,
        pointBorderColor:this.backgroundColorsRGB[1],
        pointStyle: 'circle',
				pointRadius: 3,
				pointHoverRadius: 5
      }]
    }
    const options: ChartOptions = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time [h]',
          },
          ticks: {
            font: {
              size: 12,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Energy Consumption [kWh]',
            font:{
              size: 10,
            }
          },
          ticks: {
            font: {
              size: 9,
            },
          },
        },
      },
    };
    this.chartPrev24h = new Chart(this.previous24ConsumptionGraph.nativeElement, {
      type: 'line',
      data: data,
      options: options,
    });
  }
}


  consumptionNext24h(id:any)
  {
    this.spinner.show();
    this.showNext24h = true;
    this.auth1.getConsumptionNext24Hours(id).subscribe(
      (response : any) => {
        this.consumption24next = response[0]['timestampPowerPairs'];
        this.makeDataNext24h(this.consumption24next);
        this.spinner.hide();
        this.showNext24h = false;
      }
     );
  }

  makeDataNext24h(dataGraph:any){
    this.timestampListNext24h=[];
    this.powerUsageListNext24h=[];
    for(let i = 0; i < dataGraph.length; i++){
      const date = new Date(this.consumption24next[i]['timestamp']);
      const hour = date.getUTCHours().toString().padStart(2,"0");
      const minute = date.getUTCMinutes().toString().padStart(2, "0");
      const stringHourMinute = hour+":"+minute;
      this.timestampListNext24h.push(stringHourMinute);
      this.powerUsageListNext24h.push(this.consumption24next[i]['powerUsage']);
      }


    this.dataNext24h=[];
    for (let i = 0; i < this.timestampListNext24h.length; i++) {
      const pair = {
        timestamp: this.timestampListNext24h[i],
        powerUsage: this.powerUsageListNext24h[i]
      };
      this.dataNext24h.push(pair);
    }


    this.next24Graph(this.timestampListNext24h, this.powerUsageListNext24h);
  }

  next24Graph(list:any, valueList:any){
    if (this.next24ConsumptionGraph){

      if (this.chartNext24h) {
        this.chartNext24h.destroy();
      }
    const data = {
      labels: list,
      datasets: [{
        label: 'Consumption For The Next 24h',
        data: valueList,
        fill:true,
        borderColor: this.backgroundColorsGraphs[3],
        backgroundColor:this.backgroundColorsRGBA4[3],
        pointBackgroundColor: this.backgroundColorsRGBA7[3],
        borderWidth: 1,
        pointBorderColor:this.backgroundColorsRGB[3],
        pointStyle: 'circle',
				pointRadius: 3,
				pointHoverRadius: 5,
      }]
    }
    const options: ChartOptions = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time [h]',
          },
          ticks: {
            font: {
              size: 12,
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
              size: 9,
            },
          },
        },
      },
    };
    this.chartNext24h= new Chart(this.next24ConsumptionGraph.nativeElement, {
      type: 'line',
      data: data,
      options: options,
    });
  }

  }

  consumptionPrevMonth(id:any)
  {
    this.timeStampConsumption = [];
    this.powerUsageConsumption = [];
    this.showPreviousMonth = true;
    this.spinner.show();

    this.auth1.getConsumptionPrevMonth(id).subscribe(
      {
        next: (response : any) => {
          this.consumptionPrevMonthUser = response[0]['timestampPowerPairs'];


          for(let i = 0; i < this.consumptionPrevMonthUser.length; i++){
            this.timeStampConsumption.push(this.consumptionPrevMonthUser[i]['timestamp']);
            this.powerUsageConsumption.push(this.consumptionPrevMonthUser[i]['powerUsage']);
          }

            this.chartConsumptionPrevMonth();

            this.spinner.hide();
            this.showPreviousMonth = false;

          },
        error: (err : any) => {
          console.log("GRESKA." + err);
          this.spinner.hide();
          this.showPreviousMonth = false;
        }
      }
    );


  }

  chartConsumptionPrevMonth(){
    this.extractedDatesPrevMonth = [];
    for(let i = 0; i < this.timeStampConsumption.length; i++){
      const date = new Date(this.timeStampConsumption[i]);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();
     const dateString = `${month} ${day}`;
     this.extractedDatesPrevMonth.push(dateString);

    }

    this.extractedDatesPrevMonth.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    this.dataMonth=[];
    for (let i = 0; i < this.extractedDatesPrevMonth.length; i++) {
      const pair = {
        timestamp: this.extractedDatesPrevMonth[i],
        powerUsage: this.powerUsageConsumption[i]
      };
      this.dataMonth.push(pair);
    }

    if (this.consumptionPrevMonthGraph){

      if (this.chartPrevMonth) {
        this.chartPrevMonth.destroy();
      }

    const data = {
      labels: this.extractedDatesPrevMonth,
      datasets: [{
        label: 'Consumption For The Previous Month',
        data: this.powerUsageConsumption,
        fill:true,
        borderColor: this.backgroundColorsGraphs[1],
        backgroundColor:this.backgroundColorsRGBA4[1],
        pointBackgroundColor: this.backgroundColorsRGBA7[1],
        borderWidth: 1,
        pointBorderColor:this.backgroundColorsRGB[1],
        pointStyle: 'circle',
				pointRadius: 3,
				pointHoverRadius: 5
      }]
    }
    const options: ChartOptions = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date ',
          },
          ticks: {
            font: {
              size: 10,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Energy Consumption [kWh]',
            font: {
            size: 9,
          },
          },
          ticks: {
            font: {
              size: 9,
            },
          },
        },
      },
    };
    this.chartPrevMonth = new Chart(this.consumptionPrevMonthGraph.nativeElement, {
      type: 'line',
      data: data,
      options: options,
    });
  }
}

  consumptionNextMonth(id:any)
  {
    this.timeStampConsumptionNextMonth = [];
    this.powerUsageConsumptionNextMonth = [];
    this.spinner.show();
    this.showNextMonth = true;
        this.auth1.getConsumptionNextMonth(id).subscribe(
          {
            next: (response:any) => {
              this.consumptionNextMonthUser = response[0]['timestampPowerPairs'];
              for(let i = 0; i < this.consumptionNextMonthUser.length; i++){
                this.timeStampConsumptionNextMonth.push(this.consumptionNextMonthUser[i]['timestamp']);
                this.powerUsageConsumptionNextMonth.push(this.consumptionNextMonthUser[i]['powerUsage']);

              }
                this.chartConsumptionNextMonthChart();
                this.spinner.hide();
                this.showNextMonth = false;

            },
            error : (err : any) => {
              console.log(err);
              this.spinner.hide();
              this.showNextMonth = false;
            }
          })
  }

  chartConsumptionNextMonthChart(){
    this.extractedDatesNextMonth = [];
    for(let i = 0; i < this.timeStampConsumptionNextMonth.length; i++){
      const date = new Date(this.timeStampConsumptionNextMonth[i]);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();
      const dateString = ''+ month + ' ' + day;
      this.extractedDatesNextMonth.push(dateString);
    }

    this.extractedDatesNextMonth.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    this.dataNextMonth=[];
    for (let i = 0; i < this.extractedDatesNextMonth.length; i++) {
      const pair = {
        timestamp: this.extractedDatesNextMonth[i],
        powerUsage: this.powerUsageConsumptionNextMonth[i]
      };
      this.dataNextMonth.push(pair);
    }


    if (this.consumptionNextMonthGraph){

      if (this.chartNextMonth) {
        this.chartNextMonth.destroy();
      }
    const data = {
      labels: this.extractedDatesNextMonth,
      datasets: [{
        label: 'Consumption For The Next Month',
        data: this.powerUsageConsumptionNextMonth,
        fill:true,
        borderColor: this.backgroundColorsGraphs[3],
        backgroundColor:this.backgroundColorsRGBA4[3],
        pointBackgroundColor: this.backgroundColorsRGBA7[3],
        borderWidth: 1,
        pointBorderColor:this.backgroundColorsRGB[3],
        pointStyle: 'circle',
				pointRadius: 3,
				pointHoverRadius: 5,
      }]
    }
    const options: ChartOptions = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date ',
          },
          ticks: {
            font: {
              size: 10,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Energy Consumption [kWh]',
            font: {
            size: 9,
          },
          },
          ticks: {
            font: {
              size: 9,
            },
          },
        },
      },
    };
    this.chartNextMonth= new Chart(this.consumptionNextMonthGraph.nativeElement, {
      type: 'line',
      data: data,
      options: options,
    });
  }
  }


  consumptionPrev7Days(id : any){
    this.spinner.show();
    this.showPrevious7days = true;
    this.auth1.getConsumptionPrev7days(id).subscribe({
      next:(response : any) => {
        this.consPrev7Days = response[0]['timestampPowerPairs'];
        this.makeDataGraphPrev7DaysConsumption(this.consPrev7Days);
        this.chartConsumptionPrev7Days();
        this.spinner.hide();
        this.showPrevious7days = false;
      },
      error : (err : any) => {
        console.log("error consumption previous 7 days");
        this.spinner.hide();
        this.showPrevious7days = false;
      }
    })
  }


  makeDataGraphPrev7DaysConsumption(dataGraph : any){
    this.timeStrampConsumptionPrev7days = [];
    this.powerUsageConsumptionPrev7days = [];
    for(let i = 0; i < dataGraph.length; i++){
      this.timeStrampConsumptionPrev7days.push(this.consPrev7Days[i]['timestamp']);
      this.powerUsageConsumptionPrev7days.push(this.consPrev7Days[i]['powerUsage']);
    }
  }

  chartConsumptionPrev7Days(){
    this.extractedDatesPrev7Days = [];
    for(let i = 0; i < this.timeStrampConsumptionPrev7days.length; i++){
     const date = new Date(this.timeStrampConsumptionPrev7days[i]);
     const day = date.toLocaleString("default", { weekday: "long" });
     const dateString = `${day}`;
     this.extractedDatesPrev7Days.push(dateString);

    }

    this.extractedDatesPrev7Days.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    this.data7days = [];
    for (let i = 0; i < this.extractedDatesPrev7Days.length; i++) {
      const pair = {
        timestamp: this.extractedDatesPrev7Days[i],
        powerUsage: this.powerUsageConsumptionPrev7days[i]
      };
      this.data7days.push(pair);
    }

    if (this.consumptionPrev7daysGraph){

      if (this.chartPrev7days) {
        this.chartPrev7days.destroy();
      }

    const data = {
      labels: this.extractedDatesPrev7Days,
      datasets: [{
        label: 'Consumption For The Previous 7 days',
        data: this.powerUsageConsumptionPrev7days,
        fill: true,
        borderColor: this.backgroundColorsGraphs[1],
        backgroundColor: this.backgroundColorsRGBA4[1],
        pointBackgroundColor: 	this.backgroundColorsRGBA7[1],
        borderWidth: 2,
        pointBorderColor:this.backgroundColorsGraphs[1],
        borderRadius: 5,
        borderSkipped: false

      }]
    }

      this.chartPrev7days= new Chart(this.consumptionPrev7daysGraph.nativeElement, {
        type: 'bar',
        data: data,
        options: {
          scales: {
            y: {
              title: {
                display: true,
                text: 'Energy Consumption [kWh]',
                font: {
                  size: 9,
                },
              }
            }
          }
        }
      });
  }
  }

  consumptionNext7Days(id : any){
    this.spinner.show();
    this.showNext7days = true;
    this.auth1.getConsumptionNext7days(id).subscribe({
      next:(response : any) => {
        this.consNext7Days = response[0]['timestampPowerPairs'];
        this.makeDataGraphNext7DaysConsumption(this.consNext7Days);
        this.chartConsumptionNext7Days();
        this.spinner.hide();
        this.showNext7days = false;
      },
      error : (err : any) => {
        console.log("error consumption next 7 days " + err);
        this.spinner.hide();
        this.showNext7days = false;
      }
    })
  }

  makeDataGraphNext7DaysConsumption(dataGraph : any){
    this.timeStrampConsumptionNext7days = [];
    this.powerUsageConsumptionNext7days = [];
    for(let i = 0; i < dataGraph.length; i++){
      this.timeStrampConsumptionNext7days.push(this.consNext7Days[i]['timestamp']);
      this.powerUsageConsumptionNext7days.push(this.consNext7Days[i]['powerUsage']);
    }
  }

  chartConsumptionNext7Days(){
    this.extractedDatesNext7Days = [];
    for(let i = 0; i < this.timeStrampConsumptionNext7days.length; i++){
      const date = new Date(this.timeStrampConsumptionNext7days[i]);
      const day = date.toLocaleString("default", { weekday: "long" });
      const dateString = `${day}`;
      this.extractedDatesNext7Days.push(dateString);

    }

    this.extractedDatesNext7Days.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    this.dataNext7days = [];
    for (let i = 0; i < this.extractedDatesNext7Days.length; i++) {
      const pair = {
        timestamp: this.extractedDatesNext7Days[i],
        powerUsage: this.powerUsageConsumptionNext7days[i]
      };
      this.dataNext7days.push(pair);
    }

    if (this.consumptionNext7daysGraph){

      if (this.chartNext7days) {
        this.chartNext7days.destroy();
      }
    const data = {
      labels: this.extractedDatesNext7Days,
      datasets: [{
        label: 'Consumption For The Next 7 days',
        data: this.powerUsageConsumptionNext7days,
        fill: true,
        borderColor: this.backgroundColorsGraphs[3],
        backgroundColor: this.backgroundColorsRGBA4[3],
        pointBackgroundColor: 	this.backgroundColorsRGBA7[3],
        borderWidth: 2,
        pointBorderColor:this.backgroundColorsGraphs[3],
        borderRadius: 5,
        borderSkipped: false

      }]
    }


      this.chartNext7days = new Chart(this.consumptionNext7daysGraph.nativeElement, {
        type: 'bar',
        data: data,
        options: {
          scales: {
            y: {
              title: {
                display: true,
                text: 'Energy Consumption [kWh]',
                font: {
                  size: 9,
                },
              }
            }
          }
        }
      });
  }

}

productionPrevious24h(id:any)
{
  this.timestampListProductionPrev24h=[];
  this.powerUsageListProductionPrev24h=[];
  this.spinner.show();
  this.showProdPrevious24h = true;
  this.auth1.getProductionPrevious24Hours(id).subscribe(
    (response : any) => {
      this.graphProduction24prev = response[0]['timestampPowerPairs'];;
      this.makeDataProduction24(this.graphProduction24prev);
      this.spinner.hide();
      this.showProdPrevious24h = false;
    }
   );
}

makeDataProduction24(dataGraph:any){
  for(let i = 0; i < dataGraph.length; i++){
    const date = new Date(this.graphProduction24prev[i]['timestamp']);
    const hour = date.getUTCHours().toString().padStart(2,"0");
    const minute = date.getUTCMinutes().toString().padStart(2, "0");
    const stringHourMinute = hour+":"+minute;
    this.timestampListProductionPrev24h.push(stringHourMinute);
    this.powerUsageListProductionPrev24h.push(this.graphProduction24prev[i]['powerUsage']);
    }



  this.data24hProd=[];
  for (let i = 0; i < this.timestampListProductionPrev24h.length; i++) {
    const pair = {
      timestamp: this.timestampListProductionPrev24h[i],
      powerUsage: this.powerUsageListProductionPrev24h[i]
    };
    this.data24hProd.push(pair);

  }

  this.previousProduction24Graph(this.timestampListProductionPrev24h, this.powerUsageListProductionPrev24h);
}

previousProduction24Graph(list:any, valueList:any){
  if (this.previous24ProductionGraph){

    if (this.chartProductionPrev24) {
      this.chartProductionPrev24.destroy();
    }

  const data = {
    labels: list,
    datasets: [{
      label: 'Production For The Previous 24h',
      data: valueList,
      fill: true,
      borderColor: this.backgroundColorsGraphs[4],
      backgroundColor: this.backgroundColorsRGBA4[4],
      pointBackgroundColor: 	this.backgroundColorsRGBA7[4],
      borderWidth: 1,
      pointBorderColor:this.backgroundColorsGraphs[4],
      pointStyle: 'circle',
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  }
  const options: ChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time [h]',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Energy Production [kWh]',
          font:{
            size: 10,
          }
        },
        ticks: {
          font: {
            size: 9,
          },
        },
      },
    },
  };
  this.chartProductionPrev24 = new Chart(this.previous24ProductionGraph.nativeElement, {
    type: 'line',
    data: data,
    options: options,
  });
}
}


productionPrevMonth(id:any)
{
  this.timeStampProductionPrevMonth = [];
  this.powerUsageProductionPrevMonth = [];
  this.spinner.show();
  this.showProdPreviousMonth = true;
  this.auth1.getProductionPrevMonth(id).subscribe(
    {
      next: (response : any) => {
        this.productionPrevMonthUser = response[0]['timestampPowerPairs'];


        for(let i = 0; i < this.productionPrevMonthUser.length; i++){
          this.timeStampProductionPrevMonth.push(this.productionPrevMonthUser[i]['timestamp']);
          this.powerUsageProductionPrevMonth.push(this.productionPrevMonthUser[i]['powerUsage']);
        }

          this.chartProductionPreviousMonth();
          this.spinner.hide();
          this.showProdPreviousMonth = false;

        },
        error: (err : any) => {
        console.log("GRESKA." + err);
        this.spinner.hide();
        this.showProdPreviousMonth = false;
      }
    }
  );
}

chartProductionPreviousMonth(){
  this.extractedDatesProductionPrevMonth = [];
  for(let i = 0; i < this.timeStampProductionPrevMonth.length; i++){
    const date = new Date(this.timeStampProductionPrevMonth[i]);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();
      const dateString = `${month} ${day}`;
      this.extractedDatesProductionPrevMonth.push(dateString);

  }

  this.extractedDatesProductionPrevMonth.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  this.dataMonthProd=[];
    for (let i = 0; i < this.extractedDatesProductionPrevMonth.length; i++) {
      const pair = {
        timestamp: this.extractedDatesProductionPrevMonth[i],
        powerUsage: this.powerUsageProductionPrevMonth[i]
    };
    this.dataMonthProd.push(pair);
  }

  if (this.productionPrevMonthGraph){

    if (this.chartProductionPrevMonth) {
      this.chartProductionPrevMonth.destroy();
    }

  const data = {
    labels: this.extractedDatesProductionPrevMonth,
    datasets: [{
      label: 'Production For The Previous Month',
      data: this.powerUsageProductionPrevMonth,
      fill: true,
      borderColor: this.backgroundColorsGraphs[4],
      backgroundColor: this.backgroundColorsRGBA4[4],
      pointBackgroundColor: 	this.backgroundColorsRGBA7[4],
      borderWidth: 1,
      pointBorderColor:this.backgroundColorsGraphs[4],
      pointStyle: 'circle',
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  }
  const options: ChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date ',
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Energy Production [kWh]',
          font: {
            size: 9,
          }
        },
        ticks: {
          font: {
            size: 9,
          },
        },
      },
    },
  };
  this.chartProductionPrevMonth = new Chart(this.productionPrevMonthGraph.nativeElement, {
    type: 'line',
    data: data,
    options: options,
  });
}
}

productionPrev7Days(id : any){
  this.spinner.show();
  this.showProdPrevious7days = true;
  this.auth1.getProductionPrev7days(id).subscribe({
    next:(response : any) => {
      this.prodPrev7Days = response[0]['timestampPowerPairs'];
      this.makeDataGraphPrev7DaysProduction(this.prodPrev7Days);
      this.chartProductionPrev7Days();
      this.spinner.hide();
      this.showProdPrevious7days = false;
    },
    error : (err : any) => {
      console.log("error production previous 7 days");
      this.spinner.hide();
      this.showProdPrevious7days = false;
    }
  })
}


makeDataGraphPrev7DaysProduction(dataGraph : any){
  this.timeStrampProductionPrev7days = [];
  this.powerUsageProductionPrev7days = [];
  for(let i = 0; i < dataGraph.length; i++){
    this.timeStrampProductionPrev7days.push(this.prodPrev7Days[i]['timestamp']);
    this.powerUsageProductionPrev7days.push(this.prodPrev7Days[i]['powerUsage']);
  }
}

chartProductionPrev7Days(){
  this.extractedDatesProductionPrev7Days = [];
  for(let i = 0; i < this.timeStrampProductionPrev7days.length; i++){
    const date = new Date(this.timeStrampProductionPrev7days[i]);
    const day = date.toLocaleString("default", { weekday: "long" });
    const dateString = `${day}`;
    this.extractedDatesProductionPrev7Days.push(dateString);

  }

  this.extractedDatesProductionPrev7Days.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  this.data7daysProd = [];
    for (let i = 0; i < this.extractedDatesProductionPrev7Days.length; i++) {
      const pair = {
        timestamp: this.extractedDatesProductionPrev7Days[i],
        powerUsage: this.powerUsageProductionPrev7days[i]
      };
      this.data7daysProd.push(pair);
  }

  if (this.productionPrev7daysGraph){

    if (this.chartPrev7daysProduction) {
      this.chartPrev7daysProduction.destroy();
    }

  const data = {
      labels: this.extractedDatesProductionPrev7Days,
      datasets: [{
      label: 'Production For The Previous 7 days',
      data: this.powerUsageProductionPrev7days,
      fill: true,
      borderColor: this.backgroundColorsGraphs[4],
      backgroundColor: this.backgroundColorsRGBA4[4],
      pointBackgroundColor: 	this.backgroundColorsRGBA7[4],
      borderWidth: 2,
      pointBorderColor:this.backgroundColorsGraphs[4],
      borderRadius: 5,
      borderSkipped: false,

    }]
  }

    this.chartPrev7daysProduction= new Chart(this.productionPrev7daysGraph.nativeElement, {
      type: 'bar',
      data: data,
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: 'Energy Production [kWh]',
              font: {
                size: 9,
              },
            }
          }
        }
      }
    });
}
}

productionNext24h(id:any)
{
  this.spinner.show();
  this.showProdNext24h = true;
  this.auth1.getProductionNext24Hours(id).subscribe(
    (response : any) => {
      this.graphProduction24next = response[0]['timestampPowerPairs'];;
      this.makeDataProductionNext24(this.graphProduction24next);
      this.spinner.hide();
      this.showProdNext24h = false;
    }
   );
}

makeDataProductionNext24(dataGraph:any){
  this.timestampListProductionNext24h=[];
  this.powerUsageListProductionNext24h=[];
  for(let i = 0; i < dataGraph.length; i++){
    const date = new Date(this.graphProduction24next[i]['timestamp']);
    const hour = date.getUTCHours().toString().padStart(2,"0");
    const minute = date.getUTCMinutes().toString().padStart(2, "0");
    const stringHourMinute = hour+":"+minute;
    this.timestampListProductionNext24h.push(stringHourMinute);
    this.powerUsageListProductionNext24h.push(this.graphProduction24next[i]['powerUsage']);
    }


  this.dataNext24hProd=[];
  for (let i = 0; i < this.timestampListProductionNext24h.length; i++) {
    const pair = {
      timestamp: this.timestampListProductionNext24h[i],
      powerUsage: this.powerUsageListProductionNext24h[i]
    };
    this.dataNext24hProd.push(pair);
  }


  this.nextProduction24Graph(this.timestampListProductionNext24h, this.powerUsageListProductionNext24h);
}

nextProduction24Graph(list:any, valueList:any){
  if (this.next24ProductionGraph){

    if (this.chartProductionNext24) {
      this.chartProductionNext24.destroy();
    }

  const data = {
    labels: list,
    datasets: [{
      label: 'Production For The Next 24h',
      data: valueList,
      fill: true,
      borderColor: this.backgroundColorsGraphs[0],
      backgroundColor: this.backgroundColorsRGBA4[0],
      pointBackgroundColor: 	this.backgroundColorsRGBA7[0],
      borderWidth: 1,
      pointBorderColor:this.backgroundColorsGraphs[0],
      pointStyle: 'circle',
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  }
  const options: ChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time [h]',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Energy Production [kWh]',
          font:{
            size: 10,
          }
        },
        ticks: {
          font: {
            size: 9,
          },
        },
      },
    },
  };
  this.chartProductionNext24 = new Chart(this.next24ProductionGraph.nativeElement, {
    type: 'line',
    data: data,
    options: options,
  });
}
}

productionNext7Days(id : any){
  this.spinner.show();
  this.showProdNext7days = false;
  this.auth1.getProductionNext7days(id).subscribe({
    next:(response : any) => {
      this.prodNext7Days = response[0]['timestampPowerPairs'];
      this.makeDataGraphNext7DaysProduction(this.prodNext7Days);
      this.chartProductionNext7Days();
      this.spinner.hide();
      this.showProdNext7days = false;
    },
    error : (err : any) => {
      console.log("error production next 7 days" + err);
    }
  })
}


makeDataGraphNext7DaysProduction(dataGraph : any){
  this.timeStrampProductionNext7days = [];
  this.powerUsageProductionNext7days = [];
  for(let i = 0; i < dataGraph.length; i++){
    this.timeStrampProductionNext7days.push(this.prodNext7Days[i]['timestamp']);
    this.powerUsageProductionNext7days.push(this.prodNext7Days[i]['powerUsage']);
  }
}

chartProductionNext7Days(){
  this.extractedDatesProductionNext7Days = [];
  for(let i = 0; i < this.timeStrampProductionNext7days.length; i++){
    const date = new Date(this.timeStrampProductionNext7days[i]);
    const day = date.toLocaleString("default", { weekday: "long" });
    const dateString = `${day}`;
    this.extractedDatesProductionNext7Days.push(dateString);

  }

  this.extractedDatesProductionNext7Days.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  this.dataNext7daysProd = [];
  for (let i = 0; i < this.extractedDatesProductionNext7Days.length; i++) {
    const pair = {
      timestamp: this.extractedDatesProductionNext7Days[i],
      powerUsage: this.powerUsageProductionNext7days[i]
    };
    this.dataNext7daysProd.push(pair);
  }


  if (this.productionNext7daysGraph){

    if (this.chartNext7daysProduction) {
      this.chartNext7daysProduction.destroy();
    }

  const data = {
    labels: this.extractedDatesProductionNext7Days,
    datasets: [{
      label: 'Production For The Next 7 days',
      data: this.powerUsageProductionNext7days,
      fill: true,
      borderColor: this.backgroundColorsGraphs[0],
      backgroundColor: this.backgroundColorsRGBA4[0],
      pointBackgroundColor: 	this.backgroundColorsRGBA7[0],
      borderWidth: 2,
      pointBorderColor:this.backgroundColorsGraphs[0],
      borderRadius: 5,
      borderSkipped: false

    }]
  }

    this.chartNext7daysProduction= new Chart(this.productionNext7daysGraph.nativeElement, {
      type: 'bar',
      data: data,
      options: {
        scales: {
          y: {
            title: {
              display: true,
              text: 'Energy Production [kWh]',
              font: {
                size: 9,
              },
            }
          }
        }
      }
    });
}
}


productionNextMonth(id:any)
{
  this.timeStampProductionNextMonth = [];
  this.powerUsageProductionNextMonth = [];
  this.spinner.show();
  this.showProdNextMonth = true;
  this.auth1.getProductionNextMonth(id).subscribe(
    {
      next: (response : any) => {
        this.productionNextMonthUser = response[0]['timestampPowerPairs'];


        for(let i = 0; i < this.productionNextMonthUser.length; i++){
          this.timeStampProductionNextMonth.push(this.productionNextMonthUser[i]['timestamp']);
          this.powerUsageProductionNextMonth.push(this.productionNextMonthUser[i]['powerUsage']);
        }

          this.chartProductionNextMonth();
          this.spinner.hide();
          this.showProdNextMonth = false;

        },
      error: () => {
        this.spinner.hide();
        this.showProdNextMonth = false;
      }
    }
  );
}

chartProductionNextMonth(){
  this.extractedDatesProductionNextMonth = [];
  for(let i = 0; i < this.timeStampProductionNextMonth.length; i++){
    const date = new Date(this.timeStampProductionNextMonth[i]);
      const month = date.toLocaleString("default", { month: "long" });
      const day = date.getDate().toString();
      const dateString = `${month} ${day}`;
     this.extractedDatesProductionNextMonth.push(dateString);

  }

  this.extractedDatesProductionNextMonth.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  this.dataNextMonthProd=[];
    for (let i = 0; i < this.extractedDatesProductionNextMonth.length; i++) {
      const pair = {
        timestamp: this.extractedDatesProductionNextMonth[i],
        powerUsage: this.powerUsageProductionNextMonth[i]
      };
      this.dataNextMonthProd.push(pair);
    }

  if (this.productionNextMonthGraph){

    if (this.chartProdNextMonth) {
      this.chartProdNextMonth.destroy();
    }

  const data = {
    labels: this.extractedDatesProductionNextMonth,
    datasets: [{
      label: 'Production For The Next Month',
      data: this.powerUsageProductionNextMonth,
      fill: true,
      borderColor: this.backgroundColorsGraphs[0],
      backgroundColor: this.backgroundColorsRGBA4[0],
      pointBackgroundColor: 	this.backgroundColorsRGBA7[0],
      borderWidth: 1,
      pointBorderColor:this.backgroundColorsGraphs[0],
      pointStyle: 'circle',
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  }
  const options: ChartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date ',
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Energy Production [kWh]',
          font: {
            size: 9,
          },
        },
        ticks: {
          font: {
            size: 9,
          },
        },
      },
    },
  };
  this.chartProdNextMonth = new Chart(this.productionNextMonthGraph.nativeElement, {
    type: 'line',
    data: data,
    options: options,
  });
}
}

}

