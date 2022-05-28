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
            SELECT * FROM customers WHERE cpf = $1
        `, [cpf]);
        console.log(chalk.blue('Clientes filtrados'), clientesFiltrados.rows); //apagar

        if(!clientesFiltrados || clientesFiltrados.length === 0){
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

export { listarTodosClientes, listarClienteViaId }