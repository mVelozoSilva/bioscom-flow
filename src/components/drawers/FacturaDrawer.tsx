import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { clientesDAL } from '@/dal/clientes';

const facturaSchema = z.object({
  numero_factura: z.string().min(1, 'El número de factura es requerido'),
  cliente_id: z.string().min(1, 'Selecciona un cliente'),
  rut_cliente: z.string().min(1, 'El RUT del cliente es requerido'),
  monto: z.number().min(1, 'El monto debe ser mayor a 0'),
  fecha_emision: z.date({
    required_error: 'Selecciona la fecha de emisión'
  }),
  fecha_vencimiento: z.date({
    required_error: 'Selecciona la fecha de vencimiento'
  }),
  estado: z.string().min(1, 'Selecciona un estado'),
  estado_documento: z.string().min(1, 'Selecciona el estado del documento'),
  numero_ot_oc: z.string().optional(),
  observaciones: z.string().optional(),
});

type FacturaForm = z.infer<typeof facturaSchema>;

interface FacturaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  factura?: any;
  onSave: () => void;
}

export function FacturaDrawer({ open, onOpenChange, factura, onSave }: FacturaDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<FacturaForm>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      numero_factura: '',
      cliente_id: '',
      rut_cliente: '',
      monto: 0,
      fecha_emision: new Date(),
      fecha_vencimiento: new Date(),
      estado: 'Pendiente',
      estado_documento: 'emitida',
      numero_ot_oc: '',
      observaciones: '',
    }
  });

  useEffect(() => {
    if (open) {
      loadData();
      if (factura) {
        form.reset({
          numero_factura: factura.numero_factura || '',
          cliente_id: factura.cliente_id || '',
          rut_cliente: factura.rut_cliente || '',
          monto: factura.monto || 0,
          fecha_emision: factura.fecha_emision ? new Date(factura.fecha_emision) : new Date(),
          fecha_vencimiento: factura.fecha_vencimiento ? new Date(factura.fecha_vencimiento) : new Date(),
          estado: factura.estado || 'Pendiente',
          estado_documento: factura.estado_documento || 'emitida',
          numero_ot_oc: factura.numero_ot_oc || '',
          observaciones: factura.observaciones || '',
        });
      } else {
        form.reset({
          numero_factura: '',
          cliente_id: '',
          rut_cliente: '',
          monto: 0,
          fecha_emision: new Date(),
          fecha_vencimiento: new Date(),
          estado: 'Pendiente',
          estado_documento: 'emitida',
          numero_ot_oc: '',
          observaciones: '',
        });
      }
    }
  }, [open, factura, form]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const clientesData = await clientesDAL.listWithContacts();
      setClientes(clientesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: FacturaForm) => {
    try {
      setLoading(true);

      const facturaData = {
        numero_factura: data.numero_factura,
        cliente_id: data.cliente_id,
        rut_cliente: data.rut_cliente,
        monto: data.monto,
        fecha_emision: data.fecha_emision.toISOString().split('T')[0],
        fecha_vencimiento: data.fecha_vencimiento.toISOString().split('T')[0],
        estado: data.estado,
        estado_documento: data.estado_documento,
        numero_ot_oc: data.numero_ot_oc || null,
        observaciones: data.observaciones || null,
      };

      if (factura?.id) {
        const { error } = await supabase
          .from('facturas')
          .update(facturaData)
          .eq('id', factura.id);

        if (error) throw error;

        toast({
          title: "Factura actualizada",
          description: "La factura se ha actualizada correctamente"
        });
      } else {
        const { error } = await supabase
          .from('facturas')
          .insert([facturaData]);

        if (error) throw error;

        toast({
          title: "Factura creada",
          description: "La factura se ha creado correctamente"
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al guardar la factura",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClienteChange = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      form.setValue('rut_cliente', cliente.rut);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle>
            {factura ? 'Editar Factura' : 'Nueva Factura'}
          </SheetTitle>
          <SheetDescription>
            {factura ? 'Modifica los datos de la factura' : 'Crea una nueva factura'}
          </SheetDescription>
        </SheetHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Cargando datos...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <FormField
                control={form.control}
                name="numero_factura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Factura *</FormLabel>
                    <FormControl>
                      <Input placeholder="F001-00001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleClienteChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nombre} - {cliente.rut}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="850000" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fecha_emision"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha Emisión *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fecha_vencimiento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha Vencimiento *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Pagada">Pagada</SelectItem>
                          <SelectItem value="Vencida">Vencida</SelectItem>
                          <SelectItem value="Anulada">Anulada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estado_documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado Documento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="emitida">Emitida</SelectItem>
                          <SelectItem value="enviada">Enviada</SelectItem>
                          <SelectItem value="aceptada">Aceptada</SelectItem>
                          <SelectItem value="rechazada">Rechazada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="numero_ot_oc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número OT/OC</FormLabel>
                    <FormControl>
                      <Input placeholder="OC-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas adicionales sobre la factura..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {factura ? 'Actualizar' : 'Crear'} Factura
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}