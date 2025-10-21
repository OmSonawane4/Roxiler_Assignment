const Joi = require('joi');

const ratingValidation = {
    ratingSchema: Joi.object({
        rating: Joi.number().required().min(0).max(5),
        comment: Joi.string().allow('').max(500)
    }),

    updateSchema: Joi.object({
        rating: Joi.number().min(0).max(5),
        comment: Joi.string().allow('').max(500)
    })
};

module.exports = ratingValidation;