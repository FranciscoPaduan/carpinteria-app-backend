"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarPago = exports.deleteVenta = exports.cancelarVenta = exports.pagarVenta = exports.createVenta = exports.getVenta = exports.getVentas = void 0;
const venta_1 = __importDefault(require("../models/venta"));
const proyecto_1 = __importDefault(require("../models/proyecto"));
const getVentas = async (req, res) => {
    try {
        const ventas = await venta_1.default.find()
            .populate('cliente')
            .populate('proyecto')
            .sort({ createdAt: -1 });
        res.json(ventas);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener ventas' });
    }
};
exports.getVentas = getVentas;
const getVenta = async (req, res) => {
    try {
        const venta = await venta_1.default.findById(req.params.id)
            .populate('cliente')
            .populate('proyecto');
        if (!venta)
            return res.status(404).json({ error: 'Venta no encontrada' });
        res.json(venta);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener venta' });
    }
};
exports.getVenta = getVenta;
const createVenta = async (req, res) => {
    try {
        if (!req.body.proyecto) {
            return res.status(400).json({
                error: 'El proyecto es obligatorio para crear una venta'
            });
        }
        const proyecto = await proyecto_1.default.findById(req.body.proyecto);
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
        const venta = new venta_1.default({
            ...req.body,
            pagos: [],
            saldoPendiente: req.body.total
        });
        await venta.save();
        await proyecto_1.default.findByIdAndUpdate(req.body.proyecto, { estado: 'vendido' });
        await venta.populate(['cliente', 'proyecto']);
        res.status(201).json(venta);
    }
    catch (error) {
        console.error('Error al crear venta:', error);
        res.status(400).json({
            error: 'Error al crear venta',
            details: error.message
        });
    }
};
exports.createVenta = createVenta;
const pagarVenta = async (req, res) => {
    try {
        const venta = await venta_1.default.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Error al marcar venta como pagada:', error);
        res.status(500).json({
            error: 'Error al marcar venta como pagada',
            details: error.message
        });
    }
};
exports.pagarVenta = pagarVenta;
const cancelarVenta = async (req, res) => {
    try {
        const venta = await venta_1.default.findById(req.params.id);
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        if (venta.estado === 'cancelada') {
            return res.status(400).json({ error: 'La venta ya está cancelada' });
        }
        // Si tenía proyecto, devolverlo a disponible
        if (venta.proyecto) {
            await proyecto_1.default.findByIdAndUpdate(venta.proyecto, { estado: 'disponible' });
        }
        venta.estado = 'cancelada';
        await venta.save();
        await venta.populate(['cliente', 'proyecto']);
        res.json({
            message: 'Venta cancelada y proyecto restaurado',
            venta
        });
    }
    catch (error) {
        console.error('Error al cancelar venta:', error);
        res.status(500).json({
            error: 'Error al cancelar venta',
            details: error.message
        });
    }
};
exports.cancelarVenta = cancelarVenta;
const deleteVenta = async (req, res) => {
    try {
        const venta = await venta_1.default.findById(req.params.id);
        if (!venta) {
            return res.status(404).json({ error: 'Venta no encontrada' });
        }
        if (venta.estado !== 'cancelada') {
            return res.status(400).json({
                error: 'Solo se pueden eliminar ventas canceladas'
            });
        }
        await venta_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Venta eliminada' });
    }
    catch (error) {
        console.error('Error al eliminar venta:', error);
        res.status(500).json({
            error: 'Error al eliminar venta',
            details: error.message
        });
    }
};
exports.deleteVenta = deleteVenta;
const registrarPago = async (req, res) => {
    try {
        const venta = await venta_1.default.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({
            error: 'Error al registrar pago',
            details: error.message
        });
    }
};
exports.registrarPago = registrarPago;
