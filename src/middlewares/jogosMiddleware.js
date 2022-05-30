import chalk from "chalk";

import { schemaJogo } from "../schemas/jogoSchema.js";
import db from "../database.js";

export function validacaoSchemaJogo(req, res, next){
    const {name, image, stockTotal, categoryId, pricePerDay} = req.body;
    const validation = schemaJogo.validate({name, image, stockTotal, categoryId, pricePerDay}, {abortEarly: false});
    
    const {error} = validation;
    if(error){
        return res.status(400).send(error.details.map(detail => detail.message));
    }
    next();
}

export async function verificacaoCategoriaEJogo(req, res, next){
    const {name, categoryId} = req.body;

    try {
        const categoria = await db.query(`
            SELECT * FROM categories WHERE id = $1
        `, [categoryId]);
        
        const [categoriaId] = categoria.rows;
        if(!categoriaId) return res.status(400).send('The id of this category does not exist');

        const jogo = await db.query(`
            SELECT * FROM games WHERE name = $1
        `, [name]);

        const [jogoExistente] = jogo.rows;
        if(jogoExistente) return res.status(409).send('This game already exists');
        next();
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}
