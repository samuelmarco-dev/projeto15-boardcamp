import { Router } from 'express';
import { listarTodasCategorias, inserirCategoria } from '../controllers/categoriasControllers.js';

const categoriasRouter = Router();

categoriasRouter.get('/categories', listarTodasCategorias);
categoriasRouter.post('/categories', inserirCategoria);

export default categoriasRouter;