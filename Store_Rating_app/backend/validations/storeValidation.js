const Joi = require('joi');

const storeValidation = {
    storeSchema: Joi.object({
        name: Joi.string().required().min(3).max(100),
        address: Joi.string().required(),
        description: Joi.string().allow(''),
        is_active: Joi.boolean().default(true)
    }),

    updateSchema: Joi.object({
        name: Joi.string().min(3).max(100),
        address: Joi.string(),
        description: Joi.string().allow(''),
        is_active: Joi.boolean()
    })
};

module.exports = storeValidation;