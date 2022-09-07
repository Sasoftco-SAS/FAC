'use strict';

const NotificacionSchema = require('../model/notificacion.model');
const mongoose = require("mongoose");

/**
 * create a notificacion
 */
 NotificacionSchema.static('create', async (notificacion) => {
    // console.log("Imprimiendo objObj:");
    // console.log(propiedad);
    // console.log("//////////////////////////////");
    if (typeof notificacion !== 'object') {
        throw new TypeError('notificacion is not a valid object.');
    }

    let _obj = new NotificacionDao(notificacion);
    let saved = await  _obj.save();
    let __obj = await NotificacionDao.findOne({_id: saved._id})
    .populate('user')
    .exec();
    return (__obj);
});

/**
 * getAll notificacion
 */

 NotificacionSchema.static('getAll', async (query) => {
    try{
        return await NotificacionDao
            .find(query)
            .populate(['user']) //Consulta en las otras tablas para traer los objetos y poder retornar sus enlaces
            .exec();
    }catch(err){
        throw err;
    }
})

/**
 * remove propiedadint
 */
 NotificacionSchema.static('remove', async (id) =>{
    try{
        return await NotificacionDao.findOneAndRemove({_id: id}).exec();
    }catch (err){
        throw err;
    }
});

let NotificacionDao = mongoose.model('notificacion', NotificacionSchema);
module.exports = NotificacionDao;