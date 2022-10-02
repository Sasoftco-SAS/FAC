'use strict';

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let BienesSchema = new Schema({
    proyecto: { type: mongoose.Schema.Types.ObjectId, ref: "Proyecto" },
    nombre_proyecto: String,
    adm_recursos: String,
    convenio: String,
    codigo: String,
    version: String,
    vigencia: String,
    tipo_requerimiento: String,
    lugar_entrega: String,
    objeto_contrato: String,
    fecharequerida_actainicio: String,
    fecha_solicitud: String,
    info_adicional: String,
    info_prov_nombre: String,
    info_prov_ciudad: String,
    info_prov_direccion: String,
    info_prov_numero: String,
    info_prov_correo: String,
    tipo_rubro: String,
    valor_estimado: Number,
    valor_disponible: Number,
    valor_compromiso: Number,
    valor_financiado: Number,
    tiempo_ejecucion: String,
    observaciones_rubros: [
        {
          cantidad: Number,
          nombre: String,
          observacion: String,
          unidad: String,
          valor: Number,
        },
      ],
});

module.exports = BienesSchema;
//