'use strict';

const { validationResult } = require('express-validator/check');
const PremiosOtorgadosDao = require('../dao/premios-otorgados.dao');

/**
 * create
 * @param req
 * @param res
 * @param next
 */
 function create(req, res, next) {
    try {
        validationResult(req).throw();
        let objeto_premio = req.body;
        let objObj = JSON.parse(JSON.stringify(objeto_premio));

        let fecha_hoy = new Date();

        objObj.date = fecha_hoy;

        let year = fecha_hoy.getFullYear();
        let day = fecha_hoy.getDate();
        let month = fecha_hoy.getMonth();

        let fecha_hoy_legible = `${day}-${month + 1}-${year}`;

        objObj.fecha = fecha_hoy_legible;
        //console.log(objObj); //BORRAR

        PremiosOtorgadosDao['create'](objObj).then(async _obj => {
            res.status(201).json({ "premio_otorgado": _obj });
        });
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
 * getAll
 * @param req
 * @param res
 * @param next
 */
 function getAll(req, res, next) {
    let query = req.query;
    PremiosOtorgadosDao['getAll'](query)
        .then(async elementos => {
            res.status(200).json(elementos);
        })
        .catch(err => {
            res.status(500).json({message: err});
        });
}

/**
 * Método para eliminar
 * @param req
 * @param res
 * @param next
 */
 function remove(req, res, next) {
    try {
        validationResult(req).throw();

        let { id } = req.body;
        let idObj = JSON.parse(JSON.stringify(id));

        PremiosOtorgadosDao['remove'](idObj)
            .then(async finalizarpr => {
                if (!finalizarpr) {
                    res.status(404).json({ message: 'finalizarpr no encontrado.' });
                } else {
                    res.status(200).json({ message: 'finalizarpr eliminado.' });
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

/**
 * Método para traer por id
 * @param req
 * @param res
 * @param next
 */
 function getById(req, res, next) {
    try {
        validationResult(req).throw();

        let finalizarPr = req.params.id;

        PremiosOtorgadosDao['getById'](finalizarPr)
            .then(async FinalizarPr => {
                if (!FinalizarPr) {
                    res.status(404).json({message: 'FinalizarPr not found.'});
                } else {
                    res.status(200).json(FinalizarPr);
                }
            })
            .catch(err => {
                res.status(500).json({message: err});
            });
    } catch (err) {
        const errorFormatter = ({msg, param}) => {
            return `The value: ${param} ${msg}`;
        };
        const result = validationResult(req).formatWith(errorFormatter);
        if (!result.isEmpty()) {
            return res.status(422).json({errors: result.array()});
        }
    }
}

module.exports = {
    create,
    getAll,
    remove,
    getById,
}