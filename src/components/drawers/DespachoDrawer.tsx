import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { clientesSeed, cotizacionesSeed } from '@/data/seeds';

interface DespachoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DespachoDrawer({ open, onOpenChange, onSuccess }: DespachoDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    cotizacion_id: '',
    institucion: '',
    rut_institucion: '',
    direccion: '',
    contacto: '',
    email: '',
    telefono: '',
    responsable_entrega: '',
    telefono_responsable: '',
    plazo_entrega: undefined as Date | undefined,
    hora_entrega: '',
    tipo_despacho: 'normal',
    transportista: '',
    observaciones: ''
  });

  const { toast } = useToast();

  const clienteSeleccionado = clientesSeed.find(c => c.id === formData.cliente_id);
  const cotizacionesFiltradas = cotizacionesSeed.filter(c => 
    !formData.cliente_id || c.cliente_id === formData.cliente_id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_id || !formData.institucion || !formData.direccion || !formData.contacto) {
      toast({
        title: "Error",
        description: "Cliente, institución, dirección y contacto son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('despachos')
        .insert({
          cliente_id: formData.cliente_id,
          cotizacion_id: formData.cotizacion_id || null,
          institucion: formData.institucion,
          rut_institucion: formData.rut_institucion || null,
          direccion: formData.direccion,
          contacto: formData.contacto,
          email: formData.email || null,
          telefono: formData.telefono || null,
          responsable_entrega: formData.responsable_entrega || null,
          telefono_responsable: formData.telefono_responsable || null,
          plazo_entrega: formData.plazo_entrega?.toISOString().split('T')[0],
          hora_entrega: formData.hora_entrega || null,
          tipo_despacho: formData.tipo_despacho,
          transportista: formData.transportista || null,
          observaciones: formData.observaciones || null,
          estado: 'Pendiente'
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Despacho creado correctamente",
      });

      // Reset form
      setFormData({
        cliente_id: '',
        cotizacion_id: '',
        institucion: '',
        rut_institucion: '',
        direccion: '',
        contacto: '',
        email: '',
        telefono: '',
        responsable_entrega: '',
        telefono_responsable: '',
        plazo_entrega: undefined,
        hora_entrega: '',
        tipo_despacho: 'normal',
        transportista: '',
        observaciones: ''
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating dispatch:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el despacho",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuevo Despacho</SheetTitle>
          <SheetDescription>
            Crear una nueva orden de despacho
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={(value) => setFormData({ ...formData, cliente_id: value, cotizacion_id: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientesSeed.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    <div>
                      <div className="font-medium">{cliente.nombre}</div>
                      <div className="text-sm text-muted-foreground">{cliente.rut}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cotización (opcional)</Label>
            <Select
              value={formData.cotizacion_id}
              onValueChange={(value) => setFormData({ ...formData, cotizacion_id: value })}
              disabled={!formData.cliente_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cotización" />
              </SelectTrigger>
              <SelectContent>
                {cotizacionesFiltradas.map((cotizacion) => (
                  <SelectItem key={cotizacion.id} value={cotizacion.id}>
                    <div>
                      <div className="font-medium">{cotizacion.codigo}</div>
                      <div className="text-sm text-muted-foreground">{cotizacion.estado}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Datos de Entrega</h4>
            
            <div className="space-y-2">
              <Label htmlFor="institucion">Institución/Empresa *</Label>
              <Input
                id="institucion"
                value={formData.institucion}
                onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                placeholder="Nombre de la institución"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rut_institucion">RUT Institución</Label>
              <Input
                id="rut_institucion"
                value={formData.rut_institucion}
                onChange={(e) => setFormData({ ...formData, rut_institucion: e.target.value })}
                placeholder="12.345.678-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección de Entrega *</Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Dirección completa de entrega"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="contacto">Contacto *</Label>
                <Input
                  id="contacto"
                  value={formData.contacto}
                  onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                  placeholder="Nombre del contacto"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="responsable_entrega">Responsable Entrega</Label>
                <Input
                  id="responsable_entrega"
                  value={formData.responsable_entrega}
                  onChange={(e) => setFormData({ ...formData, responsable_entrega: e.target.value })}
                  placeholder="Nombre del responsable"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono_responsable">Teléfono Responsable</Label>
                <Input
                  id="telefono_responsable"
                  value={formData.telefono_responsable}
                  onChange={(e) => setFormData({ ...formData, telefono_responsable: e.target.value })}
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Condiciones de Despacho</h4>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Plazo de Entrega</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.plazo_entrega ? (
                        format(formData.plazo_entrega, "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.plazo_entrega}
                      onSelect={(date) => setFormData({ ...formData, plazo_entrega: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_entrega">Hora Entrega</Label>
                <Input
                  id="hora_entrega"
                  type="time"
                  value={formData.hora_entrega}
                  onChange={(e) => setFormData({ ...formData, hora_entrega: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Despacho</Label>
              <Select
                value={formData.tipo_despacho}
                onValueChange={(value) => setFormData({ ...formData, tipo_despacho: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transportista">Transportista</Label>
              <Input
                id="transportista"
                value={formData.transportista}
                onChange={(e) => setFormData({ ...formData, transportista: e.target.value })}
                placeholder="Empresa transportista"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Observaciones adicionales para el despacho"
                rows={3}
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Despacho
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}