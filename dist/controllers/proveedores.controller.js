"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProveedor = exports.updateProveedor = exports.createProveedor = exports.getProveedor = exports.getProveedores = void 0;
const Proveedor_1 = __importDefault(require("../models/Proveedor"));
const getProveedores = async (req, res) => {
    try {
        const proveedores = await Proveedor_1.default.find().sort({ createdAt: -1 });
        res.json(proveedores);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
};
exports.getProveedores = getProveedores;
const getProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor_1.default.findById(req.params.id);
        if (!proveedor)
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.json(proveedor);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener proveedor' });
    }
};
exports.getProveedor = getProveedor;
const createProveedor = async (req, res) => {
    try {
        // Validar duplicados por teléfono
        const existente = await Proveedor_1.default.findOne({
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
        const proveedor = new Proveedor_1.default(req.body);
        await proveedor.save();
        res.status(201).json(proveedor);
    }
    catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(400).json({
            error: 'Error al crear proveedor',
            details: error.message
        });
    }
};
exports.createProveedor = createProveedor;
const updateProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!proveedor)
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.json(proveedor);
    }
    catch (error) {
        res.status(400).json({ error: 'Error al actualizar proveedor' });
    }
};
exports.updateProveedor = updateProveedor;
const deleteProveedor = async (req, res) => {
    try {
        const proveedor = await Proveedor_1.default.findByIdAndDelete(req.params.id);
        if (!proveedor)
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        res.json({ message: 'Proveedor eliminado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar proveedor' });
    }
};
exports.deleteProveedor = deleteProveedor;
