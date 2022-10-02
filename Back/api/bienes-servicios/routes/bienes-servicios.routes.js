'use strict';

const express = require('express');
const BienesController = require('../controller/bienes-servicios.controller');
const endpoint = '/bienes-servicios';
const mdAuth = require('../../auth/jwt/jwt.middleware');

let api = express.Router();

api.get(endpoint, [mdAuth.ensureAuth],BienesController.getAll);
api.get(`${endpoint}/:id`, [ mdAuth.ensureAuth ], BienesController.getById);
api.post(endpoint,[mdAuth.ensureAuth], BienesController.create);
api.delete(endpoint,[mdAuth.ensureAuth], BienesController.remove);

module.exports = api;
