import { useEffect, useState } from 'react';
import EditTask from './EditTask';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  estado: 'Pendiente' | 'Completada';
}

export default function TasksList() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tareaAEditar, setTareaAEditar] = useState<Tarea | null>(null);

  const cargarTareas = () => {
    fetch('http://localhost:3000/api/tareas', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener las tareas');
        return res.json();
      })
      .then((data) => {
        if (data.status === 'success') {
          setTareas(data.tareas);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  // 1. Cambiar estado de 'Pendiente' a 'Completada' y viceversa
  const handleToggleEstado = async (id: number, estadoActual: 'Pendiente' | 'Completada') => {
    const nuevoEstado = estadoActual === 'Pendiente' ? 'Completada' : 'Pendiente';

    try {
      const res = await fetch(`http://localhost:3000/api/tareas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!res.ok) throw new Error('No se pudo cambiar el estado de la tarea');

      // Optimización visual: Actualizamos el estado local de inmediato sin esperar la recarga total
      setTareas(prev => 
        prev.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t)
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 2. Eliminar una tarea de forma definitiva
  const handleEliminarTarea = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/tareas/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('No se pudo eliminar la tarea');

      // Filtramos la tarea eliminada del estado para que desaparezca con suavidad
      setTareas(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Media': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Baja': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleTaskUpdated = () => {
    setTareaAEditar(null);
    cargarTareas();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <>
      {tareas.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
          <p className="text-slate-400 mb-2">No tienes tareas pendientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareas.map((tarea) => (
            <div 
              key={tarea.id} 
              className={`p-5 rounded-2xl border transition-all flex flex-col h-full bg-slate-800 ${
                tarea.estado === 'Completada' ? 'border-emerald-500/30 bg-slate-800/60' : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className={`font-bold text-lg break-words max-w-[70%] ${
                  tarea.estado === 'Completada' ? 'line-through text-slate-500' : 'text-slate-100'
                }`}>
                  {tarea.titulo}
                </h3>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${getPrioridadColor(tarea.prioridad)}`}>
                  {tarea.prioridad}
                </span>
              </div>
              
              <p className={`text-sm mb-6 flex-grow ${tarea.estado === 'Completada' ? 'text-slate-500 line-through' : 'text-slate-400'}`}>
                {tarea.descripcion || 'Sin descripción'}
              </p>
              
              {/* Barra de Acciones de la Tarea */}
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-700/50">
                {/* Botón interactivo para cambiar estado */}
                <button 
                  onClick={() => handleToggleEstado(tarea.id, tarea.estado)}
                  className={`text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
                    tarea.estado === 'Completada' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                      : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {tarea.estado === 'Completada' ? '✓ Completada' : '⏳ Marcar Completada'}
                </button>
                
                {/* Botones de gestión (Editar y Eliminar) */}
                <div className="flex gap-3 text-sm font-medium">
                  <button 
                    onClick={() => setTareaAEditar(tarea)}
                    className="text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleEliminarTarea(tarea.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tareaAEditar && (
        <EditTask 
          tarea={tareaAEditar} 
          onClose={() => setTareaAEditar(null)} 
          onTaskUpdated={handleTaskUpdated} 
        />
      )}
    </>
  );
}