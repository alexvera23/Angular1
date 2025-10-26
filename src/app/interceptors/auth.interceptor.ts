// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor que agrega automáticamente el token de autenticación
 * a todas las peticiones HTTP que requieran autorización.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Obtener el token desde las cookies
  const token = authService.getAccessToken();

  // Si existe el token y la petición no es para login o registro
  if (token && !req.url.includes('/token/') && !req.url.includes('/register/')) {
    // Clonar la petición y agregar el header Authorization
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedRequest);
  }

  // Si no hay token o es una petición de login/registro, continuar sin modificar
  return next(req);
};