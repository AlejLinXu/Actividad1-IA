import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Importación de enrutadores organizados
import authRoutes from './routes/authRoutes.js';
import tareasRoutes from './routes/tareasRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares globales
app.use(express.json());
app.use(cookieParser());

// Vinculación de rutas estructuradas al Servidor Express
app.use('/api/auth', authRoutes);
app.use('/api/tareas', tareasRoutes);

// Endpoint global de diagnóstico
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Estructura modular del backend lista y operativa.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend modular corriendo en: http://localhost:${PORT}`);
});