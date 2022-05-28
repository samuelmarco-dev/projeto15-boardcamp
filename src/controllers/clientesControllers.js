import joi from 'joi';
import chalk from "chalk";

import db from "../database.js";

/* 
{
  id: 1,
  name: 'João Alfredo',
  phone: '21998899222',
  cpf: '01234567890',
  birthday: '1992-10-05'
}
*/

async function clientesFiltrados(req, res, cpf){
    try {
        const clientesFiltrados = await db.query(`
            SELECT * FROM customers WHERE cpf LIKE '${cpf}%'
        `);
        console.log(chalk.blue('Clientes filtrados'), clientesFiltrados.rows); //apagar

        if(!clientesFiltrados || clientesFiltrados.rows.length === 0){
            return res.status(404).send(`Customers with parameter ${cpf} not found`);
        }

        res.send(clientesFiltrados.rows);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function listarTodosClientes(req, res){
    const {cpf} = req.query;
    console.log(cpf);
    
    if(cpf){
        clientesFiltrados(req, res, cpf);
    }else{
        try {
            const clientes = await db.query(`
                SELECT * FROM customers
            `);
            console.log(chalk.blue('Clientes encontrados'), clientes.rows); //apagar

            res.send(clientes.rows);
        } catch (error) {
            console.log(chalk.red('Erro de conexão')); //apagar
            res.sendStatus(500);
        }
    }
}

async function listarClienteViaId(req, res){
    try {
        const {cliente} = res.locals;
        res.send(cliente);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function inserirCliente(req, res){
    const {name, phone, cpf, birthday} = req.body;

    const regexName = /^[a-zA-ZáéíóúàâêôãõüçÁÉÍÓÚÀÂÊÔÃÕÜÇ ]+$/;
    const regexPhone = /^\d{10,11}$/;
    const regexCpf = /^\d{11}$/;
    const regexBirthday = /^\d{4}\-\d{2}\-\d{2}$/;

    const schemaCliente = joi.object({
        name: joi.string().pattern(regexName).required(),
        phone: joi.string().pattern(regexPhone).required(),
        cpf: joi.string().pattern(regexCpf).required(),
        birthday: joi.string().pattern(regexBirthday).required()
    });

    const validation = schemaCliente.validate({name, phone, cpf, birthday}, {abortEarly: false});

    const {error} = validation;
    if(error){
        console.log(chalk.red('Erro na validação do schema')); //apagar
        return res.status(400).send(error.details.map(detail => detail.message));
    }

    try {
        console.log('Posso fazer a request');
        const clienteExiste = await db.query(`
            SELECT * FROM customers WHERE cpf = $1
        `, [cpf]);
        
        const [clienteCpf] = clienteExiste.rows;
        if(clienteCpf) return res.status(409).send('Client with this cpf already exists in the database');

        await db.query(`
            INSERT INTO customers (name, phone, cpf, birthday)
            VALUES ($1, $2, $3, $4) 
        `, [name, phone, cpf, birthday]);
        res.sendStatus(201);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export { listarTodosClientes, listarClienteViaId, inserirCliente }