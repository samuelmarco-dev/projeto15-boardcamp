import express, {json} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import morgan from 'morgan';
import chalk from 'chalk';

dotenv.config();
const app = express();
app.use(cors());
app.use(json());
app.use(morgan('dev'))

const port = 4000 || process.env.PORT;
app.listen(port, () => {
    console.log(chalk.green(`Server is running on port ${port}`));
});
