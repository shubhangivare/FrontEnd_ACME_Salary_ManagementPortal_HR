import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/app-shell.component').then(m => m.AppShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'employees', loadComponent: () => import('./features/employees/employee-list.component').then(m => m.EmployeeListComponent) },
      { path: 'employees/new', canActivate: [roleGuard], data: { roles: ['ADMIN', 'HR'] }, loadComponent: () => import('./features/employees/employee-form.component').then(m => m.EmployeeFormComponent) },
      { path: 'employees/:id/edit', canActivate: [roleGuard], data: { roles: ['ADMIN', 'HR'] }, loadComponent: () => import('./features/employees/employee-form.component').then(m => m.EmployeeFormComponent) },
      { path: 'salary', canActivate: [roleGuard], data: { roles: ['ADMIN', 'HR'] }, loadComponent: () => import('./features/salary/salary.component').then(m => m.SalaryComponent) },
      { path: 'countries', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/countries/countries.component').then(m => m.CountriesComponent) },
      { path: 'import-export', canActivate: [roleGuard], data: { roles: ['ADMIN', 'HR'] }, loadComponent: () => import('./features/import-export/import-export.component').then(m => m.ImportExportComponent) },
      { path: 'audit', canActivate: [roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./features/audit/audit.component').then(m => m.AuditComponent) },
      { path: 'help', loadComponent: () => import('./features/help/help.component').then(m => m.HelpComponent) },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];