import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_URLS } from '../config/api-urls';
export type UserRole = 'ADMIN' | 'HR';
export interface AppUser { username: string; role: UserRole; displayName: string; }
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'peoplepay_api_user';
  readonly user = signal<AppUser | null>(this.readUser());
  constructor(private router: Router, private http: HttpClient) {}
  private readUser(): AppUser | null { try { return JSON.parse(sessionStorage.getItem(this.key) || 'null') as AppUser | null; } catch { return null; } }
  login(username: string, password: string): Observable<AppUser> {
    return this.http.post<AppUser>(API_URLS.auth.login, { username: username.trim(), password }).pipe(tap(user => {
      sessionStorage.setItem('peoplepay_access_token', `Basic ${btoa(`${username.trim()}:${password}`)}`);
      sessionStorage.setItem(this.key, JSON.stringify(user)); this.user.set(user);
    }));
  }
  logout(): void { sessionStorage.removeItem('peoplepay_access_token'); sessionStorage.removeItem(this.key); this.user.set(null); void this.router.navigate(['/login']); }
  isAuthenticated(): boolean { return !!this.user(); }
  hasRole(roles: string[]): boolean { return !!this.user() && roles.includes(this.user()!.role); }
}
