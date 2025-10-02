import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Location, CommonModule } from '@angular/common';

// NO importamos Material aquí para aislar el problema

// Importaciones de nuestros servicios
import { AdministradoresService } from '../../services/administradores.service';
import { FacadeService } from '../../services/facade.service';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule // La base que sí funcionaba
  ],
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit {

  @Input() rol: string = "";
  public adminForm: FormGroup;
  public editar: boolean = false;
  
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private administradoresService = inject(AdministradoresService);
  private facadeService = inject(FacadeService);

  constructor() {
    // Usamos el esquema del servicio para construir el formulario
    const adminSchema = this.administradoresService.esquemaAdmin();

    this.adminForm = this.fb.group({
      clave_admin: [adminSchema.clave_admin],
      first_name: [adminSchema.first_name, Validators.required],
      last_name: [adminSchema.last_name, Validators.required],
      email: [adminSchema.email, [Validators.required, Validators.email]],
      password: [adminSchema.password, [Validators.required, Validators.minLength(8)]],
      confirmar_password: [adminSchema.confirmar_password, Validators.required],
      telefono: [adminSchema.telefono, Validators.required],
      rfc: [adminSchema.rfc, [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      edad: [adminSchema.edad, Validators.required],
      ocupacion: [adminSchema.ocupacion, Validators.required],
      rol: [this.rol]
    });
  }

  ngOnInit(): void {
    this.adminForm.patchValue({ rol: this.rol });
  }

  public registrar() {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
      return;
    }

    console.log("Formulario válido. Datos:", this.adminForm.value);
    this.facadeService.openSnackBar('Administrador registrado (simulación)');
  }

  public actualizar() { /* Lógica de actualización */ }
  public regresar() { this.location.back(); }

  public soloLetras(event: KeyboardEvent) {
    if (!/^[a-zA-Z\u00C0-\u017F\s]*$/.test(event.key)) {
      event.preventDefault();
    }
  }
}

