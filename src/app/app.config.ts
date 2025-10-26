import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNgxMask } from 'ngx-mask';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideAnimationsAsync(), //  CRÍTICO para Angular Material
    provideNgxMask(), // Para las máscaras de teléfono
    provideHttpClient(
      withInterceptors([authInterceptor]) // Añadir el interceptor de autenticación    
    )
  ]
};