"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCliente = exports.updateCliente = exports.createCliente = exports.getCliente = exports.getClientes = void 0;
const cliente_1 = __importDefault(require("../models/cliente"));
const getClientes = async (req, res) => {
    try {
        const { nombre } = req.query;
        const nombreStr = typeof nombre === 'string' ? nombre : '';
        const filter = nombreStr
            ? { nombre: { $regex: nombreStr, $options: 'i' } }
            : {};
        const clientes = await cliente_1.default.find(filter).sort({ createdAt: -1 });
        res.json(clientes);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};
exports.getClientes = getClientes;
const getCliente = async (req, res) => {
    try {
        const cliente = await cliente_1.default.findById(req.params.id);
        if (!cliente)
            return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(cliente);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener cliente' });
    }
};
exports.getCliente = getCliente;
const createCliente = async (req, res) => {
    try {
        // Validar duplicados por teléfono
        const existente = await cliente_1.default.findOne({
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
        const cliente = new cliente_1.default(req.body);
        await cliente.save();
        res.status(201).json(cliente);
    }
    catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(400).json({
            error: 'Error al crear cliente',
            details: error.message
        });
    }
};
exports.createCliente = createCliente;
const updateCliente = async (req, res) => {
    try {
        // Validar duplicados por teléfono (excepto el mismo cliente)
        if (req.body.telefono) {
            const existente = await cliente_1.default.findOne({
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
        const cliente = await cliente_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cliente)
            return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(cliente);
    }
    catch (error) {
        res.status(400).json({ error: 'Error al actualizar cliente' });
    }
};
exports.updateCliente = updateCliente;
const deleteCliente = async (req, res) => {
    try {
        const cliente = await cliente_1.default.findByIdAndDelete(req.params.id);
        if (!cliente)
            return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ message: 'Cliente eliminado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
};
exports.deleteCliente = deleteCliente;
