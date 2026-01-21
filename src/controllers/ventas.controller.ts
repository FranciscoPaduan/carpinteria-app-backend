import { Request, Response } from 'express';
import Venta from '../models/venta';
import Proyecto from '../models/proyecto';

export const getVentas = async (req: Request, res: Response) => {
  try {
    const ventas = await Venta.find()
      .populate('cliente')
      .populate('proyecto')
      .sort({ createdAt: -1 });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

export const getVenta = async (req: Request, res: Response) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('cliente')
      .populate('proyecto');
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener venta' });
  }
};

export const createVenta = async (req: Request, res: Response) => {
  try {
    if (!req.body.proyecto) {
      return res.status(400).json({ 
        error: 'El proyecto es obligatorio para crear una venta' 
      });
    }

    const proyecto = await Proyecto.findById(req.body.proyecto);
    if (!proyecto) {
      return res.status(404).json({ 
        error: 'Proyecto no encontrado' 
      });
    }

    if (proyecto.estado !== 'disponible') {
      return res.status(400).json({ 
        error: `El proyecto no está disponible. Estado actual: ${proyecto.estado}` 
      });
    }

    const venta = new Venta({
      ...req.body,
      pagos: [],
      saldoPendiente: req.body.total
    });
    
    await venta.save();
    await Proyecto.findByIdAndUpdate(req.body.proyecto, { estado: 'vendido' });
    await venta.populate(['cliente', 'proyecto']);
    
    res.status(201).json(venta);
  } catch (error: any) {
    console.error('Error al crear venta:', error);
    res.status(400).json({ 
      error: 'Error al crear venta',
      details: error.message 
    });
  }
};

export const pagarVenta = async (req: Request, res: Response) => {
  try {
    const venta = await Venta.findById(req.params.id);
    
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    if (venta.estado === 'cancelada') {
      return res.status(400).json({ error: 'No se puede marcar como pagada una venta cancelada' });
    }

    if (venta.estado === 'pagada') {
      return res.status(400).json({ error: 'La venta ya está marcada como pagada' });
    }

    // Registrar pago del saldo restante
    venta.pagos.push({
      monto: venta.saldoPendiente,
      fecha: new Date(),
      metodoPago: 'Pago completo',
      observaciones: 'Saldado mediante endpoint marcar como pagada'
    });

    venta.saldoPendiente = 0;
    venta.estado = 'pagada';
    
    await venta.save();
    await venta.populate(['cliente', 'proyecto']);

    res.json({
      message: 'Venta marcada como pagada',
      venta
    });
  } catch (error: any) {
    console.error('Error al marcar venta como pagada:', error);
    res.status(500).json({ 
      error: 'Error al marcar venta como pagada',
      details: error.message 
    });
  }
};

export const cancelarVenta = async (req: Request, res: Response) => {
  try {
    const venta = await Venta.findById(req.params.id);
    
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    if (venta.estado === 'cancelada') {
      return res.status(400).json({ error: 'La venta ya está cancelada' });
    }

    // Si tenía proyecto, devolverlo a disponible
    if (venta.proyecto) {
      await Proyecto.findByIdAndUpdate(venta.proyecto, { estado: 'disponible' });
    }

    venta.estado = 'cancelada';
    await venta.save();
    await venta.populate(['cliente', 'proyecto']);

    res.json({
      message: 'Venta cancelada y proyecto restaurado',
      venta
    });
  } catch (error: any) {
    console.error('Error al cancelar venta:', error);
    res.status(500).json({ 
      error: 'Error al cancelar venta',
      details: error.message 
    });
  }
};

export const deleteVenta = async (req: Request, res: Response) => {
  try {
    const venta = await Venta.findById(req.params.id);
    
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    if (venta.estado !== 'cancelada') {
      return res.status(400).json({ 
        error: 'Solo se pueden eliminar ventas canceladas' 
      });
    }

    await Venta.findByIdAndDelete(req.params.id);
    res.json({ message: 'Venta eliminada' });
  } catch (error: any) {
    console.error('Error al eliminar venta:', error);
    res.status(500).json({ 
      error: 'Error al eliminar venta',
      details: error.message 
    });
  }
};

export const registrarPago = async (req: Request, res: Response) => {
  try {
    const venta = await Venta.findById(req.params.id);
    
    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    if (venta.estado === 'cancelada') {
      return res.status(400).json({ error: 'No se puede registrar pago en venta cancelada' });
    }

    const montoPago = Number(req.body.monto);
    
    if (montoPago <= 0) {
      return res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    }

    if (montoPago > venta.saldoPendiente) {
      return res.status(400).json({ 
        error: `El monto ($${montoPago}) excede el saldo pendiente ($${venta.saldoPendiente})` 
      });
    }

    venta.pagos.push({
      monto: montoPago,
      fecha: req.body.fecha || new Date(),
      metodoPago: req.body.metodoPago,
      observaciones: req.body.observaciones
    });

    venta.saldoPendiente -= montoPago;

    // Si pagó todo, marcar como pagada
    if (venta.saldoPendiente === 0) {
      venta.estado = 'pagada';
    }

    await venta.save();
    await venta.populate(['cliente', 'proyecto']);

    res.json({
      message: 'Pago registrado exitosamente',
      venta
    });
  } catch (error: any) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ 
      error: 'Error al registrar pago',
      details: error.message 
    });
  }
};