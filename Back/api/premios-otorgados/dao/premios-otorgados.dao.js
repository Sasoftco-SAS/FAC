'use strict';

const PremiosOtorgadosSchema = require('../model/premios-otorgados.model');
const mongoose = require("mongoose");

/**
 * create
 */
 PremiosOtorgadosSchema.static('create', async (premio) => {
    if (typeof premio !== 'object') {
        throw new TypeError('Is not a valid object.');
    }

    let _obj = new PremiosInvDao(premio);
    let saved = await  _obj.save();
    let __obj = await PremiosInvDao.findOne({_id: saved._id})
    .populate('investigador')
    // .exec();
    return (__obj);
});

/**
 * getAll
 */
 PremiosOtorgadosSchema.static('getAll', async (query) => {
    try{
        return await PremiosInvDao
            .find(query)
            .populate(['investigador'])
            .exec();
    }catch(err){
        throw err;
    }
});

/**
 * remove
 */
 PremiosOtorgadosSchema.static('remove', async (id) =>{
    try{
        return await PremiosInvDao.findOneAndRemove({_id: id}).exec();
    }catch (err){
        throw err;
    }
});

/**
 * getById
 */
 PremiosOtorgadosSchema.static('getById', async (id) => {

    try {
        return await PremiosInvDao
            .findOne({_id: id})
            .populate('proyecto')
            .exec();
    } catch (err) {
        throw err;
    }
});

let PremiosInvDao = mongoose.model('otorgar-premio-investigador', PremiosOtorgadosSchema);
module.exports = PremiosInvDao;