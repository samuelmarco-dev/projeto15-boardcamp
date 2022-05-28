import chalk from "chalk";

import db from "../database.js";

async function jogosFiltrados(req, res, name){
    try {
        const jogosFiltrados = await db.query(`
            SELECT games.*, categories.name AS "categoryName" 
            FROM games JOIN categories ON
            games."categoryId" = categories.id 
            WHERE games.name LIKE '${name}%'
        `);
        console.log(chalk.blue('Jogos filtrados por nome'), jogosFiltrados.rows); //apagar
        
        if(!jogosFiltrados || jogosFiltrados.rows.length === 0){
            return res.status(404).send(`Games with parameter ${name} not found`);
        } 

        res.send(jogosFiltrados.rows);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function listarTodosJogos(req, res){
    const {name} = req.query;
    console.log(chalk.blue('Parametro em query string'), name);

    if(name){
        jogosFiltrados(req, res, name);
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
    const {name, image, stockTotal, categoryId, pricePerDay} = req.body;
    
    try {        
        await db.query(`
            INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
            VALUES ($1, $2, $3, $4, $5)
        `, [name, image, stockTotal, categoryId, pricePerDay]);
        res.sendStatus(201);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export { listarTodosJogos, inserirJogo }