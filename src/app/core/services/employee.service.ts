import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_URLS } from '../config/api-urls';

export interface Employee {
  id: string; name: string; email: string; department: string; designation: string;
  country: string; currency: string; salary: number; status: 'Active' | 'Inactive'; joined: string;
}
@Injectable({ providedIn: 'root' })
export class EmployeeService {
  readonly employees = signal<Employee[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  constructor(private http: HttpClient) { this.refresh(); }
  refresh(filters?: { search?: string; department?: string; status?: string; sortBy?: string }): void {
    this.loading.set(true);
    let params = new HttpParams();
    if (filters?.search?.trim()) params = params.set('search', filters.search.trim());
    if (filters?.department) params = params.set('department', filters.department);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.sortBy) params = params.set('sortBy', filters.sortBy);
    // The list is always fetched from the backend; UI filtering is applied to this current server dataset.
    this.http.get<Employee[]>(API_URLS.employees.base).subscribe({
      next: rows => { this.employees.set(rows ?? []); this.loading.set(false); this.error.set(''); },
      error: () => { this.loading.set(false); this.error.set('Unable to load employees. Check the Spring Boot backend and your access.'); }
    });
  }
  save(employee: Employee, updating = false): Observable<Employee> {
    const request = updating
      ? this.http.put<Employee>(API_URLS.employees.byId(employee.id), employee)
      : this.http.post<Employee>(API_URLS.employees.base, employee);
    return request.pipe(tap({ next: () => { this.error.set(''); this.refresh(); },
      error: err => this.error.set(err?.error?.detail || err?.error?.message || 'Unable to save employee.') }));
  }
  getAllForForm(): Observable<Employee[]> { return this.http.get<Employee[]>(API_URLS.employees.base); }
  get(id: string): Employee | undefined { return this.employees().find(e => e.id === id); }
  getById(id: string): Observable<Employee> { return this.http.get<Employee>(API_URLS.employees.byId(id)); }
  deactivate(id: string): Observable<unknown> {
    return this.http.patch(API_URLS.employees.deactivate(id), {}).pipe(tap({ next: () => this.refresh() }));
  }
  replaceAll(rows: Employee[]): Observable<{ imported: number }> {
    return this.http.post<{ imported: number }>(API_URLS.employees.import, rows).pipe(tap(() => this.refresh()));
  }
}
