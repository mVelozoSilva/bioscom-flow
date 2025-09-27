import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServicioTecnicoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  servicioId?: string;
}

interface Cliente {
  id: string;
  nombre: string;
  rut: string;
}

export function ServicioTecnicoDrawer({
  open,
  onOpenChange,
  onSuccess,
  servicioId
}: ServicioTecnicoDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  const [formData, setFormData] = useState({
    tipo: '',
    cliente_id: '',
    contacto_cliente: '',
    telefono_contacto: '',
    equipo: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    prioridad: 'media',
    origen: '',
    descripcion: '',
    fecha_programada: '',
    observaciones: ''
  });

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nombre, rut')
        .order('nombre');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const loadServicio = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('servicios_tecnicos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setFormData({
        tipo: data.tipo || '',
        cliente_id: data.cliente_id || '',
        contacto_cliente: data.contacto_cliente || '',
        telefono_contacto: data.telefono_contacto || '',
        equipo: data.equipo || '',
        marca: data.marca || '',
        modelo: data.modelo || '',
        numero_serie: data.numero_serie || '',
        prioridad: data.prioridad || 'media',
        origen: data.origen || '',
        descripcion: data.descripcion || '',
        fecha_programada: data.fecha_programada ? data.fecha_programada.split('T')[0] : '',
        observaciones: data.observaciones || ''
      });
    } catch (error) {
      console.error('Error loading servicio:', error);
    }
  };

  useEffect(() => {
    if (open) {
      loadClientes();
      if (servicioId) {
        loadServicio(servicioId);
      } else {
        // Reset form
        setFormData({
          tipo: '',
          cliente_id: '',
          contacto_cliente: '',
          telefono_contacto: '',
          equipo: '',
          marca: '',
          modelo: '',
          numero_serie: '',
          prioridad: 'media',
          origen: '',
          descripcion: '',
          fecha_programada: '',
          observaciones: ''
        });
      }
    }
  }, [open, servicioId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        fecha_programada: formData.fecha_programada || null,
      };

      if (servicioId) {
        const { error } = await supabase
          .from('servicios_tecnicos')
          .update(dataToSubmit)
          .eq('id', servicioId);

        if (error) throw error;

        toast({
          title: "Servicio actualizado",
          description: "El servicio técnico se ha actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from('servicios_tecnicos')
          .insert(dataToSubmit);

        if (error) throw error;

        toast({
          title: "Servicio creado",
          description: "El servicio técnico se ha creado correctamente",
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el servicio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>
            {servicioId ? 'Editar Servicio Técnico' : 'Nuevo Servicio Técnico'}
          </DrawerTitle>
          <DrawerDescription>
            Complete la información del servicio técnico
          </DrawerDescription>
        </DrawerHeader>
        
        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Servicio *</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="correctivo">Correctivo</SelectItem>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                  <SelectItem value="instalacion">Instalación</SelectItem>
                  <SelectItem value="capacitacion">Capacitación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <Select value={formData.cliente_id} onValueChange={(value) => handleInputChange('cliente_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(cliente => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nombre} - {cliente.rut}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contacto_cliente">Contacto Cliente</Label>
              <Input
                id="contacto_cliente"
                value={formData.contacto_cliente}
                onChange={(e) => handleInputChange('contacto_cliente', e.target.value)}
                placeholder="Nombre del contacto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono_contacto">Teléfono Contacto</Label>
              <Input
                id="telefono_contacto"
                value={formData.telefono_contacto}
                onChange={(e) => handleInputChange('telefono_contacto', e.target.value)}
                placeholder="+56 9 1234 5678"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipo">Equipo *</Label>
            <Input
              id="equipo"
              value={formData.equipo}
              onChange={(e) => handleInputChange('equipo', e.target.value)}
              placeholder="Descripción del equipo"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                placeholder="Marca"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                placeholder="Modelo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_serie">N° Serie</Label>
              <Input
                id="numero_serie"
                value={formData.numero_serie}
                onChange={(e) => handleInputChange('numero_serie', e.target.value)}
                placeholder="Número de serie"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select value={formData.prioridad} onValueChange={(value) => handleInputChange('prioridad', value)}>
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
              <Label htmlFor="origen">Origen *</Label>
              <Select value={formData.origen} onValueChange={(value) => handleInputChange('origen', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telefono">Teléfono</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="preventivo">Preventivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_programada">Fecha Programada</Label>
            <Input
              id="fecha_programada"
              type="date"
              value={formData.fecha_programada}
              onChange={(e) => handleInputChange('fecha_programada', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción del Problema *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción detallada del problema o servicio requerido"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Observaciones adicionales"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : (servicioId ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}