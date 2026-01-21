import { Router } from 'express';
import * as reportesController from '../controllers/reportes.controller';

const router = Router();

router.get('/ventas-mes', reportesController.ventasMes);
router.get('/materiales-mas-usados', reportesController.materialesMasUsados);
router.get('/stock-bajo', reportesController.stockBajo);
router.get('/ganancia-neta', reportesController.gananciaNeta);
router.get('/analisis-clientes', reportesController.analisisClientes);
router.get('/flujo-caja', reportesController.flujoCaja);
export default router;