import dayjs from 'dayjs';
import chalk from "chalk";

import db from "../database.js";

function construcaoAluguelObj(array){
    const [
        id, customerId, gameId, rentDate, daysRented, returnDate, originalPrice, 
        delayFee, customerName, gameName, categoryId, categoryName
    ] = array;

    return {
        id,
        customerId,
        gameId,
        rentDate,
        daysRented,
        returnDate,
        originalPrice,
        delayFee,
        customer: {
          id: customerId,
          name: customerName
        },
        game: {
          id: gameId,
          name: gameName,
          categoryId,
          categoryName
        }
    }
}

async function listarAluguel(req, res){  
    const {alugueisEncontrados} = res.locals;
    
    try {
        const alugueis = alugueisEncontrados.map(construcaoAluguelObj);
        res.send(alugueis);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function inserirAluguel(req, res){
    const { customerId, gameId, daysRented } = req.body;
    const dataAluguel = dayjs().format('YYYY-MM-DD');
    const [dataDevolucao, multaAtraso] = [null, null];

    try {
        const cliente = await db.query(`
            SELECT * FROM customers WHERE id = $1
        `, [customerId]);
        const [clienteId] = cliente.rows;
        if(!clienteId) return res.status(404).send(`Customer with id: ${customerId} not found`);

        const jogo = await db.query(`
            SELECT * FROM games WHERE id = $1
        `, [gameId]);
        const [jogoId] = jogo.rows;
        if(!jogoId) return res.status(404).send(`Game with id: ${gameId} not found`);

        const aluguel = await db.query(`
            SELECT * FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL
        `, [gameId]);

        if(jogoId.stockTotal > aluguel.rows.length){
            const precoDia = await db.query(`
                SELECT games."pricePerDay" FROM games WHERE id = $1
            `, [gameId]);
            const [precoDiaId] = precoDia.rows;
            if(!precoDiaId) return res.status(404).send(`Game with id: ${gameId} not found`);

            const precoTotal = precoDiaId.pricePerDay * daysRented;
            await db.query(`
                INSERT INTO rentals 
                ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [customerId, gameId, dataAluguel, daysRented, dataDevolucao, precoTotal, multaAtraso]);
            res.sendStatus(201);
        }else{
            return res.status(400).send(`Game with id: ${gameId} is out of stock`);
        }
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function finalizarAluguel(req, res){  
    const {aluguelId, multaAtraso} = res.locals;

    try {
        const dataDevolucao = dayjs().format('YYYY-MM-DD');
        await db.query(`
            UPDATE rentals SET "customerId" = $1, "gameId" = $2, "rentDate" = $3, 
            "daysRented" = $4, "returnDate" = $5, "originalPrice" = $6, "delayFee" = $7
            WHERE id = $8
        `, [
            aluguelId.customerId, aluguelId.gameId, dayjs(aluguelId.rentDate).format('YYYY-MM-DD'), 
            aluguelId.daysRented, dataDevolucao, aluguelId.originalPrice, multaAtraso, aluguelId.id
        ]);
        res.sendStatus(200);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function deletarAluguel(req, res){  
    const {id} = req.params;
    
    try {
        await db.query(`
            DELETE FROM rentals WHERE id = $1
        `, [id]);
        res.sendStatus(200);
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export { listarAluguel, inserirAluguel, finalizarAluguel, deletarAluguel }