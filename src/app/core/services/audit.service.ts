import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URLS } from '../config/api-urls';
export interface AuditEntry { at: string; user: string; action: string; detail: string; }
@Injectable({ providedIn: 'root' })
export class AuditService {
  readonly entries = signal<AuditEntry[]>([]);
  constructor(private http: HttpClient) { this.refresh(); }
  refresh(): void { this.http.get<AuditEntry[]>(API_URLS.audit).subscribe({ next: rows => this.entries.set(rows ?? []), error: () => this.entries.set([]) }); }
  log(action: string, detail: string, user = 'system'): void {
    this.http.post(API_URLS.audit, { action, detail, user }).subscribe({ next: () => this.refresh(), error: () => this.refresh() });
  }
}
