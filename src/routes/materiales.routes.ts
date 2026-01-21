import { Router } from 'express';
import * as materialesController from '../controllers/materiales.controller';

const router = Router();

router.get('/', materialesController.getMateriales);
router.get('/:id', materialesController.getMaterial);
router.post('/', materialesController.createMaterial);
router.put('/:id', materialesController.updateMaterial);
router.delete('/:id', materialesController.deleteMaterial);
router.get('/:id/historial', materialesController.getHistorialPrecios);
router.post('/:id/proveedores', materialesController.agregarProveedorMaterial);
router.put('/:id/proveedores/:proveedorId', materialesController.actualizarProveedorMaterial);

export default router;
