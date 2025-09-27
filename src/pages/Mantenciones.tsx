import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Plus,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ServicioTecnicoDrawer } from '@/components/drawers/ServicioTecnicoDrawer';

interface Mantencion {
  id: string;
  cliente_nombre: string;
  equipo: string;
  tipo_mantencion: string;
  estado: 'pendiente' | 'programado' | 'completado' | 'vencido';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  fecha_programada: string;
  fecha_completado?: string;
  tecnico_asignado: string;
  observaciones?: string;
  proximo_mantenimiento: string;
}

export default function Mantenciones() {
  const [mantenciones, setMantenciones] = useState<Mantencion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [servicioDrawerOpen, setServicioDrawerOpen] = useState(false);
  const { toast } = useToast();

  const loadMantenciones = async () => {
    try {
      const { data, error } = await supabase
        .from('servicios_tecnicos')
        .select(`
          *,
          clientes (
            nombre,
            rut
          )
        `)
        .eq('tipo', 'preventivo')
        .order('fecha_programada', { ascending: true });

      if (error) throw error;

      const mantencionesData: Mantencion[] = (data || []).map(servicio => {
        const fechaProgramada = new Date(servicio.fecha_programada || servicio.created_at);
        const hoy = new Date();
        
        // Determinar estado basado en fechas
        let estado: 'pendiente' | 'programado' | 'completado' | 'vencido' = 'pendiente';
        if (servicio.estado === 'completado') {
          estado = 'completado';
        } else if (fechaProgramada < hoy) {
          estado = 'vencido';
        } else if (servicio.fecha_programada) {
          estado = 'programado';
        }

        // Calcular próximo mantenimiento (90 días después del último)
        const proximoMantenimiento = new Date(fechaProgramada);
        proximoMantenimiento.setDate(proximoMantenimiento.getDate() + 90);

        return {
          id: servicio.id,
          cliente_nombre: servicio.clientes?.nombre || 'Cliente no encontrado',
          equipo: servicio.equipo,
          tipo_mantencion: 'Preventivo',
          estado,
          prioridad: servicio.prioridad?.toLowerCase() as 'baja' | 'media' | 'alta' | 'urgente' || 'media',
          fecha_programada: servicio.fecha_programada || servicio.created_at,
          fecha_completado: servicio.fecha_fin,
          tecnico_asignado: 'Sin asignar',
          observaciones: servicio.observaciones,
          proximo_mantenimiento: proximoMantenimiento.toISOString()
        };
      });

      setMantenciones(mantencionesData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las mantenciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMantenciones();
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'default';
      case 'programado': return 'default';
      case 'vencido': return 'destructive';
      case 'pendiente': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente': return 'destructive';
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baja': return 'secondary';
      default: return 'secondary';
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
      accessorKey: 'tipo_mantencion',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('tipo_mantencion')}</Badge>
      ),
    },
    {
      accessorKey: 'fecha_programada',
      header: 'Fecha Programada',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_programada') as string;
        return (
          <div className="text-sm">
            {format(new Date(fecha), "dd/MM/yyyy", { locale: es })}
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
          <Badge variant={getEstadoColor(estado)}>
            {estado === 'completado' ? 'Completado' : 
             estado === 'programado' ? 'Programado' :
             estado === 'vencido' ? 'Vencido' : 'Pendiente'}
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
          <Badge variant={getPrioridadColor(prioridad)}>
            {prioridad === 'urgente' ? 'Urgente' :
             prioridad === 'alta' ? 'Alta' :
             prioridad === 'media' ? 'Media' : 'Baja'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'tecnico_asignado',
      header: 'Técnico',
    },
  ];

  const estadisticas = {
    total: mantenciones.length,
    programadas: mantenciones.filter(m => m.estado === 'programado').length,
    vencidas: mantenciones.filter(m => m.estado === 'vencido').length,
    completadas: mantenciones.filter(m => m.estado === 'completado').length,
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
            <Button onClick={() => setServicioDrawerOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Programar Mantención
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
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
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>

      <ServicioTecnicoDrawer
        open={servicioDrawerOpen}
        onOpenChange={setServicioDrawerOpen}
        onSuccess={() => {
          loadMantenciones();
          toast({
            title: "Mantención programada",
            description: "La mantención preventiva se ha programado correctamente",
          });
        }}
      />
    </Layout>
  );
}