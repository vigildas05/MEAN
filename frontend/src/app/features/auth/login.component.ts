import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="auth-screen">
      <div class="auth-copy">
        <p class="eyebrow">Taskometer</p>
        <h1>Project Management Platform</h1>
        <p>A modern microservices-based project management platform for teams to organize projects, track tasks, and collaborate efficiently.</p>
        <div class="auth-proof">
          <span>lets get started</span>
        </div>
      </div>

      <form class="auth-panel" (ngSubmit)="submit()">
        <div>
          <p class="eyebrow">Welcome back</p>
          <h2>Sign in to your workspace</h2>
        </div>
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

  private getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof HttpErrorResponse && error.error?.message) {
      return error.error.message;
    }

    return fallback;
  }

  submit() {
    this.api.login(this.email, this.password).subscribe({
      next: ({ token }) => {
        localStorage.setItem('token', token);
        localStorage.removeItem('demoMode');
        this.router.navigateByUrl('/');
      },
      error: (error) => this.error.set(this.getErrorMessage(error, 'Login failed. Create the account first or check your credentials.'))
    });
  }

  register() {
    this.api.register(this.name || 'Demo User', this.email, this.password).subscribe({
      next: ({ token }) => {
        localStorage.setItem('token', token);
        localStorage.removeItem('demoMode');
        this.router.navigateByUrl('/');
      },
      error: (error) => this.error.set(this.getErrorMessage(error, 'Account creation failed. Try another email or a stronger password.'))
    });
  }
}
