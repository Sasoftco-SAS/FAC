'use strict';

const express = require('express');
const PremiosInvController = require('../controller/premios-investigadores.controller');
const endpoint = '/premios-investigador';
const mdAuth = require('../../auth/jwt/jwt.middleware');

let api = express.Router();

api.get(endpoint, [mdAuth.ensureAuth],PremiosInvController.getAll);
api.get(`${endpoint}/:id`, [ mdAuth.ensureAuth ], PremiosInvController.getById);
api.post(endpoint,[mdAuth.ensureAuth], PremiosInvController.create);
api.delete(endpoint,[mdAuth.ensureAuth], PremiosInvController.remove);

module.exports = api;