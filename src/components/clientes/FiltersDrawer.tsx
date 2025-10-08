import { useState } from 'react';
import { Filter, Save, Star, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FilterState, VistaGuardada } from '@/hooks/use-filters';

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filtros: FilterState;
  onActualizarFiltro: <K extends keyof FilterState>(campo: K, valor: FilterState[K]) => void;
  onLimpiarFiltros: () => void;
  vistasGuardadas: VistaGuardada[];
  onGuardarVista: (nombre: string) => void;
  onAplicarVista: (vistaId: string) => void;
  onEliminarVista: (vistaId: string) => void;
}

const ESTADOS_OPCIONES = ['Nuevo', 'Activo', 'Inactivo', 'Problemático'];
const VENDEDORES_OPCIONES = ['Sin asignar', 'Juan Pérez', 'María González', 'Carlos López'];

export function FiltersDrawer({
  open,
  onOpenChange,
  filtros,
  onActualizarFiltro,
  onLimpiarFiltros,
  vistasGuardadas,
  onGuardarVista,
  onAplicarVista,
  onEliminarVista,
}: FiltersDrawerProps) {
  const [nombreNuevaVista, setNombreNuevaVista] = useState('');
  const [mostrarDialogoGuardar, setMostrarDialogoGuardar] = useState(false);
  const [vistaAEliminar, setVistaAEliminar] = useState<string | null>(null);

  const handleGuardarVista = () => {
    if (nombreNuevaVista.trim()) {
      onGuardarVista(nombreNuevaVista.trim());
      setNombreNuevaVista('');
      setMostrarDialogoGuardar(false);
    }
  };

  const handleToggleEstado = (estado: string) => {
    const nuevosEstados = filtros.estados.includes(estado)
      ? filtros.estados.filter(e => e !== estado)
      : [...filtros.estados, estado];
    onActualizarFiltro('estados', nuevosEstados);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avanzados
            </SheetTitle>
            <SheetDescription>
              Personaliza los filtros y guarda vistas para acceso rápido
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Vistas guardadas */}
            {vistasGuardadas.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Vistas Guardadas</Label>
                <div className="space-y-2">
                  {vistasGuardadas.map((vista) => (
                    <div
                      key={vista.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <button
                        onClick={() => {
                          onAplicarVista(vista.id);
                          onOpenChange(false);
                        }}
                        className="flex-1 text-left flex items-center gap-2"
                      >
                        <Star className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{vista.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(vista.fechaCreacion).toLocaleDateString('es-CL')}
                          </p>
                        </div>
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVistaAEliminar(vista.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            {/* Búsqueda global */}
            <div className="space-y-2">
              <Label htmlFor="texto">Búsqueda Global</Label>
              <Input
                id="texto"
                placeholder="Buscar por RUT, nombre..."
                value={filtros.texto}
                onChange={(e) => onActualizarFiltro('texto', e.target.value)}
              />
            </div>

            {/* Estados (multi-select) */}
            <div className="space-y-3">
              <Label>Estados</Label>
              <div className="space-y-2">
                {ESTADOS_OPCIONES.map((estado) => (
                  <div key={estado} className="flex items-center space-x-2">
                    <Checkbox
                      id={`estado-${estado}`}
                      checked={filtros.estados.includes(estado)}
                      onCheckedChange={() => handleToggleEstado(estado)}
                    />
                    <label
                      htmlFor={`estado-${estado}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {estado}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

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
                  {VENDEDORES_OPCIONES.map((vendedor) => (
                    <SelectItem key={vendedor} value={vendedor}>
                      {vendedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Rango de fechas */}
            <div className="space-y-3">
              <Label>Último Contacto</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fechaDesde" className="text-xs text-muted-foreground">
                    Desde
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filtros.fechaDesde && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtros.fechaDesde ? (
                          format(filtros.fechaDesde, 'dd/MM/yyyy', { locale: es })
                        ) : (
                          <span>Fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filtros.fechaDesde}
                        onSelect={(date) => onActualizarFiltro('fechaDesde', date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaHasta" className="text-xs text-muted-foreground">
                    Hasta
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filtros.fechaHasta && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filtros.fechaHasta ? (
                          format(filtros.fechaHasta, 'dd/MM/yyyy', { locale: es })
                        ) : (
                          <span>Fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filtros.fechaHasta}
                        onSelect={(date) => onActualizarFiltro('fechaHasta', date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="flex-col sm:flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => setMostrarDialogoGuardar(true)}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Vista
            </Button>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={onLimpiarFiltros}
                className="flex-1"
              >
                Limpiar
              </Button>
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                Aplicar
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Diálogo para guardar vista */}
      <AlertDialog open={mostrarDialogoGuardar} onOpenChange={setMostrarDialogoGuardar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Guardar Vista</AlertDialogTitle>
            <AlertDialogDescription>
              Dale un nombre a esta vista de filtros para acceder rápidamente más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Ej: Mis cuentas activas"
              value={nombreNuevaVista}
              onChange={(e) => setNombreNuevaVista(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGuardarVista();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNombreNuevaVista('')}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGuardarVista}
              disabled={!nombreNuevaVista.trim()}
            >
              Guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmación para eliminar vista */}
      <AlertDialog open={!!vistaAEliminar} onOpenChange={() => setVistaAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La vista será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (vistaAEliminar) {
                  onEliminarVista(vistaAEliminar);
                  setVistaAEliminar(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
