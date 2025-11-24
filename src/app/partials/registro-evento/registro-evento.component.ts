import { Component, OnInit, inject } from '@angular/core';
import { CommonModule,Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { UserDataService } from '../../services/user-data.service';
import { FacadeService } from '../../services/facade.service';
import { forkJoin } from 'rxjs'; // Para unir peticiones

@Component({
  selector: 'app-registro-evento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ...MATERIAL_MODULES],
  templateUrl: './registro-evento.component.html',
  styleUrl: './registro-evento.component.scss'
})
export class RegistroEventoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userDataService = inject(UserDataService);
  private facadeService = inject(FacadeService);
 private location = inject(Location);

  public formEvento: FormGroup;
  public listaResponsables: any[] = [];
  public showProgramaEducativo: boolean = false;

  // Opciones estáticas
  public tiposEvento = ['Conferencia', 'Taller', 'Seminario', 'Concurso'];
  public programasEducativos = ['Ingeniería en Ciencias de la Computación', 'Licenciatura en Ciencias de la Computación', 'Ingeniería en Tecnologías de la Información'];

  constructor() {
    this.formEvento = this.fb.group({
      // 1. Nombre: Letras, números y espacios
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]*$/)]],
      
      // 2. Tipo: Select
      tipo: ['', Validators.required],
      
      // 3. Fecha: Datepicker
      fecha: ['', Validators.required],
      
      // 4. Horario: Inicio y Fin
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      
      // 5. Lugar: Alfanumérico
      lugar: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]*$/)]],
      
      // 6. Público Objetivo (Group)
      publico: this.fb.group({
        estudiantes: [false],
        profesores: [false],
        publico_general: [false]
      }, { validators: this.atLeastOneCheckboxSelected }), // Validador personalizado
      
      // 7. Programa (Condicional)
      programa: [''], 
      
      // 8. Responsable
      responsable: ['', Validators.required],
      
      // 9. Descripción
      descripcion: ['', Validators.required],
      
      // 10. Cupo: Positivo, máx 3 dígitos (1-999)
      cupo: ['', [Validators.required, Validators.min(1), Validators.max(999), Validators.pattern("^[0-9]*$")]]
    });
  }

  ngOnInit(): void {
    this.cargarResponsables();
    this.detectarCambiosPublico();
  }

  // --- Carga de Usuarios (Admins + Maestros) ---
  cargarResponsables() {
    // Usamos forkJoin para hacer las dos peticiones simultáneas
    forkJoin({
      admins: this.userDataService.getAdministradores(),
      maestros: this.userDataService.getMaestros()
    }).subscribe({
      next: (resultado) => {
        // Unimos las dos listas
        const adminsFormateados = resultado.admins.map(u => ({ ...u, rol_label: 'Admin' }));
        const maestrosFormateados = resultado.maestros.map(u => ({ ...u, rol_label: 'Maestro' }));
        
        this.listaResponsables = [...adminsFormateados, ...maestrosFormateados];
      },
      error: (err) => {
        console.error(err);
        this.facadeService.openSnackBar('Error al cargar responsables', 'Cerrar');
      }
    });
  }

  // --- Lógica Condicional para "Estudiantes" ---
  detectarCambiosPublico() {
    this.formEvento.get('publico')?.valueChanges.subscribe(valores => {
      this.showProgramaEducativo = valores.estudiantes;
      
      const programaControl = this.formEvento.get('programa');
      
      if (this.showProgramaEducativo) {
        programaControl?.setValidators([Validators.required]);
      } else {
        programaControl?.clearValidators();
        programaControl?.setValue(''); // Limpiar valor si se oculta
      }
      programaControl?.updateValueAndValidity();
    });
  }

  // --- Validador Personalizado para Checkboxes ---
  atLeastOneCheckboxSelected(group: AbstractControl): { [key: string]: any } | null {
    const controls = group.value;
    // Revisa si al menos uno es true
    const isAtLeastOneSelected = Object.keys(controls).some(key => controls[key] === true);
    return isAtLeastOneSelected ? null : { 'requireOneCheckbox': true };
  }

  public registrar() {
    if (this.formEvento.invalid) {
      this.facadeService.openSnackBar('Revisa los campos marcados en rojo', 'Cerrar');
      this.formEvento.markAllAsTouched();
      return;
    }

    // Validar Horario (Inicio < Fin)
    const inicio = this.formEvento.get('horaInicio')?.value;
    const fin = this.formEvento.get('horaFin')?.value;

    if (inicio >= fin) {
      this.facadeService.openSnackBar('La hora de inicio debe ser menor a la hora de fin', 'Cerrar');
      return;
    }

    // Aquí iría la lógica de envío al backend
    console.log("Datos del Evento:", this.formEvento.value);
    this.facadeService.openSnackBar('Evento registrado correctamente (Simulación)', 'OK');
  }

    public regresar() {
    this.location.back();
  }
}