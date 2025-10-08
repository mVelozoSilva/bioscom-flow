import { useState, useEffect } from 'react';

export interface SeguimientosFilterState {
  texto: string;
  etapa: string[];
  propietario: string;
  cierreEsperadoDesde: string;
  cierreEsperadoHasta: string;
}

export interface VistaGuardada {
  id: string;
  nombre: string;
  filtros: SeguimientosFilterState;
}

const STORAGE_KEY = 'bioscom:seguimientos:filtros';
const VIEWS_STORAGE_KEY = 'bioscom:seguimientos:views';

const initialState: SeguimientosFilterState = {
  texto: '',
  etapa: [],
  propietario: '',
  cierreEsperadoDesde: '',
  cierreEsperadoHasta: '',
};

export function useSeguimientosFilters() {
  const [filtros, setFiltros] = useState<SeguimientosFilterState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  const [vistasGuardadas, setVistasGuardadas] = useState<VistaGuardada[]>(() => {
    const saved = localStorage.getItem(VIEWS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtros));
  }, [filtros]);

  useEffect(() => {
    localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(vistasGuardadas));
  }, [vistasGuardadas]);

  const actualizarFiltro = <K extends keyof SeguimientosFilterState>(
    key: K,
    value: SeguimientosFilterState[K]
  ) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros(initialState);
  };

  const guardarVista = (nombre: string) => {
    const nuevaVista: VistaGuardada = {
      id: Date.now().toString(),
      nombre,
      filtros: { ...filtros },
    };
    setVistasGuardadas((prev) => [...prev, nuevaVista]);
  };

  const aplicarVista = (vista: VistaGuardada) => {
    setFiltros(vista.filtros);
  };

  const eliminarVista = (id: string) => {
    setVistasGuardadas((prev) => prev.filter((v) => v.id !== id));
  };

  return {
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    vistasGuardadas,
    guardarVista,
    aplicarVista,
    eliminarVista,
  };
}
