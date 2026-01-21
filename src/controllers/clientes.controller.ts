import { Request, Response } from 'express';
import Cliente from '../models/cliente';

export const getClientes = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.query;
    const nombreStr = typeof nombre === 'string' ? nombre : '';
    const filter = nombreStr 
      ? { nombre: { $regex: nombreStr, $options: 'i' } }
      : {};
    
    const clientes = await Cliente.find(filter).sort({ createdAt: -1 });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

export const getCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

export const createCliente = async (req: Request, res: Response) => {
  try {
    // Validar duplicados por teléfono
    const existente = await Cliente.findOne({ 
      telefono: req.body.telefono 
    });
    
    if (existente) {
      return res.status(400).json({ 
        error: `Ya existe un cliente con el teléfono ${req.body.telefono}`,
        clienteExistente: {
          nombre: existente.nombre,
          telefono: existente.telefono
        }
      });
    }

    const cliente = new Cliente(req.body);
    await cliente.save();
    res.status(201).json(cliente);
  } catch (error: any) {
    console.error('Error al crear cliente:', error);
    res.status(400).json({ 
      error: 'Error al crear cliente',
      details: error.message 
    });
  }
};

export const updateCliente = async (req: Request, res: Response) => {
  try {
    // Validar duplicados por teléfono (excepto el mismo cliente)
    if (req.body.telefono) {
      const existente = await Cliente.findOne({ 
        telefono: req.body.telefono,
        _id: { $ne: req.params.id }
      });
      
      if (existente) {
        return res.status(400).json({ 
          error: `Ya existe otro cliente con el teléfono ${req.body.telefono}`,
          clienteExistente: {
            nombre: existente.nombre,
            telefono: existente.telefono
          }
        });
      }
    }

    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar cliente' });
  }
};

export const deleteCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};