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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface EnviarEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cotizacion: any;
  onEnviar: (data: {
    to: string;
    cc?: string;
    mensaje?: string;
    adjuntarPDF: boolean;
  }) => Promise<void>;
}

export function EnviarEmailDialog({
  open,
  onOpenChange,
  cotizacion,
  onEnviar,
}: EnviarEmailDialogProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [mensaje, setMensaje] = useState(
    `Estimado cliente,\n\nAdjunto encontrará la cotización ${cotizacion?.codigo || ''}.\n\nSaludos cordiales.`
  );
  const [adjuntarPDF, setAdjuntarPDF] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const handleEnviar = async () => {
    setEnviando(true);
    try {
      await onEnviar({ to, cc, mensaje, adjuntarPDF });
      onOpenChange(false);
      // Reset form
      setTo('');
      setCc('');
      setMensaje(`Estimado cliente,\n\nAdjunto encontrará la cotización ${cotizacion?.codigo || ''}.\n\nSaludos cordiales.`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar cotización por email</DialogTitle>
          <DialogDescription>
            Enviar cotización {cotizacion?.codigo} al cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-to">Para *</Label>
            <Input
              id="email-to"
              type="email"
              placeholder="cliente@ejemplo.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-cc">CC (opcional)</Label>
            <Input
              id="email-cc"
              type="email"
              placeholder="copia@ejemplo.com"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-mensaje">Mensaje</Label>
            <Textarea
              id="email-mensaje"
              rows={6}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="adjuntar-pdf"
              checked={adjuntarPDF}
              onCheckedChange={(checked) => setAdjuntarPDF(checked as boolean)}
            />
            <label
              htmlFor="adjuntar-pdf"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Adjuntar PDF de la cotización
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEnviar} disabled={!to || enviando}>
            {enviando ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
