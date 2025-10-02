import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfesoresService {

  constructor() { }

  public esquemaProfesor(){
    return {
      rol: 'maestro',
      n_empleado: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmar_password: '',
      fecha_nacimiento: '',
      telefono: '',
      cubiculo: '',
      area_investigacion: '',
    };
  }
}
