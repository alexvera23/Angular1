// src/app/services/user-data.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private http = inject(HttpClient);
  private apiUrl = environment.url_api;

  constructor() { }

  /**
   * Obtiene la lista de usuarios Administradores.
   */
  getAdministradores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/users/users/administradores/`);
  }

  /**
   * Obtiene la lista de usuarios Maestros.
   */
  getMaestros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/users/users/maestros/`);
  }

  /**
   * Obtiene la lista de usuarios Alumnos.
   */
  getAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/users/users/alumnos/`);
  }
}