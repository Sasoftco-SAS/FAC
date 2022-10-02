'use strict';

let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let PremiosInvestigadoresSchema = new Schema({
    Investigador: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = PremiosInvestigadoresSchema;
//