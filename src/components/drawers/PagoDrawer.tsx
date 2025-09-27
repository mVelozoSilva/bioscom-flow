import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

const pagoSchema = z.object({
  factura_id: z.string().min(1, 'Selecciona una factura'),
  tipo: z.string().min(1, 'Selecciona el tipo de pago'),
  monto: z.number().min(1, 'El monto debe ser mayor a 0'),
  fecha_pago: z.date({
    required_error: 'Selecciona la fecha del pago'
  }),
  referencia: z.string().optional(),
  verificado: z.boolean().default(false),
});

type PagoForm = z.infer<typeof pagoSchema>;

interface PagoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pago?: any;
  onSave: () => void;
}

export function PagoDrawer({ open, onOpenChange, pago, onSave }: PagoDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<PagoForm>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      factura_id: '',
      tipo: 'Transferencia',
      monto: 0,
      fecha_pago: new Date(),
      referencia: '',
      verificado: false,
    }
  });

  useEffect(() => {
    if (open) {
      loadData();
      if (pago) {
        form.reset({
          factura_id: pago.factura_id || '',
          tipo: pago.tipo || 'Transferencia',
          monto: pago.monto || 0,
          fecha_pago: pago.fecha_pago ? new Date(pago.fecha_pago) : new Date(),
          referencia: pago.referencia || '',
          verificado: pago.verificado || false,
        });
      } else {
        form.reset({
          factura_id: '',
          tipo: 'Transferencia',
          monto: 0,
          fecha_pago: new Date(),
          referencia: '',
          verificado: false,
        });
      }
    }
  }, [open, pago, form]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from('facturas')
        .select(`
          id,
          numero_factura,
          monto,
          estado,
          clientes (
            nombre
          )
        `)
        .in('estado', ['Pendiente', 'Vencida'])
        .order('numero_factura', { ascending: true });

      if (error) throw error;
      setFacturas(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las facturas",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: PagoForm) => {
    try {
      setLoading(true);

      const pagoData = {
        factura_id: data.factura_id,
        tipo: data.tipo,
        monto: data.monto,
        fecha_pago: data.fecha_pago.toISOString().split('T')[0],
        referencia: data.referencia || null,
        verificado: data.verificado,
      };

      if (pago?.id) {
        const { error } = await supabase
          .from('pagos')
          .update(pagoData)
          .eq('id', pago.id);

        if (error) throw error;

        toast({
          title: "Pago actualizado",
          description: "El pago se ha actualizado correctamente"
        });
      } else {
        const { error } = await supabase
          .from('pagos')
          .insert([pagoData]);

        if (error) throw error;

        // If verified, update the invoice status
        if (data.verificado) {
          await supabase
            .from('facturas')
            .update({ estado: 'Pagada' })
            .eq('id', data.factura_id);
        }

        toast({
          title: "Pago registrado",
          description: "El pago se ha registrado correctamente"
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al guardar el pago",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFacturaChange = (facturaId: string) => {
    const factura = facturas.find(f => f.id === facturaId);
    if (factura) {
      form.setValue('monto', factura.monto);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle>
            {pago ? 'Editar Pago' : 'Nuevo Pago'}
          </SheetTitle>
          <SheetDescription>
            {pago ? 'Modifica los datos del pago' : 'Registra un nuevo pago recibido'}
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
                name="factura_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factura *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFacturaChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una factura" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {facturas.map((factura) => (
                          <SelectItem key={factura.id} value={factura.id}>
                            {factura.numero_factura} - {factura.clientes?.nombre} - ${factura.monto?.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pago *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                          <SelectItem value="Cheque">Cheque</SelectItem>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                          <SelectItem value="Depósito">Depósito</SelectItem>
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
              </div>

              <FormField
                control={form.control}
                name="fecha_pago"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha del Pago *</FormLabel>
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
                          disabled={(date) => date > new Date()}
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
                name="referencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia</FormLabel>
                    <FormControl>
                      <Input placeholder="TRF-2025-0001, CHQ-123456, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verificado"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Pago verificado
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Marca si el pago ha sido verificado y confirmado
                      </p>
                    </div>
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
                  {pago ? 'Actualizar' : 'Registrar'} Pago
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}