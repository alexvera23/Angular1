import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // --- GRUPO DE RUTAS DE AUTENTICACIÓN ---
  {
    // 1. Ruta Padre (Layout): Cualquier URL vacía ('') activará este layout.
    path: '',
    // En lugar de `component`, usamos `loadComponent` para el layout también.
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(c => c.AuthLayoutComponent),
    // 2. Rutas Hijas (Screens): Estas rutas se renderizarán DENTRO del <router-outlet> de AuthLayoutComponent.
    children: [
      {
        // Si el path está vacío, redirige a 'login'.
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        // La URL completa será '/login'
        path: 'login',
        loadComponent: () => import('./screens/login-screen/login-screen.component').then(c => c.LoginScreenComponent)
      },
      {
        // La URL completa será '/registro-usuario'
        path: 'registro-usuario',
        loadComponent: () => import('./screens/registro-screen/registro-screen.component').then(c => c.RegistroScreenComponent)
      },
      {
        path: 'editar/administrador/:id',
        loadComponent: () => import('./partials/registro-admin/registro-admin.component').then(c => c.RegistroAdminComponent)
      },
      {
        path : 'editar/profesor/:id',
        loadComponent: () => import('./partials/registro-profesores/registro-profesores.component').then(c => c.RegistroProfesoresComponent)
      },
      {
        path : 'editar/alumno/:id',
        loadComponent: () => import('./partials/registro-alumnos/registro-alumnos.component').then(c => c.RegistroAlumnosComponent)
      }

    ]
  },

  // GRUPO DE RUTAS DEL DASHBOARD
  {
    // Cuando el usuario vaya a '/dashboard', se cargará el layout del dashboard.
    path: 'dashboard',
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then(c => c.DashboardLayoutComponent),
    canActivate: [authGuard], // Proteger todas las rutas del dashboard con el AuthGuard
    children: [
      { 
        path: '', redirectTo: 'admin', pathMatch: 'full'
        
      },
      {
        path : 'admin',
        loadComponent: () => import('./screens/admin/admin.component').then(c => c.AdminComponent),
        canActivate: [authGuard] // Proteger esta ruta con el AuthGuard
      },
      {
        path : 'profesor',
        loadComponent: () => import('./screens/profesores/profesores.component').then(c => c.ProfesoresComponent),
        canActivate: [authGuard] // Proteger esta ruta con el AuthGuard
      },
      {
        path : 'alumno',
        loadComponent: () => import('./screens/alumno/alumno.component').then(c => c.AlumnoComponent),
        canActivate: [authGuard] // Proteger esta ruta con el AuthGuard
      },
      {
        path : 'graficas',
        loadComponent: () => import('./screens/graficas-screen/graficas-screen.component').then(c => c.GraficasScreenComponent),
        canActivate: [authGuard] // Proteger esta ruta con el AuthGuard
      },
      {
        path: 'registrar-evento',
        loadComponent: () => import('./partials/registro-evento/registro-evento.component').then(c => c.RegistroEventoComponent),
        canActivate: [authGuard]
        
      },
      {
        path: 'eventos',
        loadComponent: () => import('./screens/eventos-academicos-screens/eventos-academicos-screens.component').then(c => c.EventosAcademicosScreensComponent),
        canActivate: [authGuard]
      }


    ]
  },

  
  // Si el usuario escribe cualquier otra URL que no exista, lo redirige a 'login'.
  {
    path: '**',
    redirectTo: 'login'
  }
];
