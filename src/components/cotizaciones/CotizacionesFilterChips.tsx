import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CotizacionesFilterState } from '@/hooks/use-cotizaciones-filters';

interface FilterChipsProps {
  filtros: CotizacionesFilterState;
  onRemoveFiltro: (key: keyof CotizacionesFilterState) => void;
  onLimpiarTodo: () => void;
}

export function CotizacionesFilterChips({ filtros, onRemoveFiltro, onLimpiarTodo }: FilterChipsProps) {
  const chips: Array<{ key: keyof CotizacionesFilterState; label: string }> = [];

  if (filtros.texto) {
    chips.push({ key: 'texto', label: `Texto: "${filtros.texto}"` });
  }

  if (filtros.estado.length > 0) {
    chips.push({ key: 'estado', label: `Estado: ${filtros.estado.join(', ')}` });
  }

  if (filtros.vendedor) {
    chips.push({ key: 'vendedor', label: `Vendedor: ${filtros.vendedor}` });
  }

  if (filtros.fechaEmisionDesde || filtros.fechaEmisionHasta) {
    const desde = filtros.fechaEmisionDesde ? new Date(filtros.fechaEmisionDesde).toLocaleDateString('es-CL') : '';
    const hasta = filtros.fechaEmisionHasta ? new Date(filtros.fechaEmisionHasta).toLocaleDateString('es-CL') : '';
    chips.push({ 
      key: 'fechaEmisionDesde', 
      label: `Fecha: ${desde || '...'} - ${hasta || '...'}` 
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtros activos:</span>
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1">
          {chip.label}
          <button
            onClick={() => onRemoveFiltro(chip.key)}
            className="ml-1 rounded-full hover:bg-secondary-foreground/20"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={onLimpiarTodo}>
        Limpiar todo
      </Button>
    </div>
  );
}
