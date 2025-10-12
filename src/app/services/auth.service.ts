// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.url_api; // Obtenemos la URL de la API desde el archivo de entorno

  constructor() { }

  /**
   * Envía los datos de un nuevo usuario al backend para registrarlo.
   * @param userData Los datos del formulario de registro.
   * @returns Un Observable con la respuesta del servidor.
   */
  register(userData: any): Observable<any> {
    // Hacemos una petición POST a nuestro endpoint de Django
    return this.http.post(`${this.apiUrl}/api/users/register/`, userData);
  }
}