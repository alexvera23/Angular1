import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfesoresService } from '../../services/profesores.service';
import { FacadeService } from '../../services/facade.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-registro-profesores',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxMaskDirective
  ],
  templateUrl: './registro-profesores.component.html',
  styleUrls: ['./registro-profesores.component.scss']
})
export class RegistroProfesoresComponent implements OnInit {

  @Input() rol: string = "maestro";
  public maestroForm: FormGroup;
  public editar: boolean = false;
  // Simulación de materias que vendrían de una base de datos
  public materiasData = [
    { id: 1, nombre: 'Aplicaciones Web' },
    { id: 2, nombre: 'Programación Orientada a Objetos' },
    { id: 3, nombre: 'Bases de Datos' },
    { id: 4, nombre: 'Redes de Computadoras' },
    { id: 5, nombre: 'Inteligencia Artificial' }
  ];
  
  private fb = inject(FormBuilder);
  private profesoresService = inject(ProfesoresService);
  private facadeService = inject(FacadeService);

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
  }

  onCheckboxChange(event: any) {
    const materiasFormArray: FormArray = this.maestroForm.get('materias') as FormArray;

    if (event.target.checked) {
      materiasFormArray.push(new FormControl(event.target.value));
    } else {
      const index = materiasFormArray.controls.findIndex(x => x.value === event.target.value);
      materiasFormArray.removeAt(index);
    }
  }

  registrar() {
    if (this.maestroForm.invalid) {
      this.maestroForm.markAllAsTouched();
      this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
      return;
    }
    console.log("Formulario de maestro válido. Datos:", this.maestroForm.value);
    this.facadeService.openSnackBar('Maestro registrado (simulación)');
  }

  soloLetras(event: KeyboardEvent) {
    if (!/^[a-zA-Z\u00C0-\u017F\s]*$/.test(event.key)) {
      event.preventDefault();
    }
  }
}

