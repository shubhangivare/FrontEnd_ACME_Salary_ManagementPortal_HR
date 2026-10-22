import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Employee, EmployeeService } from '../../core/services/employee.service';
import { AuditService } from '../../core/services/audit.service';
import { AuthService } from '../../core/auth/auth.service';
import { CountryService } from '../../core/services/country.service';

@Component({ standalone: true, imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './employee-form.component.html', styleUrls: ['./employee-form.component.scss'] })
export class EmployeeFormComponent {
  private fb = inject(FormBuilder); private route = inject(ActivatedRoute); private router = inject(Router);
  private service = inject(EmployeeService); private countryService = inject(CountryService); private audit = inject(AuditService); private auth = inject(AuthService);
  countries: { name: string; currency: string }[] = [];
  readonly deptOptions = ['Engineering', 'Human Resources', 'Finance', 'Operations', 'Sales', 'Legal', 'Marketing'];
  readonly id = this.route.snapshot.paramMap.get('id');
  readonly editing = !!this.id;
  error = ''; loading = false;
  form = this.fb.nonNullable.group({
    id: ['', [Validators.required, Validators.maxLength(40)]], name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]], department: ['', Validators.required],
    designation: ['', Validators.required], country: ['India', Validators.required], joined: [new Date().toISOString().slice(0,10), Validators.required],
    status: ['Active' as 'Active'|'Inactive', Validators.required], salary: [0, [Validators.required, Validators.min(0)]],
    currency: ['INR', [Validators.required, Validators.pattern(/^[A-Za-z]{3}$/)]]
  });
  constructor() {
    this.countryService.getAll().subscribe({ next: rows => this.countries = rows, error: () => this.error = 'Unable to load country options from backend.' });
    this.form.controls.country.valueChanges.subscribe(country => {
      const currency = this.countries.find(c => c.name === country)?.currency;
      if (currency) this.form.controls.currency.setValue(currency, { emitEvent: false });
    });
    if (this.id) {
      this.loading = true;
      this.service.getById(this.id).subscribe({ next: e => { this.form.patchValue({ ...e, joined: String(e.joined).slice(0,10) }); this.loading = false; },
        error: () => { this.error = 'Employee not found or API unavailable.'; this.loading = false; } });
      this.form.controls.id.disable();
    } else {
      this.service.refresh();
      this.service.employees();
      this.service.getAllForForm().subscribe({ next: rows => {
        const max = rows.reduce((n,e) => Math.max(n, Number(e.id.replace('EMP-','')) || 1000), 1000);
        this.form.controls.id.setValue(`EMP-${max + 1}`);
      }, error: () => this.error = 'Unable to load employee IDs from backend.' });
    }
  }
  save(): void {
    this.error = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const employee: Employee = { ...value, currency: value.currency.toUpperCase(), salary: Number(value.salary) };
    this.service.save(employee, this.editing).subscribe({
      next: () => { this.audit.log(this.editing ? 'EMPLOYEE_UPDATED' : 'EMPLOYEE_CREATED', `${employee.id} · ${employee.name}`, this.auth.user()?.username); void this.router.navigate(['/employees']); },
      error: err => this.error = err?.error?.detail || err?.error?.message || 'Unable to save employee. Check the record and try again.'
    });
  }
}
