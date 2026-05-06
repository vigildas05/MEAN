import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="auth-screen">
      <form class="auth-panel" (ngSubmit)="submit()">
        <p class="eyebrow">MEAN Microservices</p>
        <h1>Project Platform</h1>
        <label>
          Name
          <input name="name" [(ngModel)]="name" autocomplete="name" />
        </label>
        <label>
          Email
          <input name="email" type="email" [(ngModel)]="email" autocomplete="email" required />
        </label>
        <label>
          Password
          <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password" required />
        </label>
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        <div class="auth-actions">
          <button type="submit">Sign in</button>
          <button type="button" class="secondary" (click)="register()">Create account</button>
        </div>
      </form>
    </section>
  `
})
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  name = '';
  email = 'demo@example.com';
  password = 'password123';
  error = signal('');

  submit() {
    this.api.login(this.email, this.password).subscribe({
      next: ({ token }) => {
        localStorage.setItem('token', token);
        this.router.navigateByUrl('/');
      },
      error: () => this.error.set('Login failed. Create the account first or check your credentials.')
    });
  }

  register() {
    this.api.register(this.name || 'Demo User', this.email, this.password).subscribe({
      next: ({ token }) => {
        localStorage.setItem('token', token);
        this.router.navigateByUrl('/');
      },
      error: () => this.error.set('Account creation failed. Try another email.')
    });
  }
}
