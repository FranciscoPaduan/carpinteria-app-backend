import { Request, Response } from 'express';
import Proveedor from '../models/Proveedor';

export const getProveedores = async (req: Request, res: Response) => {
  try {
    const proveedores = await Proveedor.find().sort({ createdAt: -1 });
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

export const getProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

export const createProveedor = async (req: Request, res: Response) => {
  try {
    // Validar duplicados por teléfono
    const existente = await Proveedor.findOne({ 
      telefono: req.body.telefono 
    });
    
    if (existente) {
      return res.status(400).json({ 
        error: `Ya existe un proveedor con el teléfono ${req.body.telefono}`,
        proveedorExistente: {
          nombre: existente.nombre,
          telefono: existente.telefono
        }
      });
    }

    const proveedor = new Proveedor(req.body);
    await proveedor.save();
    res.status(201).json(proveedor);
  } catch (error: any) {
    console.error('Error al crear proveedor:', error);
    res.status(400).json({ 
      error: 'Error al crear proveedor',
      details: error.message 
    });
  }
};

export const updateProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar proveedor' });
  }
};

export const deleteProveedor = async (req: Request, res: Response) => {
  try {
    const proveedor = await Proveedor.findByIdAndDelete(req.params.id);
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ message: 'Proveedor eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar proveedor' });
  }
};