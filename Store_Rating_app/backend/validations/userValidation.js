const Joi = require('joi');

const userValidation = {
    registerSchema: Joi.object({
        name: Joi.string().required().min(3).max(100),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
        address: Joi.string().allow(''),
        role: Joi.string().valid('user', 'store_owner', 'admin').default('user')
    }),

    loginSchema: Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    }),

    updateSchema: Joi.object({
        name: Joi.string().min(3).max(100),
        address: Joi.string().allow(''),
        currentPassword: Joi.string().min(6),
        newPassword: Joi.string().min(6)
    })
};

module.exports = userValidation;