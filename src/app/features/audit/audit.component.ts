import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuditService } from '../../core/services/audit.service';
@Component({ standalone: true, imports: [CommonModule, ReactiveFormsModule], templateUrl: './audit.component.html', styleUrls: ['./audit.component.scss'] })
export class AuditComponent {
  private audit = inject(AuditService); private fb = inject(FormBuilder);
  readonly filters = this.fb.nonNullable.group({ search: [''], action: [''] });
  readonly entries = this.audit.entries;
  readonly actions = computed(() => [...new Set(this.entries().map(e => e.action))].sort());
  filtered() {
    const { search, action } = this.filters.getRawValue(); const q = search.toLowerCase().trim();
    return this.entries().filter(e => (!action || e.action === action) && (!q || `${e.user} ${e.action} ${e.detail}`.toLowerCase().includes(q)));
  }
  clear(): void { this.filters.reset({ search: '', action: '' }); this.audit.refresh(); }
  exportAudit(): void {
    const rows = [['timestamp','user','action','detail'], ...this.filtered().map(e => [e.at,e.user,e.action,e.detail])];
    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); const a = document.createElement('a'); a.href = url; a.download = 'peoplepay-audit.csv'; a.click(); URL.revokeObjectURL(url);
  }
}
