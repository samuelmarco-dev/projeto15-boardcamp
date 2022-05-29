import chalk from "chalk";

import db from "../database.js";

async function clientesFiltrados(req, res, cpf){
    try {
        const clientesFiltrados = await db.query(`
            SELECT * FROM customers WHERE cpf LIKE '${cpf}%'
        `);
        console.log(chalk.blue('Clientes filtrados'), clientesFiltrados.rows); //apagar

        if(!clientesFiltrados || clientesFiltrados.rows.length === 0){
            return res.status(404).send(`Customers with parameter cpf: ${cpf} not found`);
        }

        res.send(clientesFiltrados.rows);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function listarTodosClientes(req, res){
    const {cpf} = req.query;

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

    try {
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

async function atualizarCliente(req, res){
    const {name, phone, cpf, birthday} = req.body;
    const {id} = req.params;

    try {
        await db.query(`
            UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4
            WHERE id = $5 and cpf = '${cpf}'
        `, [name, phone, cpf, birthday, id]);
        res.sendStatus(200);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export { listarTodosClientes, listarClienteViaId, inserirCliente, atualizarCliente }