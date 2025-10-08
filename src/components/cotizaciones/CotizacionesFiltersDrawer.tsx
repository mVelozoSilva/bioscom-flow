import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CotizacionesFilterState, VistaGuardada } from '@/hooks/use-cotizaciones-filters';
import { useState } from 'react';

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filtros: CotizacionesFilterState;
  onActualizarFiltro: <K extends keyof CotizacionesFilterState>(
    key: K,
    value: CotizacionesFilterState[K]
  ) => void;
  onLimpiar: () => void;
  vistasGuardadas: VistaGuardada[];
  onGuardarVista: (nombre: string) => void;
  onAplicarVista: (vista: VistaGuardada) => void;
  onEliminarVista: (id: string) => void;
}

const ESTADOS = ['Borrador', 'Enviada', 'Aceptada', 'Rechazada', 'Vencida', 'Cancelada'];
const VENDEDORES = ['Juan Pérez', 'María García', 'Carlos López'];

export function CotizacionesFiltersDrawer({
  open,
  onOpenChange,
  filtros,
  onActualizarFiltro,
  onLimpiar,
  vistasGuardadas,
  onGuardarVista,
  onAplicarVista,
  onEliminarVista,
}: FiltersDrawerProps) {
  const [nombreVista, setNombreVista] = useState('');

  const handleGuardarVista = () => {
    if (nombreVista.trim()) {
      onGuardarVista(nombreVista.trim());
      setNombreVista('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros de Cotizaciones</SheetTitle>
          <SheetDescription>
            Filtra y guarda vistas personalizadas de tus cotizaciones
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Búsqueda global */}
          <div className="space-y-2">
            <Label htmlFor="texto">Búsqueda global</Label>
            <Input
              id="texto"
              placeholder="Buscar por folio o cliente..."
              value={filtros.texto}
              onChange={(e) => onActualizarFiltro('texto', e.target.value)}
            />
          </div>

          {/* Estado - Multi-select */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <div className="space-y-2">
              {ESTADOS.map((estado) => (
                <div key={estado} className="flex items-center space-x-2">
                  <Checkbox
                    id={`estado-${estado}`}
                    checked={filtros.estado.includes(estado)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onActualizarFiltro('estado', [...filtros.estado, estado]);
                      } else {
                        onActualizarFiltro(
                          'estado',
                          filtros.estado.filter((e) => e !== estado)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`estado-${estado}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {estado}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Vendedor */}
          <div className="space-y-2">
            <Label htmlFor="vendedor">Vendedor</Label>
            <Select
              value={filtros.vendedor || "all"}
              onValueChange={(value) => onActualizarFiltro('vendedor', value === "all" ? "" : value)}
            >
              <SelectTrigger id="vendedor">
                <SelectValue placeholder="Todos los vendedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {VENDEDORES.map((vendedor) => (
                  <SelectItem key={vendedor} value={vendedor}>
                    {vendedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rango de fechas de emisión */}
          <div className="space-y-2">
            <Label>Fecha de emisión</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="fecha-desde" className="text-xs">
                  Desde
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="fecha-desde"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filtros.fechaEmisionDesde && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.fechaEmisionDesde ? (
                        format(new Date(filtros.fechaEmisionDesde), 'dd/MM/yyyy', { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filtros.fechaEmisionDesde ? new Date(filtros.fechaEmisionDesde) : undefined}
                      onSelect={(date) =>
                        onActualizarFiltro('fechaEmisionDesde', date ? date.toISOString() : '')
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fecha-hasta" className="text-xs">
                  Hasta
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="fecha-hasta"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filtros.fechaEmisionHasta && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.fechaEmisionHasta ? (
                        format(new Date(filtros.fechaEmisionHasta), 'dd/MM/yyyy', { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filtros.fechaEmisionHasta ? new Date(filtros.fechaEmisionHasta) : undefined}
                      onSelect={(date) =>
                        onActualizarFiltro('fechaEmisionHasta', date ? date.toISOString() : '')
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Vistas guardadas */}
          <div className="space-y-2 border-t pt-4">
            <Label>Vistas guardadas</Label>
            {vistasGuardadas.length > 0 ? (
              <div className="space-y-2">
                {vistasGuardadas.map((vista) => (
                  <div key={vista.id} className="flex items-center justify-between rounded-md border p-2">
                    <button
                      onClick={() => onAplicarVista(vista)}
                      className="flex-1 text-left text-sm hover:underline"
                    >
                      {vista.nombre}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEliminarVista(vista.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay vistas guardadas</p>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Nombre de la vista..."
                value={nombreVista}
                onChange={(e) => setNombreVista(e.target.value)}
              />
              <Button onClick={handleGuardarVista} disabled={!nombreVista.trim()}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Botón limpiar */}
          <Button variant="outline" className="w-full" onClick={onLimpiar}>
            Limpiar filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
