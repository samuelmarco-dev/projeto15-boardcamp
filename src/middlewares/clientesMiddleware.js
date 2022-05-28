import chalk from 'chalk';

import db from '../database.js';

export async function clienteEncontrado(req, res, next){
    const {id} = req.params;    
    console.log(id); //apagar

    try {
        const cliente = await db.query(`
            SELECT * FROM customers WHERE id = $1
        `, [id]);

        const [clienteId] = cliente.rows;
        console.log(chalk.blue('Cliente encontrado'), clienteId); //apagar

        if(!clienteId) return res.status(404).send('Customer with id not found');
        res.locals.cliente = clienteId;

        next();
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}
