import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

  /**
   * Valida que un campo no esté vacío.
   * @param value El valor a validar.
   * @returns `true` si es válido, `false` si está vacío.
   */
  public required(value: any): boolean {
    return value !== null && value !== undefined && String(value).trim().length > 0;
  }

  /**
   * Valida que el campo sea un correo electrónico válido.
   * @param email El correo a validar.
   * @returns `true` si es un email válido, `false` si no lo es.
   */
  public email(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  }

  /**
   * Valida que dos contraseñas coincidan.
   * @param pass La contraseña.
   * @param confirm La confirmación de la contraseña.
   * @returns `true` si coinciden, `false` si no.
   */
  public passwordsMatch(pass: string, confirm: string): boolean {
    return pass === confirm;
  }

  /**
   * Valida que una contraseña tenga al menos 8 caracteres.
   * @param password La contraseña a validar.
   * @returns `true` si tiene la longitud mínima, `false` si no.
   */
  public minLength(password: string, length: number = 8): boolean {
    return typeof password === 'string' && password.length >= length;
  }
}
