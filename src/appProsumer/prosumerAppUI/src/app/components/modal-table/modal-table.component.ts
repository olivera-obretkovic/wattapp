import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-modal-table',
  templateUrl: './modal-table.component.html',
  styleUrls: ['./modal-table.component.css']
})
export class ModalTableComponent {

  constructor(
  ){}

  @Input() data:any;
  @Input() message!: string;
  @Input() time!: string;
  @Input() type!: string;

  @ViewChild('myTable') myTable!: ElementRef;


  exportToExcel(tableData: string): void {
    const worksheet = XLSX.utils.table_to_sheet(this.myTable.nativeElement);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, tableData + '.xlsx');
  }

}
