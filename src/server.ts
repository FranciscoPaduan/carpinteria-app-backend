import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';

import clientesRoutes from './routes/clientes.routes';
import materialesRoutes from './routes/materiales.routes';
import proyectosRoutes from './routes/proyectos.routes';
import ventasRoutes from './routes/ventas.routes';
import reportesRoutes from './routes/reportes.routes';
import gastosRoutes from './routes/gastos.routes';
import proveedoresRoutes from './routes/proveedores.routes';
const app = express();
const PORT = process.env.PORT || 8001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/materiales', materialesRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/proveedores', proveedoresRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🪚 API Carpintería funcionando' });
});

// Iniciar servidor
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Corriendo en http://localhost:${PORT}`);
  });
};



startServer();