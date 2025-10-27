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
  public isLoading = false;

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
      this.facadeService.openSnackBar('Por favor, completa el formulario correctamente.', 'ERROR');
      return;
    }
    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        const userRole = this.authService.getUserRole();
        const username= this.authService.getUsername();
        console.log('Rol del usuario:', userRole);
        console.log('Nombre de usuario:', username);


        this.facadeService.openSnackBar('Inicio de sesión exitoso');
        this.redirectByRole(userRole);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.facadeService.openSnackBar('Credenciales incorrectas. Por favor, inténtalo de nuevo.', 'ERROR');
      }
    });
  }

   private redirectByRole(role: string | null): void {
    switch (role) {
      case 'administrador':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'maestro':
        this.router.navigate(['/dashboard/profesor']);
        break;
      case 'alumno':
        this.router.navigate(['/dashboard/alumno']);
        break;
      default:
        console.error('Rol no reconocido:', role);
        this.facadeService.openSnackBar('Error: Rol de usuario no válido', 'ERROR');
        this.authService.logout();
        this.router.navigate(['/login']);
    }
  }

}