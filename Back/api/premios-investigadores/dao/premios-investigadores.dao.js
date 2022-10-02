'use strict';

const PremiosInvestigadoresSchema = require('../model/premios-investigadores.model');
const mongoose = require("mongoose");

/**
 * create
 */
 PremiosInvestigadoresSchema.static('create', async (premio) => {
    if (typeof premio !== 'object') {
        throw new TypeError('Is not a valid object.');
    }

    let _obj = new PremiosInvDao(premio);
    let saved = await  _obj.save();
    let __obj = await PremiosInvDao.findOne({_id: saved._id})
    .populate('Investigador')
    // .exec();
    return (__obj);
});

/**
 * getAll
 */
 PremiosInvestigadoresSchema.static('getAll', async (query) => {
    try{
        return await PremiosInvDao
            .find(query)
            .populate(['Investigador'])
            .exec();
    }catch(err){
        throw err;
    }
});

/**
 * remove
 */
 PremiosInvestigadoresSchema.static('remove', async (id) =>{
    try{
        return await PremiosInvDao.findOneAndRemove({_id: id}).exec();
    }catch (err){
        throw err;
    }
});

/**
 * getById
 */
 PremiosInvestigadoresSchema.static('getById', async (id) => {

    try {
        return await PremiosInvDao
            .findOne({_id: id})
            .populate('proyecto')
            .exec();
    } catch (err) {
        throw err;
    }
});

let PremiosInvDao = mongoose.model('premios-investigadores', PremiosInvestigadoresSchema);
module.exports = PremiosInvDao;