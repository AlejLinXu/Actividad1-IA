import express from 'express';
import { 
  obtenerTareas, 
  crearTarea, 
  editarTarea, 
  cambiarEstadoTarea, 
  eliminarTarea 
} from '../controllers/tareasController.js';
import { verificarToken } from '../auth.js';

const router = express.Router();

// Aplicar el middleware de verificación JWT a TODAS las rutas de este archivo
router.use(verificarToken);

router.get('/', obtenerTareas);
router.post('/', crearTarea);
router.put('/:id', editarTarea);
router.patch('/:id/estado', cambiarEstadoTarea); // Usamos PATCH para actualizaciones parciales
router.delete('/:id', eliminarTarea);

export default router;