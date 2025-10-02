import { Injectable, inject } from '@angular/core';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/error.service';

@Injectable({
  providedIn: 'root'
})
export class AdministradoresService {

  // Inyección de dependencias moderna con `inject()`
  private validatorService = inject(ValidatorService);
  private errorsService = inject(ErrorsService);

  constructor() { }

  /**
   * Devuelve un objeto con la estructura de datos para un nuevo administrador.
   */
  public esquemaAdmin() {
    return {
      clave_admin: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmar_password: '',
      telefono: '',
      rfc: '',
      edad: '',
      ocupacion: '',
      rol: 'administrador'
    };
  }

  /**
   * Valida los datos del formulario de administrador.
   * @param data Los datos del formulario.
   * @param editar `true` si se está editando, `false` si es un nuevo registro.
   * @returns Un objeto con los errores encontrados.
   */
  public validarAdmin(data: any, editar: boolean) {
    let errors: any = {};

    // Validaciones de campos
    if (!this.validatorService.required(data.first_name)) {
      errors.first_name = this.errorsService.required('Nombre');
    }
    if (!this.validatorService.required(data.last_name)) {
      errors.last_name = this.errorsService.required('Apellidos');
    }
    if (!this.validatorService.email(data.email)) {
      errors.email = this.errorsService.email();
    }
    if (!this.validatorService.required(data.telefono)) {
      errors.telefono = this.errorsService.required('Teléfono');
    }
    // ... aquí puedes agregar el resto de las validaciones (RFC, edad, etc.)

    // Validaciones de contraseña solo si no estamos en modo "editar"
    if (!editar) {
      if (!this.validatorService.minLength(data.password)) {
        errors.password = this.errorsService.minLength();
      }
      if (!this.validatorService.passwordsMatch(data.password, data.confirmar_password)) {
        errors.confirmar_password = this.errorsService.passwordsNotMatch();
      }
    }

    return errors;
  }
}

