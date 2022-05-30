import { Router } from "express";

import { 
    deletarAluguel, finalizarAluguel, inserirAluguel, listarAluguel 
} from "../controllers/alugueisControllers.js";
import { 
    aluguelNaoDevolvido, listaAluguelQueryString, validacaoSchemaAluguel, verificarUpdate 
} from "../middlewares/alugueisMiddleware.js";

const alugueisRouter = Router();

alugueisRouter.get('/rentals', listaAluguelQueryString, listarAluguel);
alugueisRouter.post('/rentals', validacaoSchemaAluguel, inserirAluguel);
alugueisRouter.post('/rentals/:id/return', verificarUpdate, finalizarAluguel);
alugueisRouter.delete('/rentals/:id', aluguelNaoDevolvido, deletarAluguel);

export default alugueisRouter;