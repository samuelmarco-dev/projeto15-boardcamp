import { Router } from "express";

import { listarTodosClientes } from "../controllers/clientesControllers.js";

const clientesRouter = Router();

clientesRouter.get('/customers', listarTodosClientes);
clientesRouter.get('/customers/:id');
clientesRouter.post('/customers');
clientesRouter.put('/customers/:id');

export default clientesRouter;