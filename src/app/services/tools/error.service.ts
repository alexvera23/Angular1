import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  constructor() { }

  /**
   * Genera un mensaje de error si un campo requerido está vacío.
   * @param fieldName El nombre del campo (ej. "Nombre").
   * @returns El mensaje de error o una cadena vacía.
   */
  public required(fieldName: string): string {
    return `El campo ${fieldName} es requerido.`;
  }

  /**
   * Genera un mensaje de error para un email inválido.
   * @returns El mensaje de error.
   */
  public email(): string {
    return 'El formato del correo electrónico es inválido.';
  }

  /**
   * Genera un mensaje de error si las contraseñas no coinciden.
   * @returns El mensaje de error.
   */
  public passwordsNotMatch(): string {
    return 'Las contraseñas no coinciden.';
  }

  /**
   * Genera un mensaje de error para una contraseña demasiado corta.
   * @param length La longitud mínima requerida.
   * @returns El mensaje de error.
   */
  public minLength(length: number = 8): string {
    return `La contraseña debe tener al menos ${length} caracteres.`;
  }
}
