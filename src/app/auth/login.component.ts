import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>Iniciar Sesión</h2>
        <form (ngSubmit)="login()">
          <div class="form-group">
            <label>Email</label>
            <input [(ngModel)]="email" name="email" type="email" required placeholder="tu@email.com">
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input [(ngModel)]="password" name="password" type="password" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn-primary">Entrar</button>
        </form>
        <p class="switch-auth">
          ¿No tienes cuenta? <a routerLink="/signup">Regístrate aquí</a>
        </p>
        <div class="mock-info">
          <small>Tip: Usa el botón "Mock Login" para entrar como admin sin credenciales.</small>
          <br>
          <a href="/auth/mock" class="btn-secondary">🔑 Mock Admin Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f4f6f9;
      font-family: 'Inter', sans-serif;
    }
    .auth-box {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    h2 { margin-bottom: 1.5rem; color: #1e293b; }
    .form-group { margin-bottom: 1rem; text-align: left; }
    label { display: block; margin-bottom: 0.5rem; color: #475569; }
    input {
      width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1;
      border-radius: 6px; font-size: 1rem;
    }
    .btn-primary {
      width: 100%; padding: 0.75rem; background: #3b82f6; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;
      margin-top: 1rem;
    }
    .btn-primary:hover { background: #2563eb; }
    .switch-auth { margin-top: 1rem; font-size: 0.9rem; color: #64748b; }
    .switch-auth a { color: #3b82f6; text-decoration: none; }
    .mock-info { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; }
    .btn-secondary {
      display: inline-block; margin-top: 0.5rem; padding: 0.5rem 1rem;
      background: #e2e8f0; color: #475569; text-decoration: none;
      border-radius: 4px; font-size: 0.9rem;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router, private authService: AuthService) { }

  login() {
    if (!this.email || !this.password) return;

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al iniciar sesión. Verifica tus credenciales.');
      }
    });
  }
}
