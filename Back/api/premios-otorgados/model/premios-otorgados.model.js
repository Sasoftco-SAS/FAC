'use strict';

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let PremiosOtorgadosSchema = new Schema({
    investigador: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: Date,
    premio: String,
    merito: String,
    fecha: String,
});

module.exports = PremiosOtorgadosSchema;
//