// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  private apiUrl = environment.url_api;
  private router = inject(Router);

  constructor() { }

  /**
   * Envía los datos de un nuevo usuario al backend para registrarlo.
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/users/register/`, userData);
  }

  /**
   * Inicia sesión y guarda los tokens en cookies.
   */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/token/`, credentials).pipe(
      tap((tokens: any) => {
        this.saveTokens(tokens.access, tokens.refresh);
      })
    );
  }

  /**
   * Guarda los tokens en cookies seguras.
   * Las cookies expiran en:
   * - Access token: 1 día (puedes ajustarlo según tu backend)
   * - Refresh token: 7 días (puedes ajustarlo según tu backend)
   */
  private saveTokens(accessToken: string, refreshToken: string): void {
    // Opciones de seguridad para las cookies
    const cookieOptions = {
      path: '/',           // Disponible en toda la aplicación
      secure: false,       // Cambiar a true en producción (requiere HTTPS)
      sameSite: 'Lax'      // Protección contra CSRF
    };

    // Guardar access token (expira en 1 día)
    this.cookieService.set(
      'access_token',
      accessToken,
      1, // Días de expiración
      cookieOptions.path,
      undefined,
      cookieOptions.secure,
      cookieOptions.sameSite as 'Lax' | 'Strict' | 'None'
    );

    // Guardar refresh token (expira en 7 días)
    this.cookieService.set(
      'refresh_token',
      refreshToken,
      7, // Días de expiración
      cookieOptions.path,
      undefined,
      cookieOptions.secure,
      cookieOptions.sameSite as 'Lax' | 'Strict' | 'None'
    );
  }

  /**
   * Obtiene el token de acceso desde las cookies.
   */
  getAccessToken(): string | null {
    const token = this.cookieService.get('access_token');
    return token || null;
  }

  /**
   * Obtiene el refresh token desde las cookies.
   */
  getRefreshToken(): string | null {
    const token = this.cookieService.get('refresh_token');
    return token || null;
  }

  /**
   * Verifica si el usuario está autenticado.
   */
  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Cierra la sesión eliminando las cookies.
   */
  logout(): void {
    this.cookieService.delete('access_token', '/');
    this.cookieService.delete('refresh_token', '/');
    //Redirigir al login 
    this.router.navigate(['/login']);
  }

  /**
   * Refresca el access token usando el refresh token.
   */
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post(`${this.apiUrl}/api/token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap((tokens: any) => {
        // Solo actualizamos el access token
        const cookieOptions = {
          path: '/',
          secure: false,
          sameSite: 'Lax'
        };

        this.cookieService.set(
          'access_token',
          tokens.access,
          1,
          cookieOptions.path,
          undefined,
          cookieOptions.secure,
          cookieOptions.sameSite as 'Lax' | 'Strict' | 'None'
        );
      })
    );
  }
}