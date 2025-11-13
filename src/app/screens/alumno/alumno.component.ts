// src/app/screens/alumno/alumno.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { AuthService } from '../../services/auth.service';
import { UserDataService } from '../../services/user-data.service';
import { FacadeService } from '../../services/facade.service';

@Component({
  selector: 'app-alumno',
  standalone: true,
  imports: [
    CommonModule,
    ...MATERIAL_MODULES // Importar Material
  ],
  templateUrl: './alumno.component.html',
  styleUrl: './alumno.component.scss'
})
export class AlumnoComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private facadeService = inject(FacadeService);

  public username: string | null = null;
  public userRole: string | null = null;

  // Listas para las tablas
  public listaAlumnos: any[] = [];


  // Columnas a mostrar
 public displayedAlumnosColumns: string[] = ['first_name', 'last_name', 'email', 'matricula', 'acciones'];
  ngOnInit(): void {
    // Obtenemos datos del token
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getUserRole();
    
    // Cargamos los datos para las tablas
    this.loadAlumnos();  
  }

private loadAlumnos(): void {
    this.userDataService.getAlumnos().subscribe(
      data => this.listaAlumnos = data
    );
  }



  public logout() {
    this.authService.logout();
    this.facadeService.openSnackBar('Sesión cerrada correctamente :).', 'OK');
  }

}