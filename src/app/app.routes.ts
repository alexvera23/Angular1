import { Routes } from '@angular/router';

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
      }
    ]
  },

  // --- GRUPO DE RUTAS DEL DASHBOARD (PARA EL FUTURO) ---
  {
    // Cuando el usuario vaya a '/dashboard', se cargará el layout del dashboard.
    path: 'dashboard',
    loadComponent: () => import('./layouts/dashboard-layout/dashboard-layout.component').then(c => c.DashboardLayoutComponent),
    children: [
      // Aquí irían las rutas del dashboard, ej: 'perfil', 'cursos', etc.
      // { path: 'profile', loadComponent: ... }
    ]
  },

  // --- RUTA FALLBACK ---
  // Si el usuario escribe cualquier otra URL que no exista, lo redirige a 'login'.
  {
    path: '**',
    redirectTo: 'login'
  }
];
