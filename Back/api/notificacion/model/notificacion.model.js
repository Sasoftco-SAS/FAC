'use strict';

const { strict } = require('assert');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let NotificacionSchema = Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mensaje: String,
    detalle: String,
    tipo: String,
})

module.exports = NotificacionSchema;
//