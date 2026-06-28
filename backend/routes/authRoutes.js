import express from 'express';
import { registrarUsuario, iniciarSesion, cerrarSesion } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);
router.post('/logout', cerrarSesion);

// ... tus otros imports y rutas
import { verificarToken } from '../auth.js';

// Nuevo endpoint para verificar el estado de la sesión actual
router.get('/me', verificarToken, (req, res) => {
  // Si pasa el middleware 'verificarToken', significa que la cookie es válida
  // El id y el email se extrajeron del JWT y están en req.usuario
  res.json({
    status: 'success',
    usuario: {
      id: req.usuario.id,
      email: req.usuario.email
    }
  });
});

export default router;