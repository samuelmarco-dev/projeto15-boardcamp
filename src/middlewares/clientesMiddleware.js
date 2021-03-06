import chalk from 'chalk';

import { schemaCliente } from '../schemas/clienteSchema.js';
import db from '../database.js';

export async function clienteEncontrado(req, res, next){
    const {id} = req.params;    

    try {
        const cliente = await db.query(`
            SELECT * FROM customers WHERE id = $1
        `, [id]);
        
        const [clienteId] = cliente.rows;
        if(!clienteId) return res.status(404).send(`Customer with id: ${id} not found`);
        
        res.locals.cliente = clienteId;
        next();
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

function validacaoDataNascimento(ano, mes, dia){
    const validacaoAno = Number(ano) < 1920 || Number(ano) > 2022;
    const validacaoMes = Number(mes) < 0 || Number(mes) > 12;
    const validacaoDia = Number(dia) < 1 || Number(dia) > 31;

    if(validacaoAno || validacaoMes || validacaoDia) return false;
    return true;
}

export function validacaoSchemaCliente(req, res, next){
    const {name, phone, cpf, birthday} = req.body;
    const validation = schemaCliente.validate({name, phone, cpf, birthday}, {abortEarly: false});

    const anoNascimento = validation.value.birthday;
    const arrData = anoNascimento.split('-');
    const [ano, mes, dia] = arrData;
    const validate = validacaoDataNascimento(ano, mes, dia);
    if(!validate) return res.status(400).send('Invalid data');

    const {error} = validation;
    if(error){
        return res.status(400).send(error.details.map(detail => detail.message));
    }
    next();
}

export async function usuarioJaCadastrado(req, res, next){
    const {cpf} = req.body;
    
    try {
        const clienteExiste = await db.query(`
            SELECT * FROM customers WHERE cpf = $1
        `, [cpf]);
        const [clienteCpf] = clienteExiste.rows;
        
        if(clienteCpf) return res.status(409).send('Client with this cpf already exists in the database');
        next();
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}

export async function usuarioEncontrado(req, res, next){
    const {cpf} = req.body;
    const {id} = req.params;
    
    try {
        const clienteExiste = await db.query(`
            SELECT * FROM customers WHERE id = $1
        `, [id]);
        const [clienteId] = clienteExiste.rows;

        if(!clienteId) return res.status(404).send('Client with this id does not exist in the database');
        if(Number(clienteId.cpf) !== Number(cpf) || Number(clienteId.id) !== Number(id)) {
            return res.status(401).send('Divergent cpf, you are not authorized to update this client');
        }
        next();
    } catch (error) {
        console.log(chalk.red('Erro de conexão')); //apagar
        res.sendStatus(500);
    }
}
