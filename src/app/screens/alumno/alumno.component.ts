// src/app/screens/alumno/alumno.component.ts
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { AuthService } from '../../services/auth.service';
import { UserDataService } from '../../services/user-data.service';
import { FacadeService } from '../../services/facade.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

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
export class AlumnoComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private facadeService = inject(FacadeService);

  public username: string | null = null;
  public userRole: string | null = null;

 
  public listaAlumnos = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


 
 public displayedAlumnosColumns: string[] = ['first_name', 'last_name', 'email', 'matricula', 'acciones'];
  ngOnInit(): void {
    
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getUserRole();
    
    // Cargamos los datos para las tablas
    this.loadAlumnos(); 
    this.listaAlumnos.filterPredicate = this.createFilter(); 
  }

private loadAlumnos(): void {
   this.userDataService.getAlumnos().subscribe({
      next: (data) => {
        this.listaAlumnos.data = data;
        console.log('Datos de alumnos cargados:', data);
      },
      error: (err) => {
        console.error('Error al cargar datos de alumnos:', err);
        this.facadeService.openSnackBar('Error al cargar datos de alumnos.', 'ERROR');
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaAlumnos.filter = filterValue.trim().toLowerCase();

    if (this.listaAlumnos.paginator) {
      this.listaAlumnos.paginator.firstPage();
    }
  }

  clearFilter(input: HTMLInputElement): void {
    input.value = '';
    this.listaAlumnos.filter = '';
    if (this.listaAlumnos.paginator) {
      this.listaAlumnos.paginator.firstPage();
    }
  }

  private createFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      const searchStr = filter.toLowerCase();

      //Buscar en campos de alumno
      const basicMatch = 
      data.first_name?.toLowerCase().includes(searchStr) ||
      data.last_name?.toLowerCase().includes(searchStr) ||
      data.email?.toLowerCase().includes(searchStr) ||
      data.matricula?.toString().toLowerCase().includes(searchStr);
      return basicMatch ;
    };
  }



  public logout() {
    this.authService.logout();
    this.facadeService.openSnackBar('Sesión cerrada correctamente :).', 'OK');
  }

  ngAfterViewInit(): void {
    this.listaAlumnos.paginator = this.paginator;
    this.listaAlumnos.sort = this.sort;
  }

}