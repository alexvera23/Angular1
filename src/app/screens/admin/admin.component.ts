import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { AuthService } from '../../services/auth.service';
import { FacadeService } from '../../services/facade.service';
import { UserDataService } from '../../services/user-data.service';

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
export class AdminComponent {
  private authService = inject(AuthService);
  private facadeService = inject(FacadeService);
  private userDataService = inject(UserDataService);
  // Propiedades para datos dinámicos
  public username: string | null = null;
  public userRole: string | null = null;

  // Listas para las tablas
  public listaAdmins: any[] = [];


  // Columnas a mostrar
  public displayedAdminsColumns: string[] = ['username', 'first_name', 'last_name', 'email', 'clave_admin', 'rfc'];
  ngOnInit(): void {
    // Obtenemos datos del token
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getUserRole();
    
    // Cargamos los datos para las tablas
    this.loadAdmins();  
  }

private loadAdmins(): void {
    this.userDataService.getAdministradores().subscribe(
      data => this.listaAdmins = data
    );
  }



  public logout() {
    this.authService.logout();
    this.facadeService.openSnackBar('Sesión cerrada correctamente :).', 'OK');
  }

}
