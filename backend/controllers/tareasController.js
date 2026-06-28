import db from '../database.js';

// 1. Obtener todas las tareas del usuario autenticado
export const obtenerTareas = (req, res) => {
  const usuarioId = req.usuario.id;
  
  const query = `SELECT * FROM tareas WHERE usuario_id = ?`;
  db.all(query, [usuarioId], (err, tareas) => {
    if (err) return res.status(500).json({ message: 'Error al obtener las tareas.' });
    res.json({ status: 'success', tareas });
  });
};

// 2. Crear una nueva tarea
export const crearTarea = (req, res) => {
  const { titulo, descripcion, prioridad } = req.body;
  const usuarioId = req.usuario.id;

  if (!titulo) return res.status(400).json({ message: 'El título es obligatorio.' });

  const query = `INSERT INTO tareas (titulo, descripcion, prioridad, estado, usuario_id) VALUES (?, ?, ?, 'Pendiente', ?)`;
  
  db.run(query, [titulo, descripcion, prioridad || 'Media', usuarioId], function(err) {
    if (err) return res.status(500).json({ message: 'Error al crear la tarea.' });
    
    res.status(201).json({
      status: 'success',
      tarea: {
        id: this.lastID,
        titulo,
        descripcion,
        prioridad: prioridad || 'Media',
        estado: 'Pendiente',
        usuario_id: usuarioId
      }
    });
  });
};

// 3. Editar los detalles de una tarea (Título, Descripción, Prioridad)
export const editarTarea = (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, prioridad } = req.body;
  const usuarioId = req.usuario.id;

  if (!titulo) return res.status(400).json({ message: 'El título es obligatorio.' });

  const query = `
    UPDATE tareas 
    SET titulo = ?, descripcion = ?, prioridad = ? 
    WHERE id = ? AND usuario_id = ?
  `;

  db.run(query, [titulo, descripcion, prioridad, id, usuarioId], function(err) {
    if (err) return res.status(500).json({ message: 'Error al actualizar la tarea.' });
    if (this.changes === 0) return res.status(404).json({ message: 'Tarea no encontrada o no autorizada.' });

    res.json({ status: 'success', message: 'Tarea actualizada correctamente.' });
  });
};

// 4. Cambiar exclusivamente el estado (Marcar como Completada o Pendiente)
export const cambiarEstadoTarea = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // Se espera 'Pendiente' o 'Completada'
  const usuarioId = req.usuario.id;

  if (!estado || !['Pendiente', 'Completada'].includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido. Debe ser Pendiente o Completada.' });
  }

  const query = `UPDATE tareas SET estado = ? WHERE id = ? AND usuario_id = ?`;

  db.run(query, [estado, id, usuarioId], function(err) {
    if (err) return res.status(500).json({ message: 'Error al cambiar el estado de la tarea.' });
    if (this.changes === 0) return res.status(404).json({ message: 'Tarea no encontrada o no autorizada.' });

    res.json({ status: 'success', message: `Tarea marcada como ${estado}.` });
  });
};

// 5. Eliminar tarea
export const eliminarTarea = (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuario.id;

  const query = `DELETE FROM tareas WHERE id = ? AND usuario_id = ?`;

  db.run(query, [id, usuarioId], function(err) {
    if (err) return res.status(500).json({ message: 'Error al eliminar la tarea.' });
    if (this.changes === 0) return res.status(404).json({ message: 'Tarea no encontrada o no autorizada.' });

    res.json({ status: 'success', message: 'Tarea eliminada correctamente.' });
  });
};