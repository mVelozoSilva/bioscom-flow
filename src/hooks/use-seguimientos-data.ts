import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SeguimientosFiltros {
  texto: string;
  etapa: string[];
  propietario: string;
  cierreEsperadoDesde: string;
  cierreEsperadoHasta: string;
}

export interface Seguimiento {
  id: string;
  nombre: string;
  cliente: string;
  etapa: string;
  monto: number;
  probabilidad: number;
  cierre_esperado: string;
  propietario: string;
  fecha_creacion: string;
  cliente_id?: string;
  vendedor_id?: string;
}

interface UseSeguimientosDataParams {
  pageIndex: number;
  pageSize: number;
  sort?: { id: string; desc: boolean }[];
  filtros: SeguimientosFiltros;
}

export function useSeguimientosData({ pageIndex, pageSize, sort, filtros }: UseSeguimientosDataParams) {
  const [data, setData] = useState<Seguimiento[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('vw_seguimientos_listado')
        .select('*', { count: 'exact' });

      // Filtro de texto global
      if (filtros.texto) {
        query = query.or(`nombre.ilike.%${filtros.texto}%,cliente.ilike.%${filtros.texto}%`);
      }

      // Filtro etapa (multi-select)
      if (filtros.etapa.length > 0) {
        query = query.in('etapa', filtros.etapa);
      }

      // Filtro propietario
      if (filtros.propietario) {
        query = query.eq('vendedor_id', filtros.propietario);
      }

      // Rango de cierre esperado
      if (filtros.cierreEsperadoDesde) {
        query = query.gte('cierre_esperado', filtros.cierreEsperadoDesde);
      }
      if (filtros.cierreEsperadoHasta) {
        query = query.lte('cierre_esperado', filtros.cierreEsperadoHasta);
      }

      // Sorting
      if (sort && sort.length > 0) {
        const { id, desc } = sort[0];
        query = query.order(id, { ascending: !desc });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Paginación
      const from = pageIndex * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: rows, error, count: total } = await query;

      if (error) {
        console.error('Error fetching seguimientos:', error);
        toast({
          variant: 'destructive',
          title: 'Error al cargar oportunidades',
          description: error.message,
        });
        return;
      }

      setData(rows || []);
      setCount(total || 0);
    } catch (error: any) {
      console.error('Error en fetchData:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Error al cargar las oportunidades',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize, JSON.stringify(sort), JSON.stringify(filtros)]);

  return { data, count, isLoading, refetch: fetchData };
}
