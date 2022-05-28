import joi from 'joi';

export const schemaJogo = joi.object({
    name: joi.string().required(),
    image: joi.string().uri({
        scheme: ['http', 'https', 'data' ,'.jpg', '.jpeg', '.png', '.gif']
    }).required(),
    stockTotal: joi.number().positive().min(1).required(),
    categoryId: joi.number().required(),
    pricePerDay: joi.number().positive().min(1).required()
});