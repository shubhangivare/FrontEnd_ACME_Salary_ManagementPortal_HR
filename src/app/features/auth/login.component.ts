import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserRole } from '../../core/auth/auth.service';
@Component({ standalone: true, imports: [CommonModule, ReactiveFormsModule], templateUrl: './login.component.html', styleUrls: ['./login.component.scss'] })
export class LoginComponent {
  private auth = inject(AuthService); private router = inject(Router); private route = inject(ActivatedRoute); private fb = inject(FormBuilder);
  role: UserRole = 'ADMIN'; readonly error = signal(''); readonly submitting = signal(false);
  form = this.fb.nonNullable.group({ role: ['ADMIN' as UserRole, Validators.required], username: ['', Validators.required], password: ['', Validators.required] });
  submit(): void {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true); const { role, username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({ next: user => {
      this.submitting.set(false);
      if (user.role !== role) { this.auth.logout(); this.error.set('Your account does not have the selected role.'); return; }
      const target = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard'; void this.router.navigateByUrl(target);
    }, error: () => { this.submitting.set(false); this.error.set('Invalid username or password, or backend is unavailable.'); } });
  }
}
