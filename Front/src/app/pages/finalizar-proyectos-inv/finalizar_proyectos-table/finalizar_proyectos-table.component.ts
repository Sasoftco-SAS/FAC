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
import { Form, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'; //Se importa Formbuilder y Validators para crear formularios y validar campos
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
import { PremiosInvestigadoresService } from "src/app/shared/services/premios-investigadores-service/premios-investigadores";
//import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { VistaFinalizacionComponent, VistaFinalizacionData } from "../vista-finalizacion/vista-finalizacion.component";
//ARRIBA SE IMPORTA LO NECESARIO PARA VER UN HTML QUE MUESTRA EL PDF DE FINALIZACION
import {MatDialog} from '@angular/material/dialog';
import { VistaBienesComponent, VistaBienesData } from "../vista-bienes/vista-bienes.component";
import { validarValorEstimado } from "./finalizar_proyectos-table.validators";
import { bienesService } from "src/app/shared/services/bienes-service/bienes.service";
import { NotificacionService } from "src/app/shared/services/notificacion-service/notificacion.service";

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
  public lista_usuarios: any = [];
  public centrosDeInv : any = [];
  public formEncuestaFinalizarPr: FormGroup;
  public id_pr_finalizar;
  public proyecto_final : any = [];
  public hayProyectos = false;
  public proyecto_usar : any = [];
  public rubros_proyecto = [];
  public info_rubroSelected = [];
  public rubros_observaciones: any[] = [{
    observacion: '',
    nombre: '',
  }];
  public selectedRubro;
  public suma_montoRubros;
  public valor_en_compromiso;
  public valor_financiado;
  public valor_disponible;
  public semaforo_continuar;
  public formEncuestaBienes!: FormGroup;
  public valor_estimado;

  constructor(
    private modal:NgbModal,
    private fb: FormBuilder,
    private proyectoService: ProjectService,
    private FinalizarPrService: FinalizarPrService,
    private dialog: MatDialog,
    private router: Router,
    private userService: UsersService,
    private PremiosInvService: PremiosInvestigadoresService,
    private bienesService: bienesService,
    private notificacionService: NotificacionService,
    ){
      // this.getProyectos();
      // this.getUsuarios();
      // this.builder();
    }

  ngOnInit(): void {
    this.getProyectos();
    this.getUsuarios();
    this.builder();
    this.formEncuestaBienes.controls.observaciones_rubros.valueChanges.subscribe(data =>{
      this.valor_estimado = 0;
      for (let iterator of data) {
        this.valor_estimado += (iterator.valor*iterator.cantidad);  //cambia dependiendo de lo que se ingrese en los rubros
      }
      this.setDatoForm(this.valor_disponible, this.valor_estimado, this.valor_en_compromiso, this.valor_financiado);
    });
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

  consola(arg){
    console.log(arg);
  }

  private getProyectos(){
    this.hayProyectos = false;
    //Obtenemos los proyectos cuyo inv.principal coincidan con el usuario logeado.
    this.proyectoService.getAll().subscribe((proyecto)=>{
        let listaProyectos2 = [];
        this.listaProyectos = [];

        for (let pr of proyecto.Proyectos) {
          if( (this.sesion_user.role.name == "Jefe De Centro") || (pr.firmas_finalizar[0].idQuienFirma == this.sesion_user._id) || (pr.firmas_finalizar[1].idQuienFirma == this.sesion_user._id) || (pr.firmas_finalizar[2].idQuienFirma == this.sesion_user._id) || (pr.firmas_finalizar[3].idQuienFirma == this.sesion_user._id)){


            if((this.sesion_user.profile.names == pr.EquipoInvestigaciones[0].nombres) && (this.sesion_user.profile.surname == pr.EquipoInvestigaciones[0].apellido)||(this.sesion_user.role.name != "Jefe De Centro")) { //RECIBE TODOS LOS PROYECTOS TERMINADOS
              this.listaProyectos.push(pr); //si es investigador pr. recibe cualquier pr.
            }


            //No ha sido iniciado el flujo de firmas y es inv principal
            if( (pr.firmas_finalizar[1].status != true) && (this.sesion_user.profile.names == pr.EquipoInvestigaciones[0].nombres) && (this.sesion_user.profile.surname == pr.EquipoInvestigaciones[0].apellido) ) {
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
        listaProyectos2 = this.listaProyectos.filter(proyecto => {
          if( (this.calculateAdvance(proyecto.date_inicio.toString(), proyecto.date_fin.toString())) > 59){
            //console.log("Avance cumple");
            this.hayProyectos = true; //Si no hay, mostrará un mensaje de que no hay en lugar de quedarse vacío
            return proyecto;
          }
        })
        this.dataSource.data = listaProyectos2;
        //console.log("Encontrados", this.listaProyectos2); //console.log("Encontrados", this.listaProyectos);
    })
  }

  getInfoRubro(value:string): void {
		this.selectedRubro = value;
    this.valor_en_compromiso = 0;
    this.suma_montoRubros = 0;
    for (let Rubro of this.proyecto_usar.AgregarDetallesRubros) {
      //console.log(Rubro);
      if(value == Rubro.NombreRubro){
        //console.log(Rubro);
        this.valor_financiado = Rubro.EntidadesCostos;
        this.info_rubroSelected = Rubro;
        for (let aux of Rubro.listaRubros) {
          this.suma_montoRubros += aux.rubro;
          this.valor_en_compromiso = this.suma_montoRubros;
        }
      }
    }
    this.valor_disponible = this.valor_financiado - this.valor_en_compromiso;
    //EntidadesCostos es el valor asignado total, suma_montoRubros es la suma de lo gastado
    //console.log(this.info_rubroSelected, this.suma_montoRubros, this.valor_disponible);
	}

  metodobasura(){
    
  }

  private getUsuarios(){
    this.userService.getAll().subscribe(usuarios=>{
      this.lista_usuarios = usuarios;
    });
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

  public iniciarFirmas(Proyecto) {

    //Investigador principal
    if((Proyecto.firmas_finalizar[1].status == false) && (this.sesion_user.profile.names == Proyecto.EquipoInvestigaciones[0].nombres) && (this.sesion_user.profile.surname == Proyecto.EquipoInvestigaciones[0].apellido)){
      Swal.fire({
        title: '<b>FINALIZADO CON ÉXITO</b>',
        icon: 'success',
        html:
          '<br>Usted como <b>Investigador principal</b> ha firmado, iniciando así el <b>proceso de firmas de finalización</b>',
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
      })

      Proyecto.firmas_finalizar[1].status = true;
      //console.log(Proyecto.firmas_finalizar[1].status);
      Proyecto.firmas_finalizar[1].date = new Date();

      this.proyectoService.update(Proyecto._id, Proyecto).subscribe(()=>{
        this.getProyectos();
      });

      this.FinalizarPrService.createFinalizarPr(Proyecto, 1)
        .subscribe(() => {});
    }else{
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
    }

    //Investigador creador del proyecto
    if((Proyecto.firmas_finalizar[0].status == false)&&(Proyecto.firmas_finalizar[0].idQuienFirma == this.sesion_user._id)){
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
      this.proyectoService.update(Proyecto._id, Proyecto).subscribe(()=>{
        this.getProyectos();
      });

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
    }else{
      if((Proyecto.firmas_finalizar[0].status == true)&&(Proyecto.firmas_finalizar[0].idQuienFirma == this.sesion_user._id)){
        Swal.fire({
          title: '<b>Oops...</b>',
          icon: 'error',
          html:
            '<br>Usted <b>ya firmó</b> este proceso de finalización',
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
        })
      }
    }

    //Gestor ACTI
    if((Proyecto.firmas_finalizar[3].status == false)&&(Proyecto.firmas_finalizar[3].idQuienFirma == this.sesion_user._id)){
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

      this.proyectoService.update(Proyecto._id, Proyecto).subscribe(()=>{
        this.getProyectos();
      });

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
    }else{
      if((Proyecto.firmas_finalizar[3].status == true)&&(Proyecto.firmas_finalizar[3].idQuienFirma == this.sesion_user._id)){
        Swal.fire({
          title: '<b>Oops...</b>',
          icon: 'error',
          html:
            '<br>Usted <b>ya firmó</b> este proceso de finalización',
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
        })
      }
    }

    //Comandante
    if((Proyecto.firmas_finalizar[2].status == false)&&(Proyecto.firmas_finalizar[2].idQuienFirma == this.sesion_user._id) && (Proyecto.firmas_finalizar[0].status == true) && (Proyecto.firmas_finalizar[1].status == true) && (Proyecto.firmas_finalizar[3].status == true)){
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
      this.proyectoService.update(Proyecto._id, Proyecto).subscribe(()=>{
        this.getProyectos();
      });

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
    }else{
      if((Proyecto.firmas_finalizar[2].status == true)&&(Proyecto.firmas_finalizar[2].idQuienFirma == this.sesion_user._id) && (Proyecto.firmas_finalizar[0].status == true) && (Proyecto.firmas_finalizar[1].status == true) && (Proyecto.firmas_finalizar[3].status == true)){
        Swal.fire({
          title: '<b>Oops...</b>',
          icon: 'error',
          html:
            '<br>Usted <b>ya firmó</b> este proceso de finalización',
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
        })
      }
    }
  }

  public viewPDF(id: string, accion: string): void {
    let valor = [];
    let Evaluado;
    // console.log("Id pr: ", id);
    // console.log(this.sesion_user._id);
    this.proyectoService.getById(id)
        .pipe(finalize(() => {
            if (accion=="bienes") {
              this.showModalPDFBienes(id, false, valor, Evaluado);
            }
            if (accion=="finalizar") {
              this.showModalPDF(id, false, valor, Evaluado);
            }
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

  private showModalPDFBienes(idProyecto, evaluar, valor, Evaluado): void {
    const data: VistaBienesData = {idProyecto, evaluar, valor, Evaluado};
    this.dialog.open(VistaBienesComponent, {data})
        .afterClosed().subscribe(response => {
        this.router.navigate(['/pages/finalizar_proyectos']);
    });
  }

  async openModalEncuesta(idProyecto: String){
    this.id_pr_finalizar = idProyecto;
    this.proyecto_usar = await this.obtenerProyecto();
  }

  async openModalEncuestaBienes(Proyecto){
    this.proyecto_usar = Proyecto;
    this.rubros_proyecto = [];
    for (let iterator of Proyecto.AgregarDetallesRubros) {
      this.rubros_proyecto.push(iterator.NombreRubro);
    }
  }

  obtenerProyecto(){
    return this.proyectoService.getById(this.id_pr_finalizar).toPromise();
  }

  async metodoActualizarProyectoFinalizar(){
    const datos = this.formEncuestaFinalizarPr.value;

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
        this.getProyectos();
        }, error =>{
          console.log("Error al agregar");
          console.log(error);
      })

      // console.log(proyectoFinalizar.Proyecto.EquipoInvestigaciones[0].nombres+" "+proyectoFinalizar.Proyecto.EquipoInvestigaciones[0].apellido);
      // console.log(this.lista_usuarios[10]);

      for (let userAux of this.lista_usuarios) {
        if( (userAux.profile.names==proyectoFinalizar.Proyecto.EquipoInvestigaciones[0].nombres)&&(userAux.profile.surname==proyectoFinalizar.Proyecto.EquipoInvestigaciones[0].apellido) ){
          let obj = {
            Investigador: userAux
          }
          this.PremiosInvService.postular(obj).subscribe(data=>{}); //Debe obtener el inv. principal completo como parametro
        }
      }
    }

  }

  get getObservaciones(){
    return this.formEncuestaBienes.get('observaciones_rubros') as FormArray;
  }

  addObservacion(){
    const control = <FormArray>this.formEncuestaBienes.controls['observaciones_rubros'];
    control.push(this.fb.group({nombre: [''], cantidad: [''], observacion: [''], unidad: [''], valor: ['']}));
  }


  removeObservacion(index: number){
    const control = <FormArray>this.formEncuestaBienes.controls['observaciones_rubros'];
    control.removeAt(index);
  }

  async metodoActualizarProyectoBienes(){
    const datos = this.formEncuestaBienes.value;
    let objeto;

    let fecha_hoy = new Date();
    let year = fecha_hoy.getFullYear();
    let day = fecha_hoy.getDate();
    let month = fecha_hoy.getMonth();

    let dateAux = `${day}-${month + 1}-${year}`;

    objeto = datos;

    // for (let iterator of objeto.observaciones_rubros) {
    //   objeto.total_rubroSuma += iterator.valor;
    // }

    objeto.nombre_proyecto = this.proyecto_usar.iniciarProyecto[0].nombreProyecto;
    objeto.fecha_solicitud = dateAux;

    //console.log(objeto);



    this.bienesService.create(objeto.adm_recursos, objeto.codigo, objeto.convenio, objeto.fecha_solicitud, objeto.fecharequerida_actainicio, objeto.info_adicional, objeto.info_prov_ciudad, objeto.info_prov_correo, objeto.info_prov_direccion, objeto.info_prov_nombre, objeto.info_prov_numero, objeto.lugar_entrega, objeto.nombre_proyecto, objeto.objeto_contrato, objeto.observaciones_rubros, objeto.tiempo_ejecucion, objeto.tipo_requerimiento, objeto.tipo_rubro, objeto.valor_compromiso, objeto.valor_disponible, objeto.valor_estimado, objeto.valor_financiado, objeto.version, objeto.vigencia, this.proyecto_usar).subscribe(data=>{
      Swal.fire({
        title: '<b>Creado exitosamente</b>',
        icon: 'success',
        html:
          '<br>Usted ha completado la generación del PDF de Bienes y Servicios',
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
      })

      //NOTIFICACION
      //Obteniendo el usuario para la notificacion
      this.userService.getAll().subscribe((usuarios) => {
        for (let usuario of usuarios) {
          if(usuario._id == this.proyecto_usar.firmas_finalizar[3].idQuienFirma){
            this.notificacionService.createNotificacion(usuario, "Nuevo documento de Bienes/Servicios", "Nuevo documento de Bienes/Servicios", "Nuevo documento de Bienes/Servicios", "Bienes y Servicios").subscribe(() => {});
          }
        }
      });

      this.getProyectos();

      }, error =>{
        console.log("Error al agregar");
        console.log(error);
    })


    // for (let iterator of datos.observaciones_rubros) {
    //   //console.log(iterator);
    //   if (!iterator.nombre || !iterator.unidad || !iterator.cantidad || !iterator.observacion || !iterator.valor) {
    //     //console.log("Rubro NULL");
    //     this.semaforo_continuar = false;
    //     semaforo_continuar2 = await this.funcion_semaforo();
    //     Swal.fire({
    //       title: '<b>Faltan datos por diligenciar</b>',
    //       html: '<b>Datos relacionados a sus Bienes o Servicios a Adquirir',
    //       icon: 'error',
    //       showConfirmButton: true,
    //       confirmButtonText: "Aceptar",
    //     })
    //   }
    // }

    // if(!datos.adm_recursos){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<br>Administrador de los recursos',
    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }
    // if(!datos.convenio){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<br>Convenio',
    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }
    // if(!datos.codigo){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<br>Código',
    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }
    // if(!datos.objeto_contrato){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<br>Objeto del contrato',
    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }
    // if(!datos.version){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<br>Versión',
    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }
    // if(!datos.vigencia){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<br>Vigencia',
    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }
    // if(!datos.tipo_requerimiento){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<br>Tipo de requerimiento',
    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }
    // if(!datos.fecharequerida_actainicio){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<b>Fecha requerida para el Acta de inicio',

    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }
    // if(!datos.lugar_entrega){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<b>Lugar de entrega',
    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }
    // if(!datos.tipo_rubro){
    //   this.semaforo_continuar = false;
    //   Swal.fire({
    //     title: '<b>Faltan datos por diligenciar</b>',
    //     html: '<b>Tipo de Rubro',
    //     icon: 'error',
    //     showConfirmButton: true,
    //     confirmButtonText: "Aceptar",
    //   })
    // }

    //CREAR EL ELEMENTO EN UNA TABLA DE BIENES Y SERVICIOS DONDE SE VINCULE AL PROYECTO.

    // proyectoBienes.Proyecto.observaciones_rubros = datos.observaciones_rubros;

    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].adm_recursos = datos.adm_recursos;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].convenio = datos.convenio;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].codigo = datos.codigo;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].version = datos.version;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].vigencia = datos.vigencia;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].lugar_entrega = datos.lugar_entrega;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].objeto_contrato = datos.objeto_contrato;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].fecharequerida_actainicio = datos.fecharequerida_actainicio;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].info_adicional = datos.info_adicional;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].info_prov_nombre = datos.info_prov_nombre;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].info_prov_ciudad = datos.info_prov_ciudad;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].info_prov_direccion = datos.info_prov_direccion;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].info_prov_numero = datos.info_prov_numero;
    // proyectoBienes.Proyecto.preguntasBienesyServicios[0].info_prov_correo = datos.info_prov_correo;

    //proyectoBienes.Proyecto.bienes_servicios = true; //HABILITAMOS TRUE PARA QUE DESAPAREZCA DE LA TABLA EL BOTON
  }

  setDatoForm(valor_d: number, valor_e: number, valor_c: number, valor_f: number): void {
    this.formEncuestaBienes.patchValue({valor_disponible: valor_d, valor_estimado: valor_e, valor_compromiso: valor_c, valor_financiado: valor_f});
  }

  validarMonto():  boolean  {
    return  this.formEncuestaBienes.hasError('noCumple')
  }

  private builder(): void {
    this.formEncuestaFinalizarPr = this.fb.group({
      respuesta_preg_uno: new FormControl(''),
      respuesta_preg_dos: new FormControl(''),
      respuesta_preg_tres: new FormControl(''),
      respuesta_preg_cuatro: new FormControl(''),
      respuesta_preg_cinco: new FormControl(''),
    });

    this.formEncuestaBienes = this.fb.group({
      adm_recursos: new FormControl(''),//new FormControl("", Validators.required),
      convenio: new FormControl(''),
      codigo: new FormControl(''),
      version: new FormControl(''),
      vigencia: new FormControl(''),
      tipo_requerimiento: new FormControl(''), //bienes o servicios
      lugar_entrega: new FormControl(''),
      objeto_contrato: new FormControl(''),
      fecharequerida_actainicio: new FormControl(''),
      tiempo_ejecucion: new FormControl(''),
      info_adicional: new FormControl(''),
      info_prov_nombre: new FormControl(''),
      info_prov_ciudad: new FormControl(''),
      info_prov_direccion: new FormControl(''),
      info_prov_numero: new FormControl(''),
      info_prov_correo: new FormControl(''),
      tipo_rubro: new FormControl(''),
      valor_estimado: new FormControl(''),
      valor_disponible: new FormControl(''),
      valor_compromiso: new FormControl(''),
      valor_financiado: new FormControl(''),
      observaciones_rubros: this.fb.array( [this.fb.group({nombre: [''], cantidad: [''], observacion: [''], unidad: [''], valor: ['']})] ), //Tendremos un arrray
    },
    {
      validators: validarValorEstimado
    });
  }
}