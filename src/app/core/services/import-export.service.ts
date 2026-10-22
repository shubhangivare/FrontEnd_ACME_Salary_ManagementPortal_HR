import { Injectable, inject } from '@angular/core';
import { Employee, EmployeeService } from './employee.service';
@Injectable({ providedIn: 'root' })
export class ImportExportService {
  private employees = inject(EmployeeService);
  importRows(rows: Employee[]) { return this.employees.replaceAll(rows); }
  refreshEmployees(): void { this.employees.refresh(); }
}
