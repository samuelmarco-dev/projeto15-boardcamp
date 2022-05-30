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

function construcaoAluguelObj(array){
    console.log(array); //apagar
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
    const {customerId, gameId} = req.query;
    let getAlugueisEncontrados;

    try {
        if(customerId){
            getAlugueisEncontrados = await db.query({
                text: `
                SELECT rentals.*, customers.name, games.name, categories.* FROM rentals
                JOIN customers ON customers.id = rentals."customerId"
                JOIN games ON games.id = rentals."gameId"
                JOIN categories ON categories.id = games."categoryId"
                WHERE rentals."customerId" = $1
            `, rowMode: 'array'
            }, [customerId]);
        }
        if(gameId){
            getAlugueisEncontrados = await db.query({
                text: `
                SELECT rentals.*, customers.name, games.name, categories.* FROM rentals
                JOIN customers ON customers.id = rentals."customerId"
                JOIN games ON games.id = rentals."gameId"
                JOIN categories ON categories.id = games."categoryId"
                WHERE rentals."gameId" = $1
            `, rowMode: 'array'
            }, [gameId]);
        }
        if(customerId && gameId){
            getAlugueisEncontrados = await db.query({
                text: `
                SELECT rentals.*, customers.name, games.name, categories.* FROM rentals
                JOIN customers ON customers.id = rentals."customerId"
                JOIN games ON games.id = rentals."gameId"
                JOIN categories ON categories.id = games."categoryId"
                WHERE rentals."customerId" = $1 AND rentals."gameId" = $2
            `, rowMode: 'array'
            }, [customerId, gameId]);
        }
        if(!customerId && !gameId){
            getAlugueisEncontrados = await db.query({
                text: `
                SELECT rentals.*, customers.name, games.name, categories.* FROM rentals
                JOIN customers ON customers.id = rentals."customerId"
                JOIN games ON games.id = rentals."gameId"
                JOIN categories ON categories.id = games."categoryId"
            `, rowMode: 'array'
            });
        }

        const alugueisEncontrados = getAlugueisEncontrados.rows;
        console.log(alugueisEncontrados); //apagar
        if(!alugueisEncontrados || alugueisEncontrados.length === 0) return res.status(404).send(`Rental not found`);

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
        console.log(clienteId); //apagar

        const jogo = await db.query(`
            SELECT * FROM games WHERE id = $1
        `, [gameId]);
        const [jogoId] = jogo.rows;
        if(!jogoId) return res.status(404).send(`Game with id: ${gameId} not found`);
        console.log(jogoId); //apagar

        const aluguel = await db.query(`
            SELECT * FROM rentals WHERE "gameId" = $1 AND "returnDate" IS NULL
        `, [gameId]);
        console.log(aluguel.rows); //apagar

        if(jogoId.stockTotal > aluguel.rows.length){
            const precoDia = await db.query(`
                SELECT games."pricePerDay" FROM games WHERE id = $1
            `, [gameId]);
            const [precoDiaId] = precoDia.rows;
            if(!precoDiaId) return res.status(404).send(`Game with id: ${gameId} not found`);
            console.log(precoDiaId); //apagar

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
    const {id} = req.params;
    const dataDevolucao = dayjs().format('YYYY-MM-DD');
    
    try {
        const aluguel = await db.query(`
            SELECT * FROM rentals WHERE id = $1
        `, [id]);
        
        const [aluguelId] = aluguel.rows;
        if(!aluguelId) return res.status(404).send(`Rental with id: ${id} not found`);
        if(aluguelId.returnDate !== null) return res.status(400).send(`Rental with id: ${id} already returned`);
        console.log(aluguelId); //apagar

        const findAluguelJogo = await db.query(`
            SELECT * FROM rentals WHERE id = $1
            AND "customerId" = $2 AND "gameId" = $3
        `, [id, aluguelId.customerId, aluguelId.gameId]); 
        
        const [findAluguelJogoId] = findAluguelJogo.rows;
        if(!findAluguelJogoId) return res.status(404).send(`Rental with id: ${id} not found`);
        if(findAluguelJogoId.returnDate !== null) return res.status(400).send(`Rental with id ${id} already returned`);
        console.log(findAluguelJogoId); //apagar

        const jogo = await db.query(`
            SELECT * FROM games WHERE id = $1
        `, [aluguelId.gameId]); 
        
        const [jogoId] = jogo.rows;
        if(!jogoId) return res.status(404).send(`Game with id: ${aluguelId.gameId} not found`);
        console.log(jogoId); //apagar

        const dataAluguel = dayjs(aluguelId.rentDate).format('YYYY-MM-DD'); 
        const diasAlugado = aluguelId.daysRented;
        console.log(dataAluguel, diasAlugado); //apagar
        
        const dataEntrega = dayjs(dataAluguel).add(diasAlugado, 'day').format('YYYY-MM-DD'); 
        const dataEntregaReal = dayjs().format('YYYY-MM-DD'); 
        console.log(dataEntrega, dataEntregaReal); //apagar

        let multaAtraso;
        if(dataEntregaReal < dataEntrega){
            multaAtraso = null;
        }else{
            const diferencaTempo = dataEntregaReal.getTime() - dataEntrega.getTime();
            const diferencaDias = Number(diferencaTempo / (1000 * 60 * 60 * 24));
            const precoDia = jogoId.pricePerDay;
            multaAtraso = diferencaDias * precoDia;
        }

        console.log(multaAtraso); //apagar
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