import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EventosService } from '../../services/eventos.service';
import { FacadeService } from '../../services/facade.service';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { AuthService } from '../../services/auth.service';

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

  // --- Botones (Funcionalidad pendiente) ---
  
  public editarEvento(id: number) {
    console.log("Editar evento ID:", id);
    // Aquí irás a la pantalla de edición
  }

  public eliminarEvento(id: number) {
    console.log("Eliminar evento ID:", id);
    // Aquí abrirás el diálogo de confirmación
  }


}
