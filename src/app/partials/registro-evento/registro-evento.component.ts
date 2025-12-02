import { Component, OnInit, inject } from '@angular/core';
import { CommonModule,Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { UserDataService } from '../../services/user-data.service';
import { FacadeService } from '../../services/facade.service';
import { forkJoin } from 'rxjs'; // Para unir peticiones
import { EventosService } from '../../services/eventos.service';
import { ActivatedRoute,Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../partials/confirm-dialog/confirm-dialog.component';
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
 private eventosService = inject(EventosService);
 private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  public formEvento: FormGroup;
  public listaResponsables: any[] = [];
  public showProgramaEducativo: boolean = false;
  public editar: boolean = false;
  public eventoId: number | null = null;
  public pageTitle: string = "Registro de Evento";

  
  public tiposEvento = ['Conferencia', 'Taller', 'Seminario', 'Concurso'];
  public programasEducativos = ['Ingeniería en Ciencias de la Computación', 'Licenciatura en Ciencias de la Computación', 'Ingeniería en Tecnologías de la Información'];

  constructor() {
    this.formEvento = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]*$/)]],
      tipo: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      lugar: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ ]*$/)]],
      publico: this.fb.group({
        estudiantes: [false],
        profesores: [false],
        publico_general: [false]
      }, { validators: this.atLeastOneCheckboxSelected }),
      programa: [''], 
      responsable: ['', Validators.required],
      descripcion: ['', Validators.required],
      cupo: ['', [Validators.required, Validators.min(1), Validators.max(999), Validators.pattern("^[0-9]*$")]]
    });
  }

  ngOnInit(): void {
    this.cargarResponsables();
    this.detectarCambiosPublico();
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.editar = true;
        this.eventoId = +idParam;
        this.pageTitle = 'Editar Evento';
        this.cargarDatosEvento(this.eventoId);
      }
    });
  }
  
  cargarDatosEvento(id: number) {
    this.eventosService.getEventoById(id).subscribe({
      next: (data) => {
        console.log('Datos del evento a editar:', data);
       
        this.formEvento.patchValue({
          nombre: data.nombre,
          tipo: data.tipo,
          lugar: data.lugar,
          descripcion: data.descripcion,
          cupo: data.cupo,
          responsable: data.responsable,
          programa: data.programa_educativo,
          fecha: new Date(data.fecha+'T00:00:00'), // Asegura formato correcto
          horaInicio: data.hora_inicio.substring(0,5),
          horaFin: data.hora_fin.substring(0,5),
          publico: {
            estudiantes: data.publico_estudiantes,
          profesores: data.publico_profesores,
          publico_general: data.publico_general
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar datos del evento:', err);
        this.facadeService.openSnackBar('Error al cargar los datos del evento para edición.', 'OK');
      }
    });
  }

 
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

  
  atLeastOneCheckboxSelected(group: AbstractControl): { [key: string]: any } | null {
    const controls = group.value;
    
    const isAtLeastOneSelected = Object.keys(controls).some(key => controls[key] === true);
    return isAtLeastOneSelected ? null : { 'requireOneCheckbox': true };
  }

  public registrar() {
     if (this.formEvento.invalid) {
      this.formEvento.markAllAsTouched();
      return;
    }

    
    const formValues = this.formEvento.value;
    const datosParaEnviar = {
      ...formValues,
      hora_inicio: formValues.horaInicio, 
      hora_fin: formValues.horaFin,
      programa_educativo: formValues.programa,
      fecha: formValues.fecha ? new Date(formValues.fecha).toISOString().split('T')[0] : null
    };
    delete datosParaEnviar.horaInicio; delete datosParaEnviar.horaFin; delete datosParaEnviar.programa;

   
    if (this.editar && this.eventoId) {
      
      
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Confirmar Cambios',
          message: '¿Estás seguro de actualizar los datos de este evento?',
          confirmText: 'Actualizar',
          confirmColor: 'primary' // Botón Azul
        }
      });

      dialogRef.afterClosed().subscribe(confirmado => {
        if (confirmado) {
          this.eventosService.updateEvento(this.eventoId!, datosParaEnviar).subscribe({
            next: () => {
              this.facadeService.openSnackBar('Evento actualizado', 'OK');
              this.router.navigate(['/dashboard/eventos']);
            },
            error: () => this.facadeService.openSnackBar('Error al actualizar', 'Cerrar')
          });
        }
      });

    } else {
      
      this.eventosService.registrarEvento(datosParaEnviar).subscribe({
        next: () => {
          this.facadeService.openSnackBar('Evento registrado', 'OK');
          this.router.navigate(['/dashboard/eventos']); // Ir a la lista
        },
        error: () => this.facadeService.openSnackBar('Error al registrar', 'Cerrar')
      });
    }
  }

 public regresar() {
    this.location.back();
  }
}