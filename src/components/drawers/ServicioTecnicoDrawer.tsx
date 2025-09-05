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
import { clientesSeed, productosSeed } from '@/data/seeds';

interface ServicioTecnicoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ServicioTecnicoDrawer({ open, onOpenChange, onSuccess }: ServicioTecnicoDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    equipo: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    tipo: 'Correctivo',
    origen: 'Cliente',
    descripcion: '',
    prioridad: 'media',
    fecha_programada: undefined as Date | undefined,
    contacto_cliente: '',
    telefono_contacto: ''
  });

  const { toast } = useToast();

  const clienteSeleccionado = clientesSeed.find(c => c.id === formData.cliente_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_id || !formData.equipo || !formData.descripcion) {
      toast({
        title: "Error",
        description: "Cliente, equipo y descripción son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('servicios_tecnicos')
        .insert({
          cliente_id: formData.cliente_id,
          equipo: formData.equipo,
          marca: formData.marca || null,
          modelo: formData.modelo || null,
          numero_serie: formData.numero_serie || null,
          tipo: formData.tipo,
          origen: formData.origen,
          descripcion: formData.descripcion,
          prioridad: formData.prioridad,
          estado: 'pendiente',
          fecha_programada: formData.fecha_programada?.toISOString().split('T')[0],
          contacto_cliente: formData.contacto_cliente || null,
          telefono_contacto: formData.telefono_contacto || null
        });

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Orden de servicio técnico creada correctamente",
      });

      // Reset form
      setFormData({
        cliente_id: '',
        equipo: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        tipo: 'Correctivo',
        origen: 'Cliente',
        descripcion: '',
        prioridad: 'media',
        fecha_programada: undefined,
        contacto_cliente: '',
        telefono_contacto: ''
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating service order:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la orden de servicio",
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
          <SheetTitle>Nueva Orden de Servicio</SheetTitle>
          <SheetDescription>
            Crear una nueva orden de servicio técnico
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
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

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Tipo de Servicio</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Correctivo">Correctivo</SelectItem>
                  <SelectItem value="Preventivo">Preventivo</SelectItem>
                  <SelectItem value="Instalación">Instalación</SelectItem>
                  <SelectItem value="Calibración">Calibración</SelectItem>
                  <SelectItem value="Capacitación">Capacitación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Origen</Label>
              <Select
                value={formData.origen}
                onValueChange={(value) => setFormData({ ...formData, origen: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cliente">Cliente</SelectItem>
                  <SelectItem value="Interno">Interno</SelectItem>
                  <SelectItem value="Garantía">Garantía</SelectItem>
                  <SelectItem value="Contrato">Contrato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipo">Equipo/Producto *</Label>
            <Input
              id="equipo"
              value={formData.equipo}
              onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
              placeholder="Nombre del equipo o producto"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                placeholder="Marca del equipo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Modelo del equipo"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_serie">Número de Serie</Label>
            <Input
              id="numero_serie"
              value={formData.numero_serie}
              onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
              placeholder="Número de serie del equipo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción del Problema/Servicio *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe el problema o servicio requerido"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select
              value={formData.prioridad}
              onValueChange={(value) => setFormData({ ...formData, prioridad: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha Programada</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.fecha_programada ? (
                    format(formData.fecha_programada, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.fecha_programada}
                  onSelect={(date) => setFormData({ ...formData, fecha_programada: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Información de Contacto</h4>
            
            <div className="space-y-2">
              <Label htmlFor="contacto_cliente">Contacto en Cliente</Label>
              <Input
                id="contacto_cliente"
                value={formData.contacto_cliente}
                onChange={(e) => setFormData({ ...formData, contacto_cliente: e.target.value })}
                placeholder="Nombre del contacto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono_contacto">Teléfono de Contacto</Label>
              <Input
                id="telefono_contacto"
                value={formData.telefono_contacto}
                onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                placeholder="+56 9 1234 5678"
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
              Crear Orden
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}