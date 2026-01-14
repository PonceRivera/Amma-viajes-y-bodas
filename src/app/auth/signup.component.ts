import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>Crear Cuenta</h2>
        <form (ngSubmit)="signup()">
          <div class="form-group">
            <label>Nombre Completo</label>
            <input [(ngModel)]="name" name="name" type="text" required placeholder="Tu Nombre">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input [(ngModel)]="email" name="email" type="email" required placeholder="tu@email.com">
          </div>
          <div class="form-group">
            <label>Contraseña</label>
            <input [(ngModel)]="password" name="password" type="password" required placeholder="••••••••">
          </div>
          <button type="submit" class="btn-primary">Registrarse</button>
        </form>
        <p class="switch-auth">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia Sesión</a>
        </p>
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
      width: 100%; padding: 0.75rem; background: #22c55e; color: white;
      border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;
      margin-top: 1rem;
    }
    .btn-primary:hover { background: #16a34a; }
    .switch-auth { margin-top: 1rem; font-size: 0.9rem; color: #64748b; }
    .switch-auth a { color: #3b82f6; text-decoration: none; }
  `]
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';

  constructor(private router: Router, private authService: AuthService) { }

  signup() {
    if (!this.name || !this.email || !this.password) return;

    this.authService.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        alert('Cuenta creada exitosamente. Bienvenido!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        const errorMessage = err.error?.error || 'Error al crear cuenta.';
        alert(errorMessage);
      }
    });
  }
}
