import chalk from 'chalk';

import db from '../database.js';

async function listarTodasCategorias(req, res){
    try {
        const categorias = await db.query(`
            SELECT * FROM categories
        `);
        res.send(categorias.rows);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function inserirCategoria(req, res){
    const {name} = req.body;
    
    try {
        await db.query(`
            INSERT INTO categories (name) VALUES ($1)
        `, [name]);
        res.sendStatus(201);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export { listarTodasCategorias, inserirCategoria }