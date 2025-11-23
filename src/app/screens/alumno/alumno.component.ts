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
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../partials/confirm-dialog/confirm-dialog.component';
import { AlumnosService } from '../../services/alumnos.service';



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
  private alumnosService = inject(AlumnosService);
  private dialog = inject(MatDialog);


  


  public username: string | null = null;
  public userRole: string | null = null;

 
  public listaAlumnos = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


 
 public displayedAlumnosColumns: string[] = ['first_name', 'last_name', 'email', 'matricula', 'acciones'];
  ngOnInit(): void {
    
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getUserRole();
    
    if (this.userRole === 'alumno') {
      this.displayedAlumnosColumns = this.displayedAlumnosColumns.filter(c => c !== 'acciones');
    }
    
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

    eliminarUsuario(id: string, username: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar eliminación',
      mesage: `¿Estás seguro de que deseas eliminar al administrador <strong>${username}</strong>? Esta acción no se puede deshacer.`
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.alumnosService.delateUsuario(id).subscribe({
          next: () => {
            this.facadeService.openSnackBar(`Alumno ${username} eliminado correctamente.`, 'OK');
            this.loadAlumnos(); // Recargar la lista de alumnos
          },
          error: (err) => {
            console.error('Error al eliminar alumno:', err);
            this.facadeService.openSnackBar('Error al eliminar alumno.', 'OK');
          }
        });
      }
    });
  }

}