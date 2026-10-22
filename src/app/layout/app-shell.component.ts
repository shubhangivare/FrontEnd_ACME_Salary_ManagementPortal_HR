import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss']
})
export class AppShellComponent {
  readonly auth = inject(AuthService);
  readonly canManage = computed(() => this.auth.hasRole(['ADMIN', 'HR']));
  readonly isAdmin = computed(() => this.auth.hasRole(['ADMIN']));
  initials(): string { return (this.auth.user()?.displayName ?? 'U').split(' ').map(v => v[0]).join('').slice(0, 2); }
}