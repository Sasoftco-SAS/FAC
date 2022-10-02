'use strict';

const express = require('express');
const OtorgarPremiosController = require('../controller/premios-otorgados.controller');
const endpoint = '/otorgar-premio-investigador';
const mdAuth = require('../../auth/jwt/jwt.middleware');

let api = express.Router();

api.get(endpoint, [mdAuth.ensureAuth],OtorgarPremiosController.getAll);
api.get(`${endpoint}/:id`, [ mdAuth.ensureAuth ], OtorgarPremiosController.getById);
api.post(endpoint,[mdAuth.ensureAuth], OtorgarPremiosController.create);
api.delete(endpoint,[mdAuth.ensureAuth], OtorgarPremiosController.remove);

module.exports = api;