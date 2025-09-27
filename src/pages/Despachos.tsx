import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DespachoDrawer } from '@/components/drawers/DespachoDrawer';

interface Despacho {
  id: string;
  codigo_despacho: string;
  cliente_nombre: string;
  cliente_rut?: string;
  direccion: string;
  contacto: string;
  telefono?: string;
  email?: string;
  plazo_entrega?: string;
  estado: 'Pendiente' | 'En Preparación' | 'En Tránsito' | 'Entregado' | 'Devuelto';
  tipo: 'normal' | 'express' | 'retiro_cliente';
  transportista?: string;
  numero_guia?: string;
  observaciones?: string;
  created_at: string;
  diasParaEntrega: number;
}

export default function Despachos() {
  const [despachos, setDespachos] = useState<Despacho[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [despachoDrawerOpen, setDespachoDrawerOpen] = useState(false);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Entregado': return 'bg-green-100 text-green-800';
      case 'En tránsito': return 'bg-blue-100 text-blue-800';
      case 'Preparando': return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente': return 'bg-gray-100 text-gray-800';
      case 'Cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'express': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'retiro': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularDiasEntrega = (fechaEntrega: string) => {
    const hoy = new Date();
    const entrega = new Date(fechaEntrega);
    const diffTime = entrega.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'codigo_despacho',
      header: 'Código',
      cell: ({ row }) => {
        const despacho = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{despacho.codigo_despacho}</div>
            {despacho.numero_guia && (
              <div className="text-sm text-muted-foreground">
                Guía: {despacho.numero_guia}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'cliente_nombre',
      header: 'Cliente',
      cell: ({ row }) => {
        const despacho = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{despacho.cliente_nombre}</div>
            <div className="text-sm text-muted-foreground">{despacho.contacto}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'direccion',
      header: 'Destino',
      cell: ({ row }) => {
        const direccion = row.getValue('direccion') as string;
        return (
          <div className="max-w-[200px] truncate" title={direccion}>
            {direccion}
          </div>
        );
      },
    },
    {
      accessorKey: 'plazo_entrega',
      header: 'Fecha Entrega',
      cell: ({ row }) => {
        const fecha = row.getValue('plazo_entrega') as string;
        const diasEntrega = calcularDiasEntrega(fecha);
        
        return (
          <div className="space-y-1">
            <div className="text-sm">
              {format(new Date(fecha), "PPP", { locale: es })}
            </div>
            {diasEntrega < 0 && (
              <Badge variant="destructive" className="text-xs">
                Vencido ({Math.abs(diasEntrega)} días)
              </Badge>
            )}
            {diasEntrega >= 0 && diasEntrega <= 2 && (
              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                {diasEntrega === 0 ? 'Hoy' : `${diasEntrega} días`}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'tipo_despacho',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipo = row.getValue('tipo_despacho') as string;
        return (
          <Badge className={getTipoColor(tipo)}>
            {tipo}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado') as string;
        return (
          <Badge className={getEstadoColor(estado)}>
            {estado}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'transportista',
      header: 'Transportista',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  const estadisticas = {
    total: despachos.length,
    pendientes: despachos.filter(d => d.estado === 'Pendiente').length,
    enTransito: despachos.filter(d => d.estado === 'En Tránsito').length,
    entregados: despachos.filter(d => d.estado === 'Entregado').length,
    vencidos: despachos.filter(d => {
      const fecha = new Date(d.plazo_entrega);
      return fecha < new Date() && d.estado !== 'Entregado';
    }).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Despachos</h1>
            <p className="text-muted-foreground">
              Gestión de despachos y logística de entregas
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Mapa
            </Button>
            <Button onClick={() => setDespachoDrawerOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Despacho
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Despachos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
              <p className="text-xs text-muted-foreground">
                En el sistema
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
              <p className="text-xs text-muted-foreground">
                Por preparar
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.enTransito}</div>
              <p className="text-xs text-muted-foreground">
                En camino
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estadisticas.vencidos}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.entregados}</div>
              <p className="text-xs text-muted-foreground">
                {((estadisticas.entregados / estadisticas.total) * 100).toFixed(1)}% del total
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
              <Button variant="outline" size="sm">Pendientes</Button>
              <Button variant="outline" size="sm">En tránsito</Button>
              <Button variant="outline" size="sm">Vencidos</Button>
              <Button variant="outline" size="sm">Hoy</Button>
              <Button variant="outline" size="sm">Esta semana</Button>
              <Button variant="outline" size="sm">Express</Button>
              <Button variant="outline" size="sm">Retiro en tienda</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de despachos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Despachos</CardTitle>
            <CardDescription>
              {despachos.length} despachos registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={despachos}
              searchKey="codigo_despacho"
              searchPlaceholder="Buscar por código, cliente o guía..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Drawer */}
      <DespachoDrawer
        open={despachoDrawerOpen}
        onOpenChange={setDespachoDrawerOpen}
        onSuccess={() => {
          // Refresh data if needed
        }}
      />
    </Layout>
  );
}