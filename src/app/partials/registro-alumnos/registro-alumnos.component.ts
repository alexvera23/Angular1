import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';

// Importación de los módulos de Material
import { MATERIAL_MODULES } from '../../shared/shared-material';

// Importaciones de nuestros servicios
import { AlumnosService } from '../../services/alumnos.service';
import { FacadeService } from '../../services/facade.service';
//importar el nuevo servicio AuthService
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-registro-alumnos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    ...MATERIAL_MODULES // ✅ Importamos todos los módulos de Material
  ],
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "alumno";
  public alumnoForm: FormGroup;
  public editar: boolean = false;
  public hide: boolean = true; // Para mostrar/ocultar contraseña
  public hideConfirm: boolean = true; // Para confirmar contraseña

  private fb = inject(FormBuilder);
  private alumnosService = inject(AlumnosService);
  private facadeService = inject(FacadeService);
  private authService = inject(AuthService); // Inyecta el servicio AuthService

  constructor() {
    const alumnoSchema = this.alumnosService.esquemaAlumno();
    this.alumnoForm = this.fb.group({
      matricula: [alumnoSchema.matricula, Validators.required],
      first_name: [alumnoSchema.first_name, Validators.required],
      last_name: [alumnoSchema.last_name, Validators.required],
      email: [alumnoSchema.email, [Validators.required, Validators.email]],
      password: [alumnoSchema.password, [Validators.required, Validators.minLength(8)]],
      confirmar_password: [alumnoSchema.confirmar_password, Validators.required],
      fecha_nacimiento: [alumnoSchema.fecha_nacimiento, Validators.required],
      curp: [alumnoSchema.curp, [Validators.required, Validators.pattern(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$/)]],
      rfc: [alumnoSchema.rfc, [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      edad: [alumnoSchema.edad, [Validators.required, Validators.min(1)]],
      telefono: [alumnoSchema.telefono, Validators.required],
      ocupacion: [alumnoSchema.ocupacion],
      rol: [this.rol]
    });
  }

  ngOnInit(): void {
    this.alumnoForm.patchValue({ rol: this.rol });
  }

  public registrar() {
    if (this.alumnoForm.invalid) {
      this.alumnoForm.markAllAsTouched();
      this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
      return;
    }
    const userData = { ...this.alumnoForm.value };
    userData.username = this.alumnoForm.get('email')?.value; // Asignar el email como username
    delete userData.confirmar_password; // Eliminar el campo confirmar_password

    if(userData.fecha_nacimiento){
      const fecha = new Date(userData.fecha_nacimiento);
      const year = fecha.getFullYear();
      const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
      const day = ('0' + fecha.getDate()).slice(-2);
      userData.fecha_nacimiento = `${year}-${month}-${day}`;
    }
    console.log('Datos a enviar al backend:', userData);
    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.facadeService.openSnackBar('Registro exitoso', 'ÉXITO');
        this.alumnoForm.reset();
      },
      error: (err) => {
        console.error('Error al registrar el usuario:',err);
        let errorMessage = 'Error en el registro.';
        if(err.error){
          const errors = Object.values(err.error).flat().join(' ');
          errorMessage += ` ${errors}`;
        }else {
          errorMessage += ' Por favor, intenta de nuevo más tarde.';
        }
        this.facadeService.openSnackBar(errorMessage, 'ERROR');
  }
    });
  }
}