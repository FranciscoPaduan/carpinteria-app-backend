import { Request, Response } from 'express';
import Gasto from '../models/gasto';

export const getGastos = async (req: Request, res: Response) => {
  try {
    const gastos = await Gasto.find().sort({ fecha: -1 });
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

export const createGasto = async (req: Request, res: Response) => {
  try {
    const gasto = new Gasto(req.body);
    await gasto.save();
    res.status(201).json(gasto);
  } catch (error: any) {
    res.status(400).json({ 
      error: 'Error al crear gasto',
      details: error.message 
    });
  }
};

export const updateGasto = async (req: Request, res: Response) => {
  try {
    const gasto = await Gasto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(gasto);
  } catch (error: any) {
    res.status(400).json({ 
      error: 'Error al actualizar gasto',
      details: error.message 
    });
  }
};

export const deleteGasto = async (req: Request, res: Response) => {
  try {
    const gasto = await Gasto.findByIdAndDelete(req.params.id);
    if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({ message: 'Gasto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};