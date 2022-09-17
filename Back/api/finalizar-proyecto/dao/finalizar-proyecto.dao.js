'use strict';

const FinalizarPrSchema = require('../model/finalizar-proyecto.model');
const mongoose = require("mongoose");

/**
 * create table finalizarpr
 */
 FinalizarPrSchema.static('create', async (finalizarpr) => {
    // console.log("Imprimiendo objObj:");
    // console.log(propiedad);
    // console.log("//////////////////////////////");
    if (typeof finalizarpr !== 'object') {
        throw new TypeError('Is not a valid object.');
    }

    let _obj = new FinalizarPrDao(finalizarpr);
    let saved = await  _obj.save();
    let __obj = await FinalizarPrDao.findOne({_id: saved._id})
    .populate('proyecto')
    .exec();
    return (__obj);
});

/**
 * getAll table finalizarpr
 */
 FinalizarPrSchema.static('getAll', async (query) => {
    try{
        return await FinalizarPrDao
            .find(query)
            .populate(['proyecto'])
            .exec();
    }catch(err){
        throw err;
    }
});

/**
 * remove table finalizarpr
 */
 FinalizarPrSchema.static('remove', async (id) =>{
    try{
        return await FinalizarPrDao.findOneAndRemove({_id: id}).exec();
    }catch (err){
        throw err;
    }
});

/**
 * patch
 */
 FinalizarPrSchema.static('update', async (id, finalizarPr) => {
    try {
        if (typeof finalizarPr !== 'object') {
            throw new TypeError('Necesidad no es un Objeto');
        }
        return await FinalizarPrDao.findOneAndUpdate({_id: id}, finalizarPr,{new: true}).exec(); //Le pasamos los parametros con req.params, procurar llamar al lado izq. tal y como en la DB
    } catch (error) {
        throw error;
    }
})

/**
 * getById
 */
 FinalizarPrSchema.static('getById', async (id) => {

    try {
        return await FinalizarPrDao
            .findOne({_id: id})
            .populate('proyecto')
            .exec();
    } catch (err) {
        throw err;
    }
});

let FinalizarPrDao = mongoose.model('finalizar-proyecto', FinalizarPrSchema);
module.exports = FinalizarPrDao;