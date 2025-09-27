import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  FileText, 
  Search, 
  Filter, 
  MoreHorizontal,
  Download,
  QrCode,
  Calendar,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorialServicio {
  id: string;
  numero_ticket: string;
  cliente_nombre: string;
  equipo: string;
  tipo: string;
  fecha_servicio: string;
  tecnico: string;
  estado: string;
  informe_id?: string;
  numero_informe?: string;
  pdf_url?: string;
  qr_code?: string;
}

export default function HistorialServicios() {
  const [historial, setHistorial] = useState<HistorialServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadHistorial = async () => {
    try {
      const { data, error } = await supabase
        .from('servicios_tecnicos')
        .select(`
          *,
          clientes (
            nombre,
            rut
          ),
          informes_tecnicos (
            id,
            numero,
            pdf_url,
            qr_code
          )
        `)
        .in('estado', ['completado', 'cancelado'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const historialData: HistorialServicio[] = (data || []).map(servicio => ({
        id: servicio.id,
        numero_ticket: servicio.numero_ticket,
        cliente_nombre: servicio.clientes?.nombre || 'Cliente no encontrado',
        equipo: servicio.equipo,
        tipo: servicio.tipo,
        fecha_servicio: servicio.fecha_fin || servicio.fecha_programada || servicio.created_at,
        tecnico: 'No asignado', // Por ahora sin relación con user_profiles
        estado: servicio.estado === 'completado' ? 'completado' : 'cancelado',
        informe_id: Array.isArray(servicio.informes_tecnicos) && servicio.informes_tecnicos.length > 0 ? servicio.informes_tecnicos[0].id : undefined,
        numero_informe: Array.isArray(servicio.informes_tecnicos) && servicio.informes_tecnicos.length > 0 ? servicio.informes_tecnicos[0].numero : undefined,
        pdf_url: Array.isArray(servicio.informes_tecnicos) && servicio.informes_tecnicos.length > 0 ? servicio.informes_tecnicos[0].pdf_url : undefined,
        qr_code: Array.isArray(servicio.informes_tecnicos) && servicio.informes_tecnicos.length > 0 ? servicio.informes_tecnicos[0].qr_code : undefined
      }));

      setHistorial(historialData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de servicios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'cerrado': return 'bg-blue-100 text-blue-800';
      case 'facturado': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'correctivo': return 'bg-red-100 text-red-800';
      case 'preventivo': return 'bg-green-100 text-green-800';
      case 'instalacion': return 'bg-blue-100 text-blue-800';
      case 'garantia': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: ColumnDef<HistorialServicio>[] = [
    {
      accessorKey: 'numero_ticket',
      header: 'N° Ticket',
      cell: ({ row }) => {
        const servicio = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{servicio.numero_ticket}</div>
            {servicio.numero_informe && (
              <div className="text-sm text-muted-foreground">
                Informe: {servicio.numero_informe}
              </div>
            )}
          </div>
        );
      },
    },
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
      cell: ({ row }) => {
        const tipo = row.getValue('tipo') as string;
        return (
          <Badge className={getTipoColor(tipo)}>
            {tipo}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'fecha_servicio',
      header: 'Fecha Servicio',
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_servicio') as string;
        return (
          <div className="text-sm">
            {format(new Date(fecha), "PPP", { locale: es })}
          </div>
        );
      },
    },
    {
      accessorKey: 'tecnico',
      header: 'Técnico',
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
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const servicio = row.original;
        return (
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" title="Ver Detalle">
              <Eye className="h-4 w-4" />
            </Button>
            {servicio.pdf_url && (
              <Button variant="ghost" size="sm" title="Descargar PDF">
                <Download className="h-4 w-4" />
              </Button>
            )}
            {servicio.qr_code && (
              <Button variant="ghost" size="sm" title="QR Code">
                <QrCode className="h-4 w-4" />
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
    total: historial.length,
    completados: historial.filter(h => h.estado === 'completado').length,
    conInforme: historial.filter(h => h.informe_id).length,
    esteMes: historial.filter(h => {
      const fecha = new Date(h.fecha_servicio);
      const hoy = new Date();
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    }).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Historial de Servicios</h1>
            <p className="text-muted-foreground">
              Registro completo de servicios técnicos realizados
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Filtros Fecha
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
              <p className="text-xs text-muted-foreground">
                Servicios completados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Informe</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.conInforme}</div>
              <p className="text-xs text-muted-foreground">
                Informes técnicos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.esteMes}</div>
              <p className="text-xs text-muted-foreground">
                Servicios realizados
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.completados}</div>
              <p className="text-xs text-muted-foreground">
                {((estadisticas.completados / estadisticas.total) * 100).toFixed(1)}% del total
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
              <Button variant="outline" size="sm">Con Informe</Button>
              <Button variant="outline" size="sm">Sin Informe</Button>
              <Button variant="outline" size="sm">Este mes</Button>
              <Button variant="outline" size="sm">Correctivos</Button>
              <Button variant="outline" size="sm">Preventivos</Button>
              <Button variant="outline" size="sm">Garantía</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de historial */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Servicios</CardTitle>
            <CardDescription>
              {historial.length} servicios técnicos completados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={historial}
              searchKey="numero_ticket"
              searchPlaceholder="Buscar por ticket, cliente, equipo o técnico..."
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}