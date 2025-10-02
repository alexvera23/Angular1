import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Importamos los componentes parciales que se usarán dentro de este screen
import { RegistroAdminComponent } from '../../partials/registro-admin/registro-admin.component';
import { RegistroAlumnosComponent } from '../../partials/registro-alumnos/registro-alumnos.component';
import { RegistroProfesoresComponent } from '../../partials/registro-profesores/registro-profesores.component';

@Component({
  selector: 'app-registro-screen',
  standalone: true,
  imports: [
    CommonModule, // Necesario para [ngSwitch]
    RouterLink,
    // Se declaran aquí los componentes que se usarán en el template
    RegistroAdminComponent,
    RegistroAlumnosComponent,
    RegistroProfesoresComponent
  ],
  templateUrl: './registro-screen.component.html',
  styleUrls: ['./registro-screen.component.scss']
})
export class RegistroScreenComponent {
  public tipo_usuario: string = 'administrador'; // Opción por defecto

  constructor() { }

  public selectOption(opcion: string) {
    this.tipo_usuario = opcion;
  }
}