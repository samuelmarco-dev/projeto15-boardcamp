import dayjs from "dayjs";
import chalk from "chalk";

import db from "../database.js";
import { schemaAluguel } from "../schemas/aluguelSchema.js";

export async function aluguelNaoDevolvido(req, res, next){
    const {id} = req.params;
    
    try {
        const aluguel = await db.query(`
            SELECT * FROM rentals WHERE id = $1
        `, [id]);
        const [aluguelId] = aluguel.rows;
        
        if(!aluguelId) return res.status(404).send(`Rental with id: ${id} not found`);
        if(aluguelId.returnDate !== null) return res.status(400).send(`Rental with id: ${id} already returned`);
        next();
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export async function listaAluguelQueryString(req, res, next){
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
        if(!alugueisEncontrados || alugueisEncontrados.length === 0) return res.status(404).send(`Rental not found`);

        res.locals.alugueisEncontrados = alugueisEncontrados;
        next();
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export function validacaoSchemaAluguel(req, res, next){
    const { customerId, gameId, daysRented } = req.body;
    const validation = schemaAluguel.validate({customerId, gameId, daysRented}, {abortEarly: false});

    const {error} = validation;
    if(error){
        return res.status(400).send(error.details.map(detail => detail.message));
    }
    next();
}

export async function verificarUpdate(req, res, next){  
    const {id} = req.params;
    
    try {
        const aluguel = await db.query(`
            SELECT * FROM rentals WHERE id = $1
        `, [id]);
        
        const [aluguelId] = aluguel.rows;
        if(!aluguelId) return res.status(404).send(`Rental with id: ${id} not found`);
        if(aluguelId.returnDate !== null) return res.status(400).send(`Rental with id: ${id} already returned`);

        const findAluguelJogo = await db.query(`
            SELECT * FROM rentals WHERE id = $1
            AND "customerId" = $2 AND "gameId" = $3
        `, [id, aluguelId.customerId, aluguelId.gameId]); 
        
        const [findAluguelJogoId] = findAluguelJogo.rows;
        if(!findAluguelJogoId) return res.status(404).send(`Rental with id: ${id} not found`);
        if(findAluguelJogoId.returnDate !== null) return res.status(400).send(`Rental with id ${id} already returned`);

        const jogo = await db.query(`
            SELECT * FROM games WHERE id = $1
        `, [aluguelId.gameId]); 
        
        const [jogoId] = jogo.rows;
        if(!jogoId) return res.status(404).send(`Game with id: ${aluguelId.gameId} not found`);

        const dataAluguel = dayjs(aluguelId.rentDate).format('YYYY-MM-DD'); 
        const diasAlugado = aluguelId.daysRented;
        const dataEntrega = dayjs(dataAluguel).add(diasAlugado, 'day').format('YYYY-MM-DD'); 
        const dataEntregaReal = dayjs().format('YYYY-MM-DD'); 

        let multaAtraso;
        if(dataEntregaReal <= dataEntrega){
            multaAtraso = null;
        }else{
            const diferencaTempo = dataEntregaReal.getTime() - dataEntrega.getTime();
            const diferencaDias = Number(diferencaTempo / (1000 * 60 * 60 * 24));
            const precoDia = jogoId.pricePerDay;
            multaAtraso = diferencaDias * precoDia;
        }

        res.locals.aluguelId = aluguelId;
        res.locals.multaAtraso = multaAtraso;
        next();
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}