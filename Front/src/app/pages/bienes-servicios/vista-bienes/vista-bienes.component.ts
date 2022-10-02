import {Component, Inject, OnInit} from '@angular/core';
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
import {CommonSimpleModel} from '../../../shared/models/common-simple.model';
import { bienesService } from 'src/app/shared/services/bienes-service/bienes.service';

require('jspdf-autotable');

@Component({
    selector: 'app-vista2-bienes',
    templateUrl: './vista-bienes.component.html',
    styleUrls: ['./vista-bienes.component.scss']
})
export class VistaBienes2Component implements OnInit {

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: VistaBienesData,
        public dialog: MatDialog,
        private bienesService: bienesService,
        private auto: AuthStorageService,
        public dialogRef: MatDialogRef<VistaBienes2Component>) {
    }

    public codigo;
    public nombre_proyecto;
    public adm_recursos;
    public convenio;
    public version;
    public vigencia;
    public tipo_requerimiento;
    public lugar_entrega;
    public objeto_contrato;
    public fecharequerida_actainicio;
    public fecha_solicitud;
    public info_adicional;
    public info_prov_nombre;
    public info_prov_ciudad;
    public info_prov_direccion;
    public info_prov_numero;
    public info_prov_correo;
    public tipo_rubro;
    public valor_estimado;
    public valor_disponible;
    public valor_compromiso;
    public valor_financiado;
    public observaciones_rubros;
    public tiempo_ejecucion;

    ngOnInit(): void {
        this.getAll();
    }

    public consola(arg){
        console.log(arg)
    }

    public getAll(): void {

        this.bienesService.getById(this.data._id)
            .pipe(finalize(() => {
            }))
            .subscribe(bien => {
                //console.log(bien);
                this.tiempo_ejecucion = bien.tiempo_ejecucion;
                this.nombre_proyecto = bien.nombre_proyecto;
                this.adm_recursos = bien.adm_recursos;
                this.convenio = bien.convenio;
                this.codigo = bien.codigo;
                this.version = bien.version;
                this.vigencia = bien.vigencia;
                this.tipo_requerimiento = bien.tipo_requerimiento;
                console.log(this.tipo_requerimiento);
                this.lugar_entrega = bien.lugar_entrega;
                this.objeto_contrato = bien.objeto_contrato;
                this.fecharequerida_actainicio = bien.fecharequerida_actainicio;
                this.fecha_solicitud = bien.fecha_solicitud;
                this.info_adicional = bien.info_adicional;
                this.info_prov_nombre = bien.info_prov_nombre;
                this.info_prov_ciudad = bien.info_prov_ciudad;
                this.info_prov_direccion = bien.info_prov_direccion;
                this.info_prov_numero = bien.info_prov_numero;
                this.info_prov_correo = bien.info_prov_correo;
                this.tipo_rubro = bien.tipo_rubro;
                this.valor_estimado = bien.valor_estimado;
                this.valor_disponible = bien.valor_disponible;
                this.valor_compromiso = bien.valor_compromiso;
                this.valor_financiado = bien.valor_financiado;
                this.observaciones_rubros = bien.observaciones_rubros;
            });
    }

    private indice_global_metodo(){
        // if(this.dataSourceRubro[this.indice_global+1]){
        //     this.indice_global = this.indice_global+1;
        // }else{
        //     this.indice_global = 0;
        // }
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
            pdf.save('Doc.BienesyServicios.pdf'); // Generated PDF
        });
    }

    public closeModal(): void {
        this.dialogRef.close(false);
    }
}

export interface VistaBienesData {
    _id: string;
}
