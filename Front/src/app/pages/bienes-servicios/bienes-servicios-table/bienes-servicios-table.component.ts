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
import Swal from "sweetalert2";
import { UsersService } from "../../admin/users/services/users.service";
import {map} from 'rxjs/operators';
//import { VistaFinalizacionComponent, VistaFinalizacionData } from "../vista-finalizacion/vista-finalizacion.component";
import {MatDialog} from '@angular/material/dialog';
import { Console } from "console";
import { ProjectService } from "src/app/shared/services/Proyect/project.service";
import { bienesService } from "src/app/shared/services/bienes-service/bienes.service";
import { runInThisContext } from "vm";
import { VistaBienes2Component, VistaBienesData } from "../vista-bienes/vista-bienes.component";

@Component({
  selector: 'app-bienes-servicios-table',
  templateUrl: './bienes-servicios-table.component.html',
  styleUrls: ['./bienes-servicios-table.component.scss']
})

export class BienesServiciosTableComponent implements OnInit, AfterViewInit {
  public sesion_rol = localStorage.getItem('Role'); //Traemos el rol logeado
  user = localStorage.getItem('user');
  dataSource = new MatTableDataSource();
  dataSourceBienes = new MatTableDataSource();
  @ViewChild("clasificar") clasificar = new MatSort();

  public displayedColumns2: string[] = [
    "proyecto",
    "acciones",
  ];
  public displayedColumnsBienes: string[] = [
    "bien/servicio",
    "acciones",
  ];
  public proyecto_usar;
  public hayProyectos = false;
  public sesion_user = JSON.parse(localStorage.getItem('user')); //Userio logeado
  public listaProyectos;
  public listaBienes;

  constructor(
    private modal:NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private userService: UsersService,
    private proyectoService: ProjectService,
    private bienesService: bienesService,
    ){
    }

  ngOnInit(): void {
    this.getProyectos();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.clasificar;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  metodobasura(){
  }

  private getProyectos(){
    this.hayProyectos = false;
    //Obtenemos los proyectos cuyo inv.principal coincidan con el usuario logeado.
    this.proyectoService.getAll().subscribe((proyecto)=>{
        this.listaProyectos = [];

        for (let pr of proyecto.Proyectos) {
          //Valida que esté involucrado al proyecto como jefe de centro, inv. principal o gestor acti
          if( (this.sesion_user.role.name == "Jefe De Centro")||(pr.firmas_finalizar[1].idQuienFirma == this.sesion_user._id)|| (pr.firmas_finalizar[3].idQuienFirma == this.sesion_user._id)){
            this.hayProyectos=true;
            this.listaProyectos.push(pr);
          }
        }
        this.dataSource.data = this.listaProyectos;
    })
  }

  openModalBienes(proyecto){
    this.proyecto_usar = proyecto;
    this.listaBienes = [];
    this.bienesService.getAll().subscribe(bienes=>{
      for (let iterador of bienes) {
        if (iterador.proyecto._id == proyecto._id) {
          this.listaBienes.push(iterador);
        }
      }
      this.dataSourceBienes.data = this.listaBienes;
    });
  }

  public viewPDF(id: string, accion: string): void {
    let valor = [];
    let Evaluado;
    this.bienesService.getById(id)
        .pipe(finalize(() => {
          this.showModalPDFBienes(id);
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

  private showModalPDFBienes(_id): void {
    const data: VistaBienesData = {_id};
    this.dialog.open(VistaBienes2Component, {data})
        .afterClosed().subscribe(response => {
        this.router.navigate(['/pages/bienes-servicios']);
    });
  }
}