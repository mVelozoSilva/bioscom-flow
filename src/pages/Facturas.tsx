import React, { useState } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download
} from 'lucide-react';
import { facturasSeed } from '@/data/seeds';
import { Factura as FacturaBase } from '@/types';

interface Factura extends FacturaBase {
  id: string;
  numero_factura: string;
  cliente_id: string;
  rut_cliente: string;
  monto: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: string;
  estado_documento: string;
  numero_ot_oc?: string;
  observaciones?: string;
  archivo_pdf_url?: string;
}

export default function Facturas() {
  const [facturas] = useState<Factura[]>(facturasSeed as Factura[]);
  const [searchTerm, setSearchTerm] = useState('');

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pagada': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Vencida': return 'bg-red-100 text-red-800';
      case 'Anulada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentoColor = (estado: string) => {
    switch (estado) {
      case 'emitida': return 'bg-blue-100 text-blue-800';
      case 'enviada': return 'bg-green-100 text-green-800';
      case 'aceptada': return 'bg-green-100 text-green-800';
      case 'rechazada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularDiasVencimiento = (fechaVencimiento: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns: ColumnDef<Factura>[] = [
    {
      accessorKey: 'numero_factura',
      header: 'N° Factura',
      cell: ({ row }) => {
        const factura = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{factura.numero_factura}</div>
            {factura.numero_ot_oc && (
              <div className="text-sm text-muted-foreground">OT/OC: {factura.numero_ot_oc}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'rut_cliente',
      header: 'Cliente',
      cell: ({ row }) => {
        const factura = row.original;
        return (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">{factura.rut_cliente}</div>
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
          <div className="font-medium">
            ${monto.toLocaleString('es-CL')}
          </div>
        );
      },
    },
    {
      accessorKey: 'fecha_emision',
      header: 'Fecha Emisión',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_emision') as string;
        return (
          <div className="text-sm">
            {new Date(fecha).toLocaleDateString('es-CL')}
          </div>
        );
      },
    },
    {
      accessorKey: 'fecha_vencimiento',
      header: 'Vencimiento',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_vencimiento') as string;
        const diasVencimiento = calcularDiasVencimiento(fecha);
        
        return (
          <div className="space-y-1">
            <div className="text-sm">
              {new Date(fecha).toLocaleDateString('es-CL')}
            </div>
            {diasVencimiento < 0 && (
              <Badge variant="destructive" className="text-xs">
                Vencida ({Math.abs(diasVencimiento)} días)
              </Badge>
            )}
            {diasVencimiento >= 0 && diasVencimiento <= 7 && (
              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                Vence en {diasVencimiento} días
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'estado',
      header: 'Estado Pago',
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
      accessorKey: 'estado_documento',
      header: 'Estado Doc.',
      cell: ({ row }) => {
        const estado = row.getValue('estado_documento') as string;
        return (
          <Badge variant="outline" className={getDocumentoColor(estado)}>
            {estado}
          </Badge>
        );
      },
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
    total: facturas.length,
    pagadas: facturas.filter(f => f.estado === 'Pagada').length,
    pendientes: facturas.filter(f => f.estado === 'Pendiente').length,
    vencidas: facturas.filter(f => f.estado === 'Vencida').length,
    montoTotal: facturas.reduce((acc, f) => acc + f.monto, 0),
    montoPendiente: facturas.filter(f => f.estado === 'Pendiente').reduce((acc, f) => acc + f.monto, 0),
    montoVencido: facturas.filter(f => f.estado === 'Vencida').reduce((acc, f) => acc + f.monto, 0),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Facturas</h1>
            <p className="text-muted-foreground">
              Gestión y seguimiento de facturas emitidas
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Factura
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
              <p className="text-xs text-muted-foreground">
                ${estadisticas.montoPendiente.toLocaleString('es-CL')} por cobrar
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estadisticas.vencidas}</div>
              <p className="text-xs text-muted-foreground">
                ${estadisticas.montoVencido.toLocaleString('es-CL')} vencido
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.pagadas}</div>
              <p className="text-xs text-muted-foreground">
                {((estadisticas.pagadas / estadisticas.total) * 100).toFixed(1)}% del total
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
              <Button variant="outline" size="sm">Todas</Button>
              <Button variant="outline" size="sm">Pendientes</Button>
              <Button variant="outline" size="sm">Vencidas</Button>
              <Button variant="outline" size="sm">Pagadas</Button>
              <Button variant="outline" size="sm">Emitidas hoy</Button>
              <Button variant="outline" size="sm">Vencen esta semana</Button>
              <Button variant="outline" size="sm">Sin OT/OC</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de facturas */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Facturas</CardTitle>
            <CardDescription>
              {facturas.length} facturas registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={facturas}
              searchKey="numero_factura"
              searchPlaceholder="Buscar por número, RUT o OT/OC..."
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}