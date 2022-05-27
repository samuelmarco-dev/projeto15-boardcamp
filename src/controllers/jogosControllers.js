import chalk from "chalk";

import db from "../database.js";

async function listarTodosJogos(req, res){
    /* 
    {
            id: 1,
            name: 'Banco Imobiliário',
            image: 'http://',
            stockTotal: 3,
            categoryId: 1,
            pricePerDay: 1500,
    }
    */
    const {name} = req.query;

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
    try {
        
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export { listarTodosJogos, inserirJogo }