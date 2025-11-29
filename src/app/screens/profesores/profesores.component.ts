import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { AuthService } from '../../services/auth.service';
import { FacadeService } from '../../services/facade.service';
import { UserDataService } from '../../services/user-data.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../partials/confirm-dialog/confirm-dialog.component';
import { Location } from '@angular/common';
import { ProfesoresService } from '../../services/profesores.service';


@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ...MATERIAL_MODULES
  ],
  templateUrl: './profesores.component.html',
  styleUrls: ['./profesores.component.scss']
})
export class ProfesoresComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private facadeService = inject(FacadeService);
  private userDataService = inject(UserDataService);
  private dialog = inject(MatDialog);
  private location = inject(Location);
  private profesoresService = inject(ProfesoresService);
  

 
  public username: string | null = null;
  public userRole: string | null = null;

  
  public listaMaestros = new MatTableDataSource<any>();

  
  public displayedMaestrosColumns: string[] = [
    'n_empleado',
    'first_name', 
    'last_name', 
    'email',
    'fecha_nacimiento',
    'telefono', 
    'area_investigacion', 
    'cubiculo',
    'materias',
    'acciones'
  ];
  
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getUserRole();

    if (this.userRole !== 'administrador') {
      this.displayedMaestrosColumns = this.displayedMaestrosColumns.filter(c => c !== 'acciones');
    }
    
    // Cargar datos de maestros
    this.loadMaestros();
    
    
    this.listaMaestros.filterPredicate = this.createFilter();
  }

  ngAfterViewInit(): void {
    // Asignar paginator y sort al dataSource
    this.listaMaestros.paginator = this.paginator;
    this.listaMaestros.sort = this.sort;
  }

  
  private loadMaestros(): void {
    this.userDataService.getMaestros().subscribe({
      next: (data) => {
        this.listaMaestros.data = data;
        console.log('Maestros cargados:', data);
      },
      error: (err) => {
        console.error('Error al cargar maestros:', err);
        this.facadeService.openSnackBar('Error al cargar la lista de maestros', 'ERROR');
      }
    });
  }

 
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaMaestros.filter = filterValue.trim().toLowerCase();

    // Si hay paginador, resetea a la primera página
    if (this.listaMaestros.paginator) {
      this.listaMaestros.paginator.firstPage();
    }
  }

  
  clearFilter(input: HTMLInputElement): void {
    input.value = '';
    this.listaMaestros.filter = '';
    
    if (this.listaMaestros.paginator) {
      this.listaMaestros.paginator.firstPage();
    }
  }

 
  private createFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      const searchStr = filter.toLowerCase();
      
      // Buscar en campos básicos
      const basicMatch = 
        data.n_empleado?.toString().toLowerCase().includes(searchStr) ||
        data.first_name?.toLowerCase().includes(searchStr) ||
        data.last_name?.toLowerCase().includes(searchStr) ||
        data.email?.toLowerCase().includes(searchStr) ||
        data.telefono?.toString().toLowerCase().includes(searchStr) ||
        data.area_investigacion?.toLowerCase().includes(searchStr) ||
        data.cubiculo?.toString().toLowerCase().includes(searchStr);

      // Buscar en materias
      let materiasMatch = false;
      if (data.materias_info && Array.isArray(data.materias_info)) {
        materiasMatch = data.materias_info.some((materia: any) =>
          materia.nombre?.toLowerCase().includes(searchStr)
        );
      }

      return basicMatch || materiasMatch;
    };
  }

  
  public logout(): void {
    this.authService.logout();
    this.facadeService.openSnackBar('Sesión cerrada correctamente', 'OK');
  }

  eliminarUsuario(id: string, username: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Confirmar eliminación',
      mesage: `¿Estás seguro de que deseas eliminar al administrador <strong>${username}</strong>? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      confirmColor: 'warn'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.profesoresService.delateUsuario(id).subscribe({
          next: () => {
            this.facadeService.openSnackBar(`Profesor ${username} eliminado correctamente.`, 'OK');
            this.loadMaestros(); // Recargar la lista de profesores
          },
          error: (err) => {
            console.error('Error al eliminar profesor:', err);
            this.facadeService.openSnackBar('Error al eliminar profesor.', 'OK');
          }
        });
      }
    });
  }

}