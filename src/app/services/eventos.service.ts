// src/app/services/eventos.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private http = inject(HttpClient);
  // Asegúrate de que esta URL coincida con tu urls.py (/api/users/eventos/)
  private apiUrl = `${environment.url_api}/api/users/eventos/`;

  constructor() { }

  // 1. Registrar un nuevo evento (POST)
  public registrarEvento(datosEvento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datosEvento);
  }

  // 2. Obtener lista de eventos (GET) - Útil para el futuro
  public obtenerEventos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}