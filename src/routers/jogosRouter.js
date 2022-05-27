import { Router } from "express";

import { inserirJogo, listarTodosJogos } from "../controllers/jogosControllers.js";

const jogosRouter = Router();

jogosRouter.get('/games', listarTodosJogos);
jogosRouter.post('/games', inserirJogo);

export default jogosRouter;