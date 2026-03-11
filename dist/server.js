"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const clientes_routes_1 = __importDefault(require("./routes/clientes.routes"));
const materiales_routes_1 = __importDefault(require("./routes/materiales.routes"));
const proyectos_routes_1 = __importDefault(require("./routes/proyectos.routes"));
const ventas_routes_1 = __importDefault(require("./routes/ventas.routes"));
const reportes_routes_1 = __importDefault(require("./routes/reportes.routes"));
const gastos_routes_1 = __importDefault(require("./routes/gastos.routes"));
const proveedores_routes_1 = __importDefault(require("./routes/proveedores.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8001;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rutas
app.use('/api/clientes', clientes_routes_1.default);
app.use('/api/materiales', materiales_routes_1.default);
app.use('/api/proyectos', proyectos_routes_1.default);
app.use('/api/ventas', ventas_routes_1.default);
app.use('/api/reportes', reportes_routes_1.default);
app.use('/api/gastos', gastos_routes_1.default);
app.use('/api/proveedores', proveedores_routes_1.default);
app.get('/', (req, res) => {
    res.json({ message: '🪚 API Carpintería funcionando' });
});
// Iniciar servidor
const startServer = async () => {
    await (0, database_1.connectDB)();
    app.listen(PORT, () => {
        console.log(`🚀 Corriendo en http://localhost:${PORT}`);
    });
};
startServer();
