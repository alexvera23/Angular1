import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfesoresService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.url_api}/api/users/users`


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

  getUsuarioById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/`);
  }

  updateUsuario(id: string, usuario: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/`, usuario);
  }

  delateUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/`);
  }


  
}
