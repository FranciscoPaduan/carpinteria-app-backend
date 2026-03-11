"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProyecto = exports.updateProyecto = exports.createProyecto = exports.getProyecto = exports.getProyectos = void 0;
const proyecto_1 = __importDefault(require("../models/proyecto"));
const material_1 = __importDefault(require("../models/material"));
const venta_1 = __importDefault(require("../models/venta"));
const getProyectos = async (req, res) => {
    try {
        const proyectos = await proyecto_1.default.find()
            .populate('materiales.material')
            .sort({ createdAt: -1 });
        res.json(proyectos);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener proyectos' });
    }
};
exports.getProyectos = getProyectos;
const getProyecto = async (req, res) => {
    try {
        const proyecto = await proyecto_1.default.findById(req.params.id)
            .populate('materiales.material');
        if (!proyecto)
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        res.json(proyecto);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al obtener proyecto' });
    }
};
exports.getProyecto = getProyecto;
const createProyecto = async (req, res) => {
    try {
        // Verificar stock disponible
        for (const item of req.body.materiales) {
            const material = await material_1.default.findById(item.material);
            if (!material) {
                return res.status(404).json({
                    error: `Material ${item.material} no encontrado`
                });
            }
            if (material.stock < item.cantidad) {
                return res.status(400).json({
                    error: `Stock insuficiente para ${material.nombre}. Disponible: ${material.stock}, Necesario: ${item.cantidad}`
                });
            }
        }
        // Calcular costo de producción si no viene
        if (!req.body.costoProduccion) {
            req.body.costoProduccion = req.body.materiales.reduce((sum, item) => sum + (item.cantidad * item.precioUnitario), 0);
        }
        // Usar margen personalizado o default 45%
        const margen = req.body.margenGanancia || 45;
        req.body.margenGanancia = margen;
        // Calcular precio de venta con margen si no viene
        if (!req.body.precioVenta) {
            req.body.precioVenta = Math.round(req.body.costoProduccion * (1 + margen / 100));
        }
        const proyecto = new proyecto_1.default(req.body);
        await proyecto.save();
        // Descontar stock de materiales
        for (const item of req.body.materiales) {
            await material_1.default.findByIdAndUpdate(item.material, { $inc: { stock: -item.cantidad } });
        }
        await proyecto.populate('materiales.material');
        res.json(proyecto);
    }
    catch (error) {
        console.error('Error al crear proyecto:', error);
        res.status(400).json({
            error: 'Error al crear proyecto',
            details: error.message
        });
    }
};
exports.createProyecto = createProyecto;
const updateProyecto = async (req, res) => {
    try {
        const proyectoViejo = await proyecto_1.default.findById(req.params.id);
        if (!proyectoViejo) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
        // QUITAMOS LA RESTRICCIÓN DE EDITAR VENDIDOS
        // Si cambiaron los materiales, ajustar stock
        if (req.body.materiales) {
            // 1. Restaurar stock de materiales viejos
            for (const itemViejo of proyectoViejo.materiales) {
                await material_1.default.findByIdAndUpdate(itemViejo.material, { $inc: { stock: itemViejo.cantidad } });
            }
            // 2. Verificar stock disponible para materiales nuevos
            for (const itemNuevo of req.body.materiales) {
                const material = await material_1.default.findById(itemNuevo.material);
                if (!material) {
                    for (const itemViejo of proyectoViejo.materiales) {
                        await material_1.default.findByIdAndUpdate(itemViejo.material, { $inc: { stock: -itemViejo.cantidad } });
                    }
                    return res.status(404).json({
                        error: `Material ${itemNuevo.material} no encontrado`
                    });
                }
                if (material.stock < itemNuevo.cantidad) {
                    for (const itemViejo of proyectoViejo.materiales) {
                        await material_1.default.findByIdAndUpdate(itemViejo.material, { $inc: { stock: -itemViejo.cantidad } });
                    }
                    return res.status(400).json({
                        error: `Stock insuficiente para ${material.nombre}. Disponible: ${material.stock}, Necesario: ${itemNuevo.cantidad}`
                    });
                }
            }
            // 3. Descontar stock de materiales nuevos
            for (const itemNuevo of req.body.materiales) {
                await material_1.default.findByIdAndUpdate(itemNuevo.material, { $inc: { stock: -itemNuevo.cantidad } });
            }
        }
        const proyecto = await proyecto_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('materiales.material');
        res.json(proyecto);
    }
    catch (error) {
        console.error('Error al actualizar proyecto:', error);
        res.status(400).json({
            error: 'Error al actualizar proyecto',
            details: error.message
        });
    }
};
exports.updateProyecto = updateProyecto;
const deleteProyecto = async (req, res) => {
    try {
        const proyecto = await proyecto_1.default.findById(req.params.id);
        if (!proyecto)
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        // Verificar si hay ventas vinculadas
        const ventasVinculadas = await venta_1.default.find({ proyecto: req.params.id });
        if (ventasVinculadas.length > 0) {
            return res.status(400).json({
                error: `No se puede eliminar. Hay ${ventasVinculadas.length} venta(s) vinculada(s) a este proyecto`,
                ventas: ventasVinculadas.map(v => v._id)
            });
        }
        // Restaurar stock (siempre, sin importar estado)
        for (const item of proyecto.materiales) {
            await material_1.default.findByIdAndUpdate(item.material, { $inc: { stock: item.cantidad } });
        }
        await proyecto_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Proyecto eliminado y stock restaurado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar proyecto' });
    }
};
exports.deleteProyecto = deleteProyecto;
