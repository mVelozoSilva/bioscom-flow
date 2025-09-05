import React, { useState } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { serviciosTecnicosSeed } from '@/data/seeds';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface Mantencion {
  id: string;
  cliente_nombre: string;
  equipo: string;
  tipo: string;
  frecuencia: string;
  ultima_mantencion: string;
  proxima_mantencion: string;
  tecnico: string;
  estado: string;
  prioridad: string;
}

export default function Mantenciones() {
  // Simular datos de mantenciones basados en servicios técnicos
  const mantenciones: Mantencion[] = serviciosTecnicosSeed
    .filter(servicio => servicio.tipo === 'preventivo')
    .map(servicio => ({
      id: servicio.id,
      cliente_nombre: 'Cliente Demo', // Se obtendría del cliente real
      equipo: servicio.equipo,
      tipo: 'Preventiva',
      frecuencia: 'Trimestral',
      ultima_mantencion: servicio.fecha_programada || new Date().toISOString(),
      proxima_mantencion: addMonths(new Date(servicio.fecha_programada || new Date()), 3).toISOString(),
      tecnico: 'Técnico Asignado',
      estado: 'Programada',
      prioridad: servicio.prioridad
    }));

  const [searchTerm, setSearchTerm] = useState('');

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Completada': return 'bg-green-100 text-green-800';
      case 'Programada': return 'bg-blue-100 text-blue-800';
      case 'Vencida': return 'bg-red-100 text-red-800';
      case 'En proceso': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: ColumnDef<Mantencion>[] = [
    {
      accessorKey: 'cliente_nombre',
      header: 'Cliente',
    },
    {
      accessorKey: 'equipo',
      header: 'Equipo',
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('tipo')}</Badge>
      ),
    },
    {
      accessorKey: 'frecuencia',
      header: 'Frecuencia',
    },
    {
      accessorKey: 'proxima_mantencion',
      header: 'Próxima Mantención',
      cell: ({ row }) => {
        const fecha = row.getValue('proxima_mantencion') as string;
        return (
          <div className="text-sm">
            {format(new Date(fecha), "PPP", { locale: es })}
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
      accessorKey: 'prioridad',
      header: 'Prioridad',
      cell: ({ row }) => {
        const prioridad = row.getValue('prioridad') as string;
        return (
          <Badge className={getPrioridadColor(prioridad)}>
            {prioridad}
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
    total: mantenciones.length,
    programadas: mantenciones.filter(m => m.estado === 'Programada').length,
    vencidas: mantenciones.filter(m => {
      const fecha = new Date(m.proxima_mantencion);
      return fecha < new Date() && m.estado !== 'Completada';
    }).length,
    completadas: mantenciones.filter(m => m.estado === 'Completada').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mantenciones</h1>
            <p className="text-muted-foreground">
              Gestión de mantenciones preventivas y programadas
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Mantención
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mantenciones</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
              <p className="text-xs text-muted-foreground">
                Planes activos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programadas</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.programadas}</div>
              <p className="text-xs text-muted-foreground">
                Próximas mantenciones
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
                Requieren atención
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.completadas}</div>
              <p className="text-xs text-muted-foreground">
                Este mes
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
              <Button variant="outline" size="sm">Programadas</Button>
              <Button variant="outline" size="sm">Vencidas</Button>
              <Button variant="outline" size="sm">Esta semana</Button>
              <Button variant="outline" size="sm">Este mes</Button>
              <Button variant="outline" size="sm">Preventivas</Button>
              <Button variant="outline" size="sm">Correctivas</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de mantenciones */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Mantenciones</CardTitle>
            <CardDescription>
              {mantenciones.length} mantenciones registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={mantenciones}
              searchKey="cliente_nombre"
              searchPlaceholder="Buscar por cliente, equipo o técnico..."
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}