// src/app/services/materias.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MateriasService {
  private http = inject(HttpClient);
  private apiUrl = environment.url_api;

  constructor() { }

  /**
   * Obtiene la lista de todas las materias desde el backend.
   */
  getMaterias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/users/materias/`);
  }
}