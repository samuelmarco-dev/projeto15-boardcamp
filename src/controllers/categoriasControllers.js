import chalk from 'chalk';
import joi from 'joi';

import db from '../database.js';

async function listarTodasCategorias(req, res){
    /* 
        {
            id: 1,
            name: 'Estratégia',
        }
    */

    try {
        const categorias = await db.query(`
            SELECT * FROM categories
        `);
        console.log(chalk.blue('Categorias encontradas', categorias.rows)); //apagar

        res.send(categorias.rows);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function inserirCategoria(req, res){
    /* 
        {
            name: 'Investigação'
        }
    */
    
    const {name} = req.body;
    const regexCategoria = /^[a-zA-ZáéíóúàâêôãõüçÁÉÍÓÚÀÂÊÔÃÕÜÇ ]+$/;

    const schemaCategoteria = joi.object({
        name: joi.string().pattern(regexCategoria).required()
    });
    const validation = schemaCategoteria.validate({name}, {abortEarly: false});
    
    const {error} = validation;
    if(error){
        console.log(chalk.red('Erro na validação do schema')); //apagar
        return res.status(400).send(error.details.map(detail => detail.message));
    }
    
    try {
        const categorias = await db.query(`
            SELECT categories.name FROM categories
        `);

        const array = categorias.rows;
        const categoriaExistente = array.find(item => item === name);
        if(categoriaExistente){
            console.log(chalk.red('Categoria já existente', categoriaExistente)); //apagar
            return res.status(409).send('This category already exists');
        }
    
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