// import { CommonModule } from '@angular/common';
// import { Component, computed, inject } from '@angular/core';
// import { RouterLink } from '@angular/router';
// import { EmployeeService } from '../../core/services/employee.service';
// import { AuthService } from '../../core/auth/auth.service';

// @Component({
//   standalone: true, imports: [CommonModule, RouterLink],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })
// export class DashboardComponent {
//   private service = inject(EmployeeService); private auth = inject(AuthService);
//   readonly employees = this.service.employees;
//   readonly activeCount = computed(() => this.employees().filter(e => e.status === 'Active').length);
//   readonly departmentCount = computed(() => new Set(this.employees().map(e => e.department)).size);
//   readonly countryCount = computed(() => new Set(this.employees().map(e => e.country)).size);
//   firstName(): string { return (this.auth.user()?.displayName || 'there').split(' ')[0]; }
//   initials(name: string): string { return name.split(' ').map(v => v[0]).join('').slice(0, 2); }
// }


import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly auth = inject(AuthService);

  readonly employees = this.employeeService.employees;

  readonly firstName = computed(() => {
    const username = this.auth.user()?.username ?? '';
    return username.trim().split(/[\s._-]+/)[0] || 'there';
  });

  readonly activeCount = computed(() =>
    this.employees().filter(
      employee => employee.status?.toLowerCase() === 'active'
    ).length
  );

  readonly inactiveCount = computed(() =>
    this.employees().length - this.activeCount()
  );

  readonly activePercentage = computed(() => {
    const total = this.employees().length;

    return total
      ? Math.round((this.activeCount() / total) * 100)
      : 0;
  });

  readonly departmentCount = computed(() =>
    new Set(
      this.employees()
        .map(employee => employee.department?.trim())
        .filter((department): department is string => !!department)
    ).size
  );

  readonly countryCount = computed(() =>
    new Set(
      this.employees()
        .map(employee => employee.country?.trim())
        .filter((country): country is string => !!country)
    ).size
  );

  private readonly chartColors = [
    '#5577e8',
    '#8b70dc',
    '#28a78a',
    '#e6a23c',
    '#e47791',
    '#43a6c6',
    '#8794a8',
    '#d27d45'
  ];

  readonly departmentStats = computed(() => {
    const employees = this.employees();
    const counts = new Map<string, number>();

    employees.forEach(employee => {
      const department = employee.department?.trim();

      if (department) {
        counts.set(
          department,
          (counts.get(department) ?? 0) + 1
        );
      }
    });

    const total = employees.length;

    return Array.from(counts.entries())
      .map(([name, count], index) => ({
        name,
        count,
        percentage: total
          ? Math.round((count / total) * 100)
          : 0,
        color: this.chartColors[index % this.chartColors.length]
      }))
      .sort((a, b) => b.count - a.count);
  });

  readonly statusChartBackground = computed(() => {
    const active = this.activePercentage();

    if (this.employees().length === 0) {
      return 'conic-gradient(#e8edf4 0% 100%)';
    }

    return `conic-gradient(
      #28a78a 0% ${active}%,
      #e47791 ${active}% 100%
    )`;
  });
}
