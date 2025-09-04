import React, { useState } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  CheckCircle2, 
  Plus, 
  Calendar,
  Clock,
  User,
  AlertTriangle,
  MoreHorizontal,
  ArrowRight,
  Repeat
} from 'lucide-react';
import { Tarea } from '@/types';
import { tareasSeed, clientesSeed, usuariosSeed } from '@/data/seeds';

export default function Tareas() {
  const [tareas] = useState<Tarea[]>(tareasSeed);

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Urgente': return 'bg-red-100 text-red-800 border-red-200';
      case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'En Proceso': return 'bg-blue-100 text-blue-800';
      case 'Completada': return 'bg-green-100 text-green-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: ColumnDef<Tarea>[] = [
    {
      accessorKey: 'titulo',
      header: 'Tarea',
      cell: ({ row }) => {
        const tarea = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium flex items-center">
              {tarea.titulo}
              {tarea.recurrente && (
                <Repeat className="h-3 w-3 ml-2 text-muted-foreground" />
              )}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {tarea.descripcion}
            </div>
            {tarea.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tarea.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'cliente_id',
      header: 'Cliente',
      cell: ({ row }) => {
        const clienteId = row.getValue('cliente_id') as string;
        if (!clienteId) return <span className="text-muted-foreground">Sin cliente</span>;
        
        const cliente = clientesSeed.find(c => c.id === clienteId);
        return cliente ? (
          <div className="text-sm">{cliente.nombre}</div>
        ) : null;
      },
    },
    {
      accessorKey: 'usuario_asignado',
      header: 'Asignado',
      cell: ({ row }) => {
        const usuarioId = row.getValue('usuario_asignado') as string;
        const usuario = usuariosSeed.find(u => u.id === usuarioId);
        return usuario ? (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white">
              {usuario.nombre[0]}
            </div>
            <span className="text-sm">{usuario.nombre}</span>
          </div>
        ) : null;
      },
    },
    {
      accessorKey: 'prioridad',
      header: 'Prioridad',
      cell: ({ row }) => {
        const prioridad = row.getValue('prioridad') as string;
        return (
          <Badge className={getPriorityColor(prioridad)}>
            {prioridad}
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
          <Badge variant="outline" className={getEstadoColor(estado)}>
            {estado}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'fecha_vencimiento',
      header: 'Vencimiento',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_vencimiento') as Date;
        const diasRestantes = Math.ceil((new Date(fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const esVencida = diasRestantes < 0;
        const esHoy = diasRestantes === 0;
        
        return (
          <div>
            <div className="text-sm">
              {new Date(fecha).toLocaleDateString('es-CL')}
            </div>
            <div className={`text-xs ${esVencida ? 'text-red-500' : esHoy ? 'text-orange-500' : 'text-muted-foreground'}`}>
              {esVencida ? `Vencida ${Math.abs(diasRestantes)} días` : 
               esHoy ? 'Vence hoy' : 
               `${diasRestantes} días`}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'hora_estimada',
      header: 'Tiempo',
      cell: ({ row }) => {
        const tiempo = row.getValue('hora_estimada') as number;
        return tiempo ? (
          <div className="text-sm text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            {tiempo} min
          </div>
        ) : null;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const tarea = row.original;
        return (
          <div className="flex space-x-1">
            {tarea.estado !== 'Completada' && (
              <Button variant="ghost" size="sm" title="Marcar como completada">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const estadisticas = {
    total: tareas.length,
    pendientes: tareas.filter(t => t.estado === 'Pendiente').length,
    enProceso: tareas.filter(t => t.estado === 'En Proceso').length,
    completadas: tareas.filter(t => t.estado === 'Completada').length,
    vencidas: tareas.filter(t => {
      const fecha = new Date(t.fecha_vencimiento);
      return fecha < new Date() && t.estado !== 'Completada';
    }).length,
    hoy: tareas.filter(t => {
      const hoy = new Date();
      const fechaTarea = new Date(t.fecha_vencimiento);
      return fechaTarea.toDateString() === hoy.toDateString() && t.estado !== 'Completada';
    }).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tareas</h1>
            <p className="text-muted-foreground">
              Gestión y seguimiento de tareas y actividades
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Mi Semana
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.hoy}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <ArrowRight className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.enProceso}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estadisticas.vencidas}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.completadas}</div>
            </CardContent>
          </Card>
        </div>

        {/* Vista rápida de tareas urgentes */}
        {estadisticas.vencidas > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Tareas Vencidas - Requieren Atención Inmediata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tareas
                  .filter(t => {
                    const fecha = new Date(t.fecha_vencimiento);
                    return fecha < new Date() && t.estado !== 'Completada';
                  })
                  .slice(0, 3)
                  .map((tarea) => (
                    <div key={tarea.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <div className="font-medium text-sm">{tarea.titulo}</div>
                        <div className="text-xs text-muted-foreground">
                          Vencida el {new Date(tarea.fecha_vencimiento).toLocaleDateString('es-CL')}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros rápidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Todas</Button>
              <Button variant="outline" size="sm">Mis Tareas</Button>
              <Button variant="outline" size="sm">Hoy</Button>
              <Button variant="outline" size="sm">Esta Semana</Button>
              <Button variant="outline" size="sm">Vencidas</Button>
              <Button variant="outline" size="sm">Alta Prioridad</Button>
              <Button variant="outline" size="sm">Recurrentes</Button>
              <Button variant="outline" size="sm">Por Cliente</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de tareas */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Tareas</CardTitle>
            <CardDescription>
              {tareas.length} tareas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={tareas}
              searchKey="titulo"
              searchPlaceholder="Buscar tareas..."
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}