import React, { useState } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  FileText, 
  Plus, 
  Download,
  Send,
  Copy,
  MoreHorizontal,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';
import { Cotizacion } from '@/types';
import { cotizacionesSeed, clientesSeed, productosSeed } from '@/data/seeds';

export default function Cotizaciones() {
  const [cotizaciones] = useState<Cotizacion[]>(cotizacionesSeed);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Enviada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Aceptada': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rechazada': return 'bg-red-100 text-red-800 border-red-200';
      case 'Vencida': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelada': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const columns: ColumnDef<Cotizacion>[] = [
    {
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ row }) => {
        const codigo = row.getValue('codigo') as string;
        return <div className="font-mono text-sm">{codigo}</div>;
      },
    },
    {
      accessorKey: 'cliente_id',
      header: 'Cliente',
      cell: ({ row }) => {
        const clienteId = row.getValue('cliente_id') as string;
        const cliente = clientesSeed.find(c => c.id === clienteId);
        return cliente ? (
          <div>
            <div className="font-medium">{cliente.nombre}</div>
            <div className="text-sm text-muted-foreground">{cliente.rut}</div>
          </div>
        ) : null;
      },
    },
    {
      accessorKey: 'productos',
      header: 'Productos',
      cell: ({ row }) => {
        const productos = row.getValue('productos') as any[];
        const totalProductos = productos.length;
        const montoTotal = productos.reduce((sum, p) => sum + p.total_linea, 0);
        return (
          <div>
            <div className="text-sm font-medium">{totalProductos} producto(s)</div>
            <div className="text-sm text-muted-foreground">
              ${montoTotal.toLocaleString('es-CL')}
            </div>
          </div>
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
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => {
        const score = row.getValue('score') as number;
        return (
          <div className={`font-medium ${getScoreColor(score)}`}>
            {score}%
          </div>
        );
      },
    },
    {
      accessorKey: 'fecha_expiracion',
      header: 'Vencimiento',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_expiracion') as Date;
        const diasRestantes = Math.ceil((new Date(fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div>
            <div className="text-sm">
              {new Date(fecha).toLocaleDateString('es-CL')}
            </div>
            <div className={`text-xs ${diasRestantes <= 7 ? 'text-red-500' : 'text-muted-foreground'}`}>
              {diasRestantes > 0 ? `${diasRestantes} días` : 'Vencida'}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Send className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const estadisticas = {
    total: cotizaciones.length,
    pendientes: cotizaciones.filter(c => c.estado === 'Pendiente' || c.estado === 'Enviada').length,
    aceptadas: cotizaciones.filter(c => c.estado === 'Aceptada').length,
    montoTotal: cotizaciones.reduce((sum, c) => 
      sum + c.productos.reduce((pSum, p) => pSum + p.total_linea, 0), 0
    ),
    scorePromedio: Math.round(cotizaciones.reduce((acc, c) => acc + c.score, 0) / cotizaciones.length),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cotizaciones</h1>
            <p className="text-muted-foreground">
              Gestión de cotizaciones y propuestas comerciales
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cotización
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.pendientes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.aceptadas}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-600">
                ${estadisticas.montoTotal.toLocaleString('es-CL')}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(estadisticas.scorePromedio)}`}>
                {estadisticas.scorePromedio}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embudo de ventas */}
        <Card>
          <CardHeader>
            <CardTitle>Embudo de Ventas</CardTitle>
            <CardDescription>Estado actual de las cotizaciones en el pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              {[
                { estado: 'Pendiente', count: cotizaciones.filter(c => c.estado === 'Pendiente').length, color: 'bg-yellow-500' },
                { estado: 'Enviada', count: cotizaciones.filter(c => c.estado === 'Enviada').length, color: 'bg-blue-500' },
                { estado: 'Aceptada', count: cotizaciones.filter(c => c.estado === 'Aceptada').length, color: 'bg-green-500' },
                { estado: 'Rechazada', count: cotizaciones.filter(c => c.estado === 'Rechazada').length, color: 'bg-red-500' },
                { estado: 'Vencida', count: cotizaciones.filter(c => c.estado === 'Vencida').length, color: 'bg-gray-500' },
                { estado: 'Cancelada', count: cotizaciones.filter(c => c.estado === 'Cancelada').length, color: 'bg-orange-500' },
              ].map((item) => (
                <div key={item.estado} className="text-center">
                  <div className={`h-16 ${item.color} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
                    {item.count}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">{item.estado}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filtros rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Todas</Button>
              <Button variant="outline" size="sm">Pendientes</Button>
              <Button variant="outline" size="sm">Enviadas</Button>
              <Button variant="outline" size="sm">Por vencer (7 días)</Button>
              <Button variant="outline" size="sm">Score alto (80+)</Button>
              <Button variant="outline" size="sm">Monto alto (+$1M)</Button>
              <Button variant="outline" size="sm">Rechazadas</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de cotizaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Cotizaciones</CardTitle>
            <CardDescription>
              {cotizaciones.length} cotizaciones en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={cotizaciones}
              searchKey="codigo"
              searchPlaceholder="Buscar por código, cliente..."
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}