import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
import { supabase } from '@/integrations/supabase/client';
import { TareaDrawer } from '@/components/drawers/TareaDrawer';
import { ClienteDrawer } from '@/components/drawers/ClienteDrawer';
import { CotizacionWizard } from '@/components/wizards/CotizacionWizard';
import { ServicioTecnicoDrawer } from '@/components/drawers/ServicioTecnicoDrawer';
import { DespachoDrawer } from '@/components/drawers/DespachoDrawer';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tareaDrawerOpen, setTareaDrawerOpen] = useState(false);
  const [clienteDrawerOpen, setClienteDrawerOpen] = useState(false);
  const [cotizacionWizardOpen, setCotizacionWizardOpen] = useState(false);
  const [servicioDrawerOpen, setServicioDrawerOpen] = useState(false);
  const [despachoDrawerOpen, setDespachoDrawerOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    tareasHoy: [] as any[],
    seguimientosHoy: [] as any[],
    cotizacionesActivas: 0,
    facturasVencidas: 0,
    montoFacturasPendientes: 0,
    alertas: [] as string[]
  });
  const [loading, setLoading] = useState(true);

  const handleNavigateWithFallback = (route: string, fallbackAction?: () => void) => {
    try {
      navigate(route);
    } catch (error) {
      if (fallbackAction) {
        fallbackAction();
      } else {
        toast({
          title: "Función en desarrollo",
          description: `La página ${route} estará disponible próximamente.`,
          variant: "default"
        });
      }
    }
  };

  const loadDashboardData = async () => {
    try {
      const hoy = new Date();
      const hoyStr = hoy.toISOString().split('T')[0];

      // Cargar tareas de hoy
      const { data: tareas } = await supabase
        .from('tareas')
        .select('*')
        .eq('fecha_vencimiento', hoyStr)
        .neq('estado', 'Completada');

      // Cargar seguimientos de hoy
      const { data: seguimientos } = await supabase
        .from('seguimientos')
        .select(`
          *,
          clientes (nombre)
        `)
        .eq('proxima_gestion', hoyStr);

      // Cargar cotizaciones activas
      const { data: cotizaciones } = await supabase
        .from('cotizaciones')
        .select('*')
        .in('estado', ['Enviada', 'Pendiente']);

      // Cargar facturas vencidas
      const { data: facturas } = await supabase
        .from('facturas')
        .select('*')
        .lt('fecha_vencimiento', hoyStr)
        .eq('estado', 'Pendiente');

      // Cargar facturas pendientes para monto
      const { data: facturasPendientes } = await supabase
        .from('facturas')
        .select('monto')
        .eq('estado', 'Pendiente');

      const facturasVencidas = facturas?.length || 0;
      const cotizacionesActivas = cotizaciones?.length || 0;
      const montoFacturasPendientes = facturasPendientes?.reduce((sum, f) => sum + (f.monto || 0), 0) || 0;
      const tareasHoy = tareas || [];
      const seguimientosHoy = seguimientos || [];

      const alertas = [
        `${facturasVencidas} facturas vencidas requieren atención`,
        `${tareasHoy.length} tareas programadas para hoy`,
        `${seguimientosHoy.length} seguimientos pendientes`,
      ].filter(alerta => !alerta.startsWith('0'));

      setDashboardData({
        tareasHoy,
        seguimientosHoy,
        cotizacionesActivas,
        facturasVencidas,
        montoFacturasPendientes,
        alertas
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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
            <Button variant="outline" onClick={() => handleNavigateWithFallback('/mi-dia/semana')}>
              <Calendar className="h-4 w-4 mr-2" />
              Ver Semana
            </Button>
            <Button onClick={() => setTareaDrawerOpen(true)}>
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
              <div className="text-2xl font-bold text-primary">{dashboardData.cotizacionesActivas}</div>
              <p className="text-xs text-muted-foreground">En proceso de gestión</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardData.facturasVencidas}</div>
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
                ${dashboardData.montoFacturasPendientes.toLocaleString('es-CL')}
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
              <div className="text-2xl font-bold text-primary">{dashboardData.tareasHoy.length}</div>
              <p className="text-xs text-muted-foreground">Para completar hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        {dashboardData.alertas.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertas y Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {dashboardData.alertas.map((alerta, index) => (
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
                {dashboardData.tareasHoy.length} tareas programadas para completar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.tareasHoy.length > 0 ? (
                  dashboardData.tareasHoy.map((tarea) => (
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
                {dashboardData.seguimientosHoy.length} clientes para contactar hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.seguimientosHoy.length > 0 ? (
                  dashboardData.seguimientosHoy.map((seguimiento) => {
                    return (
                      <div key={seguimiento.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="mt-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{seguimiento.clientes?.nombre || 'Cliente no encontrado'}</p>
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
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={() => setCotizacionWizardOpen(true)}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Nueva Cotización</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={() => setClienteDrawerOpen(true)}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Agregar Cliente</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={() => setServicioDrawerOpen(true)}
              >
                <Wrench className="h-6 w-6" />
                <span className="text-sm">Orden Servicio</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col space-y-2"
                onClick={() => setDespachoDrawerOpen(true)}
              >
                <Truck className="h-6 w-6" />
                <span className="text-sm">Nuevo Despacho</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drawers and Wizards */}
      <TareaDrawer
        open={tareaDrawerOpen}
        onOpenChange={setTareaDrawerOpen}
        onSuccess={() => {
          // Refresh data if needed
        }}
      />

      <ClienteDrawer
        open={clienteDrawerOpen}
        onOpenChange={setClienteDrawerOpen}
        onSuccess={() => {
          // Refresh data if needed
        }}
      />

      <CotizacionWizard
        open={cotizacionWizardOpen}
        onOpenChange={setCotizacionWizardOpen}
        onSuccess={(cotizacionId) => {
          navigate(`/cotizaciones/${cotizacionId}`);
        }}
      />

      <ServicioTecnicoDrawer
        open={servicioDrawerOpen}
        onOpenChange={setServicioDrawerOpen}
        onSuccess={() => {
          // Refresh data if needed
        }}
      />

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