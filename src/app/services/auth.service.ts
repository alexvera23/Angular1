// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable, tap} from 'rxjs';

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

  //Añadir el método login
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/token/`, credentials).pipe(
      // 'tap' nos permite ejecutar una acción sin modificar la respuesta
      tap((tokens: any) => {
        // Guardamos los tokens cuando la petición es exitosa
        this.saveTokens(tokens.access, tokens.refresh);
      })
    );
  }
  // --- NUEVOS MÉTODOS PARA MANEJAR TOKENS ---

  /**
   * Guarda los tokens en localStorage.
   * @param accessToken El token de acceso.
   * @param refreshToken El token de refresco.
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Obtiene el token de acceso desde localStorage.
   * @returns El token de acceso o null si no existe.
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Verifica si el usuario está autenticado (si existe un token).
   * @returns true si hay un token, false si no.
   */
  isLoggedIn(): boolean {
    return !!this.getAccessToken(); // El doble '!!' convierte el string (o null) a un booleano
  }

  /**
   * Cierra la sesión del usuario eliminando los tokens.
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}