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
import { SeguimientosDAL } from '@/dal/seguimientos';
import { clientesDAL } from '@/dal/clientes';
import { cotizacionesDAL } from '@/dal/cotizaciones';

const seguimientoSchema = z.object({
  cliente_id: z.string().min(1, 'Selecciona un cliente'),
  vendedor_id: z.string().optional(),
  cotizacion_id: z.string().optional(),
  prioridad: z.string().min(1, 'Selecciona una prioridad'),
  estado: z.string().min(1, 'Selecciona un estado'),
  proxima_gestion: z.date({
    required_error: 'Selecciona una fecha de próxima gestión'
  }),
  notas: z.string().optional(),
  origen: z.string().default('Manual')
});

type SeguimientoForm = z.infer<typeof seguimientoSchema>;

interface SeguimientoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seguimiento?: any;
  onSave: () => void;
}

export function SeguimientoDrawer({ open, onOpenChange, seguimiento, onSave }: SeguimientoDrawerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<SeguimientoForm>({
    resolver: zodResolver(seguimientoSchema),
    defaultValues: {
      cliente_id: '',
      vendedor_id: '',
      cotizacion_id: '',
      prioridad: 'Media',
      estado: 'Activo',
      proxima_gestion: new Date(),
      notas: '',
      origen: 'Manual'
    }
  });

  useEffect(() => {
    if (open) {
      loadData();
      if (seguimiento) {
        form.reset({
          cliente_id: seguimiento.cliente_id || '',
          vendedor_id: seguimiento.vendedor_id || '',
          cotizacion_id: seguimiento.cotizacion_id || '',
          prioridad: seguimiento.prioridad || 'Media',
          estado: seguimiento.estado || 'Activo',
          proxima_gestion: seguimiento.proxima_gestion ? new Date(seguimiento.proxima_gestion) : new Date(),
          notas: seguimiento.notas || '',
          origen: seguimiento.origen || 'Manual'
        });
      } else {
        form.reset({
          cliente_id: '',
          vendedor_id: '',
          cotizacion_id: '',
          prioridad: 'Media',
          estado: 'Activo',
          proxima_gestion: new Date(),
          notas: '',
          origen: 'Manual'
        });
      }
    }
  }, [open, seguimiento, form]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [clientesData, cotizacionesData, vendedoresData] = await Promise.all([
        clientesDAL.listWithContacts(),
        cotizacionesDAL.listWithDetails(),
        // For now, we'll use a mock vendedores list since we don't have a DAL for user_profiles
        Promise.resolve([
          { id: '1', nombre: 'Juan Pérez', email: 'juan@example.com' },
          { id: '2', nombre: 'María González', email: 'maria@example.com' },
          { id: '3', nombre: 'Carlos Silva', email: 'carlos@example.com' }
        ])
      ]);
      
      setClientes(clientesData);
      setCotizaciones(cotizacionesData);
      setVendedores(vendedoresData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos necesarios",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: SeguimientoForm) => {
    try {
      setLoading(true);

      const seguimientoData = {
        ...data,
        proxima_gestion: data.proxima_gestion.toISOString().split('T')[0]
      };

      if (seguimiento?.id) {
        await SeguimientosDAL.update(seguimiento.id, seguimientoData);
        toast({
          title: "Seguimiento actualizado",
          description: "El seguimiento se ha actualizado correctamente"
        });
      } else {
        await SeguimientosDAL.create(seguimientoData);
        toast({
          title: "Seguimiento creado",
          description: "El seguimiento se ha creado correctamente"
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el seguimiento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-1">
          <SheetTitle>
            {seguimiento ? 'Editar Seguimiento' : 'Nuevo Seguimiento'}
          </SheetTitle>
          <SheetDescription>
            {seguimiento ? 'Modifica los datos del seguimiento' : 'Crea un nuevo seguimiento comercial'}
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
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="vendedor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendedor Asignado (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un vendedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin vendedor asignado</SelectItem>
                        {vendedores.map((vendedor) => (
                          <SelectItem key={vendedor.id} value={vendedor.id}>
                            {vendedor.nombre} - {vendedor.email}
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
                name="cotizacion_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cotización (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una cotización" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin cotización asociada</SelectItem>
                        {cotizaciones.map((cotizacion) => (
                          <SelectItem key={cotizacion.id} value={cotizacion.id}>
                            {cotizacion.codigo} - {cotizacion.estado}
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
                  name="prioridad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Baja">Baja</SelectItem>
                          <SelectItem value="Media">Media</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="Activo">Activo</SelectItem>
                          <SelectItem value="En gestión">En gestión</SelectItem>
                          <SelectItem value="Pausado">Pausado</SelectItem>
                          <SelectItem value="Cerrado">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="proxima_gestion"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Próxima Gestión *</FormLabel>
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
                              <span>Selecciona una fecha</span>
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

              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones del seguimiento..."
                        {...field}
                        rows={4}
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
                  {seguimiento ? 'Actualizar' : 'Crear'} Seguimiento
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}