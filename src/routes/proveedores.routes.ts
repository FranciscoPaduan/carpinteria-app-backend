import { Router } from 'express';
import * as proveedoresController from '../controllers/proveedores.controller';

const router = Router();

router.get('/', proveedoresController.getProveedores);
router.get('/:id', proveedoresController.getProveedor);
router.post('/crear', proveedoresController.createProveedor);
router.put('/:id', proveedoresController.updateProveedor);
router.delete('/:id', proveedoresController.deleteProveedor);

export default router;