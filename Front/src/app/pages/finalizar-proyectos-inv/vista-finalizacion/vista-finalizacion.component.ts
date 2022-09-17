import {Component, Inject, OnInit} from '@angular/core';
import {ProjectService} from 'src/app/shared/services/Proyect/project.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {
    DetalleRubroComponent,
    DetalleRubroData
} from 'src/app/pages/formulacion/components/presupuesto/components/componente-presupuestal/detalle-rubro/detalle-rubro.component';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AuthStorageService} from '../../../@core/services/storage/auth-storage/auth-storage.service';
import {SucessDialogComponent, SucessDialogData} from '../../admin/Dialog/sucess-dialog/sucess-dialog.component';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {cronogramaService} from '../../../shared/services/cronograma/cronograma.service';
import {
    Actividad,
    Entidad,
    MetodologiaObjetivo, Planteamiento, Riesgo,
    RubrosPorEntidades
} from '../../../shared/services/saveStateService/StateInterface';
import {finalize} from 'rxjs/operators';
import {FirmaService} from '../../../shared/services/firma/firma.service';
import {CommonSimpleModel} from '../../../shared/models/common-simple.model';
import {ProjectEntryService} from '../../../shared/services/project-entry/project-entry.service';
import { UsersService } from "src/app/pages/admin/users/services/users.service";
import { InvCenterService } from '../../../shared/services/inv-center2/inv-center.service';


require('jspdf-autotable');

@Component({
    selector: 'app-vista-finalizacion',
    templateUrl: './vista-finalizacion.component.html',
    styleUrls: ['./vista-finalizacion.component.scss']
})
export class VistaFinalizacionComponent implements OnInit {

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: VistaFinalizacionData,
        private projectService: ProjectService,
        public dialog: MatDialog,
        private auto: AuthStorageService,
        private cronogramaServic: cronogramaService,
        private firmaService: FirmaService,
        private projectEntryService: ProjectEntryService,
        private userService: UsersService,
        private centroInvService: InvCenterService,
        public dialogRef: MatDialogRef<VistaFinalizacionComponent>) {
    }

    public nombreProyecto: string;
    public linea: string;
    public programa: string;
    public subprograma: string;
    public tipoInvestigacion: string;
    public avala: string;
    public lugar: string;
    public duracion: number;
    public gestor: string;
    public email: string;
    public telefonoGestor: number;
    public comandante: string;
    public ComandanteCorreo: string;
    public ComandanteNumber: string;
    public dataSourceRubro = [];
    public entidades: Entidad[] = [];
    public planteamiento: Planteamiento;
    public objetivoGeneral: string;
    public equipoInvestigacion;
    public unidadDependencia: string;
    public objetivosEspecificos: [];
    public resumen: string;
    public palabrasClave: [];
    public marcoConceptual: string;
    public estadoArte: string;
    public resultadosPrevios: string;
    public resultadosEsperados: string;
    public metodologia: string;
    public impactoAmbiental: string;
    public bibliografias: [];
    public Valores = [];
    public RvlrresultPrevios = 0;
    public displayedColumns: string[] = ['Grado', 'Nombres', 'Apellidos', 'Cargo', 'Dedicacion', 'Grupo'];
    public dataSource;
    public modelo;
    public grupos = [];
    public productosEsperados = [];
    public pregunta;
    public centroDeInvestigacion;
    public convocatoriaId;
    public rubroOpcion: CommonSimpleModel[] = [];
    public totalDelProyecto = 0;
    public rubrosPorEntidades: RubrosPorEntidades[];
    public listaDeMetodologia: MetodologiaObjetivo[] = [];
    public firmaInvestigador;
    public firmaInvestigadorPrincipal;
    public firmaInvestigador_finalizar;
    public firmaInvestigadorPrincipal_finalizar;
    public firmaGestorActi;
    public firmaComandante;
    public firmaGestorActi_finalizar;
    public firmaComandante_finalizar;
    public fechaFirmaInvestigador;
    public fechaFirmaInvestigadorPrincipal;
    public fechaFirmaGestorActi;
    public fechaFirmaComandante;
    public fechaFirmaInvestigador_finalizar;
    public fechaFirmaInvestigadorPrincipal_finalizar;
    public fechaFirmaGestorActi_finalizar;
    public fechaFirmaComandante_finalizar;
    public firmaJefeCentro;
    public firmas = [];
    public firmas_finalizar = [];
    public listaDeRubros = [];
    public riesgos: Riesgo[] = [];
    public listaDeActividades: Actividad[] = [];
    public totalAdvance = 0;
    public date;
    public date2;
    public date_hoy;
    public montoTotal = 0;
    public LIMIT_RUBROS = 2;
    public FECHA_FIRMA = 'Fecha de firma: ';
    public indice_global = 0;
    public monto_ejecutado = 0;
    public monto_ejecutado_aux = 0;
    public investigador_principal;
    public listaRubros = [];
    public pregunta_uno;
    public pregunta_dos;
    public pregunta_tres;
    public pregunta_cuatro;
    public pregunta_cinco;
    public firma_jefecentro;
    public centrosDeInv : any = [];
    public usuario_JefeDeCentro;

    ngOnInit(): void {
        this.getAll();
        //console.log(this.usuario_JefeDeCentro);
    }

    public calculateAdvance(firstDate: string, secondDate: string): number {
        const startDate = new Date(firstDate);
        const endDate = new Date(secondDate);
        const today = new Date();

        if (startDate > today) {
            return 0;
        }

        if (endDate < today) {
            return 100;
        }

        if (startDate < today && today < endDate) {
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
            const actualDay = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
            return Math.ceil((actualDay * 100) / totalDays);
        }
    }

    getCentrosInv(): void {
        this.centroInvService.getAll().subscribe((centrosInv: any)=>{
            this.centrosDeInv = centrosInv.invCenters;
        });
    }

    public getAll(): void {
        let date_hoy2 = new Date();
        let year2 = date_hoy2.getFullYear();
        let day2 = date_hoy2.getDate();
        let month2 = date_hoy2.getMonth();
        this.date_hoy = `${day2}-${month2 + 1}-${year2}`;

        this.projectService.getById(this.data.idProyecto)
            .pipe(finalize(() => {
                //this.getCentrosInv();
                this.getCronograma();
                this.getRubroOpcion();
                this.getTotalAmount();
                this.getFirmas();
            }))
            .subscribe(r => {

                // for (let centro of this.centrosDeInv) {
                //     if(centro.name == r.iniciarProyecto[0].centroDeInvestigacion){
                //         this.userService.getById(centro.jefe._id).subscribe((user)=>{
                //             this.usuario_JefeDeCentro = user;
                //         });
                //     }
                // }

                this.pregunta_uno = r.Proyecto.preguntasFinalizacion[0].respuesta_preg_uno;
                this.pregunta_dos = r.Proyecto.preguntasFinalizacion[0].respuesta_preg_dos;
                this.pregunta_tres = r.Proyecto.preguntasFinalizacion[0].respuesta_preg_tres;
                this.pregunta_cuatro = r.Proyecto.preguntasFinalizacion[0].respuesta_preg_cuatro;
                this.pregunta_cinco = r.Proyecto.preguntasFinalizacion[0].respuesta_preg_cinco;
                this.firma_jefecentro = r.Proyecto.preguntasFinalizacion[0].firma_jefeCentro;
                this.date = r.Proyecto.date;
                this.date2 = r.Proyecto.date2;
                this.convocatoriaId = r.Proyecto.Convocatoria._id,
                this.nombreProyecto = r.Proyecto.iniciarProyecto[0].nombreProyecto;
                this.centroDeInvestigacion = r.Proyecto.iniciarProyecto[0].centroDeInvestigacion;
                this.linea = r.Proyecto.iniciarProyecto[0].linea;
                this.modelo = r.Proyecto.iniciarProyecto[0].modelo;
                this.grupos = r.Proyecto.grupos;
                this.firmas = r.Proyecto.firmas,
                this.firmas_finalizar = r.Proyecto.firmas_finalizar,
                this.programa = r.Proyecto.iniciarProyecto[0].programa;
                this.subprograma = r.Proyecto.iniciarProyecto[0].subprograma;
                this.tipoInvestigacion = 'N/A';
                this.avala = r.Proyecto.iniciarProyecto[0].avala;
                this.lugar = r.Proyecto.iniciarProyecto[0].lugar;
                this.duracion = r.Proyecto.iniciarProyecto[0].duracion;
                this.gestor = r.Proyecto.iniciarProyecto[0].gestor;
                this.email = r.Proyecto.iniciarProyecto[0].email;
                this.telefonoGestor = r.Proyecto.iniciarProyecto[0].telefonoGestor;
                this.comandante = r.Proyecto.iniciarProyecto[0].comandante.profile.names + ' ' + r.Proyecto.iniciarProyecto[0].comandante.profile.surname;
                this.ComandanteCorreo = r.Proyecto.iniciarProyecto[0].comandante.email;
                this.ComandanteNumber = r.Proyecto.iniciarProyecto[0].comandante.phoneNumber;
                this.unidadDependencia = r.Proyecto.iniciarProyecto[0].dependencia;
                this.equipoInvestigacion = r.Proyecto.EquipoInvestigaciones;
                this.userService.getAll().subscribe((usuarios) => {
                    for (let usuario of usuarios) {
                      if(usuario.identification == r.Proyecto.EquipoInvestigaciones[0].identificacion){
                        this.investigador_principal = usuario;
                        //console.log(this.investigador_principal);
                      }
                    }
                  });
                this.objetivoGeneral = r.Proyecto.objetivoGeneral;
                this.objetivosEspecificos = r.Proyecto.objetivosEspecificos;
                this.resumen = r.Proyecto.resumen;
                this.palabrasClave = r.Proyecto.palabraClaves;
                this.marcoConceptual = r.Proyecto.marcoConceptual;
                this.estadoArte = r.Proyecto.estadoArte;
                this.resultadosPrevios = r.Proyecto.resultadosPrevios;
                this.resultadosEsperados = r.Proyecto.resultadosEsperados;
                this.metodologia = r.Proyecto.metodologia;
                this.impactoAmbiental = r.Proyecto.informaciones[0].impacto;
                this.pregunta = r.Proyecto.informaciones[0].pregunta;
                this.bibliografias = r.Proyecto.bibliografias;
                this.productosEsperados = [...r.Proyecto.productosEsperados];
                this.dataSourceRubro = r.Proyecto.AgregarDetallesRubros;
                this.listaRubros = r.Proyecto.AgregarDetallesRubros[0].listaRubros;
                this.entidades = r.Proyecto.Entidades;
                this.planteamiento = r.Proyecto.planteamiento;
                this.riesgos = r.Proyecto.riesgos ? r.Proyecto.riesgos : [];
                this.calcularMontoEjecutado();
            });
    }

    private indice_global_metodo(){
        if(this.dataSourceRubro[this.indice_global+1]){
            this.indice_global = this.indice_global+1;
        }else{
            this.indice_global = 0;
        }
    }

    private montoEjecutado(indice: number) {
        return (this.dataSourceRubro[indice].gastoRubrosTotal);
    }

    private calcularMontoEjecutado() {
        let rubro_acumulado = 0;
        let indice = -1;
        //console.log(typeof(this.dataSourceRubro));

        for (let tipoRubro of this.dataSourceRubro) {
            indice = indice + 1;
            for (let rubro of tipoRubro.listaRubros) {
                rubro_acumulado = rubro_acumulado + rubro.rubro;
            }
            //console.log("R1: ",rubro_acumulado);
            this.dataSourceRubro[indice].gastoRubrosTotal = rubro_acumulado;
            this.monto_ejecutado_aux += rubro_acumulado;
            rubro_acumulado = 0;
        }
        //console.log("Rtotal: ", this.monto_ejecutado_aux);
    }

    private calculateTotalAdvance(): void {
        let count = 0;
        let totalPercentage = 0;
        this.listaDeActividades.map(activity => {
            activity.subActividad.map(subActividad => {
                count += 1;
                totalPercentage += this.calculateAdvance(String(subActividad.fechaInicio), String(subActividad.fechaFinal));
            });
        });
        const total = 100 * count;
        this.totalAdvance = totalPercentage * 100 / total;
    }

    private getRubroOpcion(): void {
        this.projectEntryService.getIdConv(this.convocatoriaId)
            .pipe(finalize(() => this.createRubroObject()))
            .subscribe(response => {
                response.forEach(element => {
                    this.rubroOpcion.push(element);
                });
            });
    }

    private createRubroObject(): void {
        this.rubroOpcion.forEach(rubro => {
            //console.log(rubro);
            this.entidades.forEach(entidad => {
                //console.log(entidad);
                const efectivo = this.getAmount(entidad.nombre, 'Efectivo', rubro.descr);
                const especie = this.getAmount(entidad.nombre, 'Especie', rubro.descr);
                const hasRubro = this.listaDeRubros.find(rubroSeleccionado => rubroSeleccionado.nombre === rubro.descr);
                if (!hasRubro && (efectivo || especie)) {
                    this.listaDeRubros.push({entidad, efectivo, especie, nombre: rubro.descr});
                }
            });
        });
        //console.log(this.listaDeRubros);
    }

    public calculateRoiIndicator(): string {
        let total = 0;
        if (this.planteamiento) {
            const {inversion, utilidad} = this.planteamiento;
            total = ((utilidad - inversion) / (inversion) * 100);
        }
        return `Rol = ${total}%`;
    }

    public getProductosEsperados(subActividadNombre: string): string {
        const productoEsperado = this.productosEsperados.find(producto => producto.subActividad === subActividadNombre);
        return productoEsperado ? productoEsperado.tipoProducto : '---';
    }

    public calculatePercentage(name): string {
        const newList = this.listaDeRubros.filter(rubro => rubro.nombre === name);
        const total = newList.reduce((acc, actual) => {
            return acc + actual.efectivo + actual.especie;
        }, 0);
        const percentage = ((total * 100) / this.totalDelProyecto).toFixed(2);
        return `${percentage} %`;
    }

    public calculatePercentageByEntity(entidad): string {
        const newList = this.listaDeRubros.filter(rubro => rubro.entidad.nombre === entidad);
        const total = newList.reduce((acc, actual) => {
            return acc + actual.efectivo + actual.especie;
        }, 0);
        const percentage = ((total * 100) / this.totalDelProyecto).toFixed(2);
        return `${percentage} %`;
    }

    public getAmount(entidad: string, tipoDeRubro: string, nombreDeRubro: string): number {
        const rubroActualTemporal = this.dataSourceRubro
            .filter(rubro => rubro.entidad === entidad && rubro.tipoDeRubro === tipoDeRubro && rubro.NombreRubro === nombreDeRubro);
        let rubroActual = 0;
        rubroActualTemporal.map(rubro => rubroActual += rubro.EntidadesCostos);
        if (rubroActual) {
            return rubroActual;
        } else {
            return 0;
        }
    }

    public getTotalSubTypeAmount(entidad: string, tipoDeRubro: string): number {
        let total = 0;
        this.dataSourceRubro.map(rubro => {
            if (rubro.tipoDeRubro === tipoDeRubro && rubro.entidad === entidad) {
                total = total + rubro.EntidadesCostos;
            }
        });
        return total;
    }

    public getTotalAmount(): void {
        this.dataSourceRubro.map(rubro => this.totalDelProyecto = this.totalDelProyecto + rubro.EntidadesCostos);
    }

    private getFirmas(): void {
        //this.usuario_JefeDeCentro
        // this.firmaService.getFirma(this.usuario_JefeDeCentro._id).subscribe(response => {
        //     this.firma_jefecentro = response.firma});

        this.firmas.map(firma => {
            if (firma.name === 'Investigador' && firma.status) {
                this.getFirma(firma.idQuienFirma, 'Investigador', firma.date);
            }
            if (firma.name === 'Investigador Principal' && firma.status) {
                this.getFirma(firma.idQuienFirma, 'Investigador Principal', firma.date);
            }
            if (firma.name === 'Comandante' && firma.status) {
                this.getFirma(firma.idQuienFirma, 'Comandante', firma.date);
            }
            if (firma.name === 'GestorACTI' && firma.status) {
                this.getFirma(firma.idQuienFirma, 'GestorACTI', firma.date);
            }
        });
        this.firmas_finalizar.map(firma => {
            if (firma.name === 'Investigador' && firma.status) {
                this.getFirma(firma.idQuienFirma, 'Investigador_finalizar', firma.date);
            }
            if (firma.name === 'Investigador Principal' && firma.status) {
                this.getFirma(firma.idQuienFirma, 'Investigador Principal_finalizar', firma.date);
            }
            if (firma.name === 'Comandante' && firma.status) {
                this.getFirma(firma.idQuienFirma, 'Comandante_finalizar', firma.date);
            }
            if (firma.name === 'GestorACTI' && firma.status) {
                this.getFirma(firma.idQuienFirma, 'GestorACTI_finalizar', firma.date);
            }
        });
    }

    private getFirma(userId: string, tipo: string, fecha): void {
        this.firmaService.getFirma(userId)
            .subscribe(
                response => {
                    if (tipo === 'Investigador') {
                        this.firmaInvestigador = response.firma;
                        this.fechaFirmaInvestigador = fecha;
                    }
                    if (tipo === 'Investigador_finalizar') {
                        this.firmaInvestigador_finalizar = response.firma;
                        this.fechaFirmaInvestigador_finalizar = fecha;
                    }
                    if (tipo === 'Investigador Principal') {
                        this.firmaInvestigadorPrincipal = response.firma;
                        this.fechaFirmaInvestigadorPrincipal = fecha;
                    }
                    if (tipo === 'Investigador Principal_finalizar') {
                        this.firmaInvestigadorPrincipal_finalizar = response.firma;
                        this.fechaFirmaInvestigadorPrincipal_finalizar = fecha;
                    }
                    if (tipo === 'Comandante') {
                        this.firmaComandante = response.firma;
                        this.fechaFirmaComandante = fecha;
                    }
                    if (tipo === 'Comandante_finalizar') {
                        this.firmaComandante_finalizar = response.firma;
                        this.fechaFirmaComandante_finalizar = fecha;
                    }
                    if (tipo === 'GestorACTI') {
                        this.firmaGestorActi = response.firma;
                        this.fechaFirmaGestorActi = fecha;
                    }
                    if (tipo === 'GestorACTI_finalizar') {
                        this.firmaGestorActi_finalizar = response.firma;
                        this.fechaFirmaGestorActi_finalizar = fecha;
                    }
                },
                error => console.log('error>>> ', error)
            );
    }

    private getCronograma(): void {
        const listaDeMetodologia: MetodologiaObjetivo[] = [];
        this.objetivosEspecificos.map(obj => {
            const {descr: objetivo} = obj;
            listaDeMetodologia.push({
                objetivo,
                actividades: []
            });
        });

        this.cronogramaServic.getByProjectId(this.data.idProyecto)
            .pipe(finalize(() => this.calculateTotalAdvance()))
            .subscribe(response => {
                // @ts-ignore
                this.listaDeActividades = response.cronogramas.actividades;
                response.cronogramas.actividades.map(actividadActual => {
                    listaDeMetodologia.map(metodologia => {
                        if (metodologia.objetivo === actividadActual.objetivo) {
                            metodologia.actividades.push(actividadActual.nombreAct);
                        }
                    });
                    this.listaDeMetodologia = listaDeMetodologia;
                });
            });
    }

    Mostrar(idRubro) {

        let datos: DetalleRubroData = {
            id: idRubro,
            MosC: true,
            Rubro: this.dataSourceRubro,
        };

        const dialogref = this.dialog.open(DetalleRubroComponent, {
            data: datos
        });
        dialogref.afterClosed().subscribe(res => {
        });
    }

    downloadPDF(): void {
        const dialogRef = this.dialog.open(SucessDialogComponent, {
            ariaLabel: `Se va a descarga el reporte en un momento`,
            role: 'alertdialog',
            autoFocus: false,
            data: {
                icono: 'done',
                severidad: 'dialog-sucess',
                encabezado: `Descargando Reporte`,
                descripcion: `Se va a descarga el reporte en un momento`
            }
        });
        dialogRef.afterClosed().subscribe(result => {

        });
        //============================================================================
        const data = document.getElementById('PROYECTPDF');
        const documentosAnexos = document.getElementById('DocumentosAnexos');
        let contentDataURL2;

        if (documentosAnexos) {
            html2canvas(documentosAnexos).then( (canvas) => {
                contentDataURL2 = canvas.toDataURL('image/png', 10);
            });
        }

        html2canvas(data).then( (canvas) => {
            const margin = 2;
            const imgWidth = 200 - 2 * margin;
            const pageHeight = 285;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            const contentDataURL = canvas.toDataURL('image/png', 10);
            const options = {
                size: '70px',
                background: '#fff',
                pagesplit: true,
            };
            const pdf = new jsPDF('p', 'mm'); // A4 size page of PDF
            let position = 20;
            pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth, imgHeight - 10, options);
            pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth, imgHeight - 10, options);

            heightLeft -= pageHeight;
            while (heightLeft >= 0) {
                position = (heightLeft - imgHeight);
                pdf.addPage();
                pdf.addImage(contentDataURL, 'PNG', margin, position, imgWidth, imgHeight - 10, options);
                heightLeft -= pageHeight;
            }
            if (documentosAnexos) {
                const options2 = {
                    size: '70px',
                    background: '#fff',
                    pagesplit: true,
                };
                pdf.addPage();
                pdf.addImage(contentDataURL2, 'PNG', 2, 2, 200, 0, options2);
            }
            pdf.save('FormulacionDeProyecto.pdf'); // Generated PDF
        });
    }

    public closeModal(): void {
        this.dialogRef.close(false);
    }
}

export interface iniciarProyecto {
    avala: string;
    comandante: string;
    dependencia: string;
    duracion: number;
    email: string;
    gestor: string;
    linea: string;
    lugar: string;
    modelo: string;
    nombreProyecto: string;
    Programa: string;
    subprograma: string;
    telefonoGestor: number;
}

export interface VistaFinalizacionData {
    idProyecto: string;
    evaluar: boolean;
    valor?: any;
    Evaluado?: boolean;
}
