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
    
    try {
        
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
    try {
        
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export { listarAluguel, inserirAluguel, finalizarAluguel, deletarAluguel }