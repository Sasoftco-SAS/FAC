'use strict';

var ProyectoDao = require('../dao/project.dao');
var bcrypt = require('bcrypt-nodejs');

const {validationResult} = require('express-validator/check');

/**
 * Método para traer los proyectos
 * @param req
 * @param res
 * @param next
 */
function getAll(req, res, next) {
    let query = req.query;
    ProyectoDao['getAll'](query)
        .then(async Proyectos => {
            res.status(200).json({"Proyectos": Proyectos});
        })
        .catch(err => {
            res.status(500).json({message: err});
        });
}

/**
 * Método para traer un proyecto
 * @param req
 * @param res
 * @param next
 */
function getById(req, res, next) {
    try {
        validationResult(req).throw();

        let ProyectoId = req.params.id;

        ProyectoDao['getById'](ProyectoId)
            .then(async Proyecto => {
                if (!Proyecto) {
                    res.status(404).json({message: 'Proyecto not found.'});
                } else {
                    res.status(200).json({"Proyecto": Proyecto});
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


/**
 * Método para crear un proyecto
 * @param req
 * @param res
 * @param next
 */
function create(req, res, next) {

    try {
        validationResult(req).throw();

        let Proyecto = req.body;

        bcrypt.hash(Proyecto.password, null, null, (err, hash) => {
            if (err) {
                return res.status(400).send({message: 'Password encryption problem.'});
            }
            //console.log("//////////////inicio/////////");
            let date = new Date();
            let year = date.getFullYear();
            let day = date.getDate();
            let month = date.getMonth();

            let dateAux = `${day}-${month + 1}-${year}`;//Ya estan usando el date asi.
            //console.log("fecha_inicio: ", date);

            let date2 = dateAux.split('-');
            let endDate = new Date(date2);
            endDate.setMonth(Number(date2[1]) - 1 + Number(Proyecto.iniciarProyecto.duracion));
            // let year2 = endDate.getFullYear();
            // let day2 = endDate.getDate();
            // let month2 = endDate.getMonth();

            //endDate = `${day2}-${month2 + 1}-${year2}`;

            Proyecto.date = dateAux;
            Proyecto.date_inicio = date;
            Proyecto.date_fin = endDate;

            //console.log("Proyecto: ", Proyecto);
            //console.log("duración: ", Proyecto.iniciarProyecto.duracion);
            //console.log("fecha_fin: ",endDate);
            //console.log("//////////////fin/////////");
            if (hash) {
                Proyecto.password = hash;
                let ProyectoObj = JSON.parse(JSON.stringify(Proyecto));
                //console.log("ProyectoObj: ", ProyectoObj);
                ProyectoDao['create'](ProyectoObj)
                    .then(async _Proyecto => {
                        res.status(201).json({"Proyecto": _Proyecto});
                    }).catch(err => {
                    if (err.code === 11000) {
                        res.status(409).json({message: "Proyecto already exists."});
                    }
                    {
                        res.status(500).json({message: err});
                    }
                });
            }
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


/**
 * Método para actualizar un proyecto
 * @param req
 * @param res
 * @param next
 */
function update(req, res, next) {
    try {
        validationResult(req).throw();

        let Proyecto = req.body;
        let ProyectoObj = JSON.parse(JSON.stringify(Proyecto));
        let ProyectoId = req.params.id;

        ProyectoDao['update'](ProyectoId, ProyectoObj)
            .then(async _Proyecto => {
                if (!_Proyecto) {
                    res.status(404).json({message: 'Proyecto not found.'});
                } else {
                    res.status(200).json({"Proyecto": _Proyecto});
                }
            }).catch(err => res.status(500).json({message: err}));

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

/**
 * Método para eliminar un rubro de un proyecto
 * @param req
 * @param res
 * @param next
 */
async function removeRubro(req, res, next) {
    try {
        const ProjectObject = JSON.parse(JSON.stringify(req.body));
        const {ProjectId, idDetalleRubro, idRubro} = ProjectObject;
        const projectObj = await ProyectoDao.findOne({_id: ProjectId})
        projectObj.AgregarDetallesRubros.map(rubroActual => {
            if (String(rubroActual._id) === String(idDetalleRubro)) {
                rubroActual.listaRubros = rubroActual.listaRubros.filter(rubroSeleccionado => String(rubroSeleccionado._id) !== String(idRubro));
            }
        })
        ProyectoDao['update'](ProjectId, projectObj)
            .then(async _Proyecto => {
                if (!_Proyecto) {
                    res.status(404).json({message: 'Proyecto not found.'});
                } else {
                    res.status(200).json({"Proyecto": _Proyecto});
                }
            }).catch(err => res.status(500).json({message: err}));

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

/**
 * Método para crear un rubro de un proyecto
 * @param req
 * @param res
 * @param next
 */
async function updateRubro(req, res, next) {
    try {
        const project = req.body;
        const ProjectObject = JSON.parse(JSON.stringify(project));
        //console.log("ProjectObject /////// ", req.body);
        const {ProjectId, rubro, idRubro} = ProjectObject;
        const {file} = req.files;
        const factura = {
            name: file.name,
            data: file.data,
            path: '/img/uploads/' + file.name
        }

          //CREAMOS EL CONSECUTIVO
        const projectObj = await ProyectoDao.findOne({_id: ProjectId})

        //console.log("///////////////////////////////////////////////")
        //console.log(projectObj.AgregarDetallesRubros[0].NombreRubro)
        //console.log(projectObj)
        //console.log("Consecutivo es de tipo: ", typeof(consecutivo))//string
        //console.log(factura)
        //console.log("Rubro: ",rubro)
        //console.log("Consecutivo: ", consecutivo)//string
        //console.log("///////////////////////////////////////////////")
        //const consecutivopt2 = (consecutivo).substring(4,9) //Obtiene los ultimos 4 digitos numéricos desde el index 4

        projectObj.AgregarDetallesRubros.map(rubroActual => { //ACA ESTAMOS TENIENDO EL RUBRO ACTUAL
            if ((String(rubroActual._id) === idRubro) && ( (rubroActual.NombreRubro) == "Adquisición de equipos" )) {
                //console.log(rubroActual)
                const rubrosLength = ((rubroActual.listaRubros).length)
                const consecutivo = ((projectObj.iniciarProyecto[0].centroDeInvestigacion).substr(0,3)+"_")+(rubrosLength+1)
                rubroActual.listaRubros.push({rubro, factura, consecutivo}) //CREA EL GASTO Y LE AÑADE CONSECUTIVO
            }else if ((String(rubroActual._id) === idRubro) && ( (rubroActual.NombreRubro) != "Adquisición de equipos" )){
                rubroActual.listaRubros.push({rubro, factura}) //CREA EL GASTO SIN CONSECUTIVO PORQUE NO ES ADQUISICION
            }
        })

        ProyectoDao['update'](ProjectId, projectObj)
            .then(async _Proyecto => {
                if (!_Proyecto) {
                    res.status(404).json({message: 'Proyecto not found.'});
                } else {
                    res.status(200).json({"Proyecto": _Proyecto});
                }
            }).catch(err => res.status(500).json({message: err}));

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

/**
 * Método para actualizar un rubro de un proyecto
 * @param req
 * @param res
 * @param next
 */
 async function patchRubro(req, res, next) {
    try {
        const project = req.body;
        const ProjectObject = JSON.parse(JSON.stringify(project));
        //console.log("ProjectObject /////// ", req.body);
        const {ProjectId, rubro, idRubro, consecutivo} = ProjectObject;
        const {file} = req.files;
        const factura = {
            name: file.name,
            data: file.data,
            path: '/img/uploads/' + file.name
        }

        // if (!necesidad.name) {
        //     delete necesidad.name;
        // }

        //console.log("ProjectId ",ProjectId);    //ProjectId
        //console.log("idRubro ",idRubro);    //RubroId
        //console.log("factura ",factura);    //Factura
        //console.log("rubro ",rubro);    //Monto
        //console.log("Consecutivo ",consecutivo);    //Consecutivo es 'undefined' para los otros rubros

        //CREAMOS EL CONSECUTIVO
        const projectObj = await ProyectoDao.findOne({_id: ProjectId})
        //console.log(projectObj);
        if(consecutivo!='undefined'){
            //console.log("Distinto: ", consecutivo);
            projectObj.AgregarDetallesRubros[0].listaRubros.map(rubroActual => {
                if ( (String(rubroActual._id) === idRubro) ) {//Encontramos el rubro que vamos a editar
                    //console.log(rubroActual.rubro);
                    rubroActual.rubro = rubro;
                    rubroActual.factura = factura;
                    rubroActual.consecutivo = consecutivo;

                    ProyectoDao['update'](ProjectId, projectObj)
                        .then(async _Proyecto => {
                            if (!_Proyecto) {
                                res.status(404).json({message: 'Proyecto not found.'});
                            } else {
                                res.status(200).json({"Proyecto": _Proyecto});
                            }
                        }).catch(err => res.status(500).json({message: err}));
                }
            });
        }else{
            //console.log("Es undefined: ", consecutivo);
            projectObj.AgregarDetallesRubros[0].listaRubros.map(rubroActual => {
                if ( (String(rubroActual._id) === idRubro) ) {//Encontramos el rubro que vamos a editar
                    //console.log(rubroActual.rubro);
                    rubroActual.rubro = rubro;
                    rubroActual.factura = factura;
                    //console.log("Nuevo monto: ", rubroActual.rubro, "Nueva factura: ", rubroActual.factura);
                    ProyectoDao['update'](ProjectId, projectObj)
                        .then(async _Proyecto => {
                            if (!_Proyecto) {
                                res.status(404).json({message: 'Proyecto not found.'});
                            } else {
                                res.status(200).json({"Proyecto": _Proyecto});
                            }
                        }).catch(err => res.status(500).json({message: err}));
                }
            });
        }
        // projectObj.AgregarDetallesRubros.map(rubroActual => {
        //     if ((String(rubroActual._id) === idRubro) && ( (rubroActual.NombreRubro) == "Adquisición de equipos" )) {
        //         //console.log(rubroActual)
        //         const rubrosLength = ((rubroActual.listaRubros).length)
        //         const consecutivo = ((projectObj.iniciarProyecto[0].centroDeInvestigacion).substr(0,3)+"_")+(rubrosLength+1)
        //         rubroActual.listaRubros.push({rubro, factura, consecutivo}) //CREA EL GASTO Y LE AÑADE CONSECUTIVO
        //     }else if ((String(rubroActual._id) === idRubro) && ( (rubroActual.NombreRubro) != "Adquisición de equipos" )){
        //         rubroActual.listaRubros.push({rubro, factura}) //CREA EL GASTO SIN CONSECUTIVO PORQUE NO ES ADQUISICION
        //     }
        // })

        // ProyectoDao['update'](ProjectId, projectObj) //DESCOMENTAR**********************
        //     .then(async _Proyecto => {
        //         if (!_Proyecto) {
        //             res.status(404).json({message: 'Proyecto not found.'});
        //         } else {
        //             res.status(200).json({"Proyecto": _Proyecto});
        //         }
        //     }).catch(err => res.status(500).json({message: err}));

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

function getIdConv(req, res) {
    let query = req.params.id;
    ProyectoDao['getAllId'](query)
        .then(async _Proyecto => {
            res.status(200).json({"Proyectos": _Proyecto});
        })
        .catch(err => {
            res.status(500).json({message: err});
        });
}

/**
 * Método para eliminar un proyecto
 * @param req
 * @param res
 * @param next
 */
function remove(req, res, next) {
    try {
        validationResult(req).throw();

        let ProyectoId = req.params.id;

        ProyectoDao['remove'](ProyectoId)
            .then(async Proyecto => {
                if (!Proyecto) {
                    res.status(404).json({message: 'Proyecto not found.'});
                } else {
                    res.status(200).json({message: 'Proyecto deleted.'});
                }
            })
            .catch(err => res.status(500).json({message: err}));
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
    getAll,
    getById,
    create,
    getIdConv,
    update,
    updateRubro,
    removeRubro,
    patchRubro,
    remove,
};

