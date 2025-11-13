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
  templateUrl: './profesores.component.html',
  styleUrl: './profesores.component.scss'
})
export class ProfesoresComponent implements OnInit {
  private authService = inject(AuthService);
  private facadeService = inject(FacadeService)
  private userDataService = inject(UserDataService);
  // Propiedades para datos dinámicos
  public username: string | null = null;
  public userRole: string | null = null;

  public listaMaestros: any[] = [];

  public displayedMaestrosColumns: string[] = ['first_name', 'last_name', 'email', 'area_investigacion', 'cubiculo'];
  
  ngOnInit(): void {
    // Obtenemos datos del token
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getUserRole();
    this.loadMaestros();
  }
  private loadMaestros(): void {
    this.userDataService.getMaestros().subscribe(
      data => this.listaMaestros = data
    );
  }
  public logout() {
    this.authService.logout();
    this.facadeService.openSnackBar('Sesión cerrada correctamente :).', 'OK');
  }


}
