// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';


// Interfaz para tipar el payload del token
interface TokenPayload {
  user_id: number;
  username: string;
  rol: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private cookieService = inject(CookieService);
  private apiUrl = environment.url_api;
  private router = inject(Router);
  

  constructor() { }

  // Registro de un nuevo usuario
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/users/register/`, userData);
  }

  // Login de usuario 
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/token/`, credentials).pipe(
      tap((tokens: any) => {
        this.saveTokens(tokens.access, tokens.refresh);
      })
    );
  }

 ///Guarda los token en cookies
  private saveTokens(accessToken: string, refreshToken: string): void {
    const cookieOptions = {
      path: '/',
      secure: false,       
      sameSite: 'Lax'
    };

    // Guardar access token (expira en 1 día)
    this.cookieService.set(
      'access_token',
      accessToken,
      1,
      cookieOptions.path,
      undefined,
      cookieOptions.secure,
      cookieOptions.sameSite as 'Lax' | 'Strict' | 'None'
    );

    // Guardar refresh token (expira en 7 días)
    this.cookieService.set(
      'refresh_token',
      refreshToken,
      7,
      cookieOptions.path,
      undefined,
      cookieOptions.secure,
      cookieOptions.sameSite as 'Lax' | 'Strict' | 'None'
    );
  }

  // Obtiene el access token desde las cookies.
  getAccessToken(): string | null {
    const token = this.cookieService.get('access_token');
    return token || null;
  }

  // Obtiene el refresh token desde las cookies.
  getRefreshToken(): string | null {
    const token = this.cookieService.get('refresh_token');
    return token || null;
  }

  // Decodifica el token y obtiene el payload con la información del usuario.
  getTokenPayload(): TokenPayload | null {
    const token = this.getAccessToken();
    
    if (!token) {
      return null;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  // Obtiene el rol del usuario desde el token.
  getUserRole(): string | null {
    const payload = this.getTokenPayload();
    return payload ? payload.rol : null;
  }

  // Obtiene el ID del usuario desde el token.
  getUserId(): number | null {
    const payload = this.getTokenPayload();
    return payload ? payload.user_id : null;
  }

  // Obtiene el nombre de usuario desde el token.
  getUsername(): string | null {
    const payload = this.getTokenPayload();
    return payload ? payload.username : null;
  }

  // Verifica si el usuario está logueado (token válido y no expirado).
  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    
    if (!token) {
      return false;
    }

    // Verificar si el token ha expirado
    try {
      const payload = this.getTokenPayload();
      if (!payload) {
        return false;
      }

      // Verificar si el token ha expirado 
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

 // Cierra la sesión del usuario eliminando las cookies.
  logout(): void {
    this.cookieService.delete('access_token', '/');
    this.cookieService.delete('refresh_token', '/');
    console.log('Usuario deslogueado, cookies eliminadas.');
    this.router.navigate(['/login']);
    
  }

// Refresca el access token usando el refresh token.
  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post(`${this.apiUrl}/api/token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap((tokens: any) => {
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

 // Obtiene la ruta del dashboard según el rol del usuario.
  getDashboardRoute(): string {
    const role = this.getUserRole();
    
    switch (role) {
      case 'administrador':
        return '/dashboard/admin';
      case 'maestro':
        return '/dashboard/profesor';
      case 'alumno':
        return '/dashboard/alumno';
      default:
        return '/login';
    }
  }
}