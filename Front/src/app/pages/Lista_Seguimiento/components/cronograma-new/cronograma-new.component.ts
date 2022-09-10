import { Component, OnInit, AfterViewInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { cronogramaService } from "src/app/shared/services/cronograma/cronograma.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import { SucessDialogComponent } from "../../../admin/Dialog/sucess-dialog/sucess-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { finalize } from "rxjs/operators";
import { ShowCalendarComponent } from "../show-calendar/show-calendar.component";
import { ProjectService } from "../../../../shared/services/Proyect/project.service";
import { Actividad } from "../../../../shared/services/saveStateService/StateInterface";
import { Form, FormControl, Validators } from "@angular/forms"; //Se importa Formbuilder y Validators para crear formularios y validar campos
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { PropiedadintService } from "src/app/shared/services/propiedadint-service/propiedadint.service";
import { NotificacionService } from "src/app/shared/services/notificacion-service/notificacion.service";
import { UsersService } from "src/app/pages/admin/users/services/users.service";
import { UpdateNececidadesTableServiceService } from "src/app/shared/services/general/update-nececidades-table-service.service";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import Swal from "sweetalert2";

@Component({
  selector: "app-cronograma-new",
  templateUrl: "./cronograma-new.component.html",
  styleUrls: ["./cronograma-new.component.scss"],
})
export class CronogramaNewComponent implements OnInit, AfterViewInit {
  public listaCronogramas : any = [];
  public cronogramaCompleto;
  public cronograma: Actividad[];
  public cronogramaId: string;
  public seguimiento: FormGroup;
  public ACTIVITY = "Actividad";
  public SUB_ACTIVITY = "Sub Actividad";
  public START_DATE = "Fecha de inicio";
  public PLANNING_DATE = "Fecha planeada cumplimiento";
  public REAL_DATE = "Fecha real cumplimiento";
  public GAP = "Desfase";
  public ADVANCE = "Avance estimado";
  public ACTIONS = "Acciones";
  public NO_REAL_DATE = "No se ha asignado fecha de cumplimiento";
  public TITLE_TABLE = "Proyecto: ";
  public ADD_CRON = "Agregar fecha de cumplimiento";
  public UPDATE_CRON = "Actualizar fecha de cumplimiento";
  public DELETE_CRON = "Eliminar fecha de cumplimiento";
  public PROJECT_NAME = ". . .";

  public semaforo_cronograma = 0;
  public sesion_rol = localStorage.getItem("Role"); //Traemos el rol logeado
  public proyecto_propiedadint = [];
  public SubActmodal = "";
  public tipo = "Propiedad intelectual";
  public formPropiedad!: FormGroup;
  public idProyectoCronograma = "";
  public idCronograma = "";
  public subact = "";
  public cronogramaParaActualizar;
  public nombreActividad = "";
  public nombresProyectos = {}; //obj vacio
  public id_Investigador = "";
  public investigador = {};
  public user_identificacion = "";
  public nombre_proyecto_notif  = "";

  constructor(
    private cronogramaService: cronogramaService,
    private propiedadintService: PropiedadintService,
    private notificacionService: NotificacionService,
    private userService: UsersService,
    private rutaActiva: ActivatedRoute,
    private updateNececidadesTableServiceService: UpdateNececidadesTableServiceService,
    private projectService: ProjectService,
    private form: FormBuilder,
    private modal: NgbModal,
    private router: Router,
    public dialog: MatDialog
  ) {}

  //Construir formulario, se deben parecer los campos
  private builder(): void {
    this.formPropiedad = this.form.group({
      descrProteccion: new FormControl("", Validators.required),
    });
  }

  ngAfterViewInit() {}

  ngOnInit(): void {
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.getAll();
    this.builder();
  }

  consoleLog(index){
    console.log("***ConsoleLog***: ", index);
  }

  getActividadesLength(cronograma){
    return (cronograma.actividades.length);
  }

  metodocrearPropiedad() {
    const descripcionProteccion = this.formPropiedad.value;
    //console.log("Descripcion", descripcionProteccion[0]);
    //console.log("Project Id", this.idProyectoCronograma);
    //console.log("Actividad: ", this.nombreActividad);
    //console.log("Cronograma Id", this.idCronograma);
    //console.log("Subactividad: ", this.subact)

    if (this.idCronograma !== null && descripcionProteccion[0] != "undefined") {
      this.cronogramaService
        .getById(this.idCronograma)
        .subscribe((response) => {
          this.cronogramaParaActualizar = response.cronograma;
          //console.log("Imprimiendo CRONOGRAMA Subscribe", this.cronogramaParaActualizar.cronograma) //Cronograma
          this.actualizarEstadoSubactividad();
          Swal.fire('Protegido con éxito')
        });

      //Creando el registro de propiedad intelectual
      this.propiedadintService.createPropiedad(
          this.idProyectoCronograma,
          this.idCronograma,
          this.subact,
          descripcionProteccion,
          this.nombreActividad
        )
        .subscribe(
          (data) => {},
          (error) => {
            throw error;
          }
        );

      //Obteniendo el usuario para la notificacion
      this.userService.getAll().subscribe((usuarios) => {
        for (let usuario of usuarios) {
          if(usuario.identification == this.user_identificacion){
            this.notificacionService.createNotificacion(usuario,this.proyecto_propiedadint[0].descripcion,this.proyecto_propiedadint[0].tipoProducto,this.nombre_proyecto_notif,this.tipo,).subscribe(() => {});
          }
        }
      });

      //Creando el registro de notificación
    }
  }

  actualizarEstadoSubactividad() {
    var i;
    var j;
    //console.log("Imprimiendo CRONOGRAMA", this.cronogramaParaActualizar) //Cronograma
    //console.log(typeof(this.cronogramaParaActualizar));
    for (i of this.cronogramaParaActualizar.actividades) {
      if (i.nombreAct == this.nombreActividad) {
        //console.log(i.nombreAct," = ",this.nombreActividad)
        for (j of i.subActividad) {
          if (j.nombreSub == this.SubActmodal) {
            //console.log(j.nombreSub," = ",this.SubActmodal)
            //console.log(j)
            j.protegido = true;
          }
        }
      }
    }
    this.cronogramaService
      .update(this.idCronograma, { cronogramas: this.cronogramaParaActualizar })
      .subscribe(() => {});
    //console.log("TYPEOF: ",typeof(this.cronogramaParaActualizar))
    //console.log("UPDATE: ",this.cronogramaParaActualizar)
  }

  openModalEdit(
    idProyectoCronograma,
    nombresubAct,
    idCronograma,
    subact,
    actividad
  ) {
    this.nombreActividad = actividad;
    this.subact = subact;
    this.SubActmodal = nombresubAct;
    this.idProyectoCronograma = idProyectoCronograma;
    this.idCronograma = idCronograma;
    //console.log("idProyectoCronograma: ",idProyectoCronograma);

    this.projectService.getById(idProyectoCronograma).subscribe((proyecto) => {
      let prEsperados = proyecto.Proyecto.productosEsperados;
      this.nombre_proyecto_notif =  proyecto.Proyecto.iniciarProyecto[0].nombreProyecto;
      this.user_identificacion = proyecto.Proyecto.EquipoInvestigaciones[0].identificacion;
      //console.log(this.user_identificacion);
      prEsperados.forEach((element) => {
        //console.log(element)
        if (element.subActividad === nombresubAct) {
          //console.log("cumple");
          this.proyecto_propiedadint = [];
          this.proyecto_propiedadint.push(element);
        }
      });
    });
    //console.log(idProyectoCronograma);
    //console.log("Subact tabla: ",nombresubAct);
    //console.log("DatoFinal",this.proyecto_propiedadint);
  }

  getProjectName(id: string){
    //console.log("id: ", id);
    return this.nombresProyectos[id];
  }

  private getAll(): void {
    //Obtener los cronogramas del proyecto actualmente cliqueado
    const projectId = this.rutaActiva.snapshot.params.id;
    if (projectId) {
      this.cronogramaService
        .getByProject(projectId)
        .pipe(finalize(() => this.getProject(projectId)))
        .subscribe((response) => {
          this.cronograma = response.cronogramas.actividades;
          this.cronogramaId = response.cronogramas._id;
          this.cronogramaCompleto = response;

          this.semaforo_cronograma = 1;
        });
    } else { // Acá obtiene cronogramas entre 0 y 75 de avance, así como no protegidos.
      this.cronogramaService
        .getAll() //Se obtienen todos los cronogramas existentes
        .subscribe((response) => {
          this.listaCronogramas = response.cronogramas;
          this.semaforo_cronograma = 2;
          this.PROJECT_NAME = "a";

          const filterObject = (obj, filter, filterValue) => Object.keys(obj).reduce((acc, val) => (obj[val][filter] === filterValue ? acc : {
            ...acc,
            [val]: obj[val]
          }), {});

          for (let q of this.listaCronogramas) {
            for (let i of q.actividades) {
              const aux = filterObject(i.subActividad, "protegido", true);
              // console.log("TypeAux1: ",typeof(aux))
              // console.log("aux", aux);
              // console.log("////////");
              i.subActividad = Object.values(aux); //Esto debido a la forma en que termina el objeto en 'aux'
            }
          }
          //console.log("/// FINAL DE FILTRO PROTEGIDO ///");
          for (let i of this.listaCronogramas) {
            for (let k of i.actividades) {
              let xd = -1;
              for (let j of k.subActividad) {
                xd++;
                // console.log("fecha inicio: ", j.fechaInicio.toString());
                // console.log("fecha final: ", j.fechaFinal.toString());
                // console.log("Avance: ", (this.calculateAdvance(j.fechaInicio.toString(), j.fechaFinal.toString())));
                if ( (this.calculateAdvance(j.fechaInicio.toString(), j.fechaFinal.toString())) > 70 ) {
                  k.subActividad.splice(xd,1);
                  while (k.subActividad[xd]) {
                    if ( (this.calculateAdvance(k.subActividad[xd].fechaInicio.toString(), k.subActividad[xd].fechaFinal.toString())) > 70 ) {
                      k.subActividad.splice(xd,1);
                    }else{
                      xd++;
                    }
                  }
                }
              }
            }
          }

          const observerCronogramas = this.listaCronogramas.map(cronograma => this.projectService.getById(cronograma.proyectId))
          forkJoin(observerCronogramas).subscribe(response=>{
            response.forEach((item : any) => {
              this.nombresProyectos[item.Proyecto._id] = item.Proyecto.iniciarProyecto[0].nombreProyecto;
            })
            //console.log("Nombres: ",this.nombresProyectos);
          })

          //console.log("Cronogramas:",JSON.parse( JSON.stringify(this.listaCronogramas) ))

        });
    }
  }

  private getProject(projectId): void {
    //console.log("Project Name2: ",this.PROJECT_NAME); //arroja 'a'
    if (this.PROJECT_NAME != ". . .") {
    } else {
      this.projectService.getById(projectId).subscribe((project) => {
        this.PROJECT_NAME = project.Proyecto.iniciarProyecto[0].nombreProyecto;
      });
    }
  }

  public deleteRealFinalDate(activityId: string, subActivityId: string): void {
    const activity = this.cronograma.find((crono) => crono._id === activityId);
    const subActivity = activity.subActividad.find(
      (subActivityActual) => subActivityActual._id === subActivityId
    );
    subActivity.fechaReal = null;
    this.cronogramaService
      .update(this.cronogramaId, this.cronogramaCompleto)
      .pipe(finalize(this.getAll))
      .subscribe((response) => {
        this.dialog
          .open(SucessDialogComponent, {
            role: "alertdialog",
            autoFocus: false,
            data: {
              icono: "done",
              severidad: "dialog-warning",
              encabezado: `Seguimiento Actualizado`,
              descripcion: `Fecha real de cumplimiento eliminada`,
            },
          })
          .afterClosed()
          .subscribe(() => {
            this.getAll();
          });
      });
  }

  public setRealFinalDate(name: string, activityId: string, id: string): void {
    this.dialog
      .open(ShowCalendarComponent, { data: { name } })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.updateRealDate(id, activityId, result);
        }
      });
  }

  private updateRealDate(
    subActivityId: string,
    activityId: string,
    newDate: string
  ): void {
    const activity = this.cronograma.find((crono) => crono._id === activityId);
    const subActivity = activity.subActividad.find(
      (subActivityActual) => subActivityActual._id === subActivityId
    );
    subActivity.fechaReal = new Date(newDate);
    this.cronogramaService
      .update(this.cronogramaId, this.cronogramaCompleto)
      .subscribe((response) => {
        this.dialog
          .open(SucessDialogComponent, {
            role: "alertdialog",
            autoFocus: false,
            data: {
              icono: "done",
              severidad: "dialog-sucess",
              encabezado: `Seguimiento Actualizado`,
              descripcion: `Fecha real de cumplimiento actualizada`,
            },
          })
          .afterClosed()
          .subscribe(() => {
            this.getAll();
          });
      });
  }

  public calculateGap(endDate: string, realDate: string): number {
    const end = new Date(endDate);
    const real = new Date(realDate);
    const differenceInTime = end.getTime() - real.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  }

  public calculateAdvance(firstDate: string, secondDate: string): number {
    const startDate = new Date(firstDate);
    const endDate = new Date(secondDate);
    //console.log(startDate,"asdasd", endDate);
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
}
