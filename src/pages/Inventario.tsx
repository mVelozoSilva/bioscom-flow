import React, { useState, useEffect } from 'react';
import { Layout as BioscomLayout } from '@/components/bioscom/layout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Plus,
  Minus,
  Edit,
  Eye
} from 'lucide-react';

interface InventarioItem {
  id: string;
  producto_id: string;
  codigo_producto: string;
  nombre_producto: string;
  stock_actual: number;
  stock_minimo: number;
  stock_reservado: number;
  ubicacion?: string;
  proveedor?: string;
  estado: 'activo' | 'descontinuado' | 'agotado';
  linea_negocio?: string;
  costo_promedio?: number;
  ultimo_ingreso?: string;
  ultimo_movimiento: string;
  created_at: string;
  updated_at: string;
}

export default function Inventario() {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const { toast } = useToast();

  // Estados para formulario
  const [formData, setFormData] = useState({
    codigo_producto: '',
    nombre_producto: '',
    stock_actual: '',
    stock_minimo: '',
    ubicacion: '',
    proveedor: '',
    estado: 'activo',
    linea_negocio: '',
    costo_promedio: ''
  });

  // Estados para movimiento de stock
  const [movimientoData, setMovimientoData] = useState({
    tipo: '', // 'entrada' | 'salida'
    cantidad: '',
    motivo: '',
    observaciones: ''
  });

  const estadoColors = {
    activo: 'success',
    descontinuado: 'default',
    agotado: 'destructive'
  } as const;

  const estadoLabels = {
    activo: 'Activo',
    descontinuado: 'Descontinuado',
    agotado: 'Agotado'
  };

  const columns: ColumnDef<InventarioItem>[] = [
    {
      accessorKey: 'codigo_producto',
      header: 'Código',
      cell: ({ row }) => {
        const codigo = row.original.codigo_producto;
        return <span className="font-mono text-sm">{codigo}</span>;
      }
    },
    {
      accessorKey: 'nombre_producto',
      header: 'Producto',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <div className="font-medium">{item.nombre_producto}</div>
            <div className="text-sm text-muted-foreground">{item.linea_negocio}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'stock_actual',
      header: 'Stock Actual',
      cell: ({ row }) => {
        const item = row.original;
        const stockBajo = item.stock_actual <= item.stock_minimo;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${stockBajo ? 'text-error' : 'text-foreground'}`}>
              {item.stock_actual}
            </span>
            {stockBajo && <AlertTriangle className="h-4 w-4 text-error" />}
          </div>
        );
      }
    },
    {
      accessorKey: 'stock_minimo',
      header: 'Stock Mínimo',
      cell: ({ row }) => {
        const minimo = row.original.stock_minimo;
        return <span className="text-muted-foreground">{minimo}</span>;
      }
    },
    {
      accessorKey: 'ubicacion',
      header: 'Ubicación',
      cell: ({ row }) => {
        const ubicacion = row.original.ubicacion;
        return ubicacion ? (
          <span className="text-sm">{ubicacion}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      }
    },
    {
      accessorKey: 'proveedor',
      header: 'Proveedor',
      cell: ({ row }) => {
        const proveedor = row.original.proveedor;
        return proveedor ? (
          <span className="text-sm">{proveedor}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      }
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.original.estado;
        return (
          <Badge variant={estadoColors[estado]}>
            {estadoLabels[estado]}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'ultimo_movimiento',
      header: 'Último Movimiento',
      cell: ({ row }) => {
        const fecha = row.original.ultimo_movimiento;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(fecha), 'dd/MM/yyyy', { locale: es })}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const item = row.original;
        const stockBajo = item.stock_actual <= item.stock_minimo;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItem(item);
                setModalMode('view');
                setShowModal(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedItem(item);
                setShowMovimientoModal(true);
              }}
            >
              <Package className="h-4 w-4" />
            </Button>
            {stockBajo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => generarMensajeWhatsApp(item)}
                title="Enviar mensaje de stock bajo"
              >
                <MessageSquare className="h-4 w-4 text-success" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const loadInventario = async () => {
    try {
      const { data, error } = await supabase
        .from('inventario')
        .select('*')
        .order('nombre_producto', { ascending: true });

      if (error) throw error;
      setInventario((data || []).map(item => ({
        ...item,
        estado: item.estado as 'activo' | 'descontinuado' | 'agotado',
        ultimo_movimiento: item.updated_at
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const crearItem = async () => {
    try {
      const { error } = await supabase
        .from('inventario')
        .insert({
          ...formData,
          stock_actual: parseInt(formData.stock_actual) || 0,
          stock_minimo: parseInt(formData.stock_minimo) || 0,
          costo_promedio: parseFloat(formData.costo_promedio) || null,
        });

      if (error) throw error;

      toast({
        title: "Item creado",
        description: "El item de inventario se ha creado correctamente",
      });

      setShowModal(false);
      resetForm();
      loadInventario();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear el item",
        variant: "destructive",
      });
    }
  };

  const actualizarItem = async () => {
    if (!selectedItem) return;

    try {
      const { error } = await supabase
        .from('inventario')
        .update({
          ...formData,
          stock_actual: parseInt(formData.stock_actual) || 0,
          stock_minimo: parseInt(formData.stock_minimo) || 0,
          costo_promedio: parseFloat(formData.costo_promedio) || null,
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: "Item actualizado",
        description: "El item de inventario se ha actualizado correctamente",
      });

      setShowModal(false);
      loadInventario();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el item",
        variant: "destructive",
      });
    }
  };

  const procesarMovimiento = async () => {
    if (!selectedItem || !movimientoData.tipo || !movimientoData.cantidad) return;

    const cantidad = parseInt(movimientoData.cantidad);
    const nuevoStock = movimientoData.tipo === 'entrada' 
      ? selectedItem.stock_actual + cantidad
      : selectedItem.stock_actual - cantidad;

    if (nuevoStock < 0) {
      toast({
        title: "Error",
        description: "No hay suficiente stock para realizar esta salida",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('inventario')
        .update({
          stock_actual: nuevoStock,
          ultimo_movimiento: new Date().toISOString(),
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      toast({
        title: "Movimiento registrado",
        description: `${movimientoData.tipo === 'entrada' ? 'Entrada' : 'Salida'} de ${cantidad} unidades registrada`,
      });

      setShowMovimientoModal(false);
      setMovimientoData({
        tipo: '',
        cantidad: '',
        motivo: '',
        observaciones: ''
      });
      loadInventario();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo registrar el movimiento",
        variant: "destructive",
      });
    }
  };

  const generarMensajeWhatsApp = (item: InventarioItem) => {
    const mensaje = `🚨 *ALERTA DE STOCK BAJO* 🚨

Producto: *${item.nombre_producto}*
Código: ${item.codigo_producto}
Stock actual: *${item.stock_actual} unidades*
Stock mínimo: ${item.stock_minimo} unidades

${item.proveedor ? `Proveedor: ${item.proveedor}` : ''}

Es necesario realizar una reposición urgente.

#StockBajo #Inventario #Bioscom`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const resetForm = () => {
    setFormData({
      codigo_producto: '',
      nombre_producto: '',
      stock_actual: '',
      stock_minimo: '',
      ubicacion: '',
      proveedor: '',
      estado: 'activo',
      linea_negocio: '',
      costo_promedio: ''
    });
  };

  useEffect(() => {
    loadInventario();
  }, []);

  // KPIs de inventario
  const kpis = {
    totalItems: inventario.length,
    stockBajo: inventario.filter(item => item.stock_actual <= item.stock_minimo).length,
    valorTotal: inventario.reduce((total, item) => total + (item.stock_actual * (item.costo_promedio || 0)), 0),
    itemsActivos: inventario.filter(item => item.estado === 'activo').length
  };

  return (
    <BioscomLayout>
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-info" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{kpis.totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-error" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Bajo</p>
                  <p className="text-2xl font-bold text-error">{kpis.stockBajo}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">${kpis.valorTotal.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items Activos</p>
                  <p className="text-2xl font-bold text-success">{kpis.itemsActivos}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de stock bajo */}
        {kpis.stockBajo > 0 && (
          <Card className="border-error/20 bg-error/5">
            <CardHeader>
              <CardTitle className="text-error flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Stock Bajo
              </CardTitle>
              <CardDescription>
                {kpis.stockBajo} productos están por debajo del stock mínimo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inventario
                  .filter(item => item.stock_actual <= item.stock_minimo)
                  .slice(0, 5)
                  .map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <span className="font-medium">{item.nombre_producto}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          Stock: {item.stock_actual}/{item.stock_minimo}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generarMensajeWhatsApp(item)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de inventario */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestión de Inventario</CardTitle>
                <CardDescription>
                  Controla el stock de productos y gestiona movimientos de inventario
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setModalMode('create');
                  setSelectedItem(null);
                  setShowModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={inventario}
              loading={loading}
              searchKey="nombre_producto"
              searchPlaceholder="Buscar productos..."
            />
          </CardContent>
        </Card>

        {/* Modal de Item */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {modalMode === 'create' ? 'Nuevo Item de Inventario' : 
                 modalMode === 'edit' ? 'Editar Item' : 'Detalle del Item'}
              </DialogTitle>
              <DialogDescription>
                {selectedItem ? `${selectedItem.nombre_producto}` : 'Crear un nuevo item de inventario'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código del Producto</Label>
                  <Input
                    value={formData.codigo_producto}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo_producto: e.target.value }))}
                    placeholder="SKU-001"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <Label>Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="descontinuado">Descontinuado</SelectItem>
                      <SelectItem value="agotado">Agotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Nombre del Producto</Label>
                <Input
                  value={formData.nombre_producto}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_producto: e.target.value }))}
                  placeholder="Nombre del producto"
                  disabled={modalMode === 'view'}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Stock Actual</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_actual}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_actual: e.target.value }))}
                    placeholder="0"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                <div>
                  <Label>Stock Mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_minimo: e.target.value }))}
                    placeholder="0"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ubicación</Label>
                  <Input
                    value={formData.ubicacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                    placeholder="Bodega A - Estante 1"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <Label>Proveedor</Label>
                  <Input
                    value={formData.proveedor}
                    onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
                    placeholder="Nombre del proveedor"
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Línea de Negocio</Label>
                  <Input
                    value={formData.linea_negocio}
                    onChange={(e) => setFormData(prev => ({ ...prev, linea_negocio: e.target.value }))}
                    placeholder="Ej: Laboratorio, Equipos, etc."
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <Label>Costo Promedio</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costo_promedio}
                    onChange={(e) => setFormData(prev => ({ ...prev, costo_promedio: e.target.value }))}
                    placeholder="0.00"
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              {modalMode !== 'view' && (
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={modalMode === 'create' ? crearItem : actualizarItem}
                    disabled={!formData.codigo_producto || !formData.nombre_producto}
                    className="flex-1"
                  >
                    {modalMode === 'create' ? 'Crear Item' : 'Actualizar'}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Movimiento de Stock */}
        <Dialog open={showMovimientoModal} onOpenChange={setShowMovimientoModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Movimiento de Stock</DialogTitle>
              <DialogDescription>
                {selectedItem?.nombre_producto} - Stock actual: {selectedItem?.stock_actual}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Tipo de Movimiento</Label>
                <Select
                  value={movimientoData.tipo}
                  onValueChange={(value) => setMovimientoData(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-success" />
                        Entrada de Stock
                      </div>
                    </SelectItem>
                    <SelectItem value="salida">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-error" />
                        Salida de Stock
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={movimientoData.cantidad}
                  onChange={(e) => setMovimientoData(prev => ({ ...prev, cantidad: e.target.value }))}
                  placeholder="Cantidad de unidades"
                  required
                />
              </div>

              <div>
                <Label>Motivo</Label>
                <Select
                  value={movimientoData.motivo}
                  onValueChange={(value) => setMovimientoData(prev => ({ ...prev, motivo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {movimientoData.tipo === 'entrada' ? (
                      <>
                        <SelectItem value="compra">Compra</SelectItem>
                        <SelectItem value="devolucion">Devolución</SelectItem>
                        <SelectItem value="ajuste_positivo">Ajuste Positivo</SelectItem>
                        <SelectItem value="transferencia_entrada">Transferencia (Entrada)</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="venta">Venta</SelectItem>
                        <SelectItem value="uso_interno">Uso Interno</SelectItem>
                        <SelectItem value="ajuste_negativo">Ajuste Negativo</SelectItem>
                        <SelectItem value="transferencia_salida">Transferencia (Salida)</SelectItem>
                        <SelectItem value="merma">Merma</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Observaciones</Label>
                <Input
                  value={movimientoData.observaciones}
                  onChange={(e) => setMovimientoData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones del movimiento"
                />
              </div>

              {movimientoData.tipo && movimientoData.cantidad && (
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm">
                    <span className="font-medium">Stock resultante: </span>
                    {movimientoData.tipo === 'entrada' 
                      ? (selectedItem?.stock_actual || 0) + parseInt(movimientoData.cantidad || '0')
                      : (selectedItem?.stock_actual || 0) - parseInt(movimientoData.cantidad || '0')
                    } unidades
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowMovimientoModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={procesarMovimiento}
                  disabled={!movimientoData.tipo || !movimientoData.cantidad}
                  className="flex-1"
                >
                  Registrar Movimiento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </BioscomLayout>
  );
}