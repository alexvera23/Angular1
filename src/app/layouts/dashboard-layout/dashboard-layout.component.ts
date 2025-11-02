import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarUserComponent } from '../../partials/navar-user/navar-user.component';
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet // Necesario para las rutas anidadas del dashboard
    ,NavbarUserComponent
  
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss']
})
export class DashboardLayoutComponent {

}