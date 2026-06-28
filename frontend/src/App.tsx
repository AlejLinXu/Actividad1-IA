import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import TasksList from './components/TasksList';
import CreateTask from './components/CreateTask'; // Importamos el nuevo modal

interface Usuario {
  id: number;
  email: string;
}

export default function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para mostrar/ocultar el modal de creación
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  // Estado para forzar la recarga de TasksList
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch('http://localhost:3000/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Sesión no válida');
        return res.json();
      })
      .then((data) => {
        if (data.status === 'success') setUsuario(data.usuario);
      })
      .catch(() => setUsuario(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setUsuario(null);
    }
  };

  // Función que se ejecuta cuando CreateTask avisa que terminó con éxito
  const handleTaskCreated = () => {
    setRefreshKey(prev => prev + 1); // Forzamos la recarga de TasksList
  };

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
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 md:p-8">
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={() => setUsuario({ id: 0, email: '' })} />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
          />

          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <div className="w-full max-w-6xl relative">
                  
                  {/* Encabezado */}
                  <header className="flex flex-col sm:flex-row justify-between items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-sm mb-8 gap-4">
                    <div>
                      <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Mis Tareas
                      </h1>
                      <p className="text-sm text-slate-400 font-mono mt-1">
                        {usuario?.email}
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      {/* Botón que abre el modal */}
                      <button 
                        onClick={() => setIsCreatingTask(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
                      >
                        + Nueva Tarea
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 text-sm font-medium transition-colors"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </header>

                  <main>
                    {/* El prop 'key' obliga a React a recargar el componente si el valor cambia */}
                    <TasksList key={refreshKey} />
                  </main>

                  {/* Renderizado condicional del Modal */}
                  {isCreatingTask && (
                    <CreateTask 
                      onClose={() => setIsCreatingTask(false)} 
                      onTaskCreated={handleTaskCreated} 
                    />
                  )}
                  
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}