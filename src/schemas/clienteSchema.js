import joi from 'joi';

const regexName = /^[a-zA-ZáéíóúàâêôãõüçÁÉÍÓÚÀÂÊÔÃÕÜÇ ]+$/;
const regexPhone = /^\d{10,11}$/;
const regexCpf = /^\d{11}$/;
const regexBirthday = /^\d{4}\-\d{2}\-\d{2}$/;

export const schemaCliente = joi.object({
    name: joi.string().pattern(regexName).required(),
    phone: joi.string().pattern(regexPhone).required(),
    cpf: joi.string().pattern(regexCpf).required(),
    birthday: joi.string().pattern(regexBirthday).required()
});