import dayjs from 'dayjs';
import joi from 'joi';
import chalk from "chalk";

import db from "../database.js";

/* 
{
  id: 1,
  customerId: 1,             // id do cliente
  gameId: 1,                 // id do jogo
  rentDate: '2021-06-20',    // data em que o aluguel foi feito
  daysRented: 3,             // por quantos dias o cliente agendou o aluguel
  returnDate: null,          // data que o cliente devolveu o jogo (null enquanto não devolvido)
  originalPrice: 4500,       // preço total do aluguel em centavos (dias alugados vezes o preço por dia do jogo)
  delayFee: null             // multa total paga por atraso (dias que passaram do prazo vezes o preço por dia do jogo)
}
*/

async function listarAluguel(req, res){  
    try {
        
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function inserirAluguel(req, res){
    const { customerId, gameId, daysRented } = req.body;
    const dataAluguel = dayjs().format('YYYY-MM-DD');
    const [dataDevolucao, multaAtraso] = [null, null];
    
    const schemaAluguel = joi.object({
        customerId: joi.number().positive().min(1).required(),
        gameId: joi.number().positive().min(1).required(),
        daysRented: joi.number().positive().min(1).required()
    });
    const validation = schemaAluguel.validate({customerId, gameId, daysRented}, {abortEarly: false});

    const {error} = validation;
    if(error){
        console.log(chalk.red('Erro de validação')); //apagar
        return res.status(400).send(error.details.map(detail => detail.message));
    }

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

        if(jogo.stockTotal > aluguel.rows.length){
            const precoDia = await db.query(`
                SELECT * FROM games WHERE id = $1
            `, [gameId]);
            const [precoDiaId] = precoDia.rows;
            if(!precoDiaId) return res.status(404).send(`Game with id: ${gameId} not found`);

            const precoTotal = precoDiaId.pricePerDay * daysRented;
            await db.query(`
                SELECT INTO rentals 
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
    try {
        
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

async function deletarAluguel(req, res){  
    const {id} = req.params;
    
    try {
        const aluguel = await db.query(`
            SELECT * FROM rentals WHERE id = $1
        `, [id]);
        const [aluguelId] = aluguel.rows;
        
        if(!aluguelId) return res.status(404).send(`Rental with id: ${id} not found`);
        if(aluguelId.returnDate !== null) return res.status(400).send(`Rental with id: ${id} already returned`);

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