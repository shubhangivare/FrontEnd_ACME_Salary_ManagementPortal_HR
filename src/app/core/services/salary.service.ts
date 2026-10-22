import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URLS } from '../config/api-urls';
export interface SalaryRevision { id: string; employeeId: string; oldSalary: number; newSalary: number; currency: string; effectiveDate: string; reason: string; user: string; at: string; }
@Injectable({ providedIn: 'root' })
export class SalaryService {
  constructor(private http: HttpClient) {}
  getRevisions() { return this.http.get<SalaryRevision[]>(API_URLS.salaryRevisions); }
  createRevision(payload: { employeeId: string; newSalary: number; effectiveDate: string; reason: string }) {
    return this.http.post<SalaryRevision>(API_URLS.salaryRevisions, payload);
  }
}
