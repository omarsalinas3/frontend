import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DatesService } from '../../services/dates.service';

@Component({
  selector: 'app-medico-dashboard',
  templateUrl: './medico-dashboard.component.html',
  styleUrls: ['./medico-dashboard.component.css']
})
export class MedicoDashboardComponent implements OnInit, AfterViewInit {
  citas: any[] = [];
  citasFiltradas: any[] = [];
  citaSeleccionada: any = null;
  historialMedico: any = {
    diagnostico: '',
    tratamiento: '',
    observaciones: ''
  };
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private datesService: DatesService) { }

  ngOnInit() {
    this.cargarCitas();
  }

  ngAfterViewInit() {
    this.setupTextareaAutoResize();
  }

  cargarCitas() {
    const medicoId = localStorage.getItem('medicoId');
    if (medicoId) {
      this.datesService.getCitasByMedico(medicoId).subscribe(
        (citas) => {
          this.citas = citas.map(cita => ({
            ...cita,
            nombreCompleto: `${cita.nombre || ''} ${cita.apePaterno || ''} ${cita.apeMaterno || ''}`.trim(),
            fechaFormateada: cita.fechaFormateada || 'No disponible',
            horaFormateada: cita.horaFormateada || 'No disponible',
          }));
          this.citasFiltradas = [...this.citas];
          console.log('Citas cargadas:', this.citas);
        },
        (error) => console.error('Error al cargar citas:', error)
      );
    }
  }

  confirmarCita(idCita: number) {
    this.datesService.confirmarCita(idCita).subscribe(
      () => {
        console.log('Cita confirmada');
        this.cargarCitas();
      },
      (error) => console.error('Error al confirmar cita:', error)
    );
  }

  seleccionarCita(cita: any) {
    this.citaSeleccionada = cita;
    this.historialMedico = {
      diagnostico: '',
      tratamiento: '',
      observaciones: ''
    };
    setTimeout(() => this.setupTextareaAutoResize(), 0);
  }

  finalizarCita() {
    if (this.citaSeleccionada) {
      const historialMedico = {
        diagnostico: this.historialMedico.diagnostico || '',
        tratamiento: this.historialMedico.tratamiento || '',
        observaciones: this.historialMedico.observaciones || ''
      };

      this.datesService.finalizarCita(this.citaSeleccionada.idcita, historialMedico).subscribe(
        (response) => {
          console.log('Respuesta del servidor:', response);
          this.cargarCitas();
          this.cerrarModal();
        },
        (error) => console.error('Error al finalizar cita:', error)
      );
    }
  }

  filtrarPorFechas() {
    if (this.fechaInicio && this.fechaFin) {
      const fechaInicio = new Date(this.fechaInicio);
      const fechaFin = new Date(this.fechaFin);

      if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
        this.citasFiltradas = this.citas.filter(cita => {
          const fechaCita = new Date(cita.fecha);
          return fechaCita >= fechaInicio && fechaCita <= fechaFin;
        });
      }
    } else {
      this.citasFiltradas = [...this.citas];
    }
  }

  cerrarModal() {
    this.citaSeleccionada = null;
  }

  setupTextareaAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.addEventListener('input', this.autoResize);
      // Inicializar el tamaño
      this.autoResize({ target: textarea } as any);
    });
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}