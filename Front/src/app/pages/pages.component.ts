import {Component, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {take, tap} from 'rxjs/operators';
import {MENU_ADMIN_ITEMS, MENU_EVALUATOR_ITEMS, MENU_INVESTIGADOR_ITEMS, MENU_RESPONSABLE_ITEMS, MENU_SUBDIR_ITEMS} from '../pages/pages-menu';
import {Roles} from '../@core/enums/roles.enum';
import {AuthService} from '../@core/services/auth/auth.service';
import {MediaMatcher} from '@angular/cdk/layout';
import { cronogramaService } from '../shared/services/cronograma/cronograma.service';
import { NotificacionService } from '../shared/services/notificacion-service/notificacion.service';
import { ProjectService } from '../shared/services/Proyect/project.service';
import { UsersService } from './admin/users/services/users.service';
import Swal from "sweetalert2";
import { ThrowStmt } from '@angular/compiler';

@Component({
    selector: 'app-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnDestroy {

    public mobileQuery: MediaQueryList;
    public userMenu = [{title: 'Perfíl'}, {title: 'Cerrar Sesión', action: 'signOut()'}];
    public roles = Roles;
    public shouldRun = true;
    public fillerNav;

    public listaCronogramas : any = [];
    public listaNotificaciones : any = [];
    public listaProyectos : any = [];
    public sesion_id = localStorage.getItem("user"); //Userio logeado
    public sesion_user = JSON.parse(localStorage.getItem('user')); //Userio logeado
    public usuario_logueado;

    public MENU_SUBDIR_ITEMS = [
        {name: 'Inicio', route: '/pages', icon: 'home', icon2: 'android'},
        {name: 'Propiedad intelectual', route: 'propiedad-intelectual', icon: 'text_snippet', icon2: 'android'} //SUBDIRECTOR PROPIEDAD INT
    ];;

    constructor(private authService: AuthService,
        private notificacionService: NotificacionService,
        private proyectoService: ProjectService,
        changeDetectorRef: ChangeDetectorRef,
        private userService: UsersService,
        private cronogramaService: cronogramaService,
        media: MediaMatcher) {

        this.getCronogramas(); //TRAEMOS CRONOGRAMAS Y PREGUNTAMOS
        this.getNotificaciones();
        //this.getProyectosdelInvestigador();

        setTimeout(() => {
            this.authService.getUserRoleName()
                .pipe(
                    tap(role => role ? this.showMenu(role) : this.authService.signOut()),
                    take(1)
                ).subscribe();
        }, 2000);

        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    private _mobileQueryListener: () => void;

/**
 * If the role is admin, show the admin menu, if the role is investigator, show the investigator menu,
 * etc.
 * @param {Roles} role - Roles
 */
    showMenu(role: Roles): void {
        switch (role) {
            case Roles.Admin:
                this.fillerNav = MENU_ADMIN_ITEMS;
                break;
            case Roles.Investigator:
                this.fillerNav = MENU_INVESTIGADOR_ITEMS;
                break;
            case Roles.Responsable:
                this.fillerNav = MENU_RESPONSABLE_ITEMS; //Ejemplo ruta          SE RELLENA FILLERNAV PARA RUTAS
                break;
            case Roles.Evaluator:
                this.fillerNav = MENU_EVALUATOR_ITEMS;
                break;
            case Roles.SubDirector:
                this.fillerNav = this.MENU_SUBDIR_ITEMS; //SUBDIRECTOR PROPIEDAD INT
                break;
            default:
                this.fillerNav = MENU_INVESTIGADOR_ITEMS; //Por default asigna estos elementos
        }
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    private getCronogramas(): void {
        this.cronogramaService
        .getAll()
        .subscribe((response) => {
            this.listaCronogramas = response.cronogramas;
            const filterObject = (obj, filter, filterValue) => Object.keys(obj).reduce((acc, val) => (obj[val][filter] === filterValue ? acc : {
            ...acc,
            [val]: obj[val]
            }), {});

            for (let q of this.listaCronogramas) {
                for (let i of q.actividades) {
                    for (let j of i.subActividad) {
                        if ( (j?.protegido != true) && (this.calculateAdvance(j.fechaInicio.toString(), j.fechaFinal.toString()) <= 70) ) { //ENCUENTRA SUBACTIVIDADES SIN PROTEGER Y DE 0 A 75
                            //console.log("j j j: ",j.nombreSub); Detecta subact. desprotegidas y de 0% a 75%
                            this.MENU_SUBDIR_ITEMS = [
                                {name: 'Inicio', route: '/pages', icon: 'home', icon2: 'android'},
                                {name: 'Propiedad intelectual', route: 'propiedad-intelectual', icon: 'text_snippet', icon2: 'announcement'}
                            ];
                        }
                    }
                }
            }
        });
    }

    private getNotificaciones(): void {
        //console.log("Se ejecuta getNotificaciones()");
        this.notificacionService.getAll().subscribe((notificacion)=>{
            //console.log("NotificacionesZZ: ", notificacion);
            this.listaNotificaciones = notificacion;
            //console.log(typeof(this.sesion_id));
            //console.log("Id sesion actual: ", this.sesion_id.substring(8,32));
            for (let notif of this.listaNotificaciones) {
                //console.log(notif.usuario," == ", this.sesion_id.substring(8,32), "#1");
                //console.log(notif.usuario," == ", this.sesion_id.substring(24,48), "#2");

                if ((this.sesion_id.substring(8,32) == notif.usuario)||this.sesion_id.substring(24,48) == notif.usuario) {
                    //console.log(" SE CUMPLE LA CONDICION ");
                    //=========
                    Swal.fire({
                        title: '<b>Proyecto: </b>'+notif.detalle2,
                        icon: 'info',
                        html:
                          '<b>Producto: </b>'+notif.detalle+'<br><br><b>Detalle: </b>'+notif.mensaje+'<br><br><b>Se ha PROTEGIDO la propiedad intelectual</b>',
                        showConfirmButton: true,
                        showCancelButton: true,
                        confirmButtonText: "Aceptar",
                        cancelButtonText: "Cerrar",
                      }).then((result) => {
                        if (result.value == true) {
                            //console.log("resultZZZZZZZ");
                            this.notificacionService.removeNotificacion(notif._id).subscribe();
                        }
                      })

                      //this.notificacionService.removeNotificacion(notif._id).subscribe();//ELIMINAR NOTIFICACION DESPUES DE VISTA
                    //=========
                }
            }
        });
    }

    private getProyectosdelInvestigador(): void{
        //console.log("Entra al metodo getprinv");
        //Obtenemos los proyectos cuyo inv.principal coincidan con el usuario logeado.
        this.proyectoService.getAll().subscribe((proyecto)=>{
            let listaProyectos2 = proyecto;
            //console.log("//=//", this.listaProyectos.Proyectos);
            //console.log("//nombre//: ", this.sesion_user.profile.names);
            //console.log("//apellido//: ", this.sesion_user.profile.surname);
            for (let pr of listaProyectos2.Proyectos) {
                if( (this.sesion_user.profile.names == pr.EquipoInvestigaciones[0].nombres) && (this.sesion_user.profile.surname == pr.EquipoInvestigaciones[0].apellido) ) {
                    //console.log("Encontrado");
                    this.listaProyectos.push(pr);
                }
            }

            for (let proyecto_iterador of this.listaProyectos) {
                if(proyecto_iterador.date_inicio && proyecto_iterador.date_fin){
                    //console.log("Avance proyecto: ",(this.calculateAdvance(proyecto_iterador.date_inicio.toString(), proyecto_iterador.date_fin.toString())) );
                    if( (this.calculateAdvance(proyecto_iterador.date_inicio.toString(), proyecto_iterador.date_fin.toString())) > 49){
                        if(this.sesion_user.role.name == "Investigador"){
                            console.log("Generar botón para iniciar flujo de firmas");
                        }
                        Swal.fire({
                            title: '<b>NOTIFICACIÓN</b>',
                            icon: 'info',
                            html:
                              '<br><b>Hay proyectos próximos a finalizar (60% + )</b>',
                            showConfirmButton: true,
                            showCancelButton: true,
                            confirmButtonText: "Aceptar",
                            cancelButtonText: "Cerrar",
                          }).then((result) => {
                            if (result.value == true) {
                                //console.log("resultZZZZZZZ");
                                //this.notificacionService.removeNotificacion(notif._id).subscribe();
                            }
                          })
                    }
                }
            }
            //console.log("Encontrados", this.listaProyectos[0]); //console.log("Encontrados", this.listaProyectos);
        })
    }

    //Obtiene porcentaje de avance
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

}
