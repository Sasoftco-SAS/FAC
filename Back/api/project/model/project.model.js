"use strict";

let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let UserSchema = require("../../user/model/user.model");

const User = mongoose.model("user", UserSchema);
const date = new Date();
date.getMonth()

let ProjectSchema = new Schema({

  date: String,
  date2: String,
  date_inicio: Date,
  date_fin: Date,
  finalizado: Boolean,
  bienes_servicios: Boolean,
  UserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  Convocatoria: { type: mongoose.Schema.Types.ObjectId, ref: "Convocatoria" },
  objetivosEspecificos: [{ descr: String }],
  ProyectoBloqueado: Boolean,
  Seguimiento: Boolean,
  Entidades: [
    {
      nombre: String,
      nit: String,
      personaACargo: String,
      numeroDeContacto: String,
      email: String,
    },
  ],
  preguntasFinalizacion: [
    {
      respuesta_preg_uno: String,
      respuesta_preg_dos: String,
      respuesta_preg_tres: String,
      respuesta_preg_cuatro: String,
      respuesta_preg_cinco: String,
      firma_jefeCentro: Boolean,
    },
  ],
  preguntasBienesyServicios: [
    {
      adm_recursos: String,
      convenio: String,
      codigo: String,
      version: String,
      vigencia: String,
      tipo_requerimiento: String,
      valor_estimado: Number,
      lugar_entrega: String,
      objeto_contrato: String,
      fecharequerida_actainicio: String,
      info_adicional: String,
      info_prov_nombre: String,
      info_prov_ciudad: String,
      info_prov_direccion: String,
      info_prov_numero: String,
      info_prov_correo: String,
    },
  ],
  EquipoInvestigaciones: [
    {
      nombres: String,
      apellido: String,
      identificacion: Number,
      grupos: String,
      lider: String,
      grado: String,
      dedicacion: String,
      cargo: String,
    },
  ],
  AgregarDetallesRubros: [
    {
      idRubro: String,
      RolDelInvestigador: String,
      PerfilDelInvestigador: String,
      NombreRubro: String,
      NombreDelInvestigador: String,
      Justificacion: String,
      HorasSemanales: String,
      Formacion: String,
      Experiencia: String,
      EntidadesCostos: Number,
      DuracionEnMeses: String,
      Descripcion: String,
      tipoDeRubro: String,
      entidad: String,
      PresupuestoEjecutado: Number,
      listaRubros: [{
        rubro: Number,
        consecutivo: String,
        //nombre: String, //AÑADIDO PARA FUTUROS DESAROLLOS
        //observacion: String, //AÑADIDO PARA PDF BIENES Y SERV.
        factura: {
          data: Object,
          name: String,
          path: String,
          created_at: {type: Date, default: Date.now()}
        }
      }]
    },
  ],
  productosEsperados: [
    {
      descripcion: String,
      partFuerza: Number,
      partOtros: Number,
      rubroRelacionado: String,
      tipoProducto: String,
      subActividad: String, //SUBACTIVIDAD
    },
  ],
  resultadosPrevios: String,
  iniciarProyecto: [
    {
      telefonoGestor: Number,
      subprograma: String,
      programa: String,
      nombreProyecto: String,
      modelo: String,
      lugar: String,
      linea: String,
      gestor: String,
      email: String,
      duracion: Number,
      dependencia: String,
      comandante: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      avala: String,
      centroDeInvestigacion: String,
      unidades: String,
    },
  ],
  metodologia: String,
  marcoConceptual: String,
  resumen: String,
  informaciones: [
    {
      impacto: String,
      nInvestigacion: String,
      pregunta: String,
    },
  ],
  estadoArte: String,
  bibliografias: [
    {
      bibliografia: String,
    },
  ],
  palabraClaves: [
    {
      palabra: String,
    },
  ],
  observaciones_rubros: [
    {
      cantidad: String,
      nombre: String,   //OTROS BIENES Y SERVICIOS, PDF DE BIENES Y SERVICIOS
      observacion: String,
      unidad: String,
    },
  ],
  resultadosEsperados: String,
  objetivoGeneral: String,
  grupos: [
    {
      nombreGrupo: String,
      entidad: String,
      antiguedad: String,
      codigo: String,
      categoria: String,
      lider: String
    },
  ],
  ValorTotal: Number,
  calificaciones: [
    {
      idEv: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      ValorParcial: Number,
      Evaluado: Boolean,
      Valores: {
        vlrequipo: Number,
        vlrestado: Number,
        vlrmarco: Number,
        vlrmetodologia: Number,
        vlrobjEspecifico: Number,
        vlrobjGeneral: Number,
        vlrpalabrasClaves: Number,
        vlrproyecto: Number,
        vlrresumen: Number,
        vlrunidadependencia: Number,
      },
    },
  ],
  firmas: [{
    name: String,
    idQuienFirma: String,
    status: Boolean,
    date: Date,
  }],
  firmas_finalizar: [{
    name: String,
    idQuienFirma: String, //Mongoose
    status: Boolean,
    date: Date,
  }],
  planteamiento: {
    planteamiento: String,
    enQueConsiste: String,
    porQueSeRequiere: String,
    paraQueDesarrollarlo: String,
    beneficiosFAC: String,
    utilidad: Number,
    inversion: Number,
  },
  evaluadorId: String,
  riesgos: [{
    descripcion: String,
    consecuencia: String,
    accion: String,
  }],
  version: Number,
});

module.exports = ProjectSchema;
