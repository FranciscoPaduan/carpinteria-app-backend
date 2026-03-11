"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGasto = exports.updateGasto = exports.createGasto = exports.getGastos = void 0;
const gasto_1 = __importDefault(require("../models/gasto"));
const getGastos = async (req, res) => {
    try {
        const gastos = await gasto_1.default.find().sort({ fecha: -1 });
        res.json(gastos);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener gastos' });
    }
};
exports.getGastos = getGastos;
const createGasto = async (req, res) => {
    try {
        const gasto = new gasto_1.default(req.body);
        await gasto.save();
        res.status(201).json(gasto);
    }
    catch (error) {
        res.status(400).json({
            error: 'Error al crear gasto',
            details: error.message
        });
    }
};
exports.createGasto = createGasto;
const updateGasto = async (req, res) => {
    try {
        const gasto = await gasto_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!gasto)
            return res.status(404).json({ error: 'Gasto no encontrado' });
        res.json(gasto);
    }
    catch (error) {
        res.status(400).json({
            error: 'Error al actualizar gasto',
            details: error.message
        });
    }
};
exports.updateGasto = updateGasto;
const deleteGasto = async (req, res) => {
    try {
        const gasto = await gasto_1.default.findByIdAndDelete(req.params.id);
        if (!gasto)
            return res.status(404).json({ error: 'Gasto no encontrado' });
        res.json({ message: 'Gasto eliminado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar gasto' });
    }
};
exports.deleteGasto = deleteGasto;
