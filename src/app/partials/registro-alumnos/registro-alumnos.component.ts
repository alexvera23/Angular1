import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';

// Importación de los módulos de Material
import { MATERIAL_MODULES } from '../../shared/shared-material';

// Importaciones de nuestros servicios
import { AlumnosService } from '../../services/alumnos.service';
import { FacadeService } from '../../services/facade.service';

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
    console.log("Datos del alumno:", this.alumnoForm.value);
    this.facadeService.openSnackBar('Alumno registrado correctamente');
  }
}