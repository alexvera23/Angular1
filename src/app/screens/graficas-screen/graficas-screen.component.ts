import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../../shared/shared-material';
import { AuthService } from '../../services/auth.service';
import { UserDataService } from '../../services/user-data.service';
import { EventosService } from '../../services/eventos.service';
import { FacadeService } from '../../services/facade.service';
import { BaseChartDirective } from 'ng2-charts';
import { 
  Chart,
  ChartConfiguration, 
  ChartType,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController
} from 'chart.js';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  PieController,
  DoughnutController
);

interface ChartData {
  administradores: number;
  maestros: number;
  alumnos: number;
  eventosEstudiantes: number;
  eventosProfesores: number;
  eventosGeneral: number;
}

@Component({
  selector: 'app-graficas-screen',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_MODULES, BaseChartDirective,MatProgressSpinnerModule],
  templateUrl: './graficas-screen.component.html',
  styleUrl: './graficas-screen.component.scss'
})
export class GraficasScreenComponent implements OnInit {
  private authService = inject(AuthService);
  private userDataService = inject(UserDataService);
  private eventosService = inject(EventosService);
  private facadeService = inject(FacadeService);

  public username: string | null = null;
  public userRole: string | null = null;
  public isLoading = true;


  public tiposGrafica = [
    { value: 'bar', label: 'Barras' },
    { value: 'line', label: 'Histograma (Líneas)' },
    { value: 'pie', label: 'Circular' },
    { value: 'doughnut', label: 'Dona' }
  ];

  // Datos crudos
  public chartData: ChartData = {
    administradores: 0,
    maestros: 0,
    alumnos: 0,
    eventosEstudiantes: 0,
    eventosProfesores: 0,
    eventosGeneral: 0
  };


  public usuariosChartType: ChartType = 'bar';
  
  public usuariosChartData: ChartConfiguration['data'] = {
    labels: ['Administradores', 'Maestros', 'Alumnos'],
    datasets: [
      {
        label: 'Total de Usuarios',
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  public usuariosChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Usuarios Registrados por Rol',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };


  public eventosChartType: ChartType = 'pie';
  
  public eventosChartData: ChartConfiguration['data'] = {
    labels: ['Para Estudiantes', 'Para Profesores', 'Público General'],
    datasets: [
      {
        label: 'Total de Eventos',
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  public eventosChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Eventos Registrados por Público',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getUserRole();
    this.cargarDatos();
  }

  // Cargar todos los datos necesarios
  private cargarDatos(): void {
    this.isLoading = true;

    Promise.all([
      this.userDataService.getAdministradores().toPromise(),
      this.userDataService.getMaestros().toPromise(),
      this.userDataService.getAlumnos().toPromise(),
      this.eventosService.obtenerEventos().toPromise()
    ])
      .then(([admins, maestros, alumnos, eventos]) => {
       
        this.chartData.administradores = admins?.length || 0;
        this.chartData.maestros = maestros?.length || 0;
        this.chartData.alumnos = alumnos?.length || 0;

       
        if (eventos) {
          this.chartData.eventosEstudiantes = eventos.filter(
            (e: any) => e.publico_estudiantes
          ).length;
          this.chartData.eventosProfesores = eventos.filter(
            (e: any) => e.publico_profesores
          ).length;
          this.chartData.eventosGeneral = eventos.filter(
            (e: any) => e.publico_general
          ).length;
        }

        
        this.actualizarGraficas();
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error al cargar datos:', error);
        this.facadeService.openSnackBar('Error al cargar los datos', 'ERROR');
        this.isLoading = false;
      });
  }

  
  private actualizarGraficas(): void {
    
    this.usuariosChartData.datasets[0].data = [
      this.chartData.administradores,
      this.chartData.maestros,
      this.chartData.alumnos
    ];

    
    this.eventosChartData.datasets[0].data = [
      this.chartData.eventosEstudiantes,
      this.chartData.eventosProfesores,
      this.chartData.eventosGeneral
    ];

    
    this.usuariosChartData = { ...this.usuariosChartData };
    this.eventosChartData = { ...this.eventosChartData };
  }

 
  public cambiarTipoUsuarios(tipo: ChartType): void {
    this.usuariosChartType = tipo;
    
    
    if (tipo === 'bar' || tipo === 'line') {
      this.usuariosChartOptions = {
        ...this.usuariosChartOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      };
    } else {
      
      const { scales, ...optionsSinScales } = this.usuariosChartOptions as any;
      this.usuariosChartOptions = optionsSinScales;
    }
  }

  
  public cambiarTipoEventos(tipo: ChartType): void {
    this.eventosChartType = tipo;
    
    
    if (tipo === 'bar' || tipo === 'line') {
      this.eventosChartOptions = {
        ...this.eventosChartOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      };
    } else {
      
      const { scales, ...optionsSinScales } = this.eventosChartOptions as any;
      this.eventosChartOptions = optionsSinScales;
    }
  }

  // Calcular totales
  public get totalUsuarios(): number {
    return (
      this.chartData.administradores +
      this.chartData.maestros +
      this.chartData.alumnos
    );
  }

  public get totalEventos(): number {
    return (
      this.chartData.eventosEstudiantes +
      this.chartData.eventosProfesores +
      this.chartData.eventosGeneral
    );
  }
}