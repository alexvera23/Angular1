import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';

// Importación de los módulos de Material
import { MATERIAL_MODULES } from '../../shared/shared-material';

// Servicios
import { ProfesoresService } from '../../services/profesores.service';
import { FacadeService } from '../../services/facade.service';
//importar el nuevo servicio AuthService
import { AuthService } from '../../services/auth.service';
// Importar el servicio de materias
import { MateriasService } from '../../services/materias.service';

@Component({
  selector: 'app-registro-profesores',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    ...MATERIAL_MODULES // ✅ Importamos todos los módulos de Material
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
  
  // Simulación de materias que vendrían de una base de datos
  public materiasData: any[] = [];
  
  private fb = inject(FormBuilder);
  private profesoresService = inject(ProfesoresService);
  private facadeService = inject(FacadeService);
  private authService = inject(AuthService); // Inyecta el servicio AuthService
  private materiasService = inject(MateriasService); // Inyecta el servicio MateriasService

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
    this.maestroForm.patchValue({ rol: this.rol });
    this.cargarMaterias();
  }
  // Método para obtener las materias desde el servicio
  cargarMaterias(): void {
    this.materiasService.getMaterias().subscribe({
      next: (data) => {
        this.materiasData = data;
      },
      error: (err) => {
        console.error('Error al cargar las materias', err);
        this.facadeService.openSnackBar('No se pudieron cargar las materias.', 'ERROR');
      }
    });
  }

  onCheckboxChange(event: any) {
    const materiasFormArray: FormArray = this.maestroForm.get('materias') as FormArray;

    if (event.checked) {
      materiasFormArray.push(new FormControl(event.source.value));
    } else {
      const index = materiasFormArray.controls.findIndex(x => x.value === event.source.value);
      materiasFormArray.removeAt(index);
    }
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

    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // 1. Verificamos si la fecha existe
    if (userData.fecha_nacimiento) {
      // 2. Creamos un nuevo objeto de fecha
      const fecha = new Date(userData.fecha_nacimiento);
      
      // 3. Formateamos a YYYY-MM-DD
      // Obtenemos los componentes y nos aseguramos de que tengan dos dígitos
      const year = fecha.getFullYear();
      const month = ('0' + (fecha.getMonth() + 1)).slice(-2); // Se suma 1 porque los meses van de 0 a 11
      const day = ('0' + fecha.getDate()).slice(-2);
      
      // 4. Asignamos la cadena de texto formateada
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

  soloLetras(event: KeyboardEvent) {
    if (!/^[a-zA-Z\u00C0-\u017F\s]*$/.test(event.key)) {
      event.preventDefault();
    }
  }
}