import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCotizacionesData } from '@/hooks/use-cotizaciones-data';
import { useCotizacionesFilters } from '@/hooks/use-cotizaciones-filters';
import { CotizacionesFilterChips } from '@/components/cotizaciones/CotizacionesFilterChips';
import { CotizacionesFiltersDrawer } from '@/components/cotizaciones/CotizacionesFiltersDrawer';
import { CotizacionRowActions } from '@/components/cotizaciones/CotizacionRowActions';
import { CotizacionWizard } from '@/components/wizards/CotizacionWizard';
import { exportToCSV, formatDateForExport, formatNumberForExport } from '@/lib/export-utils';
import { supabase } from '@/integrations/supabase/client';

type Cotizacion = {
  id: string;
  folio: string;
  cliente: string;
  vendedor: string;
  fechaEmision: string | Date;
  validezHasta: string | Date;
  estado: "Borrador" | "Enviada" | "Aceptada" | "Rechazada" | "Vencida" | "Cancelada";
  totalNeto: number;
};

export default function Cotizaciones() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [cotizacionWizardOpen, setCotizacionWizardOpen] = useState(false);
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);

  const {
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    vistasGuardadas,
    guardarVista,
    aplicarVista,
    eliminarVista,
    hayFiltrosActivos,
  } = useCotizacionesFilters();

  const { data, count, isLoading, refetch } = useCotizacionesData({
    pageIndex,
    pageSize,
    filters: filtros,
  });

  // Mapear datos a formato de tabla
  const cotizaciones = useMemo(() => {
    return data.map((cot: any) => ({
      id: cot.id,
      folio: cot.codigo,
      cliente: cot.cliente?.nombre || 'Sin cliente',
      vendedor: cot.vendedor?.nombre || 'Sin vendedor',
      fechaEmision: cot.created_at,
      validezHasta: cot.fecha_expiracion || '',
      estado: cot.estado,
      totalNeto: cot.items?.reduce((sum: number, item: any) => sum + (item.total_linea || 0), 0) || 0,
      _raw: cot,
    }));
  }, [data]);

  const formatCLP = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  };

  const getEstadoBadgeVariant = (estado: string): "default" | "secondary" | "destructive" | "success" | "warning" => {
    switch (estado) {
      case 'Aceptada': return 'success';
      case 'Rechazada': return 'destructive';
      case 'Vencida': return 'warning';
      case 'Enviada': return 'secondary';
      default: return 'default';
    }
  };

  // Handlers de acciones
  const handleDuplicar = async (id: string) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('duplicar-cotizacion', {
        body: { id },
      });

      if (error) throw error;

      toast({
        title: "Cotización duplicada",
        description: `Se creó la cotización ${result.cotizacion.codigo}`,
      });

      // Update optimista
      await refetch();
      navigate(`/cotizaciones/${result.cotizacion.id}/editar`);
    } catch (error: any) {
      toast({
        title: "Error al duplicar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEnviarEmail = async (id: string, emailData: any) => {
    try {
      const { error } = await supabase.functions.invoke('enviar-cotizacion-email', {
        body: { id, ...emailData },
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "La cotización fue enviada correctamente",
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: "Error al enviar email",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: string, motivo?: string) => {
    try {
      const { error } = await supabase.functions.invoke('cambiar-estado-cotizacion', {
        body: { id, nuevoEstado, motivo },
      });

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `Cotización ${nuevoEstado.toLowerCase()}`,
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: "Error al cambiar estado",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportarPDF = async (id: string) => {
    try {
      toast({
        title: "Generando PDF",
        description: "La descarga comenzará en breve...",
      });

      // TODO: Implementar generación de PDF
      setTimeout(() => {
        toast({
          title: "PDF generado",
          description: "Descarga completada",
        });
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error al exportar PDF",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportarCSV = () => {
    exportToCSV(
      cotizaciones,
      [
        { key: 'folio', header: 'Folio' },
        { key: 'cliente', header: 'Cliente' },
        { key: 'vendedor', header: 'Vendedor' },
        { key: 'fechaEmision', header: 'Fecha Emisión', format: formatDateForExport },
        { key: 'validezHasta', header: 'Validez Hasta', format: formatDateForExport },
        { key: 'estado', header: 'Estado' },
        { key: 'totalNeto', header: 'Total Neto', format: (v) => formatNumberForExport(v, 2) },
      ],
      `cotizaciones-${format(new Date(), 'yyyy-MM-dd')}.csv`
    );

    toast({
      title: "CSV exportado",
      description: `${cotizaciones.length} cotizaciones exportadas`,
    });
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'folio',
      header: 'Folio',
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">{row.getValue('folio')}</div>
      ),
    },
    {
      accessorKey: 'cliente',
      header: 'Cliente',
    },
    {
      accessorKey: 'vendedor',
      header: 'Vendedor',
    },
    {
      accessorKey: 'fechaEmision',
      header: 'Fecha Emisión',
      cell: ({ row }) => {
        const fecha = row.getValue('fechaEmision') as string;
        return fecha ? format(new Date(fecha), 'dd-MM-yyyy', { locale: es }) : '-';
      },
    },
    {
      accessorKey: 'validezHasta',
      header: 'Validez Hasta',
      cell: ({ row }) => {
        const fecha = row.getValue('validezHasta') as string;
        return fecha ? format(new Date(fecha), 'dd-MM-yyyy', { locale: es }) : '-';
      },
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado') as string;
        return (
          <Badge variant={getEstadoBadgeVariant(estado)}>
            {estado}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'totalNeto',
      header: 'Total Neto',
      cell: ({ row }) => {
        const total = row.getValue('totalNeto') as number;
        return <div className="font-medium">{formatCLP(total)}</div>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <CotizacionRowActions
          cotizacion={row.original._raw}
          onDuplicar={handleDuplicar}
          onEnviarEmail={handleEnviarEmail}
          onCambiarEstado={handleCambiarEstado}
          onExportarPDF={handleExportarPDF}
        />
      ),
    },
  ];

  // Estadísticas
  const stats = {
    total: cotizaciones.length,
    pendientes: cotizaciones.filter((c) => c.estado === 'Pendiente' || c.estado === 'Enviada').length,
    aceptadas: cotizaciones.filter((c) => c.estado === 'Aceptada').length,
    montoTotal: cotizaciones.reduce((sum, c) => sum + c.totalNeto, 0),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cotizaciones</h1>
            <p className="text-muted-foreground">
              Gestión de cotizaciones y propuestas comerciales
            </p>
          </div>
          <Button onClick={() => setCotizacionWizardOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cotización
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.pendientes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.aceptadas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-purple-600">
                {formatCLP(stats.montoTotal)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros activos */}
        {hayFiltrosActivos() && (
          <CotizacionesFilterChips
            filtros={filtros}
            onRemoveFiltro={(key) => {
              if (key === 'fechaEmisionDesde') {
                actualizarFiltro('fechaEmisionDesde', '');
                actualizarFiltro('fechaEmisionHasta', '');
              } else if (key === 'estado') {
                actualizarFiltro('estado', []);
              } else {
                actualizarFiltro(key, '');
              }
            }}
            onLimpiarTodo={limpiarFiltros}
          />
        )}

        {/* Tabla */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lista de Cotizaciones</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFiltersDrawerOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportarCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AdvancedDataTable
              columns={columns}
              data={cotizaciones}
              loading={isLoading}
              pageSize={pageSize}
              storageKey="cotizaciones"
              emptyMessage="No se encontraron cotizaciones"
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        {cotizacionWizardOpen && (
          <CotizacionWizard
            open={cotizacionWizardOpen}
            onOpenChange={(open) => {
              setCotizacionWizardOpen(open);
              if (!open) refetch();
            }}
          />
        )}

        <CotizacionesFiltersDrawer
          open={filtersDrawerOpen}
          onOpenChange={setFiltersDrawerOpen}
          filtros={filtros}
          onActualizarFiltro={actualizarFiltro}
          onLimpiar={limpiarFiltros}
          vistasGuardadas={vistasGuardadas}
          onGuardarVista={guardarVista}
          onAplicarVista={aplicarVista}
          onEliminarVista={eliminarVista}
        />
      </div>
    </Layout>
  );
}
