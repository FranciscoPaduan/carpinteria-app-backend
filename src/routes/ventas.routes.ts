import { Router } from 'express';
import * as ventasController from '../controllers/ventas.controller';

const router = Router();

router.get('/', ventasController.getVentas);
router.get('/:id', ventasController.getVenta);
router.post('/', ventasController.createVenta);
router.patch('/:id/pagar', ventasController.pagarVenta);
router.patch('/:id/cancelar', ventasController.cancelarVenta);
router.delete('/:id', ventasController.deleteVenta);
router.post('/:id/pagos', ventasController.registrarPago);

export default router;
