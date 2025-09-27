import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  DollarSign,
  Calendar,
  CheckCircle,
  Upload,
  Download,
  Receipt,
  RefreshCw
} from 'lucide-react';
import { PagoDrawer } from '@/components/drawers/PagoDrawer';

interface Pago {
  id: string;
  factura_id: string;
  monto: number;
  fecha_pago: string;
  tipo: string;
  referencia?: string;
  verificado: boolean;
  archivo_url?: string;
  created_at: string;
  // Relations
  facturas?: {
    numero_factura: string;
    clientes?: {
      nombre: string;
    };
  };
}

export default function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagoDrawerOpen, setPagoDrawerOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState<any>(null);
  const { toast } = useToast();

  const loadPagos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          *,
          facturas (
            numero_factura,
            clientes (
              nombre
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPagos(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPagos();
  }, []);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Transferencia': return 'bg-blue-100 text-blue-800';
      case 'Cheque': return 'bg-green-100 text-green-800';
      case 'Efectivo': return 'bg-yellow-100 text-yellow-800';
      case 'Tarjeta': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: ColumnDef<Pago>[] = [
    {
      accessorKey: 'facturas.numero_factura',
      header: 'Factura',
      cell: ({ row }) => {
        const pago = row.original;
        const factura = pago.facturas;
        return (
          <div className="space-y-1">
            <div className="font-medium">{factura?.numero_factura || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">{factura?.clientes?.nombre || 'Cliente no encontrado'}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'monto',
      header: 'Monto',
      cell: ({ row }) => {
        const monto = row.getValue('monto') as number;
        return (
          <div className="font-medium text-green-600">
            ${monto.toLocaleString('es-CL')}
          </div>
        );
      },
    },
    {
      accessorKey: 'fecha_pago',
      header: 'Fecha Pago',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_pago') as string;
        return (
          <div className="text-sm">
            {new Date(fecha).toLocaleDateString('es-CL')}
          </div>
        );
      },
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipo = row.getValue('tipo') as string;
        return (
          <Badge className={getTipoColor(tipo)}>
            {tipo}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'referencia',
      header: 'Referencia',
      cell: ({ row }) => {
        const referencia = row.getValue('referencia') as string;
        return referencia ? (
          <div className="text-sm font-mono">{referencia}</div>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'verificado',
      header: 'Estado',
      cell: ({ row }) => {
        const verificado = row.getValue('verificado') as boolean;
        return (
          <Badge variant={verificado ? "default" : "outline"} className={
            verificado ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }>
            {verificado ? 'Verificado' : 'Pendiente'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const pago = row.original;
        return (
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={() => {
              setSelectedPago(pago);
              setPagoDrawerOpen(true);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  const estadisticas = {
    total: pagos.length,
    verificados: pagos.filter(p => p.verificado).length,
    pendientes: pagos.filter(p => !p.verificado).length,
    montoTotal: pagos.reduce((acc, p) => acc + p.monto, 0),
    montoVerificado: pagos.filter(p => p.verificado).reduce((acc, p) => acc + p.monto, 0),
    montoPendiente: pagos.filter(p => !p.verificado).reduce((acc, p) => acc + p.monto, 0),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pagos</h1>
            <p className="text-muted-foreground">
              Registro y verificación de pagos recibidos
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadPagos} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button onClick={() => {
              setSelectedPago(null);
              setPagoDrawerOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
              <p className="text-xs text-muted-foreground">
                ${estadisticas.montoTotal.toLocaleString('es-CL')} total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verificados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.verificados}</div>
              <p className="text-xs text-muted-foreground">
                ${estadisticas.montoVerificado.toLocaleString('es-CL')} verificado
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
              <p className="text-xs text-muted-foreground">
                ${estadisticas.montoPendiente.toLocaleString('es-CL')} por verificar
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa Verificación</CardTitle>
              <Receipt className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {((estadisticas.verificados / estadisticas.total) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Pagos verificados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Todos</Button>
              <Button variant="outline" size="sm">Verificados</Button>
              <Button variant="outline" size="sm">Pendientes</Button>
              <Button variant="outline" size="sm">Transferencias</Button>
              <Button variant="outline" size="sm">Cheques</Button>
              <Button variant="outline" size="sm">Efectivo</Button>
              <Button variant="outline" size="sm">Esta semana</Button>
              <Button variant="outline" size="sm">Este mes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de pagos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pagos</CardTitle>
            <CardDescription>
              {pagos.length} pagos registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={pagos}
              loading={loading}
              searchKey="facturas.numero_factura"
              searchPlaceholder="Buscar por factura, cliente o referencia..."
            />
          </CardContent>
        </Card>

        {/* PagoDrawer */}
        <PagoDrawer
          open={pagoDrawerOpen}
          onOpenChange={(open) => {
            setPagoDrawerOpen(open);
            if (!open) {
              setSelectedPago(null);
            }
          }}
          pago={selectedPago}
          onSave={loadPagos}
        />
      </div>
    </Layout>
  );
}