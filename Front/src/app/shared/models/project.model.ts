import {
    Entidad,
    Grupo,
    ObjetivoEspecifico,
    PerfilInvestigador,
    Planteamiento, Riesgo
} from '../services/saveStateService/StateInterface';

export interface Proyect {
    date?: string;
    date2?: string;
    date_inicio?: Date;
    date_fin?: Date;
    finalizado?: boolean;
    UserId?: string;
    Convocatoria?: string;
    objetivosEspecificos?: ObjetivoEspecifico[];
    ProyectoBloqueado?: boolean;
    Seguimiento?: boolean;
    Entidades?: Entidad[];
    preguntasFinalizacion?: preguntasFinalizacionInterface[];
    EquipoInvestigaciones?: EquipoInvestigacion[];
    AgregarDetallesRubros?: AgregarDetallesRubros[];
    productosEsperados?: productosEsperados[];
    resultadosPrevios?: string;
    iniciarProyecto?: iniciarProyecto;
    metodologia?: string;
    marcoConceptual?: string;
    resumen?: string;
    informaciones?: informacion[];
    estadoArte?: string;
    bibliografias?: bibliografia[];
    palabraClaves?: palabraClaves[];
    resultadosEsperados?: string;
    objetivoGeneral?: string;
    grupos?: Grupo[];
    ValorTotal?: number;
    calificaciones?: Calificaciones;
    firmas?: FirmasInterface[];
    firmas_finalizar?: FirmasInterface[];
    planteamiento?: Planteamiento;
    evaluadorId?: string;
    riesgos?: Riesgo[];
    version?: number;
}

export interface productosEsperados {
    descripcion: string;
    partFuerza: number;
    partOtros: number;
    rubroRelacionado: string;
    tipoProducto: string;
}

export interface palabraClaves {
    palabra: string;
}

export interface objetivosEspecifico {
    descr: string;
}

export interface bibliografia {
    bibliografia: string;
}

export interface preguntasFinalizacionInterface {
    respuesta_preg_uno?: string;
    respuesta_preg_dos?: string;
    respuesta_preg_tres?: string;
    respuesta_preg_cuatro?: string;
    respuesta_preg_cinco?: string;
    firma_jefeCentro?: Boolean,
}

export interface informacion {
    impacto: string;
    nInvestigacion: string;
    pregunta: string;
}

export interface iniciarProyecto {
    comandante: string;
    nombreProyecto: string;
    telefonoGestor: number;
    dependencia: string;
    email: string;
    gestor: string;
    lugar: string;
    duracion: number;
    linea: string;
    modelo: string;
    programa: string;
    subprograma: string;
    avala: string;
    centroDeInvestigacion?: string;
    gestorId?: string;
}

export interface AgregarDetallesRubros {
    Descripcion?: string;
    DuracionEnMeses?: number;
    EntidadesCostos?: number;
    Experiencia?: string;
    Formacion?: string;
    HorasSemanales?: number;
    Justificacion?: string;
    NombreDelInvestigador?: string;
    NombreRubro?: string;
    PerfilDelInvestigador?: PerfilInvestigador;
    RolDelInvestigador?: string;
    idRubro?: string;
    entidad?: string;
    tipoDeRubro?: string;
    TotalEfectivo?: number;
    Cumplimiento?: number;
    PresupuestoEjecutado?: number;
    _id?: string;
    listaRubros?: ListaRubros[];
}

export interface ListaRubros {
    rubro?: number;
    factura?: any;
}

export interface EquipoInvestigacion {
    nombres: string;
    apellido: string;
    identificacion: number;
    grupos: string;
    grado: string;
    dedicacion: string;
    cargo: string;
}

export interface Calificaciones {
    idEv?: string;
    ValorParcial?: number;
    Evaluado?: boolean;
    Valores?: {
        vlrequipo: number;
        vlrestado: number;
        vlrmarco: number;
        vlrobjEspecifico: number;
        vlrobjGeneral: number;
        vlrpalabrasClaves: number;
        vlrproyecto: number;
        vlrresumen: number;
        vlrunidadependencia: number;
    };
}

export interface FirmasInterface {
    name: string;
    idQuienFirma: string;
    status: boolean;
}
