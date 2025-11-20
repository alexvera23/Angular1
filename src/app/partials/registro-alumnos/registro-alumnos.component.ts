import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { ActivatedRoute, Router } from '@angular/router';

// Importación de los módulos de Material
import { MATERIAL_MODULES } from '../../shared/shared-material';

// Importaciones de nuestros servicios
import { AlumnosService } from '../../services/alumnos.service';
import { FacadeService } from '../../services/facade.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-alumnos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    ...MATERIAL_MODULES
  ],
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "alumno";
  public alumnoForm: FormGroup;
  public editar: boolean = false;
  public hide: boolean = true;
  public hideConfirm: boolean = true;
  private currentUserID: string | null = null;
  
  public pageTitle: string = "Registro de Alumno";

  private fb = inject(FormBuilder);
  private alumnosService = inject(AlumnosService);
  private facadeService = inject(FacadeService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

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
    // IMPORTANTE: Asignar el rol correctamente desde el @Input
    if (this.rol) {
      this.alumnoForm.patchValue({ rol: this.rol });
      console.log('Rol asignado desde @Input:', this.rol);
    } else {
      // Si no hay rol desde @Input, usar 'alumno' por defecto
      this.alumnoForm.patchValue({ rol: 'alumno' });
      console.log('Rol por defecto asignado: alumno');
    }
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.editar = true;
       this.currentUserID = id;
        this.pageTitle = 'Editar Administrador';
      }else{
        this.alumnoForm.patchValue({ rol: 'alumno' });
        console.log('Modo registro de alumno');
      }
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          // --- MODO EDICIÓN ---
          this.editar = true;
          this.currentUserID = id;
          this.pageTitle = 'Editar Alumno';
          this.alumnoForm.get('password')?.clearValidators();
          this.alumnoForm.get('password')?.updateValueAndValidity();
          this.alumnoForm.get('confirmar_password')?.clearValidators();
          this.alumnoForm.get('confirmar_password')?.updateValueAndValidity();
          // Cargar datos del alumno a editar
          this.loadUserData(id);
        } else {
          // --- MODO CREACIÓN ---
          this.editar = false;
          this.pageTitle = 'Registro de Alumno';
        }
      });
    });
  }

  loadUserData(id: string) {
    this.alumnosService.getUsuarioById(id).subscribe({
      next: (data) => {
        // Rellena el formulario con los datos
        this.alumnoForm.patchValue({
          matricula: data.matricula,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          fecha_nacimiento: data.fecha_nacimiento,
          curp: data.curp,
          rfc: data.rfc,
          edad : data.edad,
          telefono: data.telefono,
          ocupacion: data.ocupacion,
          rol: data.rol
        });
        this.alumnoForm.get('email')?.disable(); // Deshabilita el campo email en modo edición
      },
      error: (err) => {
        console.error("Error al cargar usuario", err);
        this.facadeService.openSnackBar('Error al cargar datos del usuario', 'ERROR');
      }
    });
  }

  public registrar() {
    if (this.alumnoForm.invalid) {
      this.alumnoForm.markAllAsTouched();
      this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
      return;
    }
    
    const userData = { ...this.alumnoForm.value };
    userData.username = this.alumnoForm.get('email')?.value;
    delete userData.confirmar_password;

    // Formatear la fecha de nacimiento
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
        // Restablecer el rol después del reset
        this.alumnoForm.patchValue({ rol: this.rol });
      },
      error: (err) => {
        console.error('Error al registrar el usuario:', err);
        let errorMessage = 'Error en el registro.';
        if(err.error){
          const errors = Object.values(err.error).flat().join(' ');
          errorMessage += ` ${errors}`;
        } else {
          errorMessage += ' Por favor, intenta de nuevo más tarde.';
        }
        this.facadeService.openSnackBar(errorMessage, 'ERROR');
      }
    });
  }

  public actualizar() {
    if (this.alumnoForm.invalid) {
      this.alumnoForm.markAllAsTouched();
      this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
      return;
    }

    if (!this.currentUserID) {
      this.facadeService.openSnackBar('ID de usuario no encontrado para la actualización.', 'ERROR');
      return;
    }
    const emailDisable = this.alumnoForm.get('email')?.disabled;
    if(emailDisable){
      this.alumnoForm.get('email')?.enable();
    }
    const userData = { ...this.alumnoForm.value };

    if(emailDisable){
      this.alumnoForm.get('email')?.disable();
    }
    userData.username = userData.email;
    delete userData.confirmar_password;
    if (!userData.password) {
      delete userData.password;
    }
    console.log('Datos a enviar para actualización:', userData);

    this.alumnosService.updateUsuario(this.currentUserID, userData).subscribe({
      next: (response) => {
        console.log('Usuario actualizado con éxito:', response);
        this.facadeService.openSnackBar('Actualización exitosa', 'ÉXITO');
        this.router.navigate(['/dashboard/alumno']);
      },
      error: (err) => {
        console.error('Error al actualizar el usuario:', err);
        let errorMessage = 'Error en la actualización.';
        if(err.error){
          const errors = Object.values(err.error).flat().join(' ');
          errorMessage += ` ${errors}`;
        } else {
          errorMessage += ' Por favor, intenta de nuevo más tarde.';
        }
        this.facadeService.openSnackBar(errorMessage, 'ERROR');
      }
    });
  }

  public regresar(){
    this.location.back();
  }
}