import { Router } from 'express';
import * as gastosController from '../controllers/gastos.controller';

const router = Router();

router.get('/', gastosController.getGastos);
router.post('/', gastosController.createGasto);
router.delete('/:id', gastosController.deleteGasto);
router.put('/:id', gastosController.updateGasto);

export default router;