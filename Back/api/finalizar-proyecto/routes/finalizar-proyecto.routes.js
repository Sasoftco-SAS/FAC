'use strict';

const express = require('express');
const FinalizarPrController = require('../controller/finalizar-proyecto.controller');
const endpoint = '/finalizar-pr';
const mdAuth = require('../../auth/jwt/jwt.middleware');

let api = express.Router();

api.get(endpoint, [mdAuth.ensureAuth],FinalizarPrController.getAll);
api.get(`${endpoint}/:id`, [ mdAuth.ensureAuth ], FinalizarPrController.getById);
api.post(endpoint,[mdAuth.ensureAuth], FinalizarPrController.create);
api.delete(endpoint,[mdAuth.ensureAuth], FinalizarPrController.remove);
api.patch('/finalizar-pr/:id', [mdAuth.ensureAuth], FinalizarPrController.actualizarFinalizarPr)  //Actualizar 1 necesidad

module.exports = api;