import { Router } from 'express';
import * as proyectosController from '../controllers/proyectos.controller';

const router = Router();

router.get('/', proyectosController.getProyectos);
router.get('/:id', proyectosController.getProyecto);
router.post('/', proyectosController.createProyecto);
router.put('/:id', proyectosController.updateProyecto);
router.delete('/:id', proyectosController.deleteProyecto);

export default router;

