import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { AuthService } from '../../services/auth.service';
import { FacadeService } from '../../services/facade.service';
import { UserDataService } from '../../services/user-data.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  
    ...MATERIAL_MODULES //  Importamos todos los módulos de Material
    
  ],
  templateUrl: './profesores.component.html',
  styleUrl: './profesores.component.scss'
})
export class ProfesoresComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private facadeService = inject(FacadeService)
  private userDataService = inject(UserDataService);


  
  public username: string | null = null;
  public userRole: string | null = null;

  public listaMaestros = new MatTableDataSource<any>();

  public displayedMaestrosColumns: string[] = ['n_empleado','first_name', 'last_name', 'email','fecha_nacimiento','telefono', 'area_investigacion', 'cubiculo','materias','acciones'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatChipsModule) chips!: MatChipsModule;

  ngOnInit(): void {
    
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getUserRole();
    this.loadMaestros();
  }
  private loadMaestros(): void {
    this.userDataService.getMaestros().subscribe(
      data => this.listaMaestros.data = data
    );
  }
  public logout() {
    this.authService.logout();
    this.facadeService.openSnackBar('Sesión cerrada correctamente :).', 'OK');
  }

  ngAfterViewInit(): void {
    this.listaMaestros.paginator = this.paginator;
  }


}
