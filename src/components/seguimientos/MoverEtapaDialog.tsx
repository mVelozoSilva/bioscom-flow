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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MoverEtapaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seguimiento: any;
  etapaNueva: string;
  onConfirmar: (datos?: any) => Promise<void>;
}

export function MoverEtapaDialog({
  open,
  onOpenChange,
  seguimiento,
  etapaNueva,
  onConfirmar,
}: MoverEtapaDialogProps) {
  const [fechaCierre, setFechaCierre] = useState<Date>();
  const [montoCerrado, setMontoCerrado] = useState('');
  const [motivoPerdida, setMotivoPerdida] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    setLoading(true);
    try {
      const datos: any = {};

      if (etapaNueva === 'Cerrado Ganado') {
        datos.fechaCierre = fechaCierre?.toISOString();
        datos.montoCerrado = montoCerrado ? parseFloat(montoCerrado) : undefined;
      } else if (etapaNueva === 'Cerrado Perdido') {
        datos.motivoPerdida = motivoPerdida;
      }

      await onConfirmar(datos);
      onOpenChange(false);

      // Reset form
      setFechaCierre(undefined);
      setMontoCerrado('');
      setMotivoPerdida('');
    } catch (error) {
      console.error('Error al mover etapa:', error);
    } finally {
      setLoading(false);
    }
  };

  const requiereConfirmacion = etapaNueva === 'Cerrado Ganado' || etapaNueva === 'Cerrado Perdido';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover a {etapaNueva}</DialogTitle>
          <DialogDescription>
            {requiereConfirmacion
              ? `Confirma los detalles para mover la oportunidad "${seguimiento.nombre}" a ${etapaNueva}.`
              : `¿Estás seguro de mover la oportunidad "${seguimiento.nombre}" a ${etapaNueva}?`}
          </DialogDescription>
        </DialogHeader>

        {etapaNueva === 'Cerrado Ganado' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-cierre">Fecha de cierre</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="fecha-cierre"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !fechaCierre && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaCierre ? (
                      format(fechaCierre, 'dd/MM/yyyy', { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaCierre}
                    onSelect={setFechaCierre}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monto-cerrado">Monto cerrado (opcional)</Label>
              <Input
                id="monto-cerrado"
                type="number"
                placeholder="Monto final cerrado"
                value={montoCerrado}
                onChange={(e) => setMontoCerrado(e.target.value)}
              />
            </div>
          </div>
        )}

        {etapaNueva === 'Cerrado Perdido' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="motivo-perdida">Motivo de pérdida</Label>
              <Textarea
                id="motivo-perdida"
                placeholder="Describe el motivo por el cual se perdió esta oportunidad..."
                value={motivoPerdida}
                onChange={(e) => setMotivoPerdida(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
