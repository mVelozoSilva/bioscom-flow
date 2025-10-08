import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { SeguimientosFilterState } from '@/hooks/use-seguimientos-filters';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FilterChipsProps {
  filtros: SeguimientosFilterState;
  onRemoveFilter: (key: keyof SeguimientosFilterState, value?: string) => void;
}

export function SeguimientosFilterChips({ filtros, onRemoveFilter }: FilterChipsProps) {
  const activeFilters: { key: keyof SeguimientosFilterState; label: string; value?: string }[] = [];

  if (filtros.texto) {
    activeFilters.push({ key: 'texto', label: `Texto: ${filtros.texto}` });
  }

  filtros.etapa.forEach((etapa) => {
    activeFilters.push({ key: 'etapa', label: `Etapa: ${etapa}`, value: etapa });
  });

  if (filtros.propietario) {
    activeFilters.push({ key: 'propietario', label: `Propietario: ${filtros.propietario}` });
  }

  if (filtros.cierreEsperadoDesde) {
    activeFilters.push({
      key: 'cierreEsperadoDesde',
      label: `Desde: ${format(new Date(filtros.cierreEsperadoDesde), 'dd/MM/yyyy', { locale: es })}`,
    });
  }

  if (filtros.cierreEsperadoHasta) {
    activeFilters.push({
      key: 'cierreEsperadoHasta',
      label: `Hasta: ${format(new Date(filtros.cierreEsperadoHasta), 'dd/MM/yyyy', { locale: es })}`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map((filter, index) => (
        <Badge key={`${filter.key}-${index}`} variant="secondary" className="gap-1">
          {filter.label}
          <button
            onClick={() => onRemoveFilter(filter.key, filter.value)}
            className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
