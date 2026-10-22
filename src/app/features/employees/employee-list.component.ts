// import { CommonModule } from '@angular/common';
// import { Component, computed, inject } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// import { RouterLink } from '@angular/router';
// import { EmployeeService } from '../../core/services/employee.service';
// import { AuthService } from '../../core/auth/auth.service';
// import { AuditService } from '../../core/services/audit.service';

// @Component({
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterLink],
//   templateUrl: './employee-list.component.html',
//   styleUrls: ['./employee-list.component.scss']
// })
// export class EmployeeListComponent {
//   private service = inject(EmployeeService);
//   private auth = inject(AuthService);
//   private audit = inject(AuditService);
//   private fb = inject(FormBuilder);

//   readonly employees = this.service.employees;

//   readonly canManage = computed(() =>
//     this.auth.hasRole(['ADMIN', 'HR'])
//   );

//   // Reactive form with country filter added
//   readonly filters = this.fb.nonNullable.group({
//     search: [''],
//     department: [''],
//     country: [''],
//     status: [''],
//     sortBy: ['name']
//   });

//   get departments(): string[] {
//     return [
//       ...new Set(
//         this.employees()
//           .map(e => e.department)
//           .filter(Boolean)
//       )
//     ].sort();
//   }

//   // Populate country options from employee data
//   get countries(): string[] {
//     return [
//       ...new Set(
//         this.employees()
//           .map(e => e.country)
//           .filter(Boolean)
//       )
//     ].sort();
//   }

//   filtered() {
//     const {
//       search,
//       department,
//       country,
//       status,
//       sortBy
//     } = this.filters.getRawValue();

//     const q = search.toLowerCase().trim();

//     return this.employees()
//       .filter(e =>
//         (
//           !q ||
//           [
//             e.name,
//             e.id,
//             e.email,
//             e.department,
//             e.designation,
//             e.country
//           ].some(v =>
//             String(v ?? '').toLowerCase().includes(q)
//           )
//         ) &&
//         (!department || e.department === department) &&
//         (!country || e.country === country) &&
//         (!status || e.status === status)
//       )
//       .slice()
//       .sort((a, b) =>
//         sortBy === 'salary'
//           ? b.salary - a.salary
//           : sortBy === 'joined'
//             ? b.joined.localeCompare(a.joined)
//             : a.name.localeCompare(b.name)
//       );
//   }

//   initials(name: string): string {
//     return name
//       .split(' ')
//       .map(v => v[0])
//       .join('')
//       .slice(0, 2);
//   }

//   clearFilters(): void {
//     this.filters.reset({
//       search: '',
//       department: '',
//       country: '',
//       status: '',
//       sortBy: 'name'
//     });

//     this.service.refresh();
//   }

//   deactivate(id: string): void {
//     if (confirm(`Deactivate ${id}?`)) {
//       this.service.deactivate(id).subscribe({
//         next: () =>
//           this.audit.log(
//             'EMPLOYEE_DEACTIVATED',
//             id,
//             this.auth.user()?.username
//           ),
//         error: () =>
//           alert('Unable to deactivate employee. Check backend access.')
//       });
//     }
//   }

//   refresh(): void {
//     this.service.refresh();
//   }
// }


import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as XLSX from 'xlsx';

import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/auth/auth.service';
import { AuditService } from '../../core/services/audit.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent {
  private service = inject(EmployeeService);
  private auth = inject(AuthService);
  private audit = inject(AuditService);
  private fb = inject(FormBuilder);

  readonly employees = this.service.employees;

  readonly canManage = computed(() =>
    this.auth.hasRole(['ADMIN', 'HR'])
  );

  readonly filters = this.fb.nonNullable.group({
    search: [''],
    department: [''],
    country: [''],
    status: [''],
    sortBy: ['name']
  });

  get departments(): string[] {
    return [
      ...new Set(
        this.employees()
          .map(e => e.department)
          .filter(Boolean)
      )
    ].sort();
  }

  get countries(): string[] {
    return [
      ...new Set(
        this.employees()
          .map(e => e.country)
          .filter(Boolean)
      )
    ].sort();
  }

  filtered() {
    const {
      search,
      department,
      country,
      status,
      sortBy
    } = this.filters.getRawValue();

    const q = search.toLowerCase().trim();

    return this.employees()
      .filter(e =>
        (
          !q ||
          [
            e.name,
            e.id,
            e.email,
            e.department,
            e.designation,
            e.country
          ].some(v =>
            String(v ?? '').toLowerCase().includes(q)
          )
        ) &&
        (!department || e.department === department) &&
        (!country || e.country === country) &&
        (!status || e.status === status)
      )
      .slice()
      .sort((a, b) =>
        sortBy === 'salary'
          ? b.salary - a.salary
          : sortBy === 'joined'
            ? b.joined.localeCompare(a.joined)
            : a.name.localeCompare(b.name)
      );
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map(v => v[0])
      .join('')
      .slice(0, 2);
  }

  downloadExcel(): void {
    // Enforce role-based access in the UI.
    // The backend must enforce authorization independently.
    if (!this.canManage()) {
      alert('You are not authorized to export employee data.');
      return;
    }

    const records = this.filtered();

    if (records.length === 0) {
      alert('No employee records available to export.');
      return;
    }

    // Export only the currently filtered and sorted records.
    const exportData = records.map(e => ({
      'Employee ID': e.id,
      'Employee Name': e.name,
      'Email': e.email,
      'Department': e.department,
      'Designation': e.designation,
      'Country': e.country,
      'Annual Salary': e.salary,
      'Currency': e.currency,
      'Status': e.status,
      'Joining Date': e.joined
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set readable column widths.
    worksheet['!cols'] = [
      { wch: 16 },
      { wch: 24 },
      { wch: 32 },
      { wch: 20 },
      { wch: 24 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 }
    ];

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Employees'
    );

    const date = new Date().toISOString().slice(0, 10);
    const fileName = `PeoplePay_Employees_${date}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  clearFilters(): void {
    this.filters.reset({
      search: '',
      department: '',
      country: '',
      status: '',
      sortBy: 'name'
    });

    this.service.refresh();
  }

  deactivate(id: string): void {
    if (confirm(`Deactivate ${id}?`)) {
      this.service.deactivate(id).subscribe({
        next: () =>
          this.audit.log(
            'EMPLOYEE_DEACTIVATED',
            id,
            this.auth.user()?.username
          ),
        error: () =>
          alert('Unable to deactivate employee. Check backend access.')
      });
    }
  }

  refresh(): void {
    this.service.refresh();
  }
}
