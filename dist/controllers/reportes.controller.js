"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flujoCaja = exports.analisisClientes = exports.gananciaNeta = exports.stockBajo = exports.materialesMasUsados = exports.ventasMes = void 0;
const venta_1 = __importDefault(require("../models/venta"));
const material_1 = __importDefault(require("../models/material"));
const proyecto_1 = __importDefault(require("../models/proyecto"));
const gasto_1 = __importDefault(require("../models/gasto"));
const cliente_1 = __importDefault(require("../models/cliente"));
// Ventas del mes actual
const ventasMes = async (req, res) => {
    try {
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);
        const ventas = await venta_1.default.find({
            fecha: { $gte: inicioMes },
            estado: { $ne: 'cancelada' }
        }).populate(['cliente', 'proyecto']);
        const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
        const cantidadVentas = ventas.length;
        res.json({
            mes: inicioMes.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
            totalVentas,
            cantidadVentas,
            ventas
        });
    }
    catch (error) {
        console.error('Error al obtener ventas del mes:', error);
        res.status(500).json({ error: 'Error al obtener reporte de ventas' });
    }
};
exports.ventasMes = ventasMes;
// Materiales más usados
const materialesMasUsados = async (req, res) => {
    try {
        const resultado = await venta_1.default.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.material',
                    cantidadTotal: { $sum: '$items.cantidad' },
                    ventasCount: { $sum: 1 }
                }
            },
            { $sort: { cantidadTotal: -1 } },
            { $limit: 10 }
        ]);
        // Poblar información del material
        const materialesConInfo = await Promise.all(resultado.map(async (item) => {
            const material = await material_1.default.findById(item._id);
            return {
                material: material ? {
                    _id: material._id,
                    nombre: material.nombre,
                    unidad: material.unidad,
                    stock: material.stock
                } : null,
                cantidadTotal: item.cantidadTotal,
                ventasCount: item.ventasCount
            };
        }));
        res.json(materialesConInfo.filter(item => item.material !== null));
    }
    catch (error) {
        console.error('Error al obtener materiales más usados:', error);
        res.status(500).json({ error: 'Error al obtener reporte de materiales' });
    }
};
exports.materialesMasUsados = materialesMasUsados;
// Stock bajo (menos de 10 unidades)
const stockBajo = async (req, res) => {
    try {
        const umbral = req.query.umbral ? Number(req.query.umbral) : 10;
        const materiales = await material_1.default.find({
            stock: { $lte: umbral }
        }).sort({ stock: 1 });
        res.json(materiales);
    }
    catch (error) {
        console.error('Error al obtener stock bajo:', error);
        res.status(500).json({ error: 'Error al obtener materiales con stock bajo' });
    }
};
exports.stockBajo = stockBajo;
// Reporte de ganancia neta
const gananciaNeta = async (req, res) => {
    try {
        const { mes, anio } = req.query;
        let filtroFecha = {};
        if (mes && anio) {
            const inicio = new Date(Number(anio), Number(mes) - 1, 1);
            const fin = new Date(Number(anio), Number(mes), 0, 23, 59, 59);
            filtroFecha = { $gte: inicio, $lte: fin };
        }
        // Ingresos: ventas pagadas
        const ventas = await venta_1.default.find({
            estado: 'pagada',
            ...(Object.keys(filtroFecha).length > 0 && { fecha: filtroFecha })
        });
        const ingresoTotal = ventas.reduce((sum, v) => sum + v.total, 0);
        // Costos: materiales de proyectos vendidos
        const proyectosVendidos = await proyecto_1.default.find({ estado: 'vendido' });
        const costoProduccion = proyectosVendidos.reduce((sum, p) => sum + p.costoProduccion, 0);
        // Gastos operativos e indirectos
        const gastos = await gasto_1.default.find({
            ...(Object.keys(filtroFecha).length > 0 && { fecha: filtroFecha })
        });
        const gastosOperativos = gastos
            .filter(g => g.categoria === 'operativo')
            .reduce((sum, g) => sum + g.monto, 0);
        const gastosIndirectos = gastos
            .filter(g => g.categoria === 'indirecto')
            .reduce((sum, g) => sum + g.monto, 0);
        const impuestos = gastos
            .filter(g => g.categoria === 'impuesto')
            .reduce((sum, g) => sum + g.monto, 0);
        const desperdicios = gastos
            .filter(g => g.categoria === 'desperdicio')
            .reduce((sum, g) => sum + g.monto, 0);
        const gastoTotal = gastosOperativos + gastosIndirectos + impuestos + desperdicios;
        const gananciaNeta = ingresoTotal - costoProduccion - gastoTotal;
        res.json({
            periodo: mes && anio ? `${mes}/${anio}` : 'Todos los tiempos',
            ingresoTotal,
            costos: {
                produccion: costoProduccion,
                operativos: gastosOperativos,
                indirectos: gastosIndirectos,
                impuestos,
                desperdicios,
                total: costoProduccion + gastoTotal
            },
            gananciaNeta,
            margenGanancia: ingresoTotal > 0 ? ((gananciaNeta / ingresoTotal) * 100).toFixed(2) + '%' : '0%'
        });
    }
    catch (error) {
        console.error('Error al calcular ganancia neta:', error);
        res.status(500).json({ error: 'Error al calcular ganancia neta' });
    }
};
exports.gananciaNeta = gananciaNeta;
// Análisis de clientes
const analisisClientes = async (req, res) => {
    try {
        const clientes = await cliente_1.default.find();
        const analisis = await Promise.all(clientes.map(async (cliente) => {
            const ventas = await venta_1.default.find({
                cliente: cliente._id,
                estado: { $ne: 'cancelada' }
            });
            const totalGastado = ventas.reduce((sum, v) => sum + v.total, 0);
            const cantidadCompras = ventas.length;
            const ventasPagadas = ventas.filter(v => v.estado === 'pagada').length;
            const ventasPendientes = ventas.filter(v => v.estado === 'pendiente').length;
            return {
                cliente: {
                    _id: cliente._id,
                    nombre: cliente.nombre,
                    telefono: cliente.telefono,
                    email: cliente.email
                },
                totalGastado,
                cantidadCompras,
                ventasPagadas,
                ventasPendientes,
                promedioCompra: cantidadCompras > 0 ? totalGastado / cantidadCompras : 0
            };
        }));
        // Ordenar por total gastado (mayor a menor)
        analisis.sort((a, b) => b.totalGastado - a.totalGastado);
        res.json(analisis);
    }
    catch (error) {
        console.error('Error al analizar clientes:', error);
        res.status(500).json({ error: 'Error al analizar clientes' });
    }
};
exports.analisisClientes = analisisClientes;
const flujoCaja = async (req, res) => {
    try {
        const { mes, anio } = req.query;
        // Define el tipo correctamente desde el inicio
        let filtroFecha;
        if (mes && anio) {
            const inicio = new Date(Number(anio), Number(mes) - 1, 1);
            const fin = new Date(Number(anio), Number(mes), 0, 23, 59, 59);
            filtroFecha = { $gte: inicio, $lte: fin };
        }
        // USA MONGODB PARA FILTRAR, NO TU CÓDIGO
        const queryVentas = filtroFecha
            ? { 'pagos.fecha': filtroFecha }
            : {};
        const ventas = await venta_1.default.find(queryVentas);
        // Ahora sí, calcula ingresos (ya filtrado por DB)
        const ingresosCobrados = ventas.reduce((total, venta) => {
            return total + venta.pagos
                .filter(pago => !filtroFecha ||
                (pago.fecha >= filtroFecha.$gte && pago.fecha <= filtroFecha.$lte))
                .reduce((sum, pago) => sum + pago.monto, 0);
        }, 0);
        // Ventas pendientes
        const ventasPendientes = await venta_1.default.find({ estado: { $ne: 'cancelada' } });
        const saldosPendientes = ventasPendientes.reduce((sum, v) => sum + v.saldoPendiente, 0);
        // Gastos con filtro correcto
        const queryGastos = filtroFecha ? { fecha: filtroFecha } : {};
        const gastos = await gasto_1.default.find(queryGastos);
        const egresoTotal = gastos.reduce((sum, g) => sum + g.monto, 0);
        // Flujo neto
        const flujoNeto = ingresosCobrados - egresoTotal;
        res.json({
            periodo: mes && anio ? `${mes}/${anio}` : 'Todos los tiempos',
            ingresos: {
                cobrados: ingresosCobrados,
                pendientes: saldosPendientes,
                total: ingresosCobrados + saldosPendientes
            },
            egresos: {
                total: egresoTotal,
                detalle: {
                    operativos: gastos.filter(g => g.categoria === 'operativo').reduce((s, g) => s + g.monto, 0),
                    indirectos: gastos.filter(g => g.categoria === 'indirecto').reduce((s, g) => s + g.monto, 0),
                    impuestos: gastos.filter(g => g.categoria === 'impuesto').reduce((s, g) => s + g.monto, 0),
                    desperdicios: gastos.filter(g => g.categoria === 'desperdicio').reduce((s, g) => s + g.monto, 0)
                }
            },
            flujoNeto,
            efectivoDisponible: flujoNeto
        });
    }
    catch (error) {
        console.error('Error al calcular flujo de caja:', error);
        res.status(500).json({ error: 'Error al calcular flujo de caja' });
    }
};
exports.flujoCaja = flujoCaja;
