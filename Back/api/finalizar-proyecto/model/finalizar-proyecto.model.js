'use strict';


let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FinalizarPrSchema = Schema({
    proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' },
    estado: Number, //De 1 a 4
})

module.exports = FinalizarPrSchema;
//