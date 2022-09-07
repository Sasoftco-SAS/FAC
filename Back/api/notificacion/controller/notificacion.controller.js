'use strict';

const { validationResult } = require('express-validator/check');
const NotificacionDao = require('../dao/notificacion.dao');
const UserDao = require('../../user/dao/user.dao');
/**
 * create notificacion
 * @param req
 * @param res
 * @param next
 */
 function create(req, res, next) {
    try {
        validationResult(req).throw();
        let notificacion = req.body;
        let objObj = JSON.parse(JSON.stringify(notificacion));
        //console.log("Imprimiendo objeto notificación: ",objObj);
        let userId = objObj.usuario;
        //objObj.mensaje = objObj.mensaje;
        //objObj.actividad = objObj.actividad;
        //console.log("userId: ",userId);

        UserDao.findOne({ _id: userId }).then(user => {
            objObj.usuario = user;
            //console.log("Crono 2: ",objObj.cronograma);

            NotificacionDao['create'](objObj)
                .then(async _obj => {
                    res.status(201).json({ "notificacion": _obj });
                });
        })
        // console.log("Imprimiendo objObj:");
        // console.log(objObj.descripcion);
        //console.log("//////////////////////////////");
    } catch (err) {
        const errorFormatter = ({ msg, param }) => {
            return `The value: ${param} ${msg}`;
        };
        const result = validationResult(req).formatWith(errorFormatter);
        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }
    }
}

/**
 * getAll notificaciones
 * @param req
 * @param res
 * @param next
 */
 const getAll = async (req, res, next) => {
    let query = req.query;

    NotificacionDao['getAll'](query)
        .then(async notificaciones => {
            res.status(200).json(notificaciones);//si retorna object hay que dejarlo de esta manera
        })
        .catch(err => {
            res.status(500).json({ message: err });
        });
}

/**
 * Método para eliminar unidad
 * @param req
 * @param res
 * @param next
 */
 function remove(req, res, next) {
    try {
        validationResult(req).throw();

        let { id } = req.body;
        let idObj = JSON.parse(JSON.stringify(id));

        NotificacionDao['remove'](idObj)
            .then(async notificacion => {
                if (!notificacion) {
                    res.status(404).json({ message: 'notificacion no encontrada.' });
                } else {
                    res.status(200).json({ message: 'notificacion eliminada.' });
                }
            })
            .catch(err => res.status(500).json({ message: err }));
    } catch (err) {
        const errorFormatter = ({ msg, param }) => {
            return `The value: ${param} ${msg}`;
        };
        const result = validationResult(req).formatWith(errorFormatter);
        if (!result.isEmpty()) {
            return res.status(422).json({ errors: result.array() });
        }
    }
}

module.exports = {
    create,
    getAll,
    remove,
}