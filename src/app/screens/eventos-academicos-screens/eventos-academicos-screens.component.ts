import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule, Location} from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EventosService } from '../../services/eventos.service';
import { FacadeService } from '../../services/facade.service';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-eventos-academicos-screens',
  standalone: true,
  imports: [ CommonModule, 
    ...MATERIAL_MODULES ],
  templateUrl: './eventos-academicos-screens.component.html',
  styleUrl: './eventos-academicos-screens.component.scss'
})
export class EventosAcademicosScreensComponent implements OnInit, AfterViewInit {
  private eventosService = inject(EventosService);
  private facadeService = inject(FacadeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private location = inject(Location);
 


  public userRole: string | null = null;
  public username: string | null = null;

  // Columnas a mostrar (Todas las solicitadas)
  public displayedColumns: string[] = [
    'id', 
    'nombre', 
    'tipo', 
    'fecha', 
    'horario', // Combinaremos inicio y fin para ahorrar espacio
    'lugar', 
    'responsable', 
    'publico', // Mostraremos chips para el público
    'cupo',
    'acciones'
  ];

  public dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.username = this.authService.getUsername();

    if (this.userRole !== 'administrador') {
      this.displayedColumns= this.displayedColumns.filter(c => c !== 'acciones');
    }

    // Cargar eventos
    this.obtenerEventos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Obtener lista de eventos del backend
  public obtenerEventos() {
    this.eventosService.obtenerEventos().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        console.log("Eventos cargados:", data);
      },
      error: (error) => {
        console.error(error);
        this.facadeService.openSnackBar('Error al obtener los eventos', 'Cerrar');
      }
    });
  }

  // Filtro de búsqueda
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }




  public eliminarEvento(id: number) {
    console.log("Eliminar evento ID:", id);
    // Aquí abrirás el diálogo de confirmación
  }
  public editarEvento(id: number) {
    console.log("Editar evento ID:", id);
    // Aquí navegarás al formulario de edición
    this.router.navigate([`/dashboard/editar-evento/${id}`]);
  }

   public regresar() { 
    this.location.back(); 
  }



}
