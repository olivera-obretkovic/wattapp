import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { deviceGroup, deviceGroupManifacturers, deviceManifacturers, deviceTypeInformation, eachDevice } from 'models/Devices';
import { AuthService } from 'service/auth.service';
import { Chart } from 'chart.js';
import { ChartOptions } from 'chart.js';
import { User } from 'models/User';
import { Root } from 'models/weather';
import { Subscription, map, timer } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit{
	// zelena, narandzasta, crvena, deep sky blue, zuta
	backgroundColorsGraphs =  ['#62C370', '#EC7357', '#e3170a', '#30C5FF', '#ffc800'];
	backgroundColorsRGB = ['rgb(98, 195, 112)','rgb(236, 115, 87)','rgb(227, 23, 10)', 'rgb(48, 197, 255)', 'rgb(255, 200, 0)'];
	backgroundColorsRGBA4 = ['rgba(98, 195, 112,0.4)','rgba(236, 115, 87,0.4)','rgba(227, 23, 10,0.4)', 'rgba(48, 197, 255,0.4)', 'rgba(255, 200, 0,0.4)'];
	backgroundColorsRGBA7 = ['rgba(98, 195, 112,0.7)','rgba(236, 115, 87,0.7)','rgba(227, 23, 10,0.7)', 'rgba(48, 197, 255,0.7)', 'rgba(255, 200, 0,0.7)'];

	public selectedGraph = 'current';
	public lengthProducers!:any;
	public lengthConsumers!:any;
	public lengthStorage!:any;

	//  --- weater ---
	public timezone!:any;
	public temperature!:any;
	public maxTemperature!:any;
	public minTemperature!:any;
	public windSpeed!:any;
	public humidity!:any;

	currentDate: any;
	summarySavedEnergy: any;
	showProdPrevious24h!: boolean;
	chartPrev7days: any;
	chartPrevMonth: any;


	// users
	totalUsers!: number;
	User! : User[];

// devices
	deviceGroup!: deviceGroup[];
	deviceManifaturers!: deviceManifacturers[];
	deviceManifacturersByGroupID!: deviceGroupManifacturers[];
	deviceGroupByGroupID!: deviceGroupManifacturers[];
	deviceTypeINFO!: deviceTypeInformation[];
	producers!: deviceGroupManifacturers[];
	consumers! : deviceGroupManifacturers[];
	storage!: deviceGroupManifacturers[];

	total!: number;


// consumption
	public currentConsumptionSys!:any;
	prevMonthConsumptionSys!:any;
	nextMonthConsumptionSys!:any;
	prevMonthEachDeviceConsumption!: eachDevice[];
	nextMonthEachDeviceConsumption!: eachDevice[];

// production
	currentProductionSys!:any;
	public prevMonthProductionSys!: any;
	nextMonthProductionSys!:any;
	prevMonextMonthConsumptionSys!:any;

// weather
	weather!:Root;
	today!:Date;
	dateForWeater!:any;
	currHour!:number;

	MonthPrev!:Date;
	MonthNext!:Date;
	next!:any;
	month!:any;


	public razlikaConsumption!:any;
	public razlikaProduction!:any;

	public savedC!:any;
	public savedP!:any;

	currentDataC!:[];
	currentDataP!:[];


	chartInstance!: Chart;
	subscription!: Subscription;

	timestampCurrentConsumptionDay!: string[];
	powerusageCurrentConsumptionDay!:any;
	stringsCurrDayC!:string[];
	currentConsumptionDayLoader:boolean = false;
	public text = " more then previous hour";

	data24hHistory: any[] = [];
  	data7daysHistory:any[] = [];
	dataMonthHistory:any[] = [];
	data24Future:any[] = [];
	data7daysFuture:any[] = [];
	dataMonthFuture:any[] = [];
  	dataConsumptionProduction:any[] = [];

	// loaders
	weatherLoader!:boolean;
	currentConsumptionSystemLoader:boolean = false;
	consumptionPrevMonthSystemLoader:boolean = false;
	consumptionNextMonthSystemLoader:boolean = false;

	productionCurrentSystemLoader:boolean = false;
	productionPrevMonthSystemLoader:boolean = false;
	productionNextMonthSystemLoader: boolean =false;

	currentProductionDayLoader : boolean = false;

	consumptionPrev24hLoader:boolean = false;
	productionPrev24hLoader:boolean = false;
	consumptionPrev7DaysLoader:boolean = false;
	productionPrev7DaysLoader:boolean = false;
	consumptionPrevMonthLoader:boolean = false;
	consumptionNext24hLoader:boolean = false;
	consumptionNext7DaysLoader:boolean = false;
	consumptionNextMonthLoader: boolean = false;
	productionNext24hLoader:boolean = false;
	productionNext7DaysLoader:boolean = false;
	productionNextMonthLoader:boolean = false;
	constructor(
		private auth : AuthService,
		private spinner: NgxSpinnerService,
		public dialog: MatDialog
	){}
	selectedGraphHistoryConsumption = '24h';
	selectedGraphFutureConsumption = '24h';
	ngOnInit(): void {

		this.giveMeWeather();
		this.getAllUserInfo();
		this.allDevices();
		this.getDate();
		this.getNumberOfUsers();
		this.getDeviceGroup();
		this.HistoryConsumption(this.selectedGraphHistoryConsumption);
		this.FutureConsumption(this.selectedGraphFutureConsumption);
		this.displayGraphConsumption(this.selectedGraph);
		this.displayGraphProduction(this.selectedGraph);
		this.currentProductionDay();
		setTimeout(() => {
			this.currentConsumptionDay();
		  }, 5000);
		this.differenceForPreviousHour();
	}

	ngAfterViewInit(): void {
		this.productionNextMonth();
		this.productionNext7Days();
		this.productionPrev24h();
		this.productionNext24h();
		this.productionPrev7Days();
		this.productionPreviousMonth();
		this.giveMeChartForTemperatureDaily();
		//this.lineChartConsumptionProduction(this.powerusageCurrentDayProduction, this.powerusageCurrentConsumptionDay, this.timestampCurrentConsumptionDay);
		//this.previous24Graph(this.powerUsageListPrev24hConsumption, this.timestampListPrev24hConsumption, this.powerUsageListPrev24hProduction);
		this.next24Graph(this.powerUsageListNext24hConsumption, this.powerusageProductionNext24h, this.timestampListNext24hConsumption);
		//this.previous7DaysGraph(this.powerUsageListPrev7DaysConsumption, this.powerUsageListPrev7DaysProduction,this.timestampListPrev7DaysConsumption);
		//this.previousMonthGraph(this.powerUsageListPrevMonthConsumption, this.timestampListPrevMonthConsumption, this.powerUsageListPrevMonthProduction);

	}

	ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }

  @ViewChild('myChart') myChart!: ElementRef;
  @ViewChild('myChartUsers') myChartUsers!:ElementRef;
  @ViewChild('myChartForEveryTypeOfDevice') myChartForEveryTypeOfDevice!: ElementRef;
  @ViewChild('hourlyTemp') hourlyTemp!: ElementRef;
  @ViewChild('tableTable') myTable!: ElementRef;
  @ViewChild('currentConsumptionSYS') currentConsumptionSYS!:ElementRef;
  @ViewChild('prevMonthConsumptionSYS') prevMonthConsumptionSYS!:ElementRef;
  @ViewChild('nextMonthConsumptionSYS') nextMonthConsumptionSYS!:ElementRef;

  @ViewChild('currentProductionSYS') currentProductionSYS!:ElementRef;
  @ViewChild('prevMonthProductionSYS') prevMonthProductionSYS!:ElementRef;
  @ViewChild('nextMonthProductionSYS') nextMonthProductionSYS!:ElementRef;
  @ViewChild('consumptionProduction') consumptionProduction!:ElementRef;
  @ViewChild('previous24ConsumptionGraph') previous24ConsumptionGraph!:ElementRef;
  @ViewChild('consumptionPrev7daysGraph') consumptionPrev7daysGraph!:ElementRef;
  @ViewChild('consumptionPrevMonthGraph') consumptionPrevMonthGraph!:ElementRef;
  @ViewChild('consumptionNext24hGraph') consumptionNext24hGraph!:ElementRef;
  @ViewChild('consumptionNext7daysGraph') consumptionNext7daysGraph!:ElementRef;
  @ViewChild('consumptionNextMonthGraph') consumptionNextMonthGraph!:ElementRef;


  exportToExcel(): void {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Sample Data']]);
    const worksheetName = 'Custom Worksheet Name';
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
	let fileNameHistory = 'Custom_File_Name.xlsx';
	fileNameHistory = "Consumption and Production for the Previous 12h";
	this.saveFile(data, fileNameHistory);
  }

  exportToExcelSelectedFuture(select : any): void {

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Sample Data']]);

    const worksheetName = 'Custom Worksheet Name';
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);


    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
	let fileNameFuture = 'Custom_File_Name.xlsx';
	fileNameFuture = "Consumption and Production for the Next "+select;
	this.saveFile(data, fileNameFuture);
  }
  exportToExcelSelectedHistory(select : any): void {

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([['Sample Data']]);
    const worksheetName = 'Custom Worksheet Name';
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
	let fileNameHistory = 'Custom_File_Name.xlsx';
	fileNameHistory = "Consumption and Production for the Previous "+select;
	this.saveFile(data, fileNameHistory);
  }

  saveFile(data: Blob, filename: string): void {
    const a = document.createElement('a');
    document.body.appendChild(a);
    const url = window.URL.createObjectURL(data);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }


	getDate(){
		this.currentDate = timer(0,1000).pipe(
			map(()=>{
			  return new Date();
			})
		  )
	}

	giveMeWeather(){
		this.spinner.show();
		this.weatherLoader = true;
		this.auth.getWeather().subscribe({
			next:(response :any)=>{
				this.weather = response;
				if(this.weather){
					this.timezone = this.weather.timezone;
					this.temperature = this.weather.current_weather.temperature;
					this.maxTemperature = this.weather.daily.temperature_2m_max[0];
					this.minTemperature = this.weather.daily.temperature_2m_min[0];
					this.windSpeed = this.weather.current_weather.windspeed;
					this.humidity = this.weather.hourly.relativehumidity_2m[0];
					this.giveMeChartForTemperatureDaily();
				}
				
				this.spinner.hide();
				this.weatherLoader = false;
			},
			error: (error : any) => {
				console.log(error);
				this.spinner.hide();
				this.weatherLoader = false;
			}
		})
	}
	timeSlice!:any;
	time!:any;
	temp2m:any;
	giveMeChartForTemperatureDaily(){
		if(this.weather && this.weather.hourly)
			this.timeSlice = this.weather?.hourly.time.slice(0,24);
			this.temp2m = this.weather.hourly?.temperature_2m;
		 	this.time = this.timeSlice?.map((time:any)=>{
			const date = new Date(time);
			const hours = date.getHours().toString().padStart(2,"0");
			const minutes = date.getMinutes().toString().padStart(2,"0");
			return hours+":"+minutes;
		})

		const labels = this.time;
		const data = {
		labels: labels,
		datasets: [{
			label: 'Temperature by hour',
			data: this.temp2m,
			fill: true,
			borderColor: 'rgb(98, 183, 254)',
			backgroundColor:'rgba(98, 183, 254,0.4)',
			pointBackgroundColor: 'rgba(98, 183, 254,0.7)',
			borderWidth: 1,
			pointBorderColor:'rgb(98, 183, 254)'
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
				size: 13,
			  },
			},
		  },
		  y: {
			title: {
			  display: true,
			  text: 'Temperature (°C)',
			},
			ticks: {
			  font: {
				size: 15,
			  },
			},
		  },
		},
	  };
		const stackedLine = new Chart(this.hourlyTemp.nativeElement, {
			type: 'line',
			data: data,
			options: options,
		});

};


	getNumberOfUsers(){
		this.auth.getUserNumber().subscribe({
			next:(response : any)=>{
					this.totalUsers = response;
			},
			error : (error : any)=>{
				console.log(error);
			}
		})
	}

	getAllUserInfo(){
		this.auth.getAllUserInfo().subscribe({
			next:(response : any)=>{
				this.User = response;
			},
			error: (error : any)=>{
				console.log(error);
			}
		});
	}

	getDeviceGroup(){
		this.auth.getDeviceGroup().subscribe(
			(response : any)=>{
				this.deviceGroup = response;
				for(let group of this.deviceGroup){
					 this.auth.getDeviceGroupID(group.id).subscribe(
						(response:any)=>{
							if(group.id === "77cbc929-1cf2-4750-900a-164de4abe28b")
							{
								this.producers = response;

							}else if(group.id === "18f30035-59de-474f-b9db-987476de551f")
							{
								this.consumers = response;
							}
							else if(group.id === "b17c9155-7e6f-4d37-8a86-ea1abb327bb2")
							{
								this.storage = response;
							}

							this.total = this.producers?.length + this.consumers?.length + this.storage?.length;



							this.lengthProducers = this.producers?.length;
							this.lengthConsumers = this.consumers?.length;
							this.lengthStorage = this.storage?.length;

							// this.lengthStorage = this.storage.length;
							this.getNumberOfUsers();

						})
					}
				})
		}

//  System
	getConsumptionCurrent(){
		this.spinner.show();
		this.currentConsumptionSystemLoader = true;
		this.auth.currentConsumptionSystem().subscribe({
			next:(response:any)=>{
				this.currentConsumptionSys = (response).toFixed(2);
				this.halfDoughnutConsumtionSys(this.currentConsumptionSys);
				this.spinner.hide();
				this.currentConsumptionSystemLoader = false;
			},
			error:(error:any)=>{
				console.log(error);
				this.spinner.hide();
				this.currentConsumptionSystemLoader = false;
			}
		});
	}
	currentConsumptionDay(){
		this.spinner.show();
		this.currentConsumptionDayLoader = true;
		this.auth.currentConsumptionDay().subscribe({
			next:(response:any)=>{
				this.currentDataC = response['timestampPowerPairs'];
				this.makeDataForConsumptionDay(this.currentDataC);
				this.lineChartConsumptionProduction(this.powerusageCurrentDayProduction, this.powerusageCurrentConsumptionDay, this.timestampCurrentConsumptionDay);
				this.spinner.hide();
				this.currentConsumptionDayLoader = false;
			},
			error:(error:any)=>{
				console.log(error);
			}
		})
	}
	differenceForPreviousHour(){
		this.auth.differenceForPreviousHourConsumption().subscribe({
			next:(response:any)=>{
				this.razlikaConsumption = response;
				console.log(this.razlikaConsumption);
			},
			error:(error : any)=>{
				console.log(error);
			}
		});
		this.auth.differenceForPreviousHourProduction().subscribe({
			next:(response : any)=>{
				this.razlikaProduction = response;
				console.log(this.razlikaProduction);
			},
			error:(error:any)=>{
				console.log(error);
			}
		})
	}

	// consumptionCurrentDifference(currentDataC:any[]){
	// 	const length = currentDataC.length;
	// 	const prevHour = currentDataC[length-2]['powerUsage'];
	// 	const currentHour = currentDataC[length-1]['powerUsage'];
	// 	this.razlikaConsumption = (((currentHour - prevHour)/prevHour)*100).toFixed(2);
	// 	this.text = " more then previous hour";
	// 	if(this.razlikaConsumption < 0){
	// 		this.text = " less then previous hour";
	// 	}				
	// }

	

	makeDataForConsumptionDay(dataGraph : any){
		this.timestampCurrentConsumptionDay = [];
		this.dataConsumptionProduction = [];
		this.powerusageCurrentConsumptionDay = [];

		for(let i = 0; i < dataGraph.length; i++){
			const date = new Date(this.currentDataC[i]['timestamp']);
			const hour = date.getUTCHours().toString().padStart(2,"0");
			const minute = date.getUTCMinutes().toString().padStart(2,"0");
			const stringHourMinute = ''+hour + ":" + minute;
			this.timestampCurrentConsumptionDay.push(stringHourMinute);
			this.powerusageCurrentConsumptionDay.push(this.currentDataC[i]['powerUsage']);
		}

		for (let i = 0; i < this.timestampCurrentConsumptionDay.length; i++) {
			const pair = {
				timestamp: this.timestampCurrentConsumptionDay[i],
				powerUsage: this.powerusageCurrentConsumptionDay[i].toFixed(2),
				powerUsage1: this.powerusageCurrentDayProduction[i].toFixed(2)
			};
			this.dataConsumptionProduction.push(pair);

		}
	}

		powerusageCurrentDayProduction!:any;
		public text1 = " more then previous hour";
		currentProductionDay(){
			this.spinner.show();
			this.currentProductionDayLoader = true;
			this.auth.currentProductionDay().subscribe(
				(response:any)=>{
					this.currentDataP = response['timestampPowerPairs'];
					this.makeDataForProductionDay(this.currentDataP);
					//this.lineChartConsumptionProduction(this.powerusageCurrentDayProduction, this.powerusageCurrentConsumptionDay, this.timestampCurrentConsumptionDay);
					this.spinner.hide();
					this.currentProductionDayLoader = false;
				}
			)
			
		}
		// currentProductionDifference(data : []){
		// 	const length = this.currentDataP.length;
		// 	let prevHour1 = data[length-2]['powerUsage'];
		// 	const currentHour1 = data[length-1]['powerUsage'];
		// 	if(prevHour1 === 0)
		// 		this.razlikaProduction = (((currentHour1 - 0)/1)).toFixed(2);
		// 	else
		// 		this.razlikaProduction = (((currentHour1 - prevHour1)/prevHour1)*100).toFixed(2);
			
		// 	this.text = " more then previous hour";
		// 	if(this.razlikaProduction < 0){
		// 		this.text = " less then previous hour";
		// 	}	
		// }

		
		makeDataForProductionDay(dataGraph:any){
			this.powerusageCurrentDayProduction = [];
			for(let i = 0; i < dataGraph.length; i++){
				this.powerusageCurrentDayProduction.push(this.currentDataP[i]['powerUsage']);
			  }

		}

		chartCurrentConsumptionSystem!:any;
		halfDoughnutConsumtionSys(usage: any){
		  const d = usage;
			let selectColor = this.backgroundColorsGraphs[0];
			if(d < 350){
				selectColor = this.backgroundColorsGraphs[0];
			}else if(d > 350 && d < 700){
				selectColor = this.backgroundColorsGraphs[1];
			}else if(d > 700) {
				selectColor = this.backgroundColorsGraphs[2];
			}
			if(this.currentConsumptionSYS){
				if(this.chartCurrentConsumptionSystem){
					this.chartCurrentConsumptionSystem.destroy();
				}

		  const data = {
			labels: ['Energy Consumption'],
			datasets: [
			  {
				label: 'Energy Consumption',
				data: [d, 1000-d],
				backgroundColor: [selectColor, '#ECEFF1'],
			  },
			],
		  };

		  const options = {
		   circumference:180,
		   rotation:270,
		   aspectRation: 2,
		   responsive:true
		  };

		 this.chartCurrentConsumptionSystem = new Chart(this.currentConsumptionSYS.nativeElement, {
			type: 'doughnut',
			data: data,
			options: options,
		  });
		}
	}

		graphProductionConsumption:any;
		lineChartConsumptionProduction(data1 : any, data3: any, label : any){

			const d1 = data1;
			const d2 = data3;
			const l = label;
			if(this.consumptionProduction){
				if(this.graphProductionConsumption){
					this.graphProductionConsumption.destroy();
				}

			const data = {
					labels: label,
					datasets: [
					{
							label: 'Consumtion',
							data: data1,
							borderColor: this.backgroundColorsGraphs[3],
							backgroundColor: this.backgroundColorsRGBA4[3],
							pointBackgroundColor: 	this.backgroundColorsRGBA7[3],
							borderWidth: 1,
							pointBorderColor:this.backgroundColorsGraphs[3],
							pointStyle: 'circle',
							pointRadius: 3,
							pointHoverRadius: 5
					},
					{
							label: 'Production',
							data: data3,
							borderColor: this.backgroundColorsGraphs[4],
							backgroundColor: this.backgroundColorsRGBA4[4],
							pointBackgroundColor: 	this.backgroundColorsRGBA7[4],
							borderWidth: 1,
							pointBorderColor:this.backgroundColorsGraphs[4],
							pointStyle: 'circle',
							pointRadius: 3,
							pointHoverRadius: 5
					}

					]
				};
				const options: ChartOptions = {
					animations: {
						radius: {
						  duration: 400,
						  easing: 'linear',
						  loop: (context) => context.active
						}
					  },
						interaction: {
						mode: 'nearest',
						intersect: true,
						axis: 'x'
						},
						plugins: {
						tooltip: {
							enabled: true
						}
						},
					scales: {
						x: {
						title: {
							display: true,
							text: 'Time [h]',
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
							text: 'Energy Consumption and Production [kWh]',
							font:{
							size: 8,
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
				this.graphProductionConsumption = new Chart(this.consumptionProduction.nativeElement, {
						type: 'line',
						data: data,
						options:options
				});
			}
		}


		getConsumtionPrevMonth(){
			this.spinner.show();
			this.consumptionPrevMonthSystemLoader = true;
			this.auth.prevMonthConsumptionSystem().subscribe({
				next:(response : any) => {
					this.prevMonthConsumptionSys = (response).toFixed(2);
					this.halfDoughnutPrevMonthConsumtionSys(this.prevMonthConsumptionSys);
					this.spinner.hide();
					this.consumptionPrevMonthSystemLoader = false;
					},
					error:(err : any) =>{
						this.prevMonextMonthConsumptionSys = 0;
						this.spinner.hide();
						this.consumptionPrevMonthSystemLoader = false;
					}
				});
		}
// prevMonthConsumptionSYS
		chartPrevMonthSystem!:any;
		halfDoughnutPrevMonthConsumtionSys(usage: any){
			const d = usage;
			let selectColor = this.backgroundColorsGraphs[0];
			if(d < 350){
				selectColor = this.backgroundColorsGraphs[0];
			}else if(d > 350 && d < 700){
				selectColor = this.backgroundColorsGraphs[1];
			}else if(d > 700) {
				selectColor = this.backgroundColorsGraphs[2];
			}
			if(this.prevMonthConsumptionSYS){
				if(this.chartPrevMonthSystem){
					this.chartPrevMonthSystem.destroy();
				}
				const data = {
				labels:  ['Energy Consumption'],
				datasets: [
					{
					label : 'Energy Consumption',
					data: [d, 1000 - d ],
					backgroundColor: [selectColor, '#ECEFF1'],
					},
				],
				};
				const options = {
				circumference:180,
				rotation:270,
				aspectRation: 2
				};
				this.chartPrevMonthSystem = new Chart(this.prevMonthConsumptionSYS.nativeElement, {
				type: 'doughnut',
				data: data,
				options: options,
				});
			}
		}

		getConsumtionNextMonth(){
			this.spinner.show();
			this.consumptionNextMonthSystemLoader = true;
			this.auth.nextMonthConsumtionSystem().subscribe(
				(response : any) => {
					this.nextMonthConsumptionSys = (response).toFixed(2);
					this.halfDoughnutNextMonthConsumtionSys(this.nextMonthConsumptionSys);
					this.spinner.hide();
					this.consumptionNextMonthSystemLoader = false;
				}
			)
		}



		chartNextMonthConsumptionSystem!:any;
		halfDoughnutNextMonthConsumtionSys(usage: any){
			const d = usage;

			let selectColor = this.backgroundColorsGraphs[0];
			if(d < 350){
				selectColor = this.backgroundColorsGraphs[0];
			}else if(d > 350 && d < 700){
				selectColor = this.backgroundColorsGraphs[1];
			}else if(d > 700) {
				selectColor = this.backgroundColorsGraphs[2];
			}
			if(this.nextMonthConsumptionSYS){
				if(this.chartNextMonthConsumptionSystem){
					this.chartNextMonthConsumptionSystem.destroy();
				}
				const data = {
				labels: ['Energy Consumption'],
				datasets: [
					{
					label: 'Energy Consumption',
					data: [d, 1000-d],
					backgroundColor: [selectColor, '#ECEFF1'],
					},
				],
				};
				const options = {
				circumference:180,
				rotation:270,
				aspectRation: 2
				};
				this.chartNextMonthConsumptionSystem = new Chart(this.nextMonthConsumptionSYS.nativeElement, {
				type: 'doughnut',
				data: data,
				options: options,
				});
			}
		}


		prevMonthProductionSystem(){
			this.spinner.show();
			this.productionPrevMonthSystemLoader = true;
			this.auth.prevMonthProductionSystem().subscribe({
				next:(response : any) => {
					this.prevMonthProductionSys = (response).toFixed(2);
					this.halfDoughnutPrevMonthProductionSys(this.prevMonthProductionSys);
					this.spinner.hide();
					this.productionPrevMonthSystemLoader = false;
				},
				error: (error : any) => {
					this.prevMonthProductionSys = 0;
					this.spinner.hide();
					this.productionPrevMonthSystemLoader = false;
				}
			}
			)
		}
		chartPrevMonthProductionSystem!:any;
		halfDoughnutPrevMonthProductionSys(usage: any){
			const d = usage;
			let selectColor = this.backgroundColorsGraphs[0];
			if(d < 350){
				selectColor = this.backgroundColorsGraphs[0];
			}else if(d > 350 && d < 700){
				selectColor = this.backgroundColorsGraphs[1];
			}else if(d > 700) {
				selectColor = this.backgroundColorsGraphs[2];
			}

			if(this.prevMonthProductionSYS){
				if(this.chartPrevMonthProductionSystem){
					this.chartPrevMonthProductionSystem.destroy();
				}
				const data = {
				labels: ['Energy Production'],
				datasets: [
					{
					label: 'Energy Production',
					data: [d, 1000-d],
					backgroundColor: [selectColor, '#ECEFF1'],
					},
				],
				};

				const options = {
				circumference:180,
				rotation:270,
				aspectRation: 2
				};

				this.chartPrevMonthProductionSystem = new Chart(this.prevMonthProductionSYS.nativeElement, {
				type: 'doughnut',
				data: data,
				options: options,
				});
			}
		}

		getProductionCurrent(){
			this.spinner.show();
			this.productionCurrentSystemLoader = true;
			this.auth.currentProcustionSystem().subscribe(
				{
					next:(response : any) => {
						this.currentProductionSys = response.toFixed(2);
						this.halfDoughnutProductionSys(this.currentProductionSys);
						this.spinner.hide();
						this.productionCurrentSystemLoader = false;
					},
					error:(err : any) => {
						this.currentProductionSys = 0;
						this.spinner.hide();
						this.productionCurrentSystemLoader = false;
					}
				}
			)
		}
		chartProductionSystem!:any;
		halfDoughnutProductionSys(usage: any){
			const d = usage;
			let selectColor = this.backgroundColorsGraphs[0];
			if(d < 350){
				selectColor = this.backgroundColorsGraphs[0];
			}else if(d > 350 && d < 700){
				selectColor = this.backgroundColorsGraphs[1];
			}else if(d > 700) {
				selectColor = this.backgroundColorsGraphs[2];
			}
			if(this.currentProductionSYS){
				if(this.chartProductionSystem){
					this.chartProductionSystem.destroy();
				}
				const data = {
				labels: ['Energy Production'],
				datasets: [
					{
					label: 'Energy Production',
					data: [d, 1000-d],
					backgroundColor: [selectColor, '#ECEFF1'],
					},
				],
				};

				const options = {
				circumference:180,
				rotation:270,
				aspectRation: 2
				};

				this.chartProductionSystem = new Chart(this.currentProductionSYS.nativeElement, {
				type: 'doughnut',
				data: data,
				options: options,
				});
			}
		}

		nextMonthProductionSystem(){
			this.spinner.show();
			this.productionNextMonthSystemLoader = true;
			this.auth.nextMonthProductionSystem().subscribe(
				{
					next: (response : any) => {
						this.nextMonthProductionSys = response.toFixed(2);
						this.halfDoughnutNextMonthProductionSys(this.nextMonthProductionSys);
						this.spinner.hide();
						this.productionNextMonthSystemLoader = false;
					},
					error: (err : any) => {
						this.nextMonthProductionSys = 0;
						this.spinner.hide();
						this.productionNextMonthSystemLoader = false;
					}
				}

			)
		}
		chartNextMonthProductionSystem!:any;
		halfDoughnutNextMonthProductionSys(usage: any){
			const d = usage;
			let selectColor = this.backgroundColorsGraphs[0];
			if(d < 350){
				selectColor = this.backgroundColorsGraphs[0];
			}else if(d > 350 && d < 700){
				selectColor = this.backgroundColorsGraphs[1];
			}else if(d > 700) {
				selectColor = this.backgroundColorsGraphs[2];
			}
			if(this.nextMonthProductionSYS){
				if(this.chartNextMonthProductionSystem){
					this.chartNextMonthProductionSystem.destroy();
				}
				const data = {
				labels: ['Energy Production'],
				datasets: [
					{
					label: 'Energy Production',
					data: [d, 1000-d],
					backgroundColor: [selectColor, '#ECEFF1'],
					},
				],
				};

				const options = {
					circumference:180,
					rotation:270,
					aspectRation: 2,

					backgroundColor:'rgba(59, 193, 74,0.4)',
					pointBackgroundColor: 'rgba(59, 193, 74,0.7)',
					borderWidth: 1,
					pointBorderColor:'rgb(59, 193, 74)',
				};

				this.chartNextMonthProductionSystem = new Chart(this.nextMonthProductionSYS.nativeElement, {
				type: 'doughnut',
				data: data,
				options: options,
				});
			}
		}


	all!: any[];
	allDevices(){
		this.auth.AllDevices().subscribe(
			(response : any)=>{
				this.all = response;
			}
		)
	}

	giveMeDeviceByID(id : any){
		this.auth.deviceInfoByID(id).subscribe(
			(response : any) => {
			}
		)
	}


	eachDeviceConsumptingPrevMonth(){
		this.auth.eachDevicePrevMonthConsumption().subscribe({
			next: (response : any) => {
				this.prevMonthEachDeviceConsumption = response;

				this.auth.deviceTypeInfo().subscribe(
					(response : any) => {
						this.deviceTypeINFO = response;
					},
					(err : any) => {
						console.error(err);
					}
				);
			},
			error: (err : any) => {
				console.error(err);
			}
		});
	}
	eachDeviceConsumptionNextmonth(){
		this.auth.eachDeviceNextMonthConsumption().subscribe({
			next: (response : any) => {
				this.nextMonthEachDeviceConsumption = response;
			},
			error : (err : any) => {

			}
		})
	}
	selectedOption!:string;
		onOptionChange(){
			switch(this.selectedOption){
				case 'option1':
				//	data = data1;
					break;
				case 'option2':
				// data = data2;
					break;
				default:

			}
		}

//CONSUMPTION
		 // set default graph
		displayGraphConsumption(graph: string) {
		switch (graph) {
			case 'current':
				this.getConsumptionCurrent();
			break;
			case 'prevMonth':
				this.getConsumtionPrevMonth();
			break;
			case 'nextMonth':
				this.getConsumtionNextMonth();
			break;
		}
	}
		selectedGraphEachDevice = 'prev';
		displayGraphConsumptionEachDevice(graph: string){
			this.selectedGraphEachDevice = graph;
			switch(graph){
				case 'prev':
					this.eachDeviceConsumptingPrevMonth();
					break;
				case 'next':
					this.eachDeviceConsumptingPrevMonth();
					break;
			}
		}

// PRODUCTION
		selectedGraphProduction = 'current'; // set default graph
		displayGraphProduction(graph: string) {
		this.selectedGraphProduction = graph;
		switch (graph) {
			case 'current':
				this.getProductionCurrent();
			break;
			case 'prevMonth':
				this.prevMonthProductionSystem();
			break;
			case 'nextMonth':
				this.nextMonthProductionSystem();
			break;
		}
	}
		selectedGraphEachDeviceProduction = 'prev';
		displayGraphProductionEachDevice(graph: string){
			this.selectedGraphEachDevice = graph;
			switch(graph){
				case 'prev':
					this.eachDeviceConsumptingPrevMonth();
					break;
				case 'next':
					this.eachDeviceConsumptingPrevMonth();
					break;
			}
		}




		savedEnergy(){
			this.auth.savedEnergyConsumption().subscribe(
				(response : any)=>{
					this.savedC = response.toFixed(2);
				}
			)
			this.auth.savedEnergyProduction().subscribe(
				(response : any)=>{
					this.savedP = response.toFixed(2);
				}
			)
			this.summarySavedEnergy = this.savedC + this.savedP;
		}



			consumptionPrev24hData!:any;
			chartPrev24h!:any;
			consumptionPrev24h(){
			this.spinner.show();
			this.consumptionPrev24hLoader = true;
			this.auth.consumptionPrev24h().subscribe(
				{
					next:(response:any)=>{
						this.consumptionPrev24hData = response['timestampPowerPairs'];
						this.makeDataConsumptionPrev24h(this.consumptionPrev24hData);
						this.previous24Graph(this.powerUsageListPrev24hConsumption, this.timestampListPrev24hConsumption, this.powerUsageListPrev24hProduction);
						this.spinner.hide();
						this.consumptionPrev24hLoader = false;
					},
					error:(err : any)=>{
						this.consumptionPrev24hData = 0;
						this.spinner.hide();
						this.consumptionPrev24hLoader = false;
					}
				});
			}

			productionPrev24hData!:any;
			productionPrev24h(){
				this.spinner.show();
				this.productionPrev24hLoader = true;
				this.auth.productionPrev24h().subscribe({
					next:(response:any)=>{
						this.productionPrev24hData = response['timestampPowerPairs'];
						this.makeDataForProductionPrev24h(this.productionPrev24hData);

						this.spinner.hide();
						this.productionPrev24hLoader = false;
					},
					error:(err : any) => {
						this.productionPrev24hData = 0;
						this.spinner.hide();
						this.productionPrev24hLoader = false;
					}
				})

			}
			timestampListPrev24hProduction!:any[];
			powerUsageListPrev24hProduction!:any[];
			makeDataForProductionPrev24h(dataGraph : any){
				this.timestampListPrev24hProduction = [];
				this.powerUsageListPrev24hProduction = [];
				for(let i = 0; i < dataGraph.length; i++){
					this.timestampListPrev24hProduction.push(this.productionPrev24hData[i]['timestamp']);
					this.powerUsageListPrev24hProduction.push(this.productionPrev24hData[i]['powerUsage']);
				}



			}
			timestampListPrev24hConsumption!:string[];
			powerUsageListPrev24hConsumption!:any[];
			makeDataConsumptionPrev24h(dataGraph:any){
				this.timestampListPrev24hConsumption = [];
				this.powerUsageListPrev24hConsumption = [];
				this.data24hHistory = [];
				for(let i = 0; i < dataGraph.length; i++){
					const date = new Date(this.consumptionPrev24hData[i]['timestamp']);
					const hour = date.getUTCHours().toString().padStart(2,"0");
					const minute = date.getUTCMinutes().toString().padStart(2, "0");
					const stringHourMinute = hour+":"+minute;
					this.timestampListPrev24hConsumption.push(stringHourMinute);
					this.powerUsageListPrev24hConsumption.push(this.consumptionPrev24hData[i]['powerUsage']);
				  }
// MODAL DATA
				for (let i = 0; i < this.timestampListPrev24hConsumption.length; i++) {
					const pair = {
						timestamp: this.timestampListPrev24hConsumption[i],
						powerUsage: this.powerUsageListPrev24hConsumption[i].toFixed(2),
						powerUsage1: this.powerUsageListPrev24hProduction[i].toFixed(2)
					};
					this.data24hHistory.push(pair);
				}
			}
			  getProduction(){
				if(this.powerUsageListPrev24hProduction != null){
					return this.powerUsageListPrev24hProduction;
				}
				return 0;
			  }


			previous24Graph(data1 : any, label : any, data2:any){

				if (this.previous24ConsumptionGraph){
				  if (this.chartPrev24h) {
					this.chartPrev24h.destroy();
				  }
				const data = {
				  	labels: label,
				  	datasets: [{
						label: 'Consumption',
						data: data1,
						borderColor: this.backgroundColorsGraphs[0],
						backgroundColor: this.backgroundColorsRGBA4[0],
						pointBackgroundColor: 	this.backgroundColorsRGBA7[0],
						borderWidth: 1,
						pointBorderColor:this.backgroundColorsGraphs[0],
						pointStyle: 'circle',
						pointRadius: 3,
						pointHoverRadius: 5,
				  },
				  {
					label: 'Production',
					data: data2,
					borderColor: this.backgroundColorsGraphs[3],
					backgroundColor:this.backgroundColorsRGBA4[3],
					pointBackgroundColor: this.backgroundColorsRGBA7[3],
					borderWidth: 1,
					pointBorderColor: this.backgroundColorsGraphs[3],
					pointStyle: 'circle',
					pointRadius: 3,
					pointHoverRadius: 5
				  }]}
				const options: ChartOptions = {
					animations: {
						radius: {
						  duration: 400,
						  easing: 'linear',
						  loop: (context) => context.active
						}
					  },
						interaction: {
						mode: 'nearest',
						intersect: true,
						axis: 'x'
						},
						plugins: {
						tooltip: {
							enabled: true
						}
						},
					scales: {
						x: {
						title: {
							display: true,
							text: 'Time [h]',
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
							text: 'Energy Consumption and Production [kWh]',
							font:{
							size: 8,
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



			consumptionPrev7DaysData! : any;
			consumptionPrev7Days(){
				this.spinner.show();
				this.consumptionPrev7DaysLoader = true;
				this.auth.consumptionPrev7Days().subscribe({
					next:(response : any)=>{
						this.consumptionPrev7DaysData = response['timestampPowerPairs'];
						this.makeDataConsumptionPrev7Days(this.consumptionPrev7DaysData);
						this.previous7DaysGraph(this.powerUsageListPrev7DaysConsumption, this.powerUsageListPrev7DaysProduction,this.timestampListPrev7DaysConsumption);
						this.spinner.hide();
						this.consumptionPrev7DaysLoader = false;
					},
					error:(error : any) => {
						this.consumptionPrev7DaysData = 0;
						this.spinner.hide();
						this.consumptionPrev7DaysLoader = false;
					}
				});
			}

			timestampListPrev7DaysConsumption!:any[];
			powerUsageListPrev7DaysConsumption!:any[];
			makeDataConsumptionPrev7Days(dataGraph:any){
				this.timestampListPrev7DaysConsumption = [];
				this.powerUsageListPrev7DaysConsumption = [];
				this.data7daysHistory = [];
				for(let i = 0; i < dataGraph.length; i++){
					const date = new Date(this.consumptionPrev7DaysData[i]['timestamp']);
					const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
					const dayOfWeek = daysOfWeek[date.getUTCDay()];
					this.timestampListPrev7DaysConsumption.push(dayOfWeek);
					this.powerUsageListPrev7DaysConsumption.push(this.consumptionPrev7DaysData[i]['powerUsage']);
				  }
				  for (let i = 0; i < this.timestampListPrev7DaysConsumption.length; i++) {
					const pair = {
						timestamp: this.timestampListPrev7DaysConsumption[i],
						powerUsage: this.powerUsageListPrev7DaysConsumption[i].toFixed(2),
						powerUsage1: this.powerUsageListPrev7DaysProduction[i].toFixed(2)
					};
					this.data7daysHistory.push(pair);
				}


			  }


			  productionPrev7DaysData! : any;
			  productionPrev7Days(){
				this.spinner.show();
				this.productionPrev7DaysLoader = true;
				this.auth.productionPrev7Days().subscribe({
					next:(response : any)=>{
						this.productionPrev7DaysData = response['timestampPowerPairs'];
						this.makeDataProductionPrev7Days(this. productionPrev7DaysData);

						this.spinner.hide();
						this.productionPrev7DaysLoader = false;
					},
					error:(error : any) => {
						this.consumptionPrev7DaysData = 0;
						this.spinner.hide();
						this.productionPrev7DaysLoader = false;
					}
				});
			}

			timestampListPrev7DaysProduction!:any[];
			powerUsageListPrev7DaysProduction!:any[];
			makeDataProductionPrev7Days(dataGraph:any){
				this.powerUsageListPrev7DaysProduction = [];
				for(let i = 0; i < dataGraph.length; i++){
					this.powerUsageListPrev7DaysProduction.push(this.productionPrev7DaysData[i]['powerUsage']);
				  }
			}

			  previous7DaysGraph(data1 : any, data2 :any, label : any){

				if (this.consumptionPrev7daysGraph){
				  if (this.chartPrev7days) {
					this.chartPrev7days.destroy();
				  }
				  	const data = {
					labels: label,
					datasets: [
					{
						label: 'Consumption',
						data: data1,
						fill: true,
						borderColor: this.backgroundColorsGraphs[0],
						backgroundColor: this.backgroundColorsRGBA4[0],
						pointBackgroundColor: 	this.backgroundColorsRGBA7[0],
						borderWidth: 2,
						pointBorderColor:this.backgroundColorsGraphs[0],
						borderRadius: 5,
      					borderSkipped: false,
					},
					{
						label: 'Production ',
						data: data2,
						fill: true,
						borderColor: this.backgroundColorsGraphs[3],
						backgroundColor: this.backgroundColorsRGBA4[3],
						pointBackgroundColor: 	this.backgroundColorsRGBA7[3],
						borderWidth: 2,
						pointBorderColor:this.backgroundColorsGraphs[3],
						borderRadius: 5,
      					borderSkipped: false,
					},
				]
				}
				const options: ChartOptions = {
				  scales: {
					x: {
					  title: {
						display: true,
						text: 'Day',
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
						text: 'Energy Consumption and Production [kWh]',
						font:{
						  size: 8,
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
				this.chartPrev7days = new Chart(this.consumptionPrev7daysGraph.nativeElement, {
				  type: 'bar',
				  data: data,
				  options: options,
				});
			  }
			}


			consumptionPreviousMonthData!:any;
			consumptionPreviousMonth(){
				this.spinner.show();
				this.consumptionPrevMonthLoader = true;

				this.auth.consumptionPreviousMonth().subscribe({
					next:(response : any)=>{
						this.consumptionPreviousMonthData = response['timestampPowerPairs'];
						this.makeDataConsumptionPrevMonth(this.consumptionPreviousMonthData);
						this.previousMonthGraph(this.powerUsageListPrevMonthConsumption, this.timestampListPrevMonthConsumption, this.powerUsageListPrevMonthProduction);
						this.spinner.hide();
						this.consumptionPrevMonthLoader = false;
					},
					error:(error : any) => {
						this.consumptionPreviousMonthData = 0;
						this.spinner.hide();
						this.consumptionPrevMonthLoader = false;
					}
				})
			}

			timestampListPrevMonthConsumption!:any[];
			powerUsageListPrevMonthConsumption!:any[];

			makeDataConsumptionPrevMonth(dataGraph:any){
				this.timestampListPrevMonthConsumption = [];
				this.powerUsageListPrevMonthConsumption = [];
				this.dataMonthHistory = [];
				for(let i = 0; i < dataGraph.length; i++){
					const date = new Date(this.consumptionPreviousMonthData[i]['timestamp']);
					const month = date.toLocaleString("default", {month:"long"});
					const day = date.getDate().toString();
					const dateString = ''+month+' '+day;
					this.timestampListPrevMonthConsumption.push(dateString);
					this.powerUsageListPrevMonthConsumption.push(this.consumptionPreviousMonthData[i]['powerUsage']);
				  }
				  for (let i = 0; i < this.timestampListPrevMonthConsumption.length; i++) {
					const pair = {
						timestamp: this.timestampListPrevMonthConsumption[i],
						powerUsage: this.powerUsageListPrevMonthConsumption[i].toFixed(2),
						powerUsage1: this.powerUsageListPrevMonthProduction[i].toFixed(2)
					};
					this.dataMonthHistory.push(pair);
				}


			  }

			productionPreviousMonthData!:any;
			productionPreviousMonthLoader:boolean = false;
			productionPreviousMonth(){
				this.spinner.show();
				this.productionPreviousMonthLoader = true;
				this.auth.productionPreviousMonth().subscribe({
					next:(response : any)=>{
						this.productionPreviousMonthData = response['timestampPowerPairs'];

						this.makeDataProductionPrevMonth(this.productionPreviousMonthData);
						this.spinner.hide();
						this.productionPrevMonthSystemLoader = false;
					},
					error:(error : any) => {
						this.productionPreviousMonthData = 0;
						this.spinner.hide();
						this.productionPrevMonthSystemLoader = false;
					}
				})
			}

			powerUsageListPrevMonthProduction!:any[];
			makeDataProductionPrevMonth(dataGraph:any){
				this.powerUsageListPrevMonthProduction = [];
				for(let i = 0; i < dataGraph.length; i++){
					this.powerUsageListPrevMonthProduction.push(this.productionPreviousMonthData[i]['powerUsage']);
				  }
			  }

			  previousMonthGraph(data1 : any, label : any, data2 : any){

				if (this.consumptionPrevMonthGraph){
				  if (this.chartPrevMonth) {
					this.chartPrevMonth.destroy();
				  }
				const data = {
				  labels: label,
				  datasets: [
					{
					label: 'Consumption',
					data: data1,
					borderColor: this.backgroundColorsGraphs[0],
					backgroundColor: this.backgroundColorsRGBA4[0],
					pointBackgroundColor: 	this.backgroundColorsRGBA7[0],
					borderWidth: 1,
					pointBorderColor:this.backgroundColorsGraphs[0],
					pointStyle: 'circle',
					pointRadius: 3,
					pointHoverRadius: 5,

				  },
				{
					label: 'Production',
					data: data2,
					borderColor: this.backgroundColorsGraphs[3],
					backgroundColor: this.backgroundColorsRGBA4[3],
					pointBackgroundColor: 	this.backgroundColorsRGBA7[3],
					borderWidth: 1,
					pointBorderColor:this.backgroundColorsGraphs[3],
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
						text: 'Date',
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
						text: 'Energy Consumption and Production [kWh]',
						font:{
						  size: 8,
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
				this.chartPrevMonth = new Chart(this.consumptionPrevMonthGraph.nativeElement, {
				  type: 'line',
				  data: data,
				  options: options,
				});
			  }
			}


		HistoryConsumption(graph : any) {
		switch (graph) {
			case '24h':
				this.productionPrev24h();
				setTimeout(() => {
					this.consumptionPrev24h();
				  }, 5000);
				
			break;
			case '7days':
				this.productionPrev7Days();
				this.consumptionPrev7Days();
			break;
			case 'month':
				this.consumptionPreviousMonth();
				this.productionPreviousMonth();
			break;
		}
	}

	FutureConsumption(graph : any){
		switch (graph) {
			case '24h':
				this.productionNext24h();
				setTimeout(() => {
					this.consumptionNext24h();
				  }, 5000);
				
			break;
			case '7days':
				this.productionNext7Days();
				this.consumptionNext7Days();
			break;
			case 'month':
				this.productionNextMonth();
				this.consumptionNextMonth();
			break;
		}
	}

	consumptionNext24hData!:any;
	consumptionNext24h(){
		this.spinner.show();
		this.consumptionNext24hLoader = true;
		this.auth.consumptionNext24h().subscribe({
			next:(response : any)=>{
				this.consumptionNext24hData = response['timestampPowerPairs'];

				this.makeDataConsumptionNext24h(this.consumptionNext24hData);
				this.next24Graph(this.powerUsageListNext24hConsumption, this.powerusageProductionNext24h,this.timestampListNext24hConsumption);
				this.spinner.hide();
				this.consumptionNext24hLoader = false;
			},
			error: (err : any) => {

				this.spinner.hide();
				this.consumptionNext24hLoader = false;
			}
		})
	}

	timestampListNext24hConsumption!:any[];
	powerUsageListNext24hConsumption!:any[];
	makeDataConsumptionNext24h(dataGraph : any){
			this.timestampListNext24hConsumption = [];
			this.powerUsageListNext24hConsumption = [];
			this.data24Future = [];
			for(let i = 0; i < dataGraph.length; i++){
				const date = new Date(this.consumptionNext24hData[i]['timestamp']);
				const hour = date.getUTCHours().toString().padStart(2,"0");
				const minute = date.getUTCMinutes().toString().padStart(2,"0");
				const stringHourMinute = ''+hour + ":" + minute;
				this.timestampListNext24hConsumption.push(stringHourMinute);
				this.powerUsageListNext24hConsumption.push(this.consumptionNext24hData[i]['powerUsage']);
			  }
			for (let i = 0; i < this.timestampListNext24hConsumption.length; i++) {
					const pair = {
						timestamp: this.timestampListNext24hConsumption[i],
						powerUsage: this.powerUsageListNext24hConsumption[i].toFixed(2),
						powerUsage1: this.powerusageProductionNext24h[i].toFixed(2)
					};
				this.data24Future.push(pair);
			}

	}

	chartNext24h!:any;
	next24Graph(data1 : any,  data2 : any, label : any){
		const d = data1;
		const l = label;

		if (this.consumptionNext24hGraph){
		  if (this.chartNext24h) {
			this.chartNext24h.destroy();
		  }

		const data = {
		  labels: label,
		  datasets: [
			{
			label: 'Consumption',
			data: data1,
			borderColor: this.backgroundColorsGraphs[4],
			backgroundColor:this.backgroundColorsRGBA4[4],
			pointBackgroundColor: this.backgroundColorsRGBA7[4],
			borderWidth: 1,
			pointBorderColor: this.backgroundColorsGraphs[4],
		  },
		{
			label: 'Production ',
			data: data2,
			borderColor: this.backgroundColorsGraphs[2],
			backgroundColor:this.backgroundColorsRGBA4[2],
			pointBackgroundColor: this.backgroundColorsRGBA7[2],
			borderWidth: 1,
			pointBorderColor: this.backgroundColorsGraphs[2],

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
				  size: 14,
				},
			  },
			},
			y: {
			  title: {
				display: true,
				text: 'Energy Consumption and Production [kWh]',
				font:{
				  size: 8,
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
		this.chartNext24h = new Chart(this.consumptionNext24hGraph.nativeElement, {
		  type: 'line',
		  data: data,
		  options: options,
		});
	  }
	}


	consumptionNext7DaysData!:any;
	consumptionNext7Days(){
		this.spinner.show();
		this.consumptionNext7DaysLoader = true;
		this.auth.consumptionNext7Days().subscribe({
			next:(response : any)=>{
				this.consumptionNext7DaysData = response['timestampPowerPairs'];
				this.makeDataForConsumptionNext7Days(this.consumptionNext7DaysData);
				this.next7DaysGraph(this.powerUsageListNext7daysConsumption, this.timestampListNext7daysConsumption, this.powerusageProductionNext7days);
				this.spinner.hide();
				this.consumptionNext7DaysLoader = false;
			},
			error: (err : any) => {
				console.log("this.consumptionNext7DaysData error" + err);
				this.spinner.hide();
				this.consumptionNext7DaysLoader = false;
			}
		})
	}
	chartNext7daysC!:any;
	next7DaysGraph(data1 : any, label : any, data2 : any){

		if (this.consumptionNext7daysGraph){
		  if (this.chartNext7daysC) {
			this.chartNext7daysC.destroy();
		  }

		const data = {
		  labels: label,
		  datasets: [{
			label: 'Consumption',
			data: data1,
			fill: true,
			borderColor: this.backgroundColorsGraphs[4],
			backgroundColor: this.backgroundColorsRGBA4[4],
			pointBackgroundColor: 	this.backgroundColorsRGBA7[4],
			borderWidth: 2,
			pointBorderColor:this.backgroundColorsGraphs[4],
			borderRadius: 5,
			borderSkipped: false,


		  },
		  {
			label: 'Prosumer',
			data: data2,
			fill:true,
			borderColor: this.backgroundColorsGraphs[2],
			backgroundColor: this.backgroundColorsRGBA4[2],
			pointBackgroundColor: 	this.backgroundColorsRGBA7[2],
			borderWidth: 2,
			pointBorderColor:this.backgroundColorsGraphs[2],
			borderRadius: 5,
			borderSkipped: false,
		  }]
		}
		const options: ChartOptions = {
		  scales: {
			x: {
			  title: {
				display: true,
				text: 'Day',
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
				text: 'Energy Consumption and Production [kWh]',
				font:{
				  size: 8,
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
		this.chartNext7daysC = new Chart(this.consumptionNext7daysGraph.nativeElement, {
		  type: 'bar',
		  data: data,
		  options: options,
		});
	  }
	}
	timestampListNext7daysConsumption!:any[];
	powerUsageListNext7daysConsumption!:any[];
	makeDataForConsumptionNext7Days(dataGraph:any){
		this.timestampListNext7daysConsumption = [];
		this.powerUsageListNext7daysConsumption = [];
		this.data7daysFuture = [];
		for(let i = 0; i < dataGraph.length; i++){
			const date = new Date(this.consumptionNext7DaysData[i]['timestamp']);
			const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			const dayOfWeek = daysOfWeek[date.getUTCDay()];
			this.timestampListNext7daysConsumption.push(dayOfWeek);
			this.powerUsageListNext7daysConsumption.push(this.consumptionNext7DaysData[i]['powerUsage']);
		}

		for (let i = 0; i < this.timestampListNext7daysConsumption.length; i++) {
			const pair = {
				timestamp: this.timestampListNext7daysConsumption[i],
				powerUsage: this.powerUsageListNext7daysConsumption[i].toFixed(2),
				powerUsage1: this.powerusageProductionNext7days[i].toFixed(2)
			};
			this.data7daysFuture.push(pair);
		}
	}



	consumptionNextMonthData!:any;
	consumptionNextMonth(){
		this.spinner.show();
		this.consumptionNextMonthLoader = true;
		this.auth.consumptionNexxtMonth().subscribe({
			next:(response : any)=>{
				this.consumptionNextMonthData = response['timestampPowerPairs'];
				this.makeDataForConsumptionNextMonth(this.consumptionNextMonthData);
				this.nextMonthGraphConsumption(this.powerUsageListNextMonthConsumption,this.timestampListNextMonthConsumption, this.powerusageNextMonthProduction);
				this.spinner.hide();
				this.consumptionNextMonthLoader = false;
			},
			error: (err : any) => {
				console.log("consumptionNextMonth error" + err);
				this.spinner.hide();
				this.consumptionNextMonthLoader = false;
			}
		})
	}
	timestampListNextMonthConsumption!:any[];
	powerUsageListNextMonthConsumption!:any[];
	makeDataForConsumptionNextMonth(dataGraph:any){
		this.timestampListNextMonthConsumption = [];
		this.powerUsageListNextMonthConsumption = [];
		this.dataMonthFuture = [];
		for(let i = 0; i < dataGraph.length; i++){
			const date = new Date(this.consumptionNextMonthData[i]['timestamp']);
			const month = date.toLocaleString("default", {month:"long"});
			const day = date.getDate().toString();
			const dateString = ''+month+' '+day;
			this.timestampListNextMonthConsumption.push(dateString);
			this.powerUsageListNextMonthConsumption.push(this.consumptionNextMonthData[i]['powerUsage']);
		  }
		  for (let i = 0; i < this.timestampListNextMonthConsumption.length; i++) {
			const pair = {
				timestamp: this.timestampListNextMonthConsumption[i],
				powerUsage: this.powerUsageListNextMonthConsumption[i].toFixed(2),
				powerUsage1: this.powerusageNextMonthProduction[i].toFixed(2)
			};
			this.dataMonthFuture.push(pair);
		}

	}
	chartNextMonth!:any;
	nextMonthGraphConsumption(data1 : any, label : any, data2:any){

		if (this.consumptionNextMonthGraph){
		  if (this.chartNextMonth) {
			this.chartNextMonth.destroy();
		  }

		const data = {
		  labels: label,
		  datasets: [
			{
			label: 'Consumption',
			data: data1,
			borderColor: this.backgroundColorsGraphs[4],
			backgroundColor:this.backgroundColorsRGBA4[4],
			pointBackgroundColor: this.backgroundColorsRGBA7[4],
			borderWidth: 1,
			pointBorderColor: this.backgroundColorsGraphs[4],
		  },
		  {
			label: 'Production',
			data: data2,
			borderColor: this.backgroundColorsGraphs[2],
			backgroundColor:this.backgroundColorsRGBA4[2],
			pointBackgroundColor: this.backgroundColorsRGBA7[2],
			borderWidth: 1,
			pointBorderColor: this.backgroundColorsGraphs[2],
		  },
		]
		}
		const options: ChartOptions = {
		  scales: {
			x: {
			  title: {
				display: true,
				text: 'Date',
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
				text: 'Energy Consumption and Production [kWh]',
				font:{
				  size: 8,
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
		this.chartNextMonth = new Chart(this.consumptionNextMonthGraph.nativeElement, {
		  type: 'line',
		  data: data,
		  options: options,
		});
	  }
	}

	productionNext24hData!:[];
	productionNext24h(){
		this.spinner.show();
		this.productionNext24hLoader = true;
		this.auth.productionNext24h().subscribe({
			next:(response : any)=>{
				this.productionNext24hData = response['timestampPowerPairs'];
				this.makeDataProductionNext24h(this.productionNext24hData);
				this.spinner.hide();
				this.productionNext24hLoader = false;
			},
			error: (err : any) => {
				console.log("productionNext24hData error" + err);
				this.spinner.hide();
				this.productionNext24hLoader = false;
			}
		})
	}
	powerusageProductionNext24h!:any[];
	makeDataProductionNext24h(dataGraph : any){
		this.powerusageProductionNext24h = [];
		for(let i = 0; i < dataGraph.length; i++){
				this.powerusageProductionNext24h.push(this.productionNext24hData[i]['powerUsage']);
		}

	}

	productionNext7DaysData!:[];
	productionNext7Days(){
		this.spinner.show();
		this.productionNext7DaysLoader = true;
		this.auth.productionNext7Days().subscribe({
			next:(response : any)=>{
				this.productionNext7DaysData = response['timestampPowerPairs'];
				this.makeDataProductionNext7days(this.productionNext7DaysData);
				this.spinner.hide();
				this.productionNext7DaysLoader = false;
			},
			error: (err : any) => {
				console.log("productionNext7Days error" + err);
				this.spinner.hide();
				this.productionNext7DaysLoader = false;
			}
		})
	}
	powerusageProductionNext7days!:any[];
	makeDataProductionNext7days(dataGraph : any){
		this.powerusageProductionNext7days = [];
		for(let i = 0; i < dataGraph.length; i++){
				this.powerusageProductionNext7days.push(this.productionNext7DaysData[i]['powerUsage']);
		}

	}

	productionNextMonthData!:any;
	productionNextMonth(){
		this.spinner.show();
		this.productionNextMonthLoader = true;
		this.auth.productionNextMonth().subscribe({
			next:(response : any)=>{
				this.productionNextMonthData = response['timestampPowerPairs'];
				this.makeDataForProductionNextMonth(this.productionNextMonthData);
				this.spinner.hide();
				this.productionNextMonthLoader = false;
			},
			error: (err : any) => {
				console.log(err);
				this.spinner.hide();
				this.productionNextMonthLoader = false;
			}
		})
	}
	powerusageNextMonthProduction!:any;
	makeDataForProductionNextMonth(dataGraph : any){
		this.powerusageNextMonthProduction = [];
		for(let i = 0; i < dataGraph.length; i++){
				this.powerusageNextMonthProduction.push(this.productionNextMonthData[i]['powerUsage']);
		}
	}

}






