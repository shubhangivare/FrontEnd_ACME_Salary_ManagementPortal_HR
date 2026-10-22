import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../core/services/employee.service';
import { AuditService } from '../../core/services/audit.service';
import { AuthService } from '../../core/auth/auth.service';
import { SalaryService, SalaryRevision } from '../../core/services/salary.service';

@Component({ standalone: true, imports: [CommonModule, ReactiveFormsModule], templateUrl: './salary.component.html', styleUrls: ['./salary.component.scss'] })
export class SalaryComponent {
  private service = inject(EmployeeService); private audit = inject(AuditService); private auth = inject(AuthService);
  private salaryService = inject(SalaryService); private fb = inject(FormBuilder);
  readonly employees = this.service.employees;
  readonly activeCount = computed(() => this.employees().filter(e => e.status === 'Active').length);
  readonly indiaPayroll = computed(() => this.employees().filter(e => e.status === 'Active' && e.currency === 'INR').reduce((s,e) => s+e.salary,0));
  readonly history = signal<SalaryRevision[]>([]);
  readonly searchForm = this.fb.nonNullable.group({ search: [''] });
  readonly revisionForm = this.fb.nonNullable.group({
    newSalary: [0, [Validators.required, Validators.min(0)]],
    effectiveDate: [new Date().toISOString().slice(0,10), Validators.required],
    reason: ['', [Validators.required, Validators.minLength(3)]]
  });
  selectedId = signal(''); readonly saving = signal(false); error = '';
  constructor() { this.refreshHistory(); }
  private refreshHistory(): void { this.salaryService.getRevisions().subscribe({ next: rows => this.history.set(rows ?? []), error: () => this.history.set([]) }); }
  filtered() {
    const q = this.searchForm.controls.search.value.toLowerCase().trim();
    return this.employees().filter(e => `${e.name} ${e.id} ${e.department}`.toLowerCase().includes(q));
  }
  selectedEmployee = computed(() => this.employees().find(e => e.id === this.selectedId()));
  initials(name: string): string { return name.split(' ').map(v => v[0]).join('').slice(0,2); }
  openRevision(id: string): void {
    const e = this.service.get(id); if (!e) return;
    this.selectedId.set(id); this.error = '';
    this.revisionForm.reset({ newSalary: e.salary, effectiveDate: new Date().toISOString().slice(0,10), reason: '' });
  }
  saveRevision(): void {
    const e = this.selectedEmployee();
    if (!e || this.revisionForm.invalid) { this.revisionForm.markAllAsTouched(); return; }
    const value = this.revisionForm.getRawValue(); this.saving.set(true); this.error = '';
    this.salaryService.createRevision({ employeeId: e.id, newSalary: Number(value.newSalary), effectiveDate: value.effectiveDate, reason: value.reason.trim() }).subscribe({
      next: () => { this.saving.set(false); this.service.refresh(); this.refreshHistory(); this.audit.log('SALARY_REVISED', `${e.id}: ${e.salary} → ${value.newSalary} ${e.currency}; effective ${value.effectiveDate}; ${value.reason}`, this.auth.user()?.username); this.selectedId.set(''); },
      error: err => { this.saving.set(false); this.error = err?.error?.detail || err?.error?.message || 'Unable to save salary revision.'; }
    });
  }
}
