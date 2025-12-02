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
  private apiUrl = `${environment.url_api}/api/users/eventos/`;

  constructor() { }

 
  public registrarEvento(datosEvento: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, datosEvento);
  }

  
  public obtenerEventos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

 public getEventoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/`);
  }

  public updateEvento(id: number, datosEvento: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}${id}/`, datosEvento);
  }

  public eliminarEvento(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id}/`);
  }

}