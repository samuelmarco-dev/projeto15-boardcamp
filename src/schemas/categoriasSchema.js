import joi from 'joi';

const regexCategoria = /^[a-zA-ZáéíóúàâêôãõüçÁÉÍÓÚÀÂÊÔÃÕÜÇ ]+$/;

export const schemaCategoteria = joi.object({
    name: joi.string().pattern(regexCategoria).required()
});