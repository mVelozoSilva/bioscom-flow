import { useState, useEffect, useCallback } from 'react';
import { cotizacionesDAL } from '@/dal/cotizaciones';
import { useToast } from '@/hooks/use-toast';

export interface UseCotizacionesDataParams {
  pageIndex: number;
  pageSize: number;
  sorting?: Array<{ id: string; desc: boolean }>;
  filters?: {
    texto?: string;
    estado?: string[];
    vendedor?: string;
    fechaEmisionDesde?: string;
    fechaEmisionHasta?: string;
  };
}

export function useCotizacionesData(params: UseCotizacionesDataParams) {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Construir filtros para la consulta
      const queryFilters: Record<string, any> = {};
      
      if (params.filters?.texto) {
        queryFilters.search = params.filters.texto;
      }
      
      if (params.filters?.estado && params.filters.estado.length > 0) {
        queryFilters.estado = params.filters.estado[0]; // Por ahora solo uno
      }
      
      if (params.filters?.vendedor) {
        queryFilters.vendedor_id = params.filters.vendedor;
      }

      // Ejecutar consulta con paginación
      const result = await cotizacionesDAL.listWithDetails(
        queryFilters,
        {
          page: params.pageIndex + 1,
          limit: params.pageSize
        }
      );

      setData(result || []);
      setCount(result?.length || 0);
    } catch (error) {
      console.error('Error loading cotizaciones:', error);
      toast({
        title: "Error al cargar cotizaciones",
        description: "No se pudieron cargar las cotizaciones. Intenta nuevamente.",
        variant: "destructive",
      });
      setData([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [params, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    count,
    isLoading,
    refetch: fetchData,
  };
}
