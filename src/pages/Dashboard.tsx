import React from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  FileText,
  Phone,
  Truck,
  Wrench,
  Plus
} from 'lucide-react';
import { usuariosSeed, tareasSeed, cotizacionesSeed, seguimientosSeed, facturasSeed, clientesSeed } from '@/data/seeds';

export default function Dashboard() {
  // Datos para Mi Día
  const tareasHoy = tareasSeed.filter(tarea => {
    const hoy = new Date();
    const fechaTarea = new Date(tarea.fecha_vencimiento);
    return fechaTarea.toDateString() === hoy.toDateString() && tarea.estado !== 'Completada';
  });

  const seguimientosHoy = seguimientosSeed.filter(seg => {
    const hoy = new Date();
    const fechaSeg = new Date(seg.proxima_gestion);
    return fechaSeg.toDateString() === hoy.toDateString();
  });

  // KPIs generales
  const cotizacionesActivas = cotizacionesSeed.filter(c => c.estado === 'Enviada' || c.estado === 'Pendiente').length;
  const facturasVencidas = facturasSeed.filter(f => f.estado === 'Vencida').length;
  const montoFacturasPendientes = facturasSeed
    .filter(f => f.estado === 'Pendiente')
    .reduce((sum, f) => sum + f.monto, 0);

  const alertas = [
    `${facturasVencidas} facturas vencidas requieren atención`,
    `${tareasHoy.length} tareas programadas para hoy`,
    `${seguimientosHoy.length} seguimientos pendientes`,
  ];

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
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'En gestión': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Día</h1>
            <p className="text-muted-foreground">
              Resumen de actividades para hoy, {new Date().toLocaleDateString('es-CL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Ver Semana
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarea
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cotizaciones Activas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{cotizacionesActivas}</div>
              <p className="text-xs text-muted-foreground">En proceso de gestión</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{facturasVencidas}</div>
              <p className="text-xs text-muted-foreground">Requieren gestión inmediata</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Pendiente</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${montoFacturasPendientes.toLocaleString('es-CL')}
              </div>
              <p className="text-xs text-muted-foreground">En facturas pendientes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tareas Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{tareasHoy.length}</div>
              <p className="text-xs text-muted-foreground">Para completar hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertas y Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {alertas.map((alerta, index) => (
                  <li key={index} className="flex items-center text-orange-700">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                    {alerta}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tareas del Día */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Mis Tareas de Hoy
              </CardTitle>
              <CardDescription>
                {tareasHoy.length} tareas programadas para completar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tareasHoy.length > 0 ? (
                  tareasHoy.map((tarea) => (
                    <div key={tarea.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className="mt-1">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{tarea.titulo}</p>
                        <p className="text-xs text-muted-foreground">{tarea.descripcion}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(tarea.prioridad)}>
                            {tarea.prioridad}
                          </Badge>
                          <Badge variant="outline" className={getEstadoColor(tarea.estado)}>
                            {tarea.estado}
                          </Badge>
                          {tarea.hora_estimada && (
                            <span className="text-xs text-muted-foreground">
                              {tarea.hora_estimada} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>¡Excelente! No tienes tareas pendientes para hoy.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seguimientos del Día */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Seguimientos Programados
              </CardTitle>
              <CardDescription>
                {seguimientosHoy.length} clientes para contactar hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {seguimientosHoy.length > 0 ? (
                  seguimientosHoy.map((seguimiento) => {
                    const cliente = clientesSeed.find(c => c.id === seguimiento.cliente_id);
                    return (
                      <div key={seguimiento.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="mt-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{cliente?.nombre}</p>
                          <p className="text-xs text-muted-foreground">{seguimiento.notas}</p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(seguimiento.prioridad)}>
                              {seguimiento.prioridad}
                            </Badge>
                            <Badge variant="outline" className={getEstadoColor(seguimiento.estado)}>
                              {seguimiento.estado}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay seguimientos programados para hoy.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accesos Rápidos */}
        <Card>
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Herramientas más utilizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">Nueva Cotización</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">Agregar Cliente</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Wrench className="h-6 w-6" />
                <span className="text-sm">Orden Servicio</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2">
                <Truck className="h-6 w-6" />
                <span className="text-sm">Nuevo Despacho</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}