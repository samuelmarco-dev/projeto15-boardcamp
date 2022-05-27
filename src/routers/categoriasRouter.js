import { Router } from 'express';

import { listarTodasCategorias, inserirCategoria } from '../controllers/categoriasControllers.js';
import { categoriaJaExistente, validacaoSchemaCategoria } from '../middlewares/categoriasMiddleware.js';

const categoriasRouter = Router();

categoriasRouter.get('/categories', listarTodasCategorias);
categoriasRouter.post('/categories', validacaoSchemaCategoria, categoriaJaExistente, inserirCategoria);

export default categoriasRouter;