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
import { PremiosInvestigadoresService } from "src/app/shared/services/premios-investigadores-service/premios-investigadores";
import { OtorgarPremioInvestigadorService } from "src/app/shared/services/otorgar-premio-investigador/otorgar-premio-investigador";
import { Console } from "console";

@Component({
  selector: 'app-premios-otorgados-table',
  templateUrl: './premios-otorgados-table.component.html',
  styleUrls: ['./premios-otorgados-table.component.scss']
})

export class PremiosOtorgadosTableComponent implements OnInit, AfterViewInit {
  public sesion_rol = localStorage.getItem('Role'); //Traemos el rol logeado
  user = localStorage.getItem('user');
  dataSource = new MatTableDataSource();
  @ViewChild("clasificar") clasificar = new MatSort();
  public displayedColumns2: string[] = [
    "investigador",
    "premio",
    "merito",
    "fecha",
  ];

  public formPremiacion: FormGroup;
  public hayInvestigadores = false;
  public investigador_premiado;
  public sesion_user = JSON.parse(localStorage.getItem('user')); //Userio logeado

  constructor(
    private modal:NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private userService: UsersService,
    private premiosInvService : PremiosInvestigadoresService,
    private OtorgarPremioInvestigadorService: OtorgarPremioInvestigadorService,
    ){
      this.getInvestigadoresPostulados();
      this.builder();
    }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.clasificar;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  metodobasura(){

  }

  private getInvestigadoresPostulados(){
    this.hayInvestigadores = false;
    this.OtorgarPremioInvestigadorService.getPremiados().subscribe(premiados=>{
      if(premiados.length>0){
        this.hayInvestigadores = true;
        //console.log("hay premiados");
      }
      this.dataSource = premiados;
      //console.log(premiados); //BORRAR
    });

    // this.premiosInvService.getPostulados().subscribe(postulados=>{
    //   this.dataSource = postulados;
    // });

  }

  openModalEncuesta(investigador){
    this.investigador_premiado = investigador;
  }

  // AUN NO LOS USO --------------
  obtenerProyecto(){
    //return this.proyectoService.getById(this.id_pr_finalizar).toPromise();
  }

  async metodoActualizarProyectoFinalizar(){
    //const proyectoFinalizar = await this.obtenerProyecto();
  }
  //-------------------------------

  //Construir formulario, se deben parecer los campos
  private builder(): void {
    this.formPremiacion = this.fb.group({
      premio: new FormControl(''),
      merito: new FormControl(''),
    });
  }
}