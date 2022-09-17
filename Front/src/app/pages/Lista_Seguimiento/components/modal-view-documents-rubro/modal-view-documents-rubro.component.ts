import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../../shared/services/Proyect/project.service';
import {finalize} from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms'; //Se importa Formbuilder y Validators para crear formularios y validar campos
import Swal from 'sweetalert2';


@Component({
  selector: 'app-modal-view-documents-rubro',
  templateUrl: './modal-view-documents-rubro.component.html',
  styleUrls: ['./modal-view-documents-rubro.component.scss']
})
export class ModalViewDocumentsRubroComponent implements OnInit {

  public rubros = [];
  public proyectoId;
  public TITLE = 'Listado de documentos por rubro';
  public NAME = 'Rubro: ';
  public AMOUNT = 'Monto';
  public VIEW_PDF = 'Ver PDF';
  public CLOSE_MODAL = 'Cerrar';
  public REMOVE = 'Eliminar presupuesto';
  public presupuesto = 0;
  public formatError = false;
  public fileToUpload;
  public fileAux="vacio";
  public montoaEditar = 0;
  public formNecesidad: FormGroup;
  public id_rubro;
  public consecutivo;

  constructor(
      public dialogRef: MatDialogRef<ModalViewDocumentsRubroComponent>,
      private projectService: ProjectService,
      private fb: FormBuilder,
      private modal:NgbModal,
      @Inject(MAT_DIALOG_DATA) public data: DocumentsViewInterface) {
  }

  ngOnInit(): void {
    this.builder();
    this.rubros = this.data.rubros;
    this.proyectoId = this.data.projectId;
    //this.data.maxmonto = this.data.maxmonto+this.montoaEditar;
    this.formNecesidad.controls.presupuesto.valueChanges.subscribe(data =>{
      if(data>(this.data.maxmonto+this.montoaEditar)){
        this.formNecesidad.controls.presupuesto.setValue(this.data.maxmonto+this.montoaEditar);
      }
    })
  }

  openModalEdit(rubroid: string, rubro: number, consecutivo: string){
    this.montoaEditar = rubro;
    this.id_rubro = rubroid;
    this.consecutivo = consecutivo;
  }

  metodoEditarRubro(){ //Es mejor usar filetoupload porque ya lo hacen de esa manera...
    const datosGasto = this.formNecesidad.value;

    if(this.fileAux=="vacio"){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡Algo ha salido mal!',
        footer: '<a>La factura es requerida y adicional debe ir en formato PDF</a>'
      })
    }else{
      if(!datosGasto.presupuesto){
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: '¡Algo ha salido mal!',
          footer: '<a>Se debe ingresar el Monto</a>'
        })
      }else{
        this.projectService.patchRubro(this.proyectoId, this.id_rubro, datosGasto.presupuesto, this.fileToUpload, this.consecutivo)
        .subscribe(r => {
          Swal.fire({
            icon: 'success',
            title: 'Cambio exitoso',
          })
        });
      }
    }


    if(datosGasto.presupuesto > (this.data.maxmonto+this.montoaEditar)){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '¡Algo ha salido mal!',
        footer: '<a>El monto no puede exceder $'+(this.data.maxmonto+this.montoaEditar)+'</a>'
      })
    }

  }


  public onFileChange(files: FileList): void { //CARGAR FACTURA
    const fileToUpload = files.item(0);
    if (fileToUpload.type.includes('pdf')) { //VALIDAR SI ES PDF
      this.fileAux = "pdf";
      this.fileToUpload = fileToUpload; //SE CARGA LA FACTURA A FILETOUPLOAD
      //this.formNecesidad.controls.presupuesto.setValue(fileToUpload);
      this.formatError = false;
    } else {
      this.formatError = true;
    }
  }

  public downloadPDF(rubro): void {
    const {data, name} = rubro;
    const downloadLink = document.createElement('a');
    downloadLink.href = `data:application/pdf;base64,${data}`;
    downloadLink.download = name;
    downloadLink.click();
  }

  public removeRubro(id): void {
    this.projectService.removeRubroPDF(this.data.projectId, this.data.rubroDetalleId, id)
        .subscribe( () => {
          this.rubros = this.rubros.filter(rubro => rubro._id !== id);
        });
  }

  public closeModal(): void {
    this.dialogRef.close();
  }

  private builder(): void {
    this.formNecesidad = this.fb.group({
      presupuesto: new FormControl(null, [Validators.required]),
      factura: new FormControl(null, [Validators.required])
    });
  }

}

export interface DocumentsViewInterface {
  name: string;
  projectId: string;
  rubroDetalleId: string;
  maxmonto: number;
  rubros: {
    _id: string;
    factura: {
      created_at: string
      data: any;
      name: string;
      path: string;
    };
    rubro: number;
    consecutivo: string; //consecutivo
  }[];
}
