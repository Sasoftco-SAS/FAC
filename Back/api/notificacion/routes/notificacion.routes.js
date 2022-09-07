'use strict';

const express = require('express');
const NotificacionController = require('../controller/notificacion.controller');
const endpoint = '/notificacion';
const mdAuth = require('../../auth/jwt/jwt.middleware');

let api = express.Router();

api.get(endpoint, [mdAuth.ensureAuth],NotificacionController.getAll);
api.post(endpoint,[mdAuth.ensureAuth], NotificacionController.create);
api.delete(endpoint,[mdAuth.ensureAuth], NotificacionController.remove);

//api.get('/notificacion/:id', [mdAuth.ensureAuth], NotificacionController.obtenerNotificacionById) //Obtener 1 notificacion


module.exports = api;