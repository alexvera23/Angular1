// src/app/screens/login-screen/login-screen.component.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Importaciones de Material y nuestro servicio
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { AuthService } from '../../services/auth.service';
import { FacadeService } from '../../services/facade.service';


@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule, // Cambiamos a ReactiveFormsModule
    ...MATERIAL_MODULES //  Importamos todos los módulos de Material
  ],
  templateUrl: './login-screen.component.html',
  styleUrl: './login-screen.component.scss'
})
export class LoginScreenComponent {
  public loginForm: FormGroup;
  public passwordVisible = false;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private facadeService = inject(FacadeService);

  constructor() {
    this.loginForm = this.fb.group({
      // Django espera 'username', no 'email', para el login por defecto
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        // TODO: Guardar el 'access_token' en localStorage
        this.facadeService.openSnackBar('Inicio de sesión exitoso');
        this.router.navigate(['/dashboard']); // Redirigir al dashboard
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.facadeService.openSnackBar('Credenciales incorrectas. Por favor, inténtalo de nuevo.', 'ERROR');
      }
    });
  }
}