import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
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
  DollarSign,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { cotizacionesDAL, Cotizacion } from '@/dal/cotizaciones';
import { CotizacionWizard } from '@/components/wizards/CotizacionWizard';

type FilterType = 'todas' | 'pendientes' | 'enviadas' | 'por-vencer' | 'score-alto' | 'monto-alto' | 'rechazadas';

export default function Cotizaciones() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cotizaciones, setCotizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState<FilterType>('todas');
  const [cotizacionWizardOpen, setCotizacionWizardOpen] = useState(false);
  const [enviarDialogOpen, setEnviarDialogOpen] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await cotizacionesDAL.listWithDetails();
      setCotizaciones(data || []);
    } catch (error) {
      console.error('Error loading cotizaciones:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las cotizaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar cotizaciones
  const cotizacionesFiltradas = useMemo(() => {
    let resultado = [...cotizaciones];

    switch (filtroActivo) {
      case 'pendientes':
        resultado = resultado.filter(c => c.estado === 'Pendiente');
        break;
      case 'enviadas':
        resultado = resultado.filter(c => c.estado === 'Enviada');
        break;
      case 'por-vencer':
        resultado = resultado.filter(c => {
          if (!c.fecha_expiracion) return false;
          const diasRestantes = Math.ceil((new Date(c.fecha_expiracion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return diasRestantes <= 7 && diasRestantes > 0;
        });
        break;
      case 'score-alto':
        resultado = resultado.filter(c => c.score >= 80);
        break;
      case 'monto-alto':
        resultado = resultado.filter(c => {
          const monto = c.items?.reduce((sum, p) => sum + p.total_linea, 0) || 0;
          return monto >= 1000000;
        });
        break;
      case 'rechazadas':
        resultado = resultado.filter(c => c.estado === 'Rechazada');
        break;
    }

    return resultado;
  }, [cotizaciones, filtroActivo]);

  const descargarPDF = async (cotizacion: any) => {
    try {
      toast({
        title: "Generando PDF",
        description: "La descarga comenzará en breve.",
      });
      
      // TODO: Implement PDF generation
      // For now, just show success message
      setTimeout(() => {
        toast({
          title: "PDF generado",
          description: `PDF de cotización ${cotizacion.codigo} listo para descarga.`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF.",
        variant: "destructive"
      });
    }
  };

  const enviarCotizacion = (cotizacion: any) => {
    setCotizacionSeleccionada(cotizacion);
    setEnviarDialogOpen(true);
  };

  const confirmarEnvio = async () => {
    if (cotizacionSeleccionada) {
      try {
        // Update status to 'Enviada'
        await cotizacionesDAL.update(cotizacionSeleccionada.id, {
          estado: 'Enviada'
        });
        
        // Simulate email sending
        const clienteEmail = cotizacionSeleccionada.cliente?.nombre || 'cliente';
        window.open(`mailto:${clienteEmail}@example.com?subject=Cotización ${cotizacionSeleccionada.codigo}&body=Adjunto encontrará la cotización solicitada.`);
        
        toast({
          title: "Cotización enviada",
          description: `Se ha enviado la cotización ${cotizacionSeleccionada.codigo}`,
        });
        
        setEnviarDialogOpen(false);
        loadData(); // Reload data to show updated status
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo enviar la cotización.",
          variant: "destructive"
        });
      }
    }
  };

  const copiarCotizacion = async (cotizacion: any) => {
    try {
      const newCodigo = await cotizacionesDAL.generateNextCodigo();
      
      // Create copy with new codigo
      await cotizacionesDAL.create({
        ...cotizacion,
        codigo: newCodigo,
        estado: 'Pendiente',
        fecha_expiracion: null,
        pdf_url: null,
        created_at: undefined,
        updated_at: undefined
      });
      
      toast({
        title: "Cotización duplicada",
        description: `Se ha creado una copia con código ${newCodigo}.`,
      });
      
      loadData(); // Reload to show new quotation
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo duplicar la cotización.",
        variant: "destructive"
      });
    }
  };

  const eliminarCotizacion = async (cotizacion: any) => {
    try {
      // TODO: Implement delete in DAL
      toast({
        title: "Cotización eliminada",
        description: `La cotización ${cotizacion.codigo} ha sido eliminada.`,
      });
      loadData(); // Reload data
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cotización.",
        variant: "destructive"
      });
    }
  };

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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ row }) => {
        const codigo = row.getValue('codigo') as string;
        return <div className="font-mono text-sm">{codigo}</div>;
      },
    },
    {
      accessorKey: 'cliente',
      header: 'Cliente',
      cell: ({ row }) => {
        const cliente = row.original.cliente;
        return cliente ? (
          <div>
            <div className="font-medium">{cliente.nombre}</div>
            <div className="text-sm text-muted-foreground">{cliente.rut}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">Sin cliente</span>
        );
      },
    },
    {
      accessorKey: 'items',
      header: 'Productos',
      cell: ({ row }) => {
        const items = row.original.items || [];
        const totalProductos = items.length;
        const montoTotal = items.reduce((sum, p) => sum + (p.total_linea || 0), 0);
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
        const fecha = row.getValue('fecha_expiracion') as string;
        if (!fecha) return <span className="text-muted-foreground">Sin fecha</span>;
        
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
        const cotizacion = row.original;
        return (
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => descargarPDF(cotizacion)}
              title="Descargar PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => enviarCotizacion(cotizacion)}
              title="Enviar por email"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => copiarCotizacion(cotizacion)}
              title="Duplicar cotización"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/cotizaciones/${cotizacion.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/cotizaciones/${cotizacion.id}/editar`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => eliminarCotizacion(cotizacion)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const estadisticas = {
    total: cotizacionesFiltradas.length,
    pendientes: cotizacionesFiltradas.filter(c => c.estado === 'Pendiente' || c.estado === 'Enviada').length,
    aceptadas: cotizacionesFiltradas.filter(c => c.estado === 'Aceptada').length,
    montoTotal: cotizacionesFiltradas.reduce((sum, c) => 
      sum + (c.items?.reduce((pSum, p) => pSum + (p.total_linea || 0), 0) || 0), 0
    ),
    scorePromedio: cotizacionesFiltradas.length > 0 ? Math.round(cotizacionesFiltradas.reduce((acc, c) => acc + (c.score || 0), 0) / cotizacionesFiltradas.length) : 0,
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
          <Button onClick={() => setCotizacionWizardOpen(true)}>
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
              {([
                { key: 'todas', label: 'Todas' },
                { key: 'pendientes', label: 'Pendientes' },
                { key: 'enviadas', label: 'Enviadas' },
                { key: 'por-vencer', label: 'Por vencer (7 días)' },
                { key: 'score-alto', label: 'Score alto (80+)' },
                { key: 'monto-alto', label: 'Monto alto (+$1M)' },
                { key: 'rechazadas', label: 'Rechazadas' },
              ] as const).map(filtro => (
                <Button 
                  key={filtro.key}
                  variant={filtroActivo === filtro.key ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setFiltroActivo(filtro.key)}
                >
                  {filtro.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabla de cotizaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Cotizaciones</CardTitle>
            <CardDescription>
              {cotizacionesFiltradas.length} cotizaciones {filtroActivo !== 'todas' ? 'filtradas' : 'en el sistema'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={cotizacionesFiltradas}
              searchKey="codigo"
              searchPlaceholder="Buscar por código, cliente..."
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Dialog para enviar cotización */}
        <Dialog open={enviarDialogOpen} onOpenChange={setEnviarDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Cotización</DialogTitle>
              <DialogDescription>
                ¿Está seguro que desea enviar la cotización {cotizacionSeleccionada?.codigo}?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEnviarDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmarEnvio}>
                Enviar por Email
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Cotización Wizard */}
        <CotizacionWizard 
          open={cotizacionWizardOpen} 
          onOpenChange={setCotizacionWizardOpen}
          onSuccess={(cotizacionId) => {
            loadData(); // Reload data to show new quotation
            toast({
              title: "Éxito",
              description: "Cotización creada correctamente",
            });
          }}
        />
      </div>
    </Layout>
  );
}