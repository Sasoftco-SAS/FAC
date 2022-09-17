import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { finalize } from "rxjs/operators";
import { Form, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'; //Se importa Formbuilder y Validators para crear formularios y validar campos
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from "@angular/forms";
import { Options } from "selenium-webdriver";
import { LocalStorageService } from "src/app/@core/services";
import { ProjectService } from "src/app/shared/services/Proyect/project.service";
import Swal from "sweetalert2";
import {AuthStorageService} from '../../../@core/services';
import { FirmaService } from "src/app/shared/services/firma/firma.service";
import { FinalizarPrService } from "src/app/shared/services/finalizar-proyecto/finalizar-proyecto.service";
import { UsersService } from "../../admin/users/services/users.service";
import { InvCenterService } from "src/app/shared/services/inv-center2/inv-center.service";
import { forkJoin } from "rxjs";
import {map} from 'rxjs/operators';


import { VistaFinalizacionComponent, VistaFinalizacionData } from "../vista-finalizacion/vista-finalizacion.component";
import {MatDialog} from '@angular/material/dialog';


@Component({
  selector: 'app-finalizar_proyectos-table',
  templateUrl: './finalizar_proyectos-table.component.html',
  styleUrls: ['./finalizar_proyectos-table.component.scss']
})
export class FinalizarPrTableComponent implements OnInit, AfterViewInit {
  public sesion_rol = localStorage.getItem('Role'); //Traemos el rol logeado
  user = localStorage.getItem('user');
  dataSource = new MatTableDataSource();
  @ViewChild("clasificar") clasificar = new MatSort();
  public displayedColumns2: string[] = [
    "proyecto",
    "avance",
    "acciones",
  ];

  public sesion_user = JSON.parse(localStorage.getItem('user')); //Userio logeado
  public listaProyectos : any = [];
  public listaProyectos2 : any = [];
  public listadoDeFirma : any = [];
  public usuario_logeado;
  public usuario_JefeDeCentro;
  public centrosDeInv : any = [];
  public formEncuestaFinalizarPr: FormGroup;
  public id_pr_finalizar;
  public proyecto_final : any = [];

  constructor(
    private modal:NgbModal,
    private fb: FormBuilder,
    private proyectoService: ProjectService,
    private authStorageService: AuthStorageService,
    private FinalizarPrService: FinalizarPrService,
    private auth: AuthStorageService,
    private firmaService: FirmaService,
    private UsersService: UsersService,
    private dialog: MatDialog,
    private router: Router,
    private userService: UsersService,
    private centroInvService: InvCenterService,
    ){
      this.getProyectos();
      this.dataSource.data = this.listaProyectos2;
      this.builder();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.clasificar;
  }

  esJefeDeCentro(){
    if((this.usuario_JefeDeCentro._id == this.sesion_user._id)){
      return true;
    }else{
      return false;
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private getProyectos(): void{
    //Obtenemos los proyectos cuyo inv.principal coincidan con el usuario logeado.
    this.proyectoService.getAll().subscribe((proyecto)=>{
        let listaProyectos2 = proyecto;

        for (let pr of listaProyectos2.Proyectos) {
          if( (this.sesion_user.role.name == "Jefe De Centro") || (pr.firmas_finalizar[0].idQuienFirma == this.sesion_user._id) || (pr.firmas_finalizar[1].idQuienFirma == this.sesion_user._id) || (pr.firmas_finalizar[2].idQuienFirma == this.sesion_user._id) || (pr.firmas_finalizar[3].idQuienFirma == this.sesion_user._id)){

            //No ha sido iniciado el flujo de firmas y es inv principal
            if( /*(pr.firmas_finalizar[1].status != true) && */(this.sesion_user.profile.names == pr.EquipoInvestigaciones[0].nombres) && (this.sesion_user.profile.surname == pr.EquipoInvestigaciones[0].apellido) ) {
                //console.log("Encontrado inv principal y no ha sido firmado");
                this.listaProyectos.push(pr);
            }else{
              //console.log("NO: ", pr.iniciarProyecto[0].nombreProyecto);
            }
            //Valida que ya se haya firmado por el inv principal -- RESTO DE FIRMAS
            if( (pr.firmas_finalizar[0].idQuienFirma == this.sesion_user._id) || (pr.firmas_finalizar[3].idQuienFirma == this.sesion_user._id)) {
              //Resto de firmas solo reciben cuando inicie flujo de firmas por inv principal
              if((pr.firmas_finalizar[1].status == true )&&(pr.firmas_finalizar[0].idQuienFirma == this.sesion_user._id)){//Investigador
                if(pr.firmas_finalizar[0].status != true){
                  this.listaProyectos.push(pr);
                }
              }
              if((pr.firmas_finalizar[1].status == true )&&(pr.firmas_finalizar[3].idQuienFirma == this.sesion_user._id)){//Gestor ACTI
                if(pr.firmas_finalizar[3].status != true){
                  this.listaProyectos.push(pr);
                }
              }
            }else{
              //console.log("Entrando a zona firmada");
              if((pr.firmas_finalizar[2].idQuienFirma == this.sesion_user._id)&&(pr.firmas_finalizar[2].status == false )&&(pr.firmas_finalizar[0].status == true )&&(pr.firmas_finalizar[1].status == true )&&(pr.firmas_finalizar[3].status == true )){ //Comandante
                this.listaProyectos.push(pr); //COMANDANTE CUANDO HAYAN 3 FIRMAS Y LA DE EL NO
              }else{
                if((this.sesion_user.role.name == "Jefe De Centro")&&(pr.firmas_finalizar[0].status == true )&&(pr.firmas_finalizar[1].status == true )&&(pr.firmas_finalizar[2].status == true )&&(pr.firmas_finalizar[3].status == true )){
                  this.listaProyectos.push(pr);
                }
                for (let centro of this.centrosDeInv) {
                    if(centro.name == pr.iniciarProyecto[0].centroDeInvestigacion){
                        this.userService.getById(centro.jefe._id).subscribe((user)=>{
                            this.usuario_JefeDeCentro = user;
                            //Jefe de Centro
                            if((this.usuario_JefeDeCentro._id == this.sesion_user._id)){
                            }
                        });
                    }
                }
              }
            }
          }
        }

        //FILTRO DE PROYECTOS CUYO AVANCE SEA 60+
        for (let proyecto_iterador of this.listaProyectos) {
            //console.log("LISTA: ",this.listaProyectos);
            //console.log("Avance proyecto: ",(this.calculateAdvance(proyecto_iterador.date_inicio.toString(), proyecto_iterador.date_fin.toString())) );
            //console.log("Pr: ", proyecto_iterador.iniciarProyecto[0].nombreProyecto);
            if( (this.calculateAdvance(proyecto_iterador.date_inicio.toString(), proyecto_iterador.date_fin.toString())) > 59){
              //console.log("Avance cumple");
              this.listaProyectos2.push(proyecto_iterador);
            }else{
              //console.log("Avance NO cumple");
            }
        }
        this.dataSource.data = this.listaProyectos2;
        //console.log("Encontrados", this.listaProyectos2); //console.log("Encontrados", this.listaProyectos);
    })
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
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      );
      const actualDay = Math.ceil(
        (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      );
      return Math.ceil((actualDay * 100) / totalDays);
    }
  }

  public iniciarFirmas(Proyecto): void {

    //Investigador principal
    if((this.sesion_user.profile.names == Proyecto.EquipoInvestigaciones[0].nombres) && (this.sesion_user.profile.surname == Proyecto.EquipoInvestigaciones[0].apellido)){
      Swal.fire({
        title: '<b>FINALIZADO CON ÉXITO</b>',
        icon: 'success',
        html:
          '<br>Usted como <b>Investigador principal</b> ha firmado, iniciando así el <b>proceso de firmas</b>',
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
      })

      Proyecto.firmas_finalizar[1].status = true;
      //console.log(Proyecto.firmas_finalizar[1].status);
      Proyecto.firmas_finalizar[1].date = new Date();
      this.proyectoService.update(Proyecto._id, Proyecto)  //Cambiamos la firma final a true del inv. principal, desaparecera de la tabla actual
        .subscribe(() => {});

      this.FinalizarPrService.createFinalizarPr(Proyecto, 1)
        .subscribe(() => {});
    }

    if((Proyecto.firmas_finalizar[1].status == true) && (this.sesion_user.profile.names == Proyecto.EquipoInvestigaciones[0].nombres) && (this.sesion_user.profile.surname == Proyecto.EquipoInvestigaciones[0].apellido)){
      Swal.fire({
        title: '<b>Oops...</b>',
        icon: 'error',
        html:
          '<br>Usted <b>ya firmó</b> este proceso de finalización',
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
      })
    }

    //Investigador creador del proyecto
    if((Proyecto.firmas_finalizar[0].idQuienFirma == this.sesion_user._id)){
      Swal.fire({
        title: '<b>FIRMADO CON ÉXITO</b>',
        icon: 'success',
        html:
          '<br>Usted ha completado su firma como <b>investigador</b> para la finalización del proyecto',
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
      })
      Proyecto.firmas_finalizar[0].status = true;
      Proyecto.firmas_finalizar[0].date = new Date();
      this.proyectoService.update(Proyecto._id, Proyecto)  //Cambiamos la firma final a true del investigador creador, desaparecera de la tabla actual
          .subscribe(() => {});

      this.FinalizarPrService.getAll().subscribe((elementos)=>{
        let cosas = [...[elementos]];
        let idFinalizarPr;
        let finalizarPrAux;

        for (let iterador of cosas) {
          //console.log(iterador[0].proyecto._id,"==",Proyecto._id);
          if((iterador[0].proyecto._id)==Proyecto._id){
            idFinalizarPr = iterador[0]._id;
          }
        }

        this.FinalizarPrService.getById(idFinalizarPr)
        .subscribe((finalizarPr) => {
          finalizarPrAux = finalizarPr;
          //console.log("XD", (finalizarPrAux.estado+1));
          this.FinalizarPrService.updateFinalizarPr(idFinalizarPr, Proyecto, (finalizarPrAux.estado+1) )
         .subscribe(() => {});
        });
      });
    }

    //Gestor ACTI
    if((Proyecto.firmas_finalizar[3].idQuienFirma == this.sesion_user._id)){
      Swal.fire({
        title: '<b>FIRMADO CON ÉXITO</b>',
        icon: 'success',
        html:
          '<br>Usted ha completado su firma como <b>Gestor ACTI</b> para la finalización del proyecto',
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
      })
      Proyecto.firmas_finalizar[3].status = true;
      Proyecto.firmas_finalizar[3].date = new Date();
      this.proyectoService.update(Proyecto._id, Proyecto)  //Cambiamos la firma final a true del investigador creador, desaparecera de la tabla actual
          .subscribe(() => {});

      this.FinalizarPrService.getAll().subscribe((elementos)=>{
        let cosas = [...[elementos]];
        let idFinalizarPr;
        let finalizarPrAux;

        for (let iterador of cosas) {
          //console.log(iterador[0].proyecto._id,"==",Proyecto._id);
          if((iterador[0].proyecto._id)==Proyecto._id){
            idFinalizarPr = iterador[0]._id;
          }
        }

        this.FinalizarPrService.getById(idFinalizarPr)
        .subscribe((finalizarPr) => {
          finalizarPrAux = finalizarPr;
          //console.log("XD", (finalizarPrAux.estado+1));
          this.FinalizarPrService.updateFinalizarPr(idFinalizarPr, Proyecto, (finalizarPrAux.estado+1) )
         .subscribe(() => {});
        });
      });
    }

    //Comandante
    if((Proyecto.firmas_finalizar[2].idQuienFirma == this.sesion_user._id) && (Proyecto.firmas_finalizar[0].status == true) && (Proyecto.firmas_finalizar[1].status == true) && (Proyecto.firmas_finalizar[3].status == true)){
      Swal.fire({
        title: '<b>FIRMADO CON ÉXITO</b>',
        icon: 'success',
        html:
          '<br>Usted ha completado su firma como <b>Comandante</b> y completado satisfactoriamente la finalización del proyecto',
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
      })
      Proyecto.firmas_finalizar[2].status = true;
      //Proyecto.finalizado = true;
      Proyecto.firmas_finalizar[2].date = new Date();
      this.proyectoService.update(Proyecto._id, Proyecto)  //Cambiamos la firma final a true del investigador creador, desaparecera de la tabla actual
          .subscribe(() => {});

      this.FinalizarPrService.getAll().subscribe((elementos)=>{
        let cosas = [...[elementos]];
        let idFinalizarPr;
        let finalizarPrAux;

        for (let iterador of cosas) {
          //console.log(iterador[0].proyecto._id,"==",Proyecto._id);
          if((iterador[0].proyecto._id)==Proyecto._id){
            idFinalizarPr = iterador[0]._id;
          }
        }

        this.FinalizarPrService.getById(idFinalizarPr)
        .subscribe((finalizarPr) => {
          finalizarPrAux = finalizarPr;

          this.FinalizarPrService.updateFinalizarPr(idFinalizarPr, Proyecto, (finalizarPrAux.estado+1) )
          .subscribe(() => {});
        });
      });
    }
  }

  public viewPDF(id: string): void {
    let valor = [];
    let Evaluado;
    // console.log("Id pr: ", id);
    // console.log(this.sesion_user._id);
    this.proyectoService.getById(id)
        .pipe(finalize(() => {
            this.showModalPDF(id, false, valor, Evaluado);
        }))
        .subscribe(response => {
            response.Proyecto.calificaciones.forEach(element => {
                if (element.idEv._id === this.sesion_user._id) {
                    valor = element.Valores;
                    Evaluado = element.Evaluado;
                }
            });
        });
  }

  private showModalPDF(idProyecto, evaluar, valor, Evaluado): void {
    const data: VistaFinalizacionData = {idProyecto, evaluar, valor, Evaluado};
    this.dialog.open(VistaFinalizacionComponent, {data})
        .afterClosed().subscribe(response => {
        this.router.navigate(['/pages/finalizar_proyectos']);
    });
  }

  openModalEncuesta(id: String){
    this.id_pr_finalizar = id;
  }

  metodobasura(){
  }

  obtenerProyecto(){
    return this.proyectoService.getById(this.id_pr_finalizar).toPromise();
  }

  async metodoActualizarProyectoFinalizar(){
    const datos = this.formEncuestaFinalizarPr.value;
    let proyecto_finalizar : any = [];

    const proyectoFinalizar = await this.obtenerProyecto();

    proyectoFinalizar.Proyecto.preguntasFinalizacion[0].respuesta_preg_uno = datos.respuesta_preg_uno;
    proyectoFinalizar.Proyecto.preguntasFinalizacion[0].respuesta_preg_dos = datos.respuesta_preg_dos;
    proyectoFinalizar.Proyecto.preguntasFinalizacion[0].respuesta_preg_tres = datos.respuesta_preg_tres;
    proyectoFinalizar.Proyecto.preguntasFinalizacion[0].respuesta_preg_cuatro = datos.respuesta_preg_cuatro;
    proyectoFinalizar.Proyecto.preguntasFinalizacion[0].respuesta_preg_cinco = datos.respuesta_preg_cinco;
    proyectoFinalizar.Proyecto.preguntasFinalizacion[0].firma_jefeCentro = true;
    proyectoFinalizar.Proyecto.finalizado = true;

    if (this.id_pr_finalizar !== null && proyectoFinalizar.Proyecto) {
      this.proyectoService.update(this.id_pr_finalizar, proyectoFinalizar.Proyecto).subscribe(data=>{
        Swal.fire({
          title: '<b>Finalizado exitosamente</b>',
          icon: 'success',
          html:
            '<br>Usted ha completado el proceso de finalización como <b>Jefe de Centro</b>',
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
        })
        }, error =>{
          console.log("Error al agregar");
          console.log(error);
        })
    }

  }

  //Construir formulario, se deben parecer los campos
  private builder(): void {
    this.formEncuestaFinalizarPr = this.fb.group({
      respuesta_preg_uno: new FormControl(''),
      respuesta_preg_dos: new FormControl(''),
      respuesta_preg_tres: new FormControl(''),
      respuesta_preg_cuatro: new FormControl(''),
      respuesta_preg_cinco: new FormControl(''),
    });
  }
}