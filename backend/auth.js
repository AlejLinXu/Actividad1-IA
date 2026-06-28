import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  // Intentamos obtener el token desde las cookies (gracias a cookie-parser)
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ 
      status: 'error', 
      message: 'Acceso denegado. No se proporcionó un token de sesión.' 
    });
  }

  try {
    // Verificar que el token sea válido y no haya expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Inyectamos los datos extraídos del token (ej. id, email) en la petición
    req.usuario = decoded; 
    
    next(); // Continuar a la ruta solicitada
  } catch (error) {
    return res.status(403).json({ 
      status: 'error', 
      message: 'Token inválido o expirado.' 
    });
  }
};