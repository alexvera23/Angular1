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
import { ConfirmDialogComponent } from '../../partials/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';


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
  private dialog = inject(MatDialog)
 


  public userRole: string | null = null;
  public username: string | null = null;

  
  public displayedColumns: string[] = [
    'id', 
    'nombre', 
    'tipo', 
    'fecha', 
    'horario', 
    'lugar', 
    'responsable', 
    'publico', 
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

    
    this.obtenerEventos();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  
  public obtenerEventos() {
    this.eventosService.obtenerEventos().subscribe({
      next: (data) => {
        
        
        let eventosFiltrados = [];

        if (this.userRole === 'administrador') {
          
          eventosFiltrados = data;
        } 
        else if (this.userRole === 'maestro') {
          
          eventosFiltrados = data.filter((evento: any) => 
            evento.publico_profesores === true || evento.publico_general === true
          );
        } 
        else if (this.userRole === 'alumno') {
          
          eventosFiltrados = data.filter((evento: any) => 
            evento.publico_estudiantes === true || evento.publico_general === true
          );
        }

       
        this.dataSource.data = eventosFiltrados;
        console.log("Eventos cargados (filtrados por rol):", eventosFiltrados);
      },
      error: (error) => {
        console.error(error);
        this.facadeService.openSnackBar('Error al obtener los eventos', 'Cerrar');
      }
    });
  }

  
  public applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }




  public eliminarEvento(id: number) {
    console.log("Eliminar evento ID:", id);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar Evento',
        message: '¿Estás seguro de que deseas eliminar este evento permanentemente?',
        confirmText: 'Eliminar', 
        confirmColor: 'warn'    
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      
      if (result) {
        this.eventosService.eliminarEvento(id).subscribe({
          next: () => {
            this.facadeService.openSnackBar('Evento eliminado correctamente', 'OK');
            
            this.obtenerEventos(); 
          },
          error: (err) => {
            console.error(err);
            this.facadeService.openSnackBar('Error al eliminar el evento', 'Cerrar');
          }
        });
      }
    });

    
  }
  public editarEvento(id: number) {
    console.log("Editar evento ID:", id);
    this.router.navigate([`/dashboard/editar-evento/${id}`]);
  }

   public regresar() { 
    this.location.back(); 
  }



}
