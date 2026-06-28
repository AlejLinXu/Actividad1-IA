import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';

interface Usuario {
  id: number;
  email: string;
}

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true); // Estado de carga inicial

  // Al arrancar la aplicación, verificamos si el usuario ya tiene una cookie válida
  useEffect(() => {
    fetch('http://localhost:3000/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Sesión no válida o expirada');
        return res.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          setUsuario(data.usuario); // Mantenemos la sesión activa
        }
      })
      .catch(() => {
        setUsuario(null); // No hay sesión válida, se queda en login
      })
      .finally(() => {
        setLoading(false); // Termina la comprobación inicial
      });
  }, []);

  const handleLogout = async () => {
    try {
      // Llamamos al backend para borrar la cookie de verdad
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Error al cerrar sesión en el servidor:', err);
    } finally {
      // Limpiamos el estado en el frontend sin importar si falló la red
      setUsuario(null);
    }
  };

  // Mientras el frontend comprueba si hay una cookie guardada, mostramos un loader limpio
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAuthenticated = usuario !== null;

  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
        <Routes>
          {/* Si ya está autenticado y va a /login o /register, lo mandamos a la raíz (/) */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={() => setUsuario({ id: 0, email: '' })} />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
          />

          {/* Ruta Principal Protegida */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <div className="text-center w-full max-w-2xl bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700">
                  <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-4">
                    Panel de Control (/)
                  </h1>
                  <p className="text-slate-400 mb-2">
                    Sesión guardada de forma persistente en el navegador.
                  </p>
                  <p className="text-sm font-mono text-indigo-400 mb-8">
                    Usuario: {usuario?.email}
                  </p>
                  <button 
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
                  >
                    Cerrar Sesión Real
                  </button>
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          {/* Comodín de redirección */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}