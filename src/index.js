import express, {json} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import morgan from 'morgan';
import chalk from 'chalk';

import categoriasRouter from './routers/categoriasRouter.js';
import jogosRouter from './routers/jogosRouter.js';
import clientesRouter from './routers/clientesRouter.js';
import alugueisRouter from './routers/alugueisRouter.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(json());
app.use(morgan('dev'));

app.use(categoriasRouter);
app.use(jogosRouter);
app.use(clientesRouter);
app.use(alugueisRouter);

const port = 4000 || process.env.PORT;
app.listen(port, () => {
    console.log(chalk.green(`Server is running on port ${port}`));
});
