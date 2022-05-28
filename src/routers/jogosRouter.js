import { Router } from "express";

import { inserirJogo, listarTodosJogos } from "../controllers/jogosControllers.js";
import { validacaoSchemaJogo, verificacaoCategoriaEJogo } from "../middlewares/jogosMiddleware.js";

const jogosRouter = Router();

jogosRouter.get('/games', listarTodosJogos);
jogosRouter.post('/games', validacaoSchemaJogo, verificacaoCategoriaEJogo, inserirJogo);

export default jogosRouter;