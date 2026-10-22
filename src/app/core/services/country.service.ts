import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URLS } from '../config/api-urls';
export interface CountryConfig { name: string; code: string; currency: string; symbol: string; rate: number; updated: string; }
@Injectable({ providedIn: 'root' })
export class CountryService {
  constructor(private http: HttpClient) {}
  getAll() { return this.http.get<CountryConfig[]>(API_URLS.countries.base); }
  updateRate(code: string, rate: number) { return this.http.put<CountryConfig>(API_URLS.countries.byCode(code), { rate }); }
}
