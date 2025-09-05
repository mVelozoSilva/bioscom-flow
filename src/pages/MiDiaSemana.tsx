import React, { useState } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Phone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { tareasSeed, seguimientosSeed, clientesSeed } from '@/data/seeds';

export default function MiDiaSemana() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTareasDelDia = (fecha: Date) => {
    return tareasSeed.filter(tarea => {
      const fechaTarea = new Date(tarea.fecha_vencimiento);
      return isSameDay(fechaTarea, fecha) && tarea.estado !== 'Completada';
    });
  };

  const getSeguimientosDelDia = (fecha: Date) => {
    return seguimientosSeed.filter(seg => {
      const fechaSeg = new Date(seg.proxima_gestion);
      return isSameDay(fechaSeg, fecha);
    });
  };

  const previousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
    setSelectedDate(new Date());
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Semana</h1>
            <p className="text-muted-foreground">
              Vista semanal de tareas y seguimientos programados
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={goToToday}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Hoy
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" size="sm" onClick={previousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-lg font-semibold">
                {format(weekStart, "dd 'de' MMMM", { locale: es })} - {format(weekEnd, "dd 'de' MMMM yyyy", { locale: es })}
              </h2>
              
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Week View */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const tareasDelDia = getTareasDelDia(day);
                const seguimientosDelDia = getSeguimientosDelDia(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);

                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-colors min-h-[200px]
                      ${isToday ? 'bg-primary/10 border-primary' : 'border-border'}
                      ${isSelected ? 'bg-accent' : 'hover:bg-muted/50'}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-center mb-2">
                      <div className="text-xs text-muted-foreground uppercase">
                        {format(day, "EEE", { locale: es })}
                      </div>
                      <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                        {format(day, "d")}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {/* Tareas */}
                      {tareasDelDia.slice(0, 2).map((tarea) => (
                        <div
                          key={tarea.id}
                          className="p-1 text-xs bg-blue-100 text-blue-800 rounded border-l-2 border-blue-500"
                        >
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span className="truncate">{tarea.titulo}</span>
                          </div>
                          <div className="text-xs opacity-75">
                            {tarea.hora_estimada && `${tarea.hora_estimada}min`}
                          </div>
                        </div>
                      ))}

                      {/* Seguimientos */}
                      {seguimientosDelDia.slice(0, 2).map((seguimiento) => {
                        const cliente = clientesSeed.find(c => c.id === seguimiento.cliente_id);
                        return (
                          <div
                            key={seguimiento.id}
                            className="p-1 text-xs bg-green-100 text-green-800 rounded border-l-2 border-green-500"
                          >
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{cliente?.nombre}</span>
                            </div>
                            <div className="text-xs opacity-75">
                              {seguimiento.prioridad}
                            </div>
                          </div>
                        );
                      })}

                      {/* Indicador de más elementos */}
                      {(tareasDelDia.length + seguimientosDelDia.length) > 4 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{(tareasDelDia.length + seguimientosDelDia.length) - 4} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detalle del día seleccionado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tareas del día seleccionado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Tareas - {format(selectedDate, "dd 'de' MMMM", { locale: es })}
              </CardTitle>
              <CardDescription>
                {getTareasDelDia(selectedDate).length} tareas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTareasDelDia(selectedDate).length > 0 ? (
                  getTareasDelDia(selectedDate).map((tarea) => (
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
                    <p>No hay tareas programadas para este día.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seguimientos del día seleccionado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Seguimientos - {format(selectedDate, "dd 'de' MMMM", { locale: es })}
              </CardTitle>
              <CardDescription>
                {getSeguimientosDelDia(selectedDate).length} clientes para contactar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getSeguimientosDelDia(selectedDate).length > 0 ? (
                  getSeguimientosDelDia(selectedDate).map((seguimiento) => {
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
                    <p>No hay seguimientos programados para este día.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}