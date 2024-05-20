import { Component, OnInit } from '@angular/core';
import { Employee } from 'src/app/models/employee.model';
import { EmpleyeesService } from 'src/app/services/empleyees.service';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.css']
})
export class EmployeesListComponent implements OnInit{

  employees: Employee[] = [];
  constructor (private employeesService: EmpleyeesService) {}

  ngOnInit(): void {
    this.employeesService.getAllEmployees().subscribe({
      next: (employees: Employee[]) =>
      {
        this.employees = employees;
      },
      error: (err:any) =>
      {
        console.log(err);
      }
    })
  }

}
