import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
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

  constructor(
    private proyectoService: ProjectService,
    private authStorageService: AuthStorageService,
    private auth: AuthStorageService,
    private firmaService: FirmaService,
    ){
      this.getProyectosdelInvestigador();
      this.dataSource.data = this.listaProyectos2;
    }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.clasificar;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
                if( (this.calculateAdvance(proyecto_iterador.date_inicio.toString(), proyecto_iterador.date_fin.toString())) > 59){
                    if(this.sesion_user.role.name == "Investigador"){
                        //console.log("Generar botón para iniciar flujo de firmas");
                        if(proyecto_iterador.firmas_finalizar[1].status = false){
                          this.listaProyectos2.push(proyecto_iterador);
                        }
                    }
                }
              }
          }
          this.dataSource.data = this.listaProyectos2;
        //console.log("Encontrados", this.listaProyectos[0]); //console.log("Encontrados", this.listaProyectos);
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
    Swal.fire({
      title: '<b>INICIA FLUJO DE FIRMAS</b>',
      icon: 'info',
      html:
        '<br><b>XXXXXXX</b>',
      showConfirmButton: true,
      confirmButtonText: "Aceptar",
    })
    Proyecto.firmas_finalizar[1].status = true;
    this.proyectoService.update(Proyecto._id, Proyecto)
        .subscribe(() => { //FALTA QUE LOS DEMÁS PUEDAN FIRMAR Y EL CAPITAN DE ULTIMAS LUEGO CAMBIAR EL ESTADO A FINALIZADO
    });
}
}
