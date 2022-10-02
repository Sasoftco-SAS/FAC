'use strict';

const BienesSchema = require('../model/bienes-servicios.model');
const mongoose = require("mongoose");

/**
 * create
 */
 BienesSchema.static('create', async (bienes) => {
    if (typeof bienes !== 'object') {
        throw new TypeError('Is not a valid object.');
    }

    let _obj = new BienesDao(bienes);
    let saved = await  _obj.save();
    let __obj = await BienesDao.findOne({_id: saved._id})
    .populate('proyecto')
    // .exec();
    return (__obj);
});

/**
 * getAll
 */
 BienesSchema.static('getAll', async (query) => {
    try{
        return await BienesDao
            .find(query)
            .populate(['proyecto'])
            .exec();
    }catch(err){
        throw err;
    }
});

/**
 * remove
 */
 BienesSchema.static('remove', async (id) =>{
    try{
        return await BienesDao.findOneAndRemove({_id: id}).exec();
    }catch (err){
        throw err;
    }
});

/**
 * getById
 */
 BienesSchema.static('getById', async (id) => {

    try {
        return await BienesDao
            .findOne({_id: id})
            .populate('proyecto')
            .exec();
    } catch (err) {
        throw err;
    }
});

let BienesDao = mongoose.model('bienes-servicios', BienesSchema);
module.exports = BienesDao;