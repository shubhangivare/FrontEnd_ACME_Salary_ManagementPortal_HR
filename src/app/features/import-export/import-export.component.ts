import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Employee, EmployeeService } from '../../core/services/employee.service';
import { AuditService } from '../../core/services/audit.service';
import { AuthService } from '../../core/auth/auth.service';
import { ImportExportService } from '../../core/services/import-export.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent {
  private service = inject(EmployeeService); private importExport = inject(ImportExportService); private audit = inject(AuditService); private auth = inject(AuthService);
  readonly employees = this.service.employees;
  readonly fileName = signal(''); readonly parsed = signal<Employee[]>([]); readonly errors = signal<string[]>([]);
  readonly validRows = signal<Employee[]>([]);
  private csvCell(value: unknown): string { const s = String(value ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
  downloadTemplate(): void {
    const headers = ['id','name','email','department','designation','country','currency','salary','status','joined'];
    this.download(headers.join(',') + '\n', 'employee-import-template.csv');
  }
  onFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    this.fileName.set(file.name); this.parsed.set([]); this.validRows.set([]); this.errors.set([]);
    const reader = new FileReader();
    reader.onload = () => this.parseCsv(String(reader.result ?? ''));
    reader.onerror = () => this.errors.set(['Unable to read the selected file.']);
    reader.readAsText(file);
  }
  private parseCsv(text: string): void {
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) { this.errors.set(['The file must include a header and at least one data row.']); return; }
    const headers = this.parseLine(lines[0]).map(h => h.trim().toLowerCase());
    const required = ['id','name','email','department','designation','country','currency','salary'];
    const missing = required.filter(h => !headers.includes(h));
    if (missing.length) { this.errors.set([`Missing required columns: ${missing.join(', ')}`]); return; }
    const rows: Employee[] = []; const issues: string[] = []; const ids = new Set<string>(); const emails = new Set<string>();
    const existingIds = new Set(this.employees().map(e => e.id)); const existingEmails = new Set(this.employees().map(e => e.email.toLowerCase()));
    lines.slice(1).forEach((line, index) => {
      const vals = this.parseLine(line); const get = (k: string) => vals[headers.indexOf(k)]?.trim() ?? '';
      const row: Employee = { id: get('id'), name: get('name'), email: get('email'), department: get('department'), designation: get('designation'), country: get('country'), currency: get('currency').toUpperCase(), salary: Number(get('salary')), status: (get('status') || 'Active') as Employee['status'], joined: get('joined') || new Date().toISOString().slice(0,10) };
      const rowIssues: string[] = [];
      for (const k of required) if (!get(k)) rowIssues.push(`${k} is required`);
      if (get('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) rowIssues.push('invalid email');
      if (get('salary') && (!Number.isFinite(row.salary) || row.salary < 0)) rowIssues.push('salary must be a non-negative number');
      if (existingIds.has(row.id) || ids.has(row.id)) rowIssues.push(`duplicate employee ID ${row.id}`);
      if (existingEmails.has(row.email.toLowerCase()) || emails.has(row.email.toLowerCase())) rowIssues.push(`duplicate email ${row.email}`);
      if (!['Active','Inactive'].includes(row.status)) rowIssues.push('status must be Active or Inactive');
      if (rowIssues.length) issues.push(`Row ${index + 2}: ${rowIssues.join('; ')}`);
      else { rows.push(row); ids.add(row.id); emails.add(row.email.toLowerCase()); }
    });
    this.parsed.set(rows); this.validRows.set(rows); this.errors.set(issues);
  }
  private parseLine(line: string): string[] {
    const out: string[] = []; let current = ''; let quoted = false;
    for (let i = 0; i < line.length; i++) { const ch = line[i]; if (ch === '"' && quoted && line[i+1] === '"') { current += '"'; i++; } else if (ch === '"') quoted = !quoted; else if (ch === ',' && !quoted) { out.push(current); current = ''; } else current += ch; }
    out.push(current); return out;
  }
  // importRows(): void {
  //   const rows = this.validRows(); if (!rows.length) return;
  //   this.importExport.importRows(rows).subscribe({
  //     next: () => {
  //       this.audit.log('EMPLOYEE_IMPORT', `${rows.length} employees imported`, this.auth.user()?.username);
  //       this.parsed.set([]); this.validRows.set([]); this.fileName.set('');
  //       alert(`${rows.length} employee record(s) imported.`);
  //     },
  //     error: err => this.errors.set([err?.error?.detail || err?.error?.message || 'Import failed. No records were confirmed imported.'])
  //   });
  // }
  exportCsv(): void {
    const headers: (keyof Employee)[] = ['id','name','email','department','designation','country','currency','salary','status','joined'];
    const body = this.employees().map(e => headers.map(h => this.csvCell(e[h])).join(','));
    this.download([headers.join(','), ...body].join('\r\n'), 'peoplepay-employees.csv');
    this.audit.log('EMPLOYEE_EXPORT', `${body.length} employee records exported`, this.auth.user()?.username);
  }
  private download(content: string, name: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }
}