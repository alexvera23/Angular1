import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// NOTA: Para que MatSnackBar funcione, debes importarlo en el componente que lo usa
// o globalmente en `app.config.ts` (lo veremos después).

@Injectable({
  providedIn: 'root'
})
export class FacadeService {

  private snackBar = inject(MatSnackBar);

  constructor() { }

  /**
   * Muestra una notificación (snackbar) en la pantalla.
   * @param message El mensaje a mostrar.
   * @param action El texto del botón de acción (ej. "Cerrar").
   * @param config Configuración adicional (duración, posición, etc.).
   */
  public openSnackBar(message: string, action: string = 'Cerrar', config?: any) {
    this.snackBar.open(message, action, {
      duration: 5000, // 5 segundos
      verticalPosition: 'top',
      horizontalPosition: 'end',
      ...config // Permite sobreescribir la configuración por defecto
    });
  }
}

