import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FilterState } from '@/hooks/use-filters';

interface FilterChipsProps {
  filtros: FilterState;
  onRemoveFiltro: (campo: keyof FilterState) => void;
  onLimpiarTodo: () => void;
}

export function FilterChips({ filtros, onRemoveFiltro, onLimpiarTodo }: FilterChipsProps) {
  const chips: { key: keyof FilterState; label: string }[] = [];

  if (filtros.texto) {
    chips.push({ key: 'texto', label: `Búsqueda: "${filtros.texto}"` });
  }

  if (filtros.estados.length > 0) {
    chips.push({
      key: 'estados',
      label: `Estados: ${filtros.estados.join(', ')}`,
    });
  }

  if (filtros.vendedor) {
    chips.push({ key: 'vendedor', label: `Vendedor: ${filtros.vendedor}` });
  }

  if (filtros.fechaDesde || filtros.fechaHasta) {
    const desde = filtros.fechaDesde?.toLocaleDateString('es-CL') || '...';
    const hasta = filtros.fechaHasta?.toLocaleDateString('es-CL') || '...';
    chips.push({
      key: 'fechaDesde',
      label: `Fecha: ${desde} - ${hasta}`,
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filtros activos:</span>
      {chips.map((chip) => (
        <Badge key={chip.key} variant="secondary" className="gap-1">
          {chip.label}
          <button
            onClick={() => onRemoveFiltro(chip.key)}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onLimpiarTodo}
        className="h-6 text-xs"
      >
        Limpiar todo
      </Button>
    </div>
  );
}
