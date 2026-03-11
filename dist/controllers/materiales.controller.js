"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actualizarProveedorMaterial = exports.agregarProveedorMaterial = exports.getHistorialPrecios = exports.deleteMaterial = exports.updateMaterial = exports.createMaterial = exports.getMaterial = exports.getMateriales = void 0;
const material_1 = __importDefault(require("../models/material"));
const HistorialPrecio_1 = __importDefault(require("../models/HistorialPrecio"));
const Proveedor_1 = __importDefault(require("../models/Proveedor"));
const getMateriales = async (req, res) => {
    try {
        const materiales = await material_1.default.find().sort({ createdAt: -1 });
        res.json(materiales);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener materiales' });
    }
};
exports.getMateriales = getMateriales;
const getMaterial = async (req, res) => {
    try {
        const material = await material_1.default.findById(req.params.id);
        if (!material)
            return res.status(404).json({ error: 'Material no encontrado' });
        res.json(material);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener material' });
    }
};
exports.getMaterial = getMaterial;
const createMaterial = async (req, res) => {
    try {
        const material = new material_1.default(req.body);
        await material.save();
        res.status(201).json(material);
    }
    catch (error) {
        res.status(400).json({ error: 'Error al crear material' });
    }
};
exports.createMaterial = createMaterial;
const updateMaterial = async (req, res) => {
    try {
        const materialViejo = await material_1.default.findById(req.params.id);
        if (!materialViejo) {
            return res.status(404).json({ error: 'Material no encontrado' });
        }
        // Si cambió el precio, guardar en historial
        if (req.body.precioUnitario && req.body.precioUnitario !== materialViejo.precioUnitario) {
            const historial = new HistorialPrecio_1.default({
                material: req.params.id,
                precioAnterior: materialViejo.precioUnitario,
                precioNuevo: req.body.precioUnitario
            });
            await historial.save();
        }
        const material = await material_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(material);
    }
    catch (error) {
        res.status(400).json({ error: 'Error al actualizar material' });
    }
};
exports.updateMaterial = updateMaterial;
const deleteMaterial = async (req, res) => {
    try {
        const material = await material_1.default.findByIdAndDelete(req.params.id);
        if (!material)
            return res.status(404).json({ error: 'Material no encontrado' });
        res.json({ message: 'Material eliminado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar material' });
    }
};
exports.deleteMaterial = deleteMaterial;
const getHistorialPrecios = async (req, res) => {
    try {
        const historial = await HistorialPrecio_1.default.find({ material: req.params.id })
            .populate('material')
            .sort({ fecha: -1 });
        res.json(historial);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener historial de precios' });
    }
};
exports.getHistorialPrecios = getHistorialPrecios;
const agregarProveedorMaterial = async (req, res) => {
    try {
        const material = await material_1.default.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ error: 'Material no encontrado' });
        }
        // Verificar que el proveedor existe
        const proveedor = await Proveedor_1.default.findById(req.body.proveedor);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        // Verificar si ya existe
        const existe = material.proveedores.find(p => p.proveedor.toString() === req.body.proveedor);
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
    }
    catch (error) {
        console.error('Error al agregar proveedor:', error);
        res.status(400).json({
            error: 'Error al agregar proveedor',
            details: error.message
        });
    }
};
exports.agregarProveedorMaterial = agregarProveedorMaterial;
const actualizarProveedorMaterial = async (req, res) => {
    try {
        const material = await material_1.default.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ error: 'Material no encontrado' });
        }
        const proveedorIndex = material.proveedores.findIndex(p => p.proveedor.toString() === req.params.proveedorId);
        if (proveedorIndex === -1) {
            return res.status(404).json({ error: 'Proveedor no encontrado en este material' });
        }
        material.proveedores[proveedorIndex].precio = req.body.precio;
        material.proveedores[proveedorIndex].activo = req.body.activo ?? material.proveedores[proveedorIndex].activo;
        await material.save();
        await material.populate('proveedores.proveedor');
        res.json(material);
    }
    catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(400).json({
            error: 'Error al actualizar proveedor',
            details: error.message
        });
    }
};
exports.actualizarProveedorMaterial = actualizarProveedorMaterial;
