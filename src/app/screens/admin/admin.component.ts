import { Component, AfterViewInit, OnInit, ViewChild, inject } from '@angular/core';
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
import { AdministradoresService } from '../../services/administradores.service';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  
    ...MATERIAL_MODULES //  Importamos todos los módulos de Material
    
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private facadeService = inject(FacadeService);
  private userDataService = inject(UserDataService);
  private dialog = inject(MatDialog);
  private administradoresService = inject(AdministradoresService);
  
  public username: string | null = null;
  public userRole: string | null = null;

  // Listas para las tablas
  public listaAdmins = new MatTableDataSource<any>();



  public displayedAdminsColumns: string[] = ['username', 'first_name', 'last_name', 'email', 'clave_admin', 'rfc', 'acciones'];
  @ViewChild(MatPaginator) paginator!: MatPaginator; 
  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit(): void {
    
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getUserRole();
    
    // Cargamos los datos para las tablas
    this.loadAdmins();  

    this.listaAdmins.filterPredicate = this.createFilter();

    
  }

private loadAdmins(): void {
    this.userDataService.getAdministradores().subscribe({
      next: (data) => {
        this.listaAdmins.data = data;
        console.log('Datos de admins cargados:', data);
      },
      error: (err) => {
        console.error('Error al cargar datos de admins:', err);
        this.facadeService.openSnackBar('Error al cargar datos de administradores.', 'OK');
      }
    });
    
  }

  applyFilterAdmins(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.listaAdmins.filter = filterValue.trim().toLowerCase(); 

    if (this.listaAdmins.paginator) {
      this.listaAdmins.paginator.firstPage();
    }
  }

  clearFilter(input: HTMLInputElement): void {
    input.value = '';
    this.listaAdmins.filter = '';

    if (this.listaAdmins.paginator) {
      this.listaAdmins.paginator.firstPage();
    }
  }

  private createFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      const searchStr = filter.toLowerCase();

      // Busacar en campos de admin 
      const basicMatch = 
      data.clave_admin?.toString().toLowerCase().includes(searchStr) ||
      data.first_name?.toLowerCase().includes(searchStr) ||
      data.last_name?.toLowerCase().includes(searchStr) ||
      data.email?.toLowerCase().includes(searchStr) ||
      data.rfc?.toLowerCase().includes(searchStr);

      return basicMatch ;
    };
  }



  public logout() {
    this.authService.logout();
    this.facadeService.openSnackBar('Sesión cerrada correctamente :).', 'OK');
  }

  ngAfterViewInit(): void {
    this.listaAdmins.paginator = this.paginator;
    this.listaAdmins.sort = this.sort;
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
        this.administradoresService.delateUsuario(id).subscribe({
          next: () => {
            this.facadeService.openSnackBar(`Administrador ${username} eliminado correctamente.`, 'OK');
            this.loadAdmins(); // Recargar la lista de administradores
          },
          error: (err) => {
            console.error('Error al eliminar administrador:', err);
            this.facadeService.openSnackBar('Error al eliminar administrador.', 'OK');
          }
        });
      }
    });
  }
}
