import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CrearTareaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seguimiento: any;
  onCrear: (datos: any) => Promise<void>;
}

const USUARIOS = ['Juan Pérez', 'María García', 'Carlos López'];

export function CrearTareaDialog({
  open,
  onOpenChange,
  seguimiento,
  onCrear,
}: CrearTareaDialogProps) {
  const [titulo, setTitulo] = useState('');
  const [vencimiento, setVencimiento] = useState<Date>();
  const [asignadoA, setAsignadoA] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCrear = async () => {
    if (!titulo || !vencimiento) {
      return;
    }

    setLoading(true);
    try {
      await onCrear({
        titulo,
        fecha_vencimiento: vencimiento.toISOString().split('T')[0],
        usuario_asignado: asignadoA,
        descripcion: notas,
      });

      onOpenChange(false);

      // Reset form
      setTitulo('');
      setVencimiento(undefined);
      setAsignadoA('');
      setNotas('');
    } catch (error) {
      console.error('Error al crear tarea:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Tarea</DialogTitle>
          <DialogDescription>
            Crea una tarea relacionada con la oportunidad "{seguimiento.nombre}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              placeholder="Título de la tarea"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vencimiento">Fecha de vencimiento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="vencimiento"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !vencimiento && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {vencimiento ? (
                    format(vencimiento, 'dd/MM/yyyy', { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={vencimiento} onSelect={setVencimiento} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asignado-a">Asignado a</Label>
            <Select value={asignadoA || 'none'} onValueChange={(value) => setAsignadoA(value === 'none' ? '' : value)}>
              <SelectTrigger id="asignado-a">
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {USUARIOS.map((usuario) => (
                  <SelectItem key={usuario} value={usuario}>
                    {usuario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleCrear} disabled={!titulo || !vencimiento || loading}>
            {loading ? 'Creando...' : 'Crear Tarea'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
