import { Component, Input, ViewChild } from '@angular/core';
import { TableExport } from 'tableexport';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-modal-table-profile',
  templateUrl: './modal-table-profile.component.html',
  styleUrls: ['./modal-table-profile.component.css']
})
export class ModalTableProfileComponent {
  @ViewChild('tableTable')
  table!: TableExport;
  constructor(
  ){}

  @Input() data:any;
  @Input() message!: string;
  @Input() time!: string;
  @Input() type!: string;


  tableExport!:any;
  tablee!:any;
  exportToExcel(): void {
    const worksheet = XLSX.utils.table_to_sheet(document.querySelector('#tableTable'));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'table-data.xlsx');
  }
}
