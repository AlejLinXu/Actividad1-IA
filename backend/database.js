import sqlite3 from 'sqlite3';

// Conectar a la base de datos local (se creará el archivo automáticamente)
const db = new sqlite3.Database('./dev.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('📦 Conectado con éxito a la base de datos SQLite.');
  }
});

// Habilitar el soporte de claves foráneas en SQLite (desactivado por defecto)
db.run('PRAGMA foreign_keys = ON');

// Inicializar tablas
db.serialize(() => {
  // 1. Tabla de Usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      contrasena TEXT NOT NULL
    )
  `);

  // 2. Tabla de Tareas
  db.run(`
    CREATE TABLE IF NOT EXISTS tareas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      prioridad TEXT CHECK(prioridad IN ('Alta', 'Media', 'Baja')) DEFAULT 'Media',
      estado TEXT CHECK(estado IN ('Pendiente', 'Completada')) DEFAULT 'Pendiente',
      usuario_id INTEGER NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);
});

export default db;