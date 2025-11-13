// src/app/partials/navbar-user/navbar-user.component.ts
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FacadeService } from '../../services/facade.service';

@Component({
  selector: 'app-navbar-user',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navar-user.component.html',
  styleUrls: ['./navar-user.component.scss']
})
export class NavbarUserComponent implements OnInit {

  public expandedMenu: string | null = null;
  public userInitial: string = '';
  public userName: string = '';
  public isMobileView: boolean = window.innerWidth <= 992;
  public showUserMenu: boolean = false;
  public mobileOpen: boolean = false;
  public userRole: string = '';

  // Variables para el tema oscuro/claro
  public paletteMode: 'light' | 'dark' = 'light';
  public colorPalettes = {
    light: {
      '--background-main': '#f4f7fb',
      '--sidebar-bg': '#23395d',
      '--navbar-bg': '#fff',
      '--text-main': '#222',
      '--table-bg': '#fff',
      '--table-header-bg': '#cfe2ff',
    },
    dark: {
      '--background-main': '#181a1b',
      '--sidebar-bg': '#1a2636',
      '--navbar-bg': '#222',
      '--text-main': '#e4ecfa',
      '--table-bg': '#222',
      '--table-header-bg': '#30507a',
    }
  };

  private router = inject(Router);
  private authService = inject(AuthService);
  private facadeService = inject(FacadeService);

  constructor() {
    // Inicializar datos del usuario desde el token
    this.initializeUserData();
    
    // Listener para cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      this.isMobileView = window.innerWidth <= 992;
      if (!this.isMobileView) {
        this.mobileOpen = false;
      }
    });

    // Aplicar tema claro por defecto
    this.applyPalette('light');
  }

  ngOnInit(): void {
    // Verificar que el usuario esté autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  // Inicializa los datos del usuario desde el token
  private initializeUserData(): void {
    const username = this.authService.getUsername();
    const role = this.authService.getUserRole();

    if (username) {
      this.userName = username;
      this.userInitial = username.charAt(0).toUpperCase();
    } else {
      this.userInitial = '?';
    }

    this.userRole = role || '';
  }

// Cambia entre modo claro y oscuro
  togglePalette(): void {
    this.paletteMode = this.paletteMode === 'light' ? 'dark' : 'light';
    this.applyPalette(this.paletteMode);
  }

  // Aplica la paleta de colores seleccionada
  private applyPalette(mode: 'light' | 'dark'): void {
    const palette = this.colorPalettes[mode];
    Object.keys(palette).forEach(key => {
      document.documentElement.style.setProperty(key, palette[key as keyof typeof palette]);
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobileView = window.innerWidth <= 992;
    if (!this.isMobileView) {
      this.mobileOpen = false;
    }
  }

  toggleSidebar(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeSidebar(): void {
    this.mobileOpen = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMenu(menu: string): void {
    this.expandedMenu = this.expandedMenu === menu ? null : menu;
  }

  closeMenu(): void {
    this.expandedMenu = null;
  }

 // Cierra la sesión del usuario
  logout(): void {
    this.authService.logout();
    this.facadeService.openSnackBar('Sesión cerrada correctamente');
    this.router.navigate(['/login']);
    this.closeSidebar();
  }

  // --- Métodos para verificar roles ---
  
  isAdmin(): boolean {
    return this.userRole === 'administrador';
  }

  isTeacher(): boolean {
    return this.userRole === 'maestro';
  }

  isStudent(): boolean {
    return this.userRole === 'alumno';
  }

  canSeeAdminItems(): boolean {
    return this.isAdmin();
  }

  canSeeTeacherItems(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  canSeeStudentItems(): boolean {
    return this.isAdmin() || this.isTeacher() || this.isStudent();
  }

  canSeeHomeItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  canSeeRegisterItem(): boolean {
    return this.isAdmin() || this.isTeacher();
  }

  // Obtiene el nombre del rol para mostrar en la interfaz
  getRoleName(): string {
    switch(this.userRole) {
      case 'administrador':
        return 'Administrador';
      case 'maestro':
        return 'Profesor';
      case 'alumno':
        return 'Alumno';
      default:
        return 'Usuario';
    }
  }
}