import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Location, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Importación de los módulos de Material
import { MATERIAL_MODULES } from '../../shared/shared-material';


import { AdministradoresService } from '../../services/administradores.service';
import { FacadeService } from '../../services/facade.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES
  ],
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit {

  @Input() rol: string = "";
  public adminForm: FormGroup;
  public editar: boolean = false;
  public hide: boolean = true;
  private currentUserID: string | null = null;
  public pageTitle: string = "Registro de Administrador";
  

  private fb = inject(FormBuilder);
  private location = inject(Location);
  private administradoresService = inject(AdministradoresService);
  private facadeService = inject(FacadeService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
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
    if (this.rol) {
      this.adminForm.patchValue({ rol: this.rol });
      console.log('Rol asignado desde @Input:', this.rol);
    } else {
      // Si no hay rol desde @Input, usar 'administrador' por defecto
      this.adminForm.patchValue({ rol: 'administrador' });
      console.log('Rol por defecto asignado: administrador');
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        //Editar usuarios:)
        this.editar = true;
        this.currentUserID = id;
        this.pageTitle = 'Editar Administrador';

        // Quita 'required' de las contraseñas en modo edición
        this.adminForm.get('password')?.clearValidators();
        this.adminForm.get('password')?.updateValueAndValidity();
        this.adminForm.get('confirmar_password')?.clearValidators();
        this.adminForm.get('confirmar_password')?.updateValueAndValidity();

        // Carga los datos del usuario
        this.loadUserData(id);
      } else {
        // Crear nuevo usuario :)
        this.editar = false;
        this.pageTitle = 'Registro de Administrador';
      }
    });
  }

  loadUserData(id: string) {
    this.administradoresService.getUsuarioById(id).subscribe({
      next: (data) => {
        // Rellena el formulario con los datos
        this.adminForm.patchValue({
          clave_admin: data.clave_admin,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          telefono: data.telefono,
          rfc: data.rfc,
          edad: data.edad,
          ocupacion: data.ocupacion,
          rol: data.rol
        });
        
        // Deshabilita el email para que no se pueda editar
        this.adminForm.get('email')?.disable();
      },
      error: (err) => {
        console.error("Error al cargar usuario", err);
        this.facadeService.openSnackBar('Error al cargar datos del usuario', 'ERROR');
      }
    });
  }

  public registrar() {
    // Validar el formulario
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
      return;
    }

    
    const userData = { ...this.adminForm.value };

    
    userData.username = this.adminForm.get('email')?.value;

    
    delete userData.confirmar_password;

    console.log('Datos que se enviarán al backend:', userData);

    
    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log("Usuario registrado con éxito:", response);
        this.facadeService.openSnackBar('Registro exitoso');
        this.adminForm.reset();
        this.router.navigate(['/login'])
      },
      error: (err) => {
        console.error("Error detallado del backend:", err.error);
        
        let errorMessage = 'Error en el registro. ';
        if (err.error && err.error.username) {
          errorMessage += `Username: ${err.error.username[0]}`;
        } else if (err.error) {
          const errors = Object.values(err.error).flat().join(' ');
          errorMessage += errors;
        } else {
          errorMessage += 'Inténtalo de nuevo.';
        }
        this.facadeService.openSnackBar(errorMessage, 'ERROR');
      }
    });
  }

  public actualizar() {
    // Validar el formulario
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
      return;
    }

    if (!this.currentUserID) {
      this.facadeService.openSnackBar('Error: No se pudo identificar el usuario', 'ERROR');
      return;
    }

    
    const emailDisabled = this.adminForm.get('email')?.disabled;
    if (emailDisabled) {
      this.adminForm.get('email')?.enable();
    }

    
    const userData = { ...this.adminForm.getRawValue() };

    
    if (emailDisabled) {
      this.adminForm.get('email')?.disable();
    }

   
    userData.username = userData.email;

   
    delete userData.confirmar_password;
    
    
    if (!userData.password) {
      delete userData.password;
    }

    console.log('Datos de actualización:', userData);

    // Enviar la actualización
    this.administradoresService.updateUsuario(this.currentUserID, userData).subscribe({
      next: (response) => {
        console.log('Administrador actualizado:', response);
        this.facadeService.openSnackBar('Administrador actualizado correctamente', 'ÉXITO');
       
        this.router.navigate(['/dashboard/admin']);
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
  
  public regresar() { 
    this.location.back(); 
  }

  public soloLetras(event: KeyboardEvent) {
    if (!/^[a-zA-Z\u00C0-\u017F\s]*$/.test(event.key)) {
      event.preventDefault();
    }
  }
}