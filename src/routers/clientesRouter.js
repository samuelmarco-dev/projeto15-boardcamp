import { Router } from "express";

import { inserirCliente, listarClienteViaId, listarTodosClientes } from "../controllers/clientesControllers.js";
import { clienteEncontrado } from "../middlewares/clientesMiddleware.js";

const clientesRouter = Router();

clientesRouter.get('/customers', listarTodosClientes);
clientesRouter.get('/customers/:id', clienteEncontrado, listarClienteViaId);
clientesRouter.post('/customers', inserirCliente);
clientesRouter.put('/customers/:id');

export default clientesRouter;