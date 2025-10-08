import { useState, useEffect } from 'react';

export interface CotizacionesFilterState {
  texto: string;
  estado: string[];
  vendedor: string;
  fechaEmisionDesde: string;
  fechaEmisionHasta: string;
}

export interface VistaGuardada {
  id: string;
  nombre: string;
  filtros: CotizacionesFilterState;
  columnas?: string[];
  sorting?: Array<{ id: string; desc: boolean }>;
  createdAt: string;
}

const STORAGE_KEY_FILTERS = 'bioscom:cotizaciones:filters';
const STORAGE_KEY_VIEWS = 'bioscom:cotizaciones:views';

export function useCotizacionesFilters() {
  const [filtros, setFiltros] = useState<CotizacionesFilterState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {
          texto: '',
          estado: [],
          vendedor: '',
          fechaEmisionDesde: '',
          fechaEmisionHasta: '',
        };
      }
    }
    return {
      texto: '',
      estado: [],
      vendedor: '',
      fechaEmisionDesde: '',
      fechaEmisionHasta: '',
    };
  });

  const [vistasGuardadas, setVistasGuardadas] = useState<VistaGuardada[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_VIEWS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Persistir filtros
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filtros));
  }, [filtros]);

  // Persistir vistas guardadas
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIEWS, JSON.stringify(vistasGuardadas));
  }, [vistasGuardadas]);

  const actualizarFiltro = <K extends keyof CotizacionesFilterState>(
    key: K,
    value: CotizacionesFilterState[K]
  ) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      texto: '',
      estado: [],
      vendedor: '',
      fechaEmisionDesde: '',
      fechaEmisionHasta: '',
    });
  };

  const guardarVista = (nombre: string, columnas?: string[], sorting?: Array<{ id: string; desc: boolean }>) => {
    const nuevaVista: VistaGuardada = {
      id: Date.now().toString(),
      nombre,
      filtros: { ...filtros },
      columnas,
      sorting,
      createdAt: new Date().toISOString(),
    };
    setVistasGuardadas((prev) => [...prev, nuevaVista]);
  };

  const aplicarVista = (vista: VistaGuardada) => {
    setFiltros(vista.filtros);
    return vista;
  };

  const eliminarVista = (id: string) => {
    setVistasGuardadas((prev) => prev.filter((v) => v.id !== id));
  };

  const contarFiltrosActivos = () => {
    let count = 0;
    if (filtros.texto) count++;
    if (filtros.estado.length > 0) count++;
    if (filtros.vendedor) count++;
    if (filtros.fechaEmisionDesde || filtros.fechaEmisionHasta) count++;
    return count;
  };

  const hayFiltrosActivos = () => contarFiltrosActivos() > 0;

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
