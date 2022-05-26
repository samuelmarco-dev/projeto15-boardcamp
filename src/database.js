import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const db = new Pool({
    host: `${process.env.HOST_SQL || '127.0.0.1'}`,
    port: process.env.PORT_SQL,
    user: process.env.USER_SQL,
    password: process.env.PASSWORD_SQL,
    database: process.env.BANCO_SQL
});

export default db;