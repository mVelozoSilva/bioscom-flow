import { useState, useEffect, useCallback } from 'react';

export interface FilterState {
  texto: string;
  estados: string[];
  vendedor: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface VistaGuardada {
  id: string;
  nombre: string;
  filtros: FilterState;
  fechaCreacion: string;
}

const STORAGE_KEY_PREFIX = 'clientes-filtros-';
const STORAGE_VISTAS_KEY = 'clientes-vistas-guardadas';

export function useFilters(userId?: string) {
  const storageKey = userId ? `${STORAGE_KEY_PREFIX}${userId}` : STORAGE_KEY_PREFIX;

  // Estado inicial de filtros
  const [filtros, setFiltros] = useState<FilterState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          fechaDesde: parsed.fechaDesde ? new Date(parsed.fechaDesde) : undefined,
          fechaHasta: parsed.fechaHasta ? new Date(parsed.fechaHasta) : undefined,
        };
      }
    } catch (error) {
      console.error('Error al cargar filtros:', error);
    }
    return {
      texto: '',
      estados: [],
      vendedor: '',
    };
  });

  // Vistas guardadas
  const [vistasGuardadas, setVistasGuardadas] = useState<VistaGuardada[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_VISTAS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error al cargar vistas:', error);
      return [];
    }
  });

  // Persistir filtros en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(filtros));
    } catch (error) {
      console.error('Error al guardar filtros:', error);
    }
  }, [filtros, storageKey]);

  // Persistir vistas guardadas
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VISTAS_KEY, JSON.stringify(vistasGuardadas));
    } catch (error) {
      console.error('Error al guardar vistas:', error);
    }
  }, [vistasGuardadas]);

  // Actualizar filtro individual
  const actualizarFiltro = useCallback(<K extends keyof FilterState>(
    campo: K,
    valor: FilterState[K]
  ) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  }, []);

  // Limpiar todos los filtros
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      texto: '',
      estados: [],
      vendedor: '',
      fechaDesde: undefined,
      fechaHasta: undefined,
    });
  }, []);

  // Guardar vista actual
  const guardarVista = useCallback((nombre: string) => {
    const nuevaVista: VistaGuardada = {
      id: `vista-${Date.now()}`,
      nombre,
      filtros: { ...filtros },
      fechaCreacion: new Date().toISOString(),
    };
    setVistasGuardadas(prev => [...prev, nuevaVista]);
    return nuevaVista;
  }, [filtros]);

  // Aplicar vista guardada
  const aplicarVista = useCallback((vistaId: string) => {
    const vista = vistasGuardadas.find(v => v.id === vistaId);
    if (vista) {
      setFiltros({
        ...vista.filtros,
        fechaDesde: vista.filtros.fechaDesde ? new Date(vista.filtros.fechaDesde) : undefined,
        fechaHasta: vista.filtros.fechaHasta ? new Date(vista.filtros.fechaHasta) : undefined,
      });
    }
  }, [vistasGuardadas]);

  // Eliminar vista guardada
  const eliminarVista = useCallback((vistaId: string) => {
    setVistasGuardadas(prev => prev.filter(v => v.id !== vistaId));
  }, []);

  // Contar filtros activos
  const contarFiltrosActivos = useCallback(() => {
    let count = 0;
    if (filtros.texto) count++;
    if (filtros.estados.length > 0) count++;
    if (filtros.vendedor) count++;
    if (filtros.fechaDesde || filtros.fechaHasta) count++;
    return count;
  }, [filtros]);

  // Verificar si hay filtros activos
  const hayFiltrosActivos = useCallback(() => {
    return contarFiltrosActivos() > 0;
  }, [contarFiltrosActivos]);

  return {
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    vistasGuardadas,
    guardarVista,
    aplicarVista,
    eliminarVista,
    contarFiltrosActivos,
    hayFiltrosActivos,
  };
}
