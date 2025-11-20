import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { ActivatedRoute, Router } from '@angular/router';

// Importación de los módulos de Material
import { MATERIAL_MODULES } from '../../shared/shared-material';

// Servicios
import { ProfesoresService } from '../../services/profesores.service';
import { FacadeService } from '../../services/facade.service';
import { AuthService } from '../../services/auth.service';
import { MateriasService } from '../../services/materias.service';

@Component({
  selector: 'app-registro-profesores',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    ...MATERIAL_MODULES
  ],
  templateUrl: './registro-profesores.component.html',
  styleUrls: ['./registro-profesores.component.scss']
})
export class RegistroProfesoresComponent implements OnInit {

  @Input() rol: string = "maestro";
  public maestroForm: FormGroup;
  public editar: boolean = false;
  public hide: boolean = true;
  public hideConfirm: boolean = true;
  private currentUserID: string | null = null;
  public pageTitle: string = "Registro de Profesor";
  
  // Materias del profesor en modo edición
  private materiasSeleccionadas: string[] = [];
  
  // Lista de materias disponibles
  public materiasData: any[] = [];
  
  private fb = inject(FormBuilder);
  private profesoresService = inject(ProfesoresService);
  private facadeService = inject(FacadeService);
  private authService = inject(AuthService);
  private materiasService = inject(MateriasService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    const maestroSchema = this.profesoresService.esquemaProfesor();
    this.maestroForm = this.fb.group({
      n_empleado: [maestroSchema.n_empleado, Validators.required],
      first_name: [maestroSchema.first_name, Validators.required],
      last_name: [maestroSchema.last_name, Validators.required],
      email: [maestroSchema.email, [Validators.required, Validators.email]],
      password: [maestroSchema.password, [Validators.required, Validators.minLength(8)]],
      confirmar_password: [maestroSchema.confirmar_password, Validators.required],
      fecha_nacimiento: [maestroSchema.fecha_nacimiento, Validators.required],
      telefono: [maestroSchema.telefono, Validators.required],
      cubiculo: [maestroSchema.cubiculo, Validators.required],
      area_investigacion: [maestroSchema.area_investigacion, Validators.required],
      materias: this.fb.array([], Validators.required),
      rol: [this.rol]
    });
  }

  ngOnInit(): void {
    if (this.rol) {
      this.maestroForm.patchValue({ rol: this.rol });
      console.log('Rol establecido en el formulario:', this.rol);
    } else {
      this.maestroForm.patchValue({ rol: 'maestro' });
      console.log('Rol por defecto asignado: maestro');
    }

    // Cargar las materias disponibles primero
    this.cargarMaterias();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        // --- MODO EDICIÓN ---
        this.editar = true;
        this.pageTitle = "Edición de Profesor";
        this.currentUserID = id;
        
        // Quitar validadores de contraseña en modo edición
        this.maestroForm.get('password')?.clearValidators();
        this.maestroForm.get('password')?.updateValueAndValidity();
        this.maestroForm.get('confirmar_password')?.clearValidators();
        this.maestroForm.get('confirmar_password')?.updateValueAndValidity();
        
        // Cargar datos del profesor
        this.loadProfesorData(id);
      } else {
        // --- MODO CREACIÓN ---
        this.editar = false;
        this.pageTitle = "Registro de Profesor";
        console.log('Modo registro de profesor');
      }
    });
  }

  loadProfesorData(id: string): void {
    this.profesoresService.getUsuarioById(id).subscribe({
      next: (data) => {
        console.log('Datos del profesor obtenidos:', data);
        
        // Convertir la fecha string a objeto Date para el datepicker
        let fechaNacimiento = null;
        if (data.fecha_nacimiento) {
          fechaNacimiento = new Date(data.fecha_nacimiento + 'T00:00:00');
        }
        
        // Guardar las materias seleccionadas
        this.materiasSeleccionadas = data.materias || [];
        
        this.maestroForm.patchValue({
          n_empleado: data.n_empleado,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          fecha_nacimiento: fechaNacimiento,
          telefono: data.telefono,
          cubiculo: data.cubiculo,
          area_investigacion: data.area_investigacion,
        });
        
        // ¡CORRECCIÓN: Cargar las materias en el FormArray!
        const materiasFormArray: FormArray = this.maestroForm.get('materias') as FormArray;
        materiasFormArray.clear(); // Limpiar primero
        
        if (this.materiasSeleccionadas && this.materiasSeleccionadas.length > 0) {
          this.materiasSeleccionadas.forEach((materiaId: string) => {
            materiasFormArray.push(new FormControl(materiaId.toString()));
          });
        }
        
        // Deshabilitar el email
        this.maestroForm.get('email')?.disable();
        
        console.log('FormArray de materias después de cargar:', materiasFormArray.value);
      },
      error: (err) => {
        console.error('Error al cargar los datos del profesor:', err);
        this.facadeService.openSnackBar('Error al cargar los datos del profesor', 'ERROR');
      }
    });
  }

  // Método para obtener las materias desde el servicio
  cargarMaterias(): void {
    this.materiasService.getMaterias().subscribe({
      next: (data) => {
        this.materiasData = data;
        console.log('Materias cargadas:', this.materiasData);
      },
      error: (err) => {
        console.error('Error al cargar las materias', err);
        this.facadeService.openSnackBar('No se pudieron cargar las materias.', 'ERROR');
      }
    });
  }

  // ¡CORRECCIÓN: Verificar si un checkbox está seleccionado!
  isMateriSelected(materiaId: string): boolean {
    const materiasFormArray: FormArray = this.maestroForm.get('materias') as FormArray;
    return materiasFormArray.controls.some(control => control.value === materiaId.toString());
  }

  onCheckboxChange(event: any) {
    const materiasFormArray: FormArray = this.maestroForm.get('materias') as FormArray;

    if (event.checked) {
      // Agregar materia
      materiasFormArray.push(new FormControl(event.source.value));
    } else {
      // Remover materia
      const index = materiasFormArray.controls.findIndex(x => x.value === event.source.value);
      if (index !== -1) {
        materiasFormArray.removeAt(index);
      }
    }
    
    console.log('Materias actuales:', materiasFormArray.value);
  }

  registrar() {
    if (this.maestroForm.invalid) {
      this.maestroForm.markAllAsTouched();
      this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
      return;
    }
    
    const userData = { ...this.maestroForm.value };
    userData.username = this.maestroForm.get('email')?.value;
    delete userData.confirmar_password;

    // Formatear la fecha de nacimiento
    if (userData.fecha_nacimiento) {
      const fecha = new Date(userData.fecha_nacimiento);
      const year = fecha.getFullYear();
      const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
      const day = ('0' + fecha.getDate()).slice(-2);
      userData.fecha_nacimiento = `${year}-${month}-${day}`;
    }

    console.log('Datos que se enviarán al backend:', userData);
    
    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.facadeService.openSnackBar('Registro exitoso', 'ÉXITO');
        this.maestroForm.reset();
      },
      error: (err) => {
        console.error('Error al registrar el usuario:', err);
        let errorMessage = 'Error en el registro';
        if (err.error) {
          const errors = Object.values(err.error).flat().join(' ');
          errorMessage += `: ${errors}`;
        } else {
          errorMessage += '. Por favor, intenta de nuevo más tarde.';
        }
        this.facadeService.openSnackBar(errorMessage, 'ERROR');
      }
    });
  }

  public actualizar() {
    if (this.maestroForm.invalid) {
      this.maestroForm.markAllAsTouched();
      this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
      console.log('Errores del formulario:', this.maestroForm.errors);
      console.log('Materias value:', this.maestroForm.get('materias')?.value);
      return;
    }

    if (!this.currentUserID) {
      this.facadeService.openSnackBar('Error: No se pudo identificar el usuario', 'ERROR');
      return;
    }

    // Habilita temporalmente el email para obtener su valor
    const emailDisabled = this.maestroForm.get('email')?.disabled;
    if (emailDisabled) {
      this.maestroForm.get('email')?.enable();
    }

    // Obtener los datos del formulario
    const userData = { ...this.maestroForm.getRawValue() };

    // Si el email estaba deshabilitado, volver a deshabilitarlo
    if (emailDisabled) {
      this.maestroForm.get('email')?.disable();
    }

    // Asignar username desde email
    userData.username = userData.email;

    // Eliminar campos que no necesitamos enviar
    delete userData.confirmar_password;
    
    // Si no hay contraseña nueva, eliminar el campo password
    if (!userData.password) {
      delete userData.password;
    }

    // Formatear la fecha de nacimiento
    if (userData.fecha_nacimiento) {
      const fecha = new Date(userData.fecha_nacimiento);
      if (!isNaN(fecha.getTime())) {
        const year = fecha.getFullYear();
        const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
        const day = ('0' + fecha.getDate()).slice(-2);
        userData.fecha_nacimiento = `${year}-${month}-${day}`;
      }
    }

    console.log('Datos de actualización:', userData);

    // Enviar la actualización
    this.profesoresService.updateUsuario(this.currentUserID, userData).subscribe({
      next: (response) => {
        console.log('Profesor actualizado:', response);
        this.facadeService.openSnackBar('Profesor actualizado correctamente', 'ÉXITO');
        this.router.navigate(['/dashboard/profesor']);
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        let errorMessage = 'Error al actualizar. ';
        if (err.error) {
          const errors = Object.values(err.error).flat().join(' ');
          errorMessage += errors;
        }
        this.facadeService.openSnackBar(errorMessage, 'ERROR');
      }
    });
  }

  public soloLetras(event: KeyboardEvent) {
    if (!/^[a-zA-Z\u00C0-\u017F\s]*$/.test(event.key)) {
      event.preventDefault();
    }
  }

  public regresar() { 
    this.location.back(); 
  }
}