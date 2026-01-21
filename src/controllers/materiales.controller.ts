import { Request, Response } from 'express';
import Material from '../models/material';
import HistorialPrecio from '../models/HistorialPrecio';
import Proveedor from '../models/Proveedor';


export const getMateriales = async (req: Request, res: Response) => {
  try {
    const materiales = await Material.find().sort({ createdAt: -1 });
    res.json(materiales);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener materiales' });
  }
};

export const getMaterial = async (req: Request, res: Response) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material no encontrado' });
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener material' });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const material = new Material(req.body);
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear material' });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const materialViejo = await Material.findById(req.params.id);
    if (!materialViejo) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    // Si cambió el precio, guardar en historial
    if (req.body.precioUnitario && req.body.precioUnitario !== materialViejo.precioUnitario) {
      const historial = new HistorialPrecio({
        material: req.params.id,
        precioAnterior: materialViejo.precioUnitario,
        precioNuevo: req.body.precioUnitario
      });
      await historial.save();
    }

    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(material);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar material' });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material no encontrado' });
    res.json({ message: 'Material eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar material' });
  }
};

export const getHistorialPrecios = async (req: Request, res: Response) => {
  try {
    const historial = await HistorialPrecio.find({ material: req.params.id })
      .populate('material')
      .sort({ fecha: -1 });
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial de precios' });
  }
};

export const agregarProveedorMaterial = async (req: Request, res: Response) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    // Verificar que el proveedor existe
    const proveedor = await Proveedor.findById(req.body.proveedor);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Verificar si ya existe
    const existe = material.proveedores.find(
      p => p.proveedor.toString() === req.body.proveedor
    );

    if (existe) {
      return res.status(400).json({ 
        error: 'Este proveedor ya está asociado a este material' 
      });
    }

    material.proveedores.push({
      proveedor: req.body.proveedor,
      precio: req.body.precio,
      activo: true
    });

    await material.save();
    await material.populate('proveedores.proveedor');
    
    res.json(material);
  } catch (error: any) {
    console.error('Error al agregar proveedor:', error);
    res.status(400).json({ 
      error: 'Error al agregar proveedor',
      details: error.message 
    });
  }
};

export const actualizarProveedorMaterial = async (req: Request, res: Response) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    const proveedorIndex = material.proveedores.findIndex(
      p => p.proveedor.toString() === req.params.proveedorId
    );

    if (proveedorIndex === -1) {
      return res.status(404).json({ error: 'Proveedor no encontrado en este material' });
    }

    material.proveedores[proveedorIndex].precio = req.body.precio;
    material.proveedores[proveedorIndex].activo = req.body.activo ?? material.proveedores[proveedorIndex].activo;

    await material.save();
    await material.populate('proveedores.proveedor');
    
    res.json(material);
  } catch (error: any) {
    console.error('Error al actualizar proveedor:', error);
    res.status(400).json({ 
      error: 'Error al actualizar proveedor',
      details: error.message 
    });
  }
};