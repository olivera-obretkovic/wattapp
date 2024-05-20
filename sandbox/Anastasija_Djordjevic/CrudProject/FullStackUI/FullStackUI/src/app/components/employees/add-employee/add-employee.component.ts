import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { Employee } from 'src/app/models/employee.model';
import { EmpleyeesService } from 'src/app/services/empleyees.service';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit{

  addEmployeeRequest: Employee = 
  {
    id: '',
    name: '',
    email: '',
    phone: 0,
    salary: 0,
    department: ''
  };

  constructor(private employeeService: EmpleyeesService, private router: Router) {}

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  addEmployee()
  {
    this.employeeService.addEmployee(this.addEmployeeRequest).subscribe({
      next: (employees) =>
      {
        this.router.navigate(['employees']);
      }
    })
  }

}
