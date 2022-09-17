'use strict';

const { validationResult } = require('express-validator/check');
const FinalizarPrDao = require('../dao/finalizar-proyecto.dao');
const ProyectoDao = require ('../../project/dao/project.dao');

/**
 * create
 * @param req
 * @param res
 * @param next
 */
 function create(req, res, next) {
    try {
        validationResult(req).throw();
        let finalizarpr = req.body;
        let objObj = JSON.parse(JSON.stringify(finalizarpr));
        //console.log("Imprimiendo objeto notificación: ",objObj);
        let proyectoId = objObj.proyecto;
        //objObj.mensaje = objObj.mensaje;
        //objObj.actividad = objObj.actividad;
        //console.log("userId: ",userId);


        //console.log("Crono 2: ",objObj.cronograma);
        ProyectoDao.findOne({ _id: proyectoId }).then(proyecto => {
            objObj.proyecto = proyecto;

            FinalizarPrDao['create'](objObj).then(async _obj => {
                res.status(201).json({ "finalizarpr": _obj });
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
 * getAll
 * @param req
 * @param res
 * @param next
 */
 function getAll(req, res, next) {
    let query = req.query;
    FinalizarPrDao['getAll'](query)
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

        FinalizarPrDao['remove'](idObj)
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
 * Método para actualizar
 * @param req
 * @param res
 * @param next
 */
 function actualizarFinalizarPr(req, res, next) {
    try {
      validationResult(req).throw();
      let finalizarPr = req.body;
      let idFinalizarPr = req.params.id;
      let finalizarPrObj = JSON.parse(JSON.stringify(finalizarPr));

      FinalizarPrDao["update"](idFinalizarPr, finalizarPrObj)
        .then(async (_obj) => {
          if (!_obj) {
            res.status(404).json({ message: "FinalizarPr not found." });
          } else {
            res.status(200).json({ necesidad: _obj });
          }
        }).catch((err) => res.status(500).json({ message: err }));
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

        FinalizarPrDao['getById'](finalizarPr)
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
    actualizarFinalizarPr,
    create,
    getAll,
    remove,
    getById,
}