import { Router } from "express";

import { 
    atualizarCliente, inserirCliente, listarClienteViaId, listarTodosClientes 
} from "../controllers/clientesControllers.js";
import { clienteEncontrado, usuarioEncontrado, usuarioJaCadastrado, validacaoSchemaCliente } from "../middlewares/clientesMiddleware.js";

const clientesRouter = Router();

clientesRouter.get('/customers', listarTodosClientes);
clientesRouter.get('/customers/:id', clienteEncontrado, listarClienteViaId);
clientesRouter.post('/customers', validacaoSchemaCliente, usuarioJaCadastrado, inserirCliente);
clientesRouter.put('/customers/:id', validacaoSchemaCliente, usuarioEncontrado, atualizarCliente);

export default clientesRouter;