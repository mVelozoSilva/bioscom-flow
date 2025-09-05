import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Loader2, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { clientesSeed, productosSeed } from '@/data/seeds';

interface CotizacionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (cotizacionId: string) => void;
}

interface CotizacionItem {
  producto_id: string;
  cantidad: number;
  precio_unit: number;
  total_linea: number;
}

const PASOS = [
  { id: 1, titulo: 'Cliente', descripcion: 'Seleccionar cliente y contacto' },
  { id: 2, titulo: 'Productos', descripcion: 'Agregar productos y cantidades' },
  { id: 3, titulo: 'Condiciones', descripcion: 'Condiciones comerciales y observaciones' }
];

export function CotizacionWizard({ open, onOpenChange, onSuccess }: CotizacionWizardProps) {
  const [loading, setLoading] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [formData, setFormData] = useState({
    cliente_id: '',
    contacto_id: '',
    fecha_expiracion: undefined as Date | undefined,
    observaciones: '',
    items: [] as CotizacionItem[]
  });

  const { toast } = useToast();

  const clienteSeleccionado = clientesSeed.find(c => c.id === formData.cliente_id);
  const contactosCliente = clienteSeleccionado?.contactos || [];

  const agregarItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        producto_id: '',
        cantidad: 1,
        precio_unit: 0,
        total_linea: 0
      }]
    });
  };

  const actualizarItem = (index: number, campo: keyof CotizacionItem, valor: any) => {
    const nuevosItems = [...formData.items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    
    // Calcular total línea si cambió cantidad o precio
    if (campo === 'cantidad' || campo === 'precio_unit') {
      nuevosItems[index].total_linea = nuevosItems[index].cantidad * nuevosItems[index].precio_unit;
    }
    
    setFormData({ ...formData, items: nuevosItems });
  };

  const eliminarItem = (index: number) => {
    const nuevosItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: nuevosItems });
  };

  const seleccionarProducto = (index: number, productoId: string) => {
    const producto = productosSeed.find(p => p.id === productoId);
    if (producto) {
      const nuevosItems = [...formData.items];
      nuevosItems[index] = {
        ...nuevosItems[index],
        producto_id: productoId,
        precio_unit: producto.precio_neto,
        total_linea: nuevosItems[index].cantidad * producto.precio_neto
      };
      setFormData({ ...formData, items: nuevosItems });
    }
  };

  const totalCotizacion = formData.items.reduce((sum, item) => sum + item.total_linea, 0);

  const puedeAvanzar = () => {
    switch (pasoActual) {
      case 1:
        return formData.cliente_id !== '';
      case 2:
        return formData.items.length > 0 && formData.items.every(item => 
          item.producto_id && item.cantidad > 0 && item.precio_unit > 0
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!puedeAvanzar()) return;

    setLoading(true);

    try {
      // Generar código único
      const codigo = `COT-${Date.now()}`;

      // Crear cotización
      const { data: cotizacion, error: cotizacionError } = await supabase
        .from('cotizaciones')
        .insert({
          codigo,
          cliente_id: formData.cliente_id,
          contacto_id: formData.contacto_id || null,
          fecha_expiracion: formData.fecha_expiracion?.toISOString().split('T')[0],
          observaciones: formData.observaciones,
          estado: 'Pendiente',
          score: 0
        })
        .select()
        .single();

      if (cotizacionError) throw cotizacionError;

      // Crear items
      const itemsData = formData.items.map(item => ({
        cotizacion_id: cotizacion.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unit: item.precio_unit,
        total_linea: item.total_linea
      }));

      const { error: itemsError } = await supabase
        .from('cotizacion_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      toast({
        title: "Éxito",
        description: `Cotización ${codigo} creada correctamente`,
      });

      // Reset form
      setFormData({
        cliente_id: '',
        contacto_id: '',
        fecha_expiracion: undefined,
        observaciones: '',
        items: []
      });
      setPasoActual(1);

      onOpenChange(false);
      onSuccess?.(cotizacion.id);
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la cotización",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nueva Cotización</SheetTitle>
          <SheetDescription>
            Crear una nueva cotización siguiendo los pasos del wizard
          </SheetDescription>
        </SheetHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mt-6 mb-8">
          {PASOS.map((paso, index) => (
            <div key={paso.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${pasoActual >= paso.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {paso.id}
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium">{paso.titulo}</div>
                <div className="text-xs text-muted-foreground">{paso.descripcion}</div>
              </div>
              {index < PASOS.length - 1 && (
                <div className={`
                  w-12 h-0.5 mx-4
                  ${pasoActual > paso.id ? 'bg-primary' : 'bg-muted'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Paso 1: Cliente */}
        {pasoActual === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => setFormData({ ...formData, cliente_id: value, contacto_id: '' })}
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

            {contactosCliente.length > 0 && (
              <div className="space-y-2">
                <Label>Contacto</Label>
                <Select
                  value={formData.contacto_id}
                  onValueChange={(value) => setFormData({ ...formData, contacto_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactosCliente.map((contacto) => (
                      <SelectItem key={contacto.id} value={contacto.id}>
                        <div>
                          <div className="font-medium">{contacto.nombre}</div>
                          <div className="text-sm text-muted-foreground">{contacto.cargo}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Productos */}
        {pasoActual === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Productos</h3>
              <Button onClick={agregarItem}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => {
                const producto = productosSeed.find(p => p.id === item.producto_id);
                return (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5">
                          <Label className="text-xs">Producto</Label>
                          <Select
                            value={item.producto_id}
                            onValueChange={(value) => seleccionarProducto(index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                              {productosSeed.map((producto) => (
                                <SelectItem key={producto.id} value={producto.id}>
                                  <div>
                                    <div className="font-medium">{producto.nombre}</div>
                                    <div className="text-sm text-muted-foreground">
                                      ${producto.precio_neto.toLocaleString('es-CL')}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2">
                          <Label className="text-xs">Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => actualizarItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label className="text-xs">Precio Unit.</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.precio_unit}
                            onChange={(e) => actualizarItem(index, 'precio_unit', parseFloat(e.target.value) || 0)}
                          />
                        </div>

                        <div className="col-span-2">
                          <Label className="text-xs">Total</Label>
                          <div className="h-10 flex items-center font-medium">
                            ${item.total_linea.toLocaleString('es-CL')}
                          </div>
                        </div>

                        <div className="col-span-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {totalCotizacion > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Cotización:</span>
                    <span className="text-xl font-bold text-primary">
                      ${totalCotizacion.toLocaleString('es-CL')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Paso 3: Condiciones */}
        {pasoActual === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha de Expiración</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.fecha_expiracion ? (
                      format(formData.fecha_expiracion, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.fecha_expiracion}
                    onSelect={(date) => setFormData({ ...formData, fecha_expiracion: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Condiciones comerciales, observaciones adicionales..."
                rows={4}
              />
            </div>

            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de la Cotización</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">{clienteSeleccionado?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Productos:</span>
                    <span className="font-medium">{formData.items.length} items</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>${totalCotizacion.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setPasoActual(Math.max(1, pasoActual - 1))}
            disabled={pasoActual === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            {pasoActual < PASOS.length ? (
              <Button
                onClick={() => setPasoActual(pasoActual + 1)}
                disabled={!puedeAvanzar()}
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !puedeAvanzar()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cotización
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}