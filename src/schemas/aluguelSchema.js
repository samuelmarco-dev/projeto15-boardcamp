import joi from 'joi';

export const schemaAluguel = joi.object({
    customerId: joi.number().positive().min(1).required(),
    gameId: joi.number().positive().min(1).required(),
    daysRented: joi.number().positive().min(1).required()
});