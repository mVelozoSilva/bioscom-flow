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
import { SeguimientosFilterState, VistaGuardada } from '@/hooks/use-seguimientos-filters';
import { useState } from 'react';

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filtros: SeguimientosFilterState;
  onActualizarFiltro: <K extends keyof SeguimientosFilterState>(
    key: K,
    value: SeguimientosFilterState[K]
  ) => void;
  onLimpiar: () => void;
  vistasGuardadas: VistaGuardada[];
  onGuardarVista: (nombre: string) => void;
  onAplicarVista: (vista: VistaGuardada) => void;
  onEliminarVista: (id: string) => void;
}

const ETAPAS = ['Prospecto', 'Propuesta', 'Negociación', 'Cerrado Ganado', 'Cerrado Perdido'];
const PROPIETARIOS = ['Juan Pérez', 'María García', 'Carlos López'];

export function SeguimientosFiltersDrawer({
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
          <SheetTitle>Filtros de Oportunidades</SheetTitle>
          <SheetDescription>
            Filtra y guarda vistas personalizadas de tus oportunidades
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Búsqueda global */}
          <div className="space-y-2">
            <Label htmlFor="texto">Búsqueda global</Label>
            <Input
              id="texto"
              placeholder="Buscar por nombre o cliente..."
              value={filtros.texto}
              onChange={(e) => onActualizarFiltro('texto', e.target.value)}
            />
          </div>

          {/* Etapa - Multi-select */}
          <div className="space-y-2">
            <Label>Etapa</Label>
            <div className="space-y-2">
              {ETAPAS.map((etapa) => (
                <div key={etapa} className="flex items-center space-x-2">
                  <Checkbox
                    id={`etapa-${etapa}`}
                    checked={filtros.etapa.includes(etapa)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onActualizarFiltro('etapa', [...filtros.etapa, etapa]);
                      } else {
                        onActualizarFiltro(
                          'etapa',
                          filtros.etapa.filter((e) => e !== etapa)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`etapa-${etapa}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {etapa}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Propietario */}
          <div className="space-y-2">
            <Label htmlFor="propietario">Propietario</Label>
            <Select
              value={filtros.propietario || 'all'}
              onValueChange={(value) =>
                onActualizarFiltro('propietario', value === 'all' ? '' : value)
              }
            >
              <SelectTrigger id="propietario">
                <SelectValue placeholder="Todos los propietarios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {PROPIETARIOS.map((propietario) => (
                  <SelectItem key={propietario} value={propietario}>
                    {propietario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rango de cierre esperado */}
          <div className="space-y-2">
            <Label>Cierre esperado</Label>
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
                        !filtros.cierreEsperadoDesde && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.cierreEsperadoDesde ? (
                        format(new Date(filtros.cierreEsperadoDesde), 'dd/MM/yyyy', { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        filtros.cierreEsperadoDesde ? new Date(filtros.cierreEsperadoDesde) : undefined
                      }
                      onSelect={(date) =>
                        onActualizarFiltro('cierreEsperadoDesde', date ? date.toISOString() : '')
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
                        !filtros.cierreEsperadoHasta && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filtros.cierreEsperadoHasta ? (
                        format(new Date(filtros.cierreEsperadoHasta), 'dd/MM/yyyy', { locale: es })
                      ) : (
                        <span>Seleccionar</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        filtros.cierreEsperadoHasta ? new Date(filtros.cierreEsperadoHasta) : undefined
                      }
                      onSelect={(date) =>
                        onActualizarFiltro('cierreEsperadoHasta', date ? date.toISOString() : '')
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
                    <Button variant="ghost" size="sm" onClick={() => onEliminarVista(vista.id)}>
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
