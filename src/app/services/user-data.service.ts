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

  //lista de los administradores :)
  getAdministradores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/users/users/administradores/`);
  }

  //lista de los maestros :)
  getMaestros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/users/users/maestros/`);
  }

 //lista de los alumnos :)
  getAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/users/users/alumnos/`);
  }
}