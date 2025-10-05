import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// 1. Importaciones CLAVE para Formularios y Angular Material
import { FormsModule } from '@angular/forms'; // Necesario para usar [(ngModel)]
// Importación de los módulos de Material
import { MATERIAL_MODULES } from '../../shared/shared-material';

@Component({
  selector: 'app-login-screen',
  standalone: true,
  // 2. Añadir TODOS los módulos necesarios a los imports
  imports: [
    RouterLink,
    FormsModule, // <-- ¡Muy importante!
     ...MATERIAL_MODULES //  Importamos todos los módulos de Material
  ],
  templateUrl: './login-screen.component.html',
  styleUrl: './login-screen.component.scss'
})
export class LoginScreenComponent {
  // 3. Variables para almacenar los datos del formulario
  public email = '';
  public password = '';
  public passwordVisible = false; // Para controlar la visibilidad de la contraseña

  // 4. Función que se ejecuta al enviar el formulario
  onSubmit() {
    // Por ahora, solo mostraremos los datos en la consola.
    // En un futuro, aquí llamarías a tu servicio de autenticación.
    console.log('Formulario enviado');
    console.log('Email:', this.email);
    console.log('Contraseña:', this.password);

    // Aquí puedes añadir lógica para redirigir al usuario si el login es exitoso
    // Ejemplo: this.router.navigate(['/dashboard']);
  }
}