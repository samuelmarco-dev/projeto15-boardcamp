import chalk from 'chalk';

import db from '../database.js';
import { schemaCategoteria } from "../schemas/categoriasSchema.js";

export function validacaoSchemaCategoria(req, res, next){
    const {name} = req.body;
    const validation = schemaCategoteria.validate({name}, {abortEarly: false});
    
    const {error} = validation;
    if(error){
        console.log(chalk.red('Erro na validação do schema')); //apagar
        return res.status(400).send(error.details.map(detail => detail.message));
    }
    next();
}

export async function categoriaJaExistente(req, res, next){
    const {name} = req.body; 

    try {
        const categorias = await db.query(`
            SELECT categories.name FROM categories
        `);
        const array = categorias.rows;
        const categoriaExistente = array.find(item => item.name === name);
        
        if(categoriaExistente){
            console.log(chalk.red('Categoria já existente'), categoriaExistente); //apagar
            return res.status(409).send('This category already exists');
        }
        next();
    } catch (error) {
        res.sendStatus(500);
    }
}
