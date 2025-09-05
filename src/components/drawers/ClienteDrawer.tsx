import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateRut, formatRut } from '@/lib/rut-validator';

interface ClienteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ClienteDrawer({ open, onOpenChange, onSuccess }: ClienteDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    tipo: 'Privado',
    direccion: '',
    // Contacto principal opcional
    crearContacto: false,
    contacto_nombre: '',
    contacto_email: '',
    contacto_telefono: '',
    contacto_cargo: ''
  });

  const { toast } = useToast();

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validation = validateRut(e.target.value);
    setFormData({ ...formData, rut: validation.formatted || e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.rut) {
      toast({
        title: "Error",
        description: "Nombre y RUT son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const rutValidation = validateRut(formData.rut);
    if (!rutValidation.valid) {
      toast({
        title: "Error",
        description: rutValidation.error || "RUT inválido",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Crear cliente
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          nombre: formData.nombre,
          rut: formData.rut,
          tipo: formData.tipo,
          direccion: formData.direccion,
          estado_relacional: 'Nuevo',
          score: 0
        })
        .select()
        .single();

      if (clienteError) throw clienteError;

      // Crear contacto principal si se especificó
      if (formData.crearContacto && formData.contacto_nombre) {
        const { error: contactoError } = await supabase
          .from('contactos')
          .insert({
            cliente_id: cliente.id,
            nombre: formData.contacto_nombre,
            email: formData.contacto_email,
            telefono: formData.contacto_telefono,
            cargo: formData.contacto_cargo,
            principal: true
          });

        if (contactoError) throw contactoError;
      }

      toast({
        title: "Éxito",
        description: "Cliente creado correctamente",
      });

      // Reset form
      setFormData({
        nombre: '',
        rut: '',
        tipo: 'Privado',
        direccion: '',
        crearContacto: false,
        contacto_nombre: '',
        contacto_email: '',
        contacto_telefono: '',
        contacto_cargo: ''
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Nuevo Cliente</SheetTitle>
          <SheetDescription>
            Crear un nuevo cliente en el sistema
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="nombre">Razón Social / Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Nombre del cliente"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rut">RUT *</Label>
            <Input
              id="rut"
              value={formData.rut}
              onChange={handleRutChange}
              placeholder="12.345.678-9"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Cliente</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Público">Público</SelectItem>
                <SelectItem value="Privado">Privado</SelectItem>
                <SelectItem value="Revendedor">Revendedor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Textarea
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Dirección del cliente"
              rows={2}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="crearContacto"
                checked={formData.crearContacto}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, crearContacto: checked as boolean })
                }
              />
              <Label htmlFor="crearContacto">Agregar contacto principal</Label>
            </div>

            {formData.crearContacto && (
              <div className="space-y-3 pl-6 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="contacto_nombre">Nombre del Contacto</Label>
                  <Input
                    id="contacto_nombre"
                    value={formData.contacto_nombre}
                    onChange={(e) => setFormData({ ...formData, contacto_nombre: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto_email">Email</Label>
                  <Input
                    id="contacto_email"
                    type="email"
                    value={formData.contacto_email}
                    onChange={(e) => setFormData({ ...formData, contacto_email: e.target.value })}
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto_telefono">Teléfono</Label>
                  <Input
                    id="contacto_telefono"
                    value={formData.contacto_telefono}
                    onChange={(e) => setFormData({ ...formData, contacto_telefono: e.target.value })}
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto_cargo">Cargo</Label>
                  <Input
                    id="contacto_cargo"
                    value={formData.contacto_cargo}
                    onChange={(e) => setFormData({ ...formData, contacto_cargo: e.target.value })}
                    placeholder="Gerente, Encargado, etc."
                  />
                </div>
              </div>
            )}
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
              Crear Cliente
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}