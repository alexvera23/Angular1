import { Injectable, inject } from '@angular/core';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/error.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdministradoresService {

  private validatorService = inject(ValidatorService);
  private errorsService = inject(ErrorsService);
  private http = inject(HttpClient);
  private apiUrl = `${environment.url_api}/api/users/users`;

  constructor() { }

 
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
    

    // Validaciones de contraseña solo si no estamos en modo "editar"
    // Aun no se implementa la edición de contraseña :(
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

  getUsuarioById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/`);
  }

  updateUsuario(id: string, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/`, usuario);
  }

}

