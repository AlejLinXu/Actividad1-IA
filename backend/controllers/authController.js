import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';

export const registrarUsuario = async (req, res) => {
  const { nombre, email, contrasena } = req.body;

  if (!nombre || !email || !contrasena) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const query = `INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)`;
    
    db.run(query, [nombre, email, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }
        return res.status(500).json({ message: 'Error interno del servidor.' });
      }
      
      res.status(201).json({ 
        status: 'success', 
        message: 'Usuario registrado correctamente.',
        userId: this.lastID 
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error procesando la solicitud.' });
  }
};

export const iniciarSesion = (req, res) => {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res.status(400).json({ message: 'Email y contraseña requeridos.' });
  }

  const query = `SELECT * FROM usuarios WHERE email = ?`;
  
  db.get(query, [email], async (err, usuario) => {
    if (err) return res.status(500).json({ message: 'Error en la base de datos.' });
    if (!usuario) return res.status(400).json({ message: 'Credenciales inválidas.' });

    const passwordMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordMatch) return res.status(400).json({ message: 'Credenciales inválidas.' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000
    });

    res.json({
      status: 'success',
      message: 'Autenticación exitosa.',
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });
  });
};

export const cerrarSesion = (req, res) => {
  // Borra la cookie 'token' del navegador
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ status: 'success', message: 'Sesión cerrada correctamente.' });
};