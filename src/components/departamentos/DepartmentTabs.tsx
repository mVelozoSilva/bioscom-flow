import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Wrench, 
  Truck, 
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KPI {
  title: string;
  value: string | number;
  change?: string;
  type: 'currency' | 'number' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
  color?: 'success' | 'warning' | 'error' | 'info';
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface DepartmentTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function DepartmentTabs({ activeTab = "ventas", onTabChange }: DepartmentTabsProps) {
  const navigate = useNavigate();

  // KPIs por departamento
  const departmentKPIs: Record<string, KPI[]> = {
    ventas: [
      { title: "Ventas del Mes", value: "$2,450,000", change: "+12%", type: "currency", trend: "up", color: "success" },
      { title: "Cotizaciones Activas", value: 23, type: "number", color: "info" },
      { title: "Tasa de Conversión", value: "68%", change: "+5%", type: "percentage", trend: "up", color: "success" },
      { title: "Clientes Nuevos", value: 8, change: "+2", type: "number", trend: "up", color: "info" }
    ],
    cobranza: [
      { title: "Por Cobrar", value: "$890,000", type: "currency", color: "warning" },
      { title: "Vencidas", value: "$125,000", type: "currency", color: "error" },
      { title: "Gestiones Hoy", value: 12, type: "number", color: "info" },
      { title: "Tasa de Recuperación", value: "85%", change: "+3%", type: "percentage", trend: "up", color: "success" }
    ],
    tecnico: [
      { title: "Tickets Activos", value: 15, type: "number", color: "warning" },
      { title: "Completados Hoy", value: 6, change: "+2", type: "number", trend: "up", color: "success" },
      { title: "Tiempo Promedio", value: "2.3h", type: "number", color: "info" },
      { title: "Satisfacción", value: "4.7/5", type: "number", color: "success" }
    ],
    administracion: [
      { title: "Stock Bajo", value: 8, type: "number", color: "warning" },
      { title: "Despachos Hoy", value: 5, type: "number", color: "info" },
      { title: "Usuarios Activos", value: 24, type: "number", color: "success" },
      { title: "Tiempo Entrega", value: "1.8 días", type: "number", color: "info" }
    ]
  };

  // Acciones rápidas por departamento
  const departmentActions: Record<string, QuickAction[]> = {
    ventas: [
      { title: "Nueva Cotización", description: "Crear cotización para cliente", icon: <FileText className="h-5 w-5" />, path: "/cotizaciones" },
      { title: "Gestionar Clientes", description: "Ver y editar clientes", icon: <Users className="h-5 w-5" />, path: "/clientes" },
      { title: "Seguimientos", description: "Tareas de seguimiento", icon: <Clock className="h-5 w-5" />, path: "/seguimientos", badge: "3" },
      { title: "Productos", description: "Catálogo de productos", icon: <Package className="h-5 w-5" />, path: "/productos" }
    ],
    cobranza: [
      { title: "Gestiones Pendientes", description: "Facturas por gestionar", icon: <AlertTriangle className="h-5 w-5" />, path: "/cobranzas", badge: "12", variant: "destructive" },
      { title: "Facturas", description: "Ver todas las facturas", icon: <FileText className="h-5 w-5" />, path: "/facturas" },
      { title: "Pagos", description: "Registrar pagos", icon: <DollarSign className="h-5 w-5" />, path: "/pagos" },
      { title: "Reportes", description: "Análisis de cobranza", icon: <TrendingUp className="h-5 w-5" />, path: "/reportes-cobranza" }
    ],
    tecnico: [
      { title: "Nuevos Tickets", description: "Tickets sin asignar", icon: <AlertTriangle className="h-5 w-5" />, path: "/servicio-tecnico", badge: "4", variant: "destructive" },
      { title: "Mis Servicios", description: "Servicios asignados", icon: <Wrench className="h-5 w-5" />, path: "/mis-servicios" },
      { title: "Informes", description: "Crear informes técnicos", icon: <FileText className="h-5 w-5" />, path: "/informes-tecnicos" },
      { title: "Mantenciones", description: "Servicios preventivos", icon: <CheckCircle className="h-5 w-5" />, path: "/mantenciones" }
    ],
    administracion: [
      { title: "Inventario", description: "Gestión de stock", icon: <Package className="h-5 w-5" />, path: "/inventario", badge: "8", variant: "destructive" },
      { title: "Despachos", description: "Órdenes de despacho", icon: <Truck className="h-5 w-5" />, path: "/despachos" },
      { title: "Usuarios", description: "Gestión de usuarios", icon: <Users className="h-5 w-5" />, path: "/usuarios" },
      { title: "Dashboard Ejecutivo", description: "Métricas generales", icon: <TrendingUp className="h-5 w-5" />, path: "/dashboard-ejecutivo" }
    ]
  };

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  const renderKPIs = (kpis: KPI[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                {kpi.change && (
                  <p className={`text-sm ${
                    kpi.trend === 'up' ? 'text-success' : 
                    kpi.trend === 'down' ? 'text-error' : 'text-muted-foreground'
                  }`}>
                    {kpi.change}
                  </p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${
                kpi.color === 'success' ? 'bg-success/10' :
                kpi.color === 'warning' ? 'bg-warning/10' :
                kpi.color === 'error' ? 'bg-error/10' :
                'bg-info/10'
              }`}>
                <TrendingUp className={`h-5 w-5 ${
                  kpi.color === 'success' ? 'text-success' :
                  kpi.color === 'warning' ? 'text-warning' :
                  kpi.color === 'error' ? 'text-error' :
                  'text-info'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderQuickActions = (actions: QuickAction[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleActionClick(action.path)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {action.icon}
                <CardTitle className="text-base">{action.title}</CardTitle>
              </div>
              {action.badge && (
                <Badge variant={action.variant || "default"}>
                  {action.badge}
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {action.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="ghost" size="sm" className="w-full justify-between">
              Ver más
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ventas">Ventas</TabsTrigger>
          <TabsTrigger value="cobranza">Cobranza</TabsTrigger>
          <TabsTrigger value="tecnico">Servicio Técnico</TabsTrigger>
          <TabsTrigger value="administracion">Administración</TabsTrigger>
        </TabsList>

        <TabsContent value="ventas" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Departamento de Ventas</h2>
              <p className="text-muted-foreground">Gestión de clientes, cotizaciones y seguimientos</p>
            </div>
          </div>
          {renderKPIs(departmentKPIs.ventas)}
          {renderQuickActions(departmentActions.ventas)}
        </TabsContent>

        <TabsContent value="cobranza" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Departamento de Cobranza</h2>
              <p className="text-muted-foreground">Gestión de facturas, pagos y recuperación de cartera</p>
            </div>
          </div>
          {renderKPIs(departmentKPIs.cobranza)}
          {renderQuickActions(departmentActions.cobranza)}
        </TabsContent>

        <TabsContent value="tecnico" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Servicio Técnico</h2>
              <p className="text-muted-foreground">Gestión de servicios, mantenciones e informes técnicos</p>
            </div>
          </div>
          {renderKPIs(departmentKPIs.tecnico)}
          {renderQuickActions(departmentActions.tecnico)}
        </TabsContent>

        <TabsContent value="administracion" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Administración</h2>
              <p className="text-muted-foreground">Inventario, logística, usuarios y reportes ejecutivos</p>
            </div>
          </div>
          {renderKPIs(departmentKPIs.administracion)}
          {renderQuickActions(departmentActions.administracion)}
        </TabsContent>
      </Tabs>
    </div>
  );
}