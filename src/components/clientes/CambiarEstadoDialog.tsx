import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cliente } from '@/dal/clientes';

interface CambiarEstadoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onConfirm: (nuevoEstado: string) => void;
}

export function CambiarEstadoDialog({
  open,
  onOpenChange,
  cliente,
  onConfirm,
}: CambiarEstadoDialogProps) {
  const [nuevoEstado, setNuevoEstado] = useState<string>('');

  const handleConfirm = () => {
    if (nuevoEstado) {
      onConfirm(nuevoEstado);
      onOpenChange(false);
      setNuevoEstado('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Cliente</DialogTitle>
          <DialogDescription>
            Cambia el estado relacional de <strong>{cliente?.nombre}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="estado">Nuevo Estado</Label>
            <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
                <SelectItem value="Problemático">Problemático</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!nuevoEstado}>
            Cambiar Estado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
