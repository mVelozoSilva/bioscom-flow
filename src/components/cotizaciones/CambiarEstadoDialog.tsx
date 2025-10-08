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
import { Textarea } from '@/components/ui/textarea';

interface CambiarEstadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cotizacion: any;
  accion: 'aceptar' | 'rechazar';
  onConfirmar: (motivo?: string) => Promise<void>;
}

export function CambiarEstadoDialog({
  open,
  onOpenChange,
  cotizacion,
  accion,
  onConfirmar,
}: CambiarEstadoDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [procesando, setProcesando] = useState(false);

  const handleConfirmar = async () => {
    setProcesando(true);
    try {
      await onConfirmar(accion === 'rechazar' ? motivo : undefined);
      onOpenChange(false);
      setMotivo('');
    } finally {
      setProcesando(false);
    }
  };

  const esRechazo = accion === 'rechazar';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {esRechazo ? 'Rechazar' : 'Aceptar'} cotización
          </DialogTitle>
          <DialogDescription>
            {esRechazo
              ? `¿Estás seguro de que deseas rechazar la cotización ${cotizacion?.codigo}?`
              : `¿Estás seguro de que deseas aceptar la cotización ${cotizacion?.codigo}?`}
          </DialogDescription>
        </DialogHeader>

        {esRechazo && (
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo del rechazo *</Label>
            <Textarea
              id="motivo"
              rows={4}
              placeholder="Ingresa el motivo del rechazo..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant={esRechazo ? 'destructive' : 'default'}
            onClick={handleConfirmar}
            disabled={procesando || (esRechazo && !motivo.trim())}
          >
            {procesando ? 'Procesando...' : esRechazo ? 'Rechazar' : 'Aceptar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
