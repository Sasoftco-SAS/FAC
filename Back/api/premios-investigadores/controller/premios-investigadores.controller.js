'use strict';

const { validationResult } = require('express-validator/check');
const PremiosInvDao = require('../dao/premios-investigadores.dao');

/**
 * create
 * @param req
 * @param res
 * @param next
 */
 function create(req, res, next) {
    try {
        validationResult(req).throw();
        let premio = req.body;
        let objObj = JSON.parse(JSON.stringify(premio));
        // let obj = {
        //     Investigador : objObj,         //CREAMOS UN OBJETO PARA QUE TENGA LA SINTAXIS DE CÓMO RECIBE EL MODELO DE PREMIOS
        // };
        //console.log(objObj);

        PremiosInvDao['create'](objObj).then(async _obj => {
            res.status(201).json({ "premio": _obj });
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
    PremiosInvDao['getAll'](query)
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

        PremiosInvDao['remove'](idObj)
            .then(async postulado => {
                if (!postulado) {
                    res.status(404).json({ message: 'postulado no encontrado.' });
                } else {
                    res.status(200).json({ message: 'postulado eliminado.' });
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

        PremiosInvDao['getById'](finalizarPr)
            .then(async FinalizarPr => {
                if (!FinalizarPr) {
                    res.status(404).json({message: 'postulado not found.'});
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