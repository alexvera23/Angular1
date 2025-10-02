import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// NOTA: Aún no importamos FacadeService porque todavía no lo hemos adaptado.
// Lo agregaremos en un paso posterior.
// import { FacadeService } from 'src/app/services/facade.se rvice';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [
    CommonModule, // Necesario para directivas como *ngIf
    ReactiveFormsModule, // Necesario para [formGroup] y formControlName
    RouterLink // Necesario para routerLink
  ],
  templateUrl: './login-screen.component.html',
  styleUrls: ['./login-screen.component.scss']
})
export class LoginScreenComponent {
  public loginForm: FormGroup;
  public hide: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    // private facadeService: FacadeService // Lo inyectaremos más adelante
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  login() {
    if (this.loginForm.invalid) {
      // Marcar campos como tocados para mostrar errores
      this.loginForm.markAllAsTouched();
      return;
    }

    // Aquí iría la lógica para llamar al servicio de autenticación
    console.log("Formulario de login enviado:", this.loginForm.value);

    // Simulación de login exitoso
    alert("Inicio de sesión exitoso (simulación)");
    this.router.navigate(['/dashboard']);
  }
}