import { Component, Input, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Location, CommonModule } from '@angular/common';

// Importación de los módulos de Material
import { MATERIAL_MODULES } from '../../shared/shared-material';

// Importaciones de nuestros servicios
import { AdministradoresService } from '../../services/administradores.service';
import { FacadeService } from '../../services/facade.service';
// Importa el nuevo servicio AuthService
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES //  Importamos todos los módulos de Material
  ],
  templateUrl: './registro-admin.component.html',
  styleUrls: ['./registro-admin.component.scss']
})
export class RegistroAdminComponent implements OnInit {

  @Input() rol: string = "";
  public adminForm: FormGroup;
  public editar: boolean = false;
  public hide: boolean = true; // Para el botón de mostrar/ocultar contraseña
  
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private administradoresService = inject(AdministradoresService);
  private facadeService = inject(FacadeService);
  private authService = inject(AuthService); // Inyecta el servicio AuthService

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
    this.adminForm.patchValue({ rol: this.rol });
  }

   public registrar() {
    // 1. Validar el formulario como siempre
    if (this.adminForm.invalid) { // Cambia "adminForm" por "alumnoForm" o "maestroForm" según el componente
        this.adminForm.markAllAsTouched();
        this.facadeService.openSnackBar('Por favor, corrige los errores.', 'ERROR');
        return;
    }

    // 2. Crear una copia de los datos del formulario
    const userData = { ...this.adminForm.value }; // Usa el nombre de tu form group aquí

    // 3. Asignar el username DIRECTAMENTE desde el control del formulario
    //    Esto es más seguro que leerlo de la copia.
    userData.username = this.adminForm.get('email')?.value; // Usa el nombre de tu form group aquí

    // 4. Eliminar el campo que el backend no necesita
    delete userData.confirmar_password;

    // 5. ¡Paso de depuración clave! Revisa la consola del navegador
    console.log('Datos que se enviarán al backend:', userData);

    // 6. Enviar la petición
    this.authService.register(userData).subscribe({
        next: (response) => {
            console.log("Usuario registrado con éxito:", response);
            this.facadeService.openSnackBar('Registro exitoso');
            this.adminForm.reset();
            // Aquí puedes resetear el formulario o redirigir al usuario
        },
        error: (err) => {
            // Esto nos mostrará el error detallado de Django en la consola del navegador
            console.error("Error detallado del backend:", err.error); 
            
            let errorMessage = 'Error en el registro. ';
            if (err.error && err.error.username) {
                errorMessage += `Username: ${err.error.username[0]}`;
            } else if (err.error) {
                // Para otros posibles errores
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
    console.log("Actualizar administrador");
    this.facadeService.openSnackBar('Administrador actualizado correctamente');
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