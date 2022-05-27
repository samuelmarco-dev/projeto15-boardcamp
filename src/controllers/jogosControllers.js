import chalk from "chalk";
import joi from "joi";

import db from "../database.js";

async function listarTodosJogos(req, res){
    /* 
    {
        id: 1,
        name: 'Banco Imobiliário',
        image: 'http://',
        stockTotal: 3,
        categoryId: 1,
        pricePerDay: 1500
    }
    */
    const {name} = req.query;
    console.log(chalk.blue('Parametro em query string'), name);

    if(name){
        try {
            const jogosFiltrados = await db.query(`
                SELECT games.*, categories.name AS "categoryName" 
                FROM games JOIN categories ON
                games."categoryId" = categories.id 
                WHERE games.name LIKE = '$1%'
            `, [name]);
            console.log(chalk.blue('Jogos filtrados por nome'), jogosFiltrados.rows); //apagar

            res.send(jogosFiltrados.rows);
        } catch (error) {
            console.log(chalk.red('Erro de conexão')); //apagar
            res.sendStatus(500);
        }
    }else{
        try {
            const jogos = await db.query(`
                SELECT games.*, categories.name AS "categoryName" 
                FROM games JOIN categories ON
                games."categoryId" = categories.id
            `);
            console.log(chalk.blue('Jogos encontrados'), jogos.rows); //apagar
    
            res.send(jogos.rows);
        } catch (error) {
            console.log(chalk.red('Erro de conexão')); //apagar
            res.sendStatus(500);
        }
    }
}

async function inserirJogo(req, res){
    /* 
    {
        name: 'Banco Imobiliário',
        image: 'http://',
        stockTotal: 3,
        categoryId: 1,
        pricePerDay: 1500,
    }
    */
   const {name, image, stockTotal, categoryId, pricePerDay} = req.body;

   const schemaJogo = joi.object({
       name: joi.string().required(),
       image: joi.string().uri({
           scheme: ['http', 'https', 'data' ,'.jpg', '.jpeg', '.png', '.gif']
       }).required(),
       stockTotal: joi.number().positive().min(1).required(),
       categoryId: joi.number().required(),
       pricePerDay: joi.number().positive().min(1).required()
   });

   const validation = schemaJogo.validate({name, image, stockTotal, categoryId, pricePerDay}, {abortEarly: false});
   const {error} = validation;

   if(error){
        console.log(chalk.red('Erro na validação do schema')); //apagar
        return res.status(400).send(error.details.map(detail => detail.message));
   }
    
    try {
        const categoria = await db.query(`
            SELECT * FROM categories WHERE id = $1
        `, [categoryId]);
        
        const [categoriaId] = categoria.rows;
        if(!categoriaId) return res.status(400).send('The id of this category does not exist');

        const jogo = await db.query(`
            SELECT * FROM games WHERE games.name = $1
        `, [name]);
        
        const [jogoExistente] = jogo.rows;
        if(jogoExistente) return res.status(409).send('This game already exists');

        await db.query(`
            INSERT INTO games (name, image, stockTotal, categoryId, pricePerDay)
            VALUES ($1, $2, $3, $4, $5)
        `, [name, image, stockTotal, categoryId, pricePerDay]);
        res.sendStatus(201);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export { listarTodosJogos, inserirJogo }