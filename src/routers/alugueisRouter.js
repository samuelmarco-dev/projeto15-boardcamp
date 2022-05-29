import { Router } from "express";

import { deletarAluguel, finalizarAluguel, inserirAluguel, listarAluguel } from "../controllers/alugueisControllers.js";

const alugueisRouter = Router();

alugueisRouter.get('/rentals', listarAluguel);
alugueisRouter.post('/rentals', inserirAluguel);
alugueisRouter.post('/rentals/:id/return', finalizarAluguel);
alugueisRouter.delete('/rentals/:id', deletarAluguel);

export default alugueisRouter;