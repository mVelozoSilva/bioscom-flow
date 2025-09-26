import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Phone, 
  Plus, 
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  TrendingUp,
  Users,
  Edit,
  PhoneCall,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { SeguimientosDAL } from '@/dal/seguimientos';
import { SeguimientoDrawer } from '@/components/drawers/SeguimientoDrawer';

type FilterType = 'todos' | 'hoy' | 'vencidos' | 'esta-semana';

export default function Seguimientos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seguimientos, setSeguimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState<FilterType>('todos');
  const [seguimientoDrawerOpen, setSeguimientoDrawerOpen] = useState(false);
  const [llamadaDialogOpen, setLlamadaDialogOpen] = useState(false);
  const [seguimientoSeleccionado, setSeguimientoSeleccionado] = useState<any>(null);
  const [vistaAgenda, setVistaAgenda] = useState(false);

  useEffect(() => {
    loadSeguimientos();
  }, []);

  const loadSeguimientos = async () => {
    try {
      setLoading(true);
      const data = await SeguimientosDAL.getAll();
      setSeguimientos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los seguimientos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar seguimientos
  const seguimientosFiltrados = useMemo(() => {
    let resultado = [...seguimientos];
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());

    switch (filtroActivo) {
      case 'hoy':
        resultado = resultado.filter(s => {
          const fecha = new Date(s.proxima_gestion);
          return fecha.toDateString() === hoy.toDateString();
        });
        break;
      case 'vencidos':
        resultado = resultado.filter(s => {
          const fecha = new Date(s.proxima_gestion);
          return fecha < hoy;
        });
        break;
      case 'esta-semana':
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 7);
        resultado = resultado.filter(s => {
          const fecha = new Date(s.proxima_gestion);
          return fecha >= inicioSemana && fecha <= finSemana;
        });
        break;
    }

    return resultado;
  }, [seguimientos, filtroActivo]);

  const abrirLlamada = (seguimiento: any) => {
    setSeguimientoSeleccionado(seguimiento);
    setLlamadaDialogOpen(true);
  };

  const registrarLlamada = async () => {
    if (seguimientoSeleccionado) {
      try {
        // Actualizar última gestión y próxima gestión
        await SeguimientosDAL.update(seguimientoSeleccionado.id, {
          ultima_gestion: new Date().toISOString().split('T')[0],
          estado: 'En gestión'
        });
        
        toast({
          title: "Llamada registrada",
          description: "Se ha registrado la gestión telefónica.",
        });
        setLlamadaDialogOpen(false);
        loadSeguimientos();
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo registrar la llamada",
          variant: "destructive"
        });
      }
    }
  };

  const completarSeguimiento = async (seguimiento: any) => {
    try {
      await SeguimientosDAL.update(seguimiento.id, {
        estado: 'Cerrado'
      });
      
      toast({
        title: "Seguimiento completado",
        description: "El seguimiento ha sido marcado como completado.",
      });
      loadSeguimientos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar el seguimiento",
        variant: "destructive"
      });
    }
  };

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
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'En gestión': return 'bg-blue-100 text-blue-800';
      case 'Pausado': return 'bg-yellow-100 text-yellow-800';
      case 'Cerrado': return 'bg-gray-100 text-gray-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSemaforoColor = (seguimiento: any) => {
    const dias = Math.ceil((new Date(seguimiento.proxima_gestion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (dias < 0) return 'bg-red-500'; // Vencido
    if (dias <= 1) return 'bg-yellow-500'; // Por vencer
    return 'bg-green-500'; // Ok
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'semaforo',
      header: '',
      cell: ({ row }) => {
        const seguimiento = row.original;
        return (
          <div className={`w-3 h-3 rounded-full ${getSemaforoColor(seguimiento)}`} />
        );
      },
    },
    {
      accessorKey: 'cliente_id',
      header: 'Cliente',
      cell: ({ row }) => {
        const seguimiento = row.original;
        const cliente = seguimiento.clientes;
        return cliente ? (
          <div>
            <div className="font-medium">{cliente.nombre}</div>
            <div className="text-sm text-muted-foreground">{cliente.rut}</div>
          </div>
        ) : null;
      },
    },
    {
      accessorKey: 'vendedor_id',
      header: 'Vendedor',
      cell: ({ row }) => {
        const seguimiento = row.original;
        const vendedor = seguimiento.user_profiles;
        return vendedor ? (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white">
              {vendedor.nombre[0]}
            </div>
            <span className="text-sm">{vendedor.nombre}</span>
          </div>
        ) : null;
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
      accessorKey: 'ultima_gestion',
      header: 'Última Gestión',
      cell: ({ row }) => {
        const fecha = row.getValue('ultima_gestion') as Date;
        return fecha ? (
          <div className="text-sm">
            {new Date(fecha).toLocaleDateString('es-CL')}
          </div>
        ) : (
          <span className="text-muted-foreground">Sin gestión</span>
        );
      },
    },
    {
      accessorKey: 'proxima_gestion',
      header: 'Próxima Gestión',
      cell: ({ row }) => {
        const fecha = row.getValue('proxima_gestion') as Date;
        const dias = Math.ceil((new Date(fecha).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div>
            <div className="text-sm">
              {new Date(fecha).toLocaleDateString('es-CL')}
            </div>
            <div className={`text-xs ${dias < 0 ? 'text-red-500' : dias <= 1 ? 'text-orange-500' : 'text-muted-foreground'}`}>
              {dias < 0 ? `Vencido ${Math.abs(dias)} días` : 
               dias === 0 ? 'Hoy' : 
               dias === 1 ? 'Mañana' :
               `En ${dias} días`}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'notas',
      header: 'Notas',
      cell: ({ row }) => {
        const notas = row.getValue('notas') as string;
        return (
          <div className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
            {notas}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const seguimiento = row.original;
        return (
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => abrirLlamada(seguimiento)}
              title="Registrar llamada"
            >
              <PhoneCall className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setSeguimientoSeleccionado(seguimiento);
                  setSeguimientoDrawerOpen(true);
                }}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => completarSeguimiento(seguimiento)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Completar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const estadisticas = {
    total: seguimientos.length,
    activos: seguimientos.filter(s => s.estado === 'Activo').length,
    enGestion: seguimientos.filter(s => s.estado === 'En gestión').length,
    vencidos: seguimientos.filter(s => {
      const fecha = new Date(s.proxima_gestion);
      return fecha < new Date();
    }).length,
    hoy: seguimientos.filter(s => {
      const hoy = new Date();
      const fechaSeg = new Date(s.proxima_gestion);
      return fechaSeg.toDateString() === hoy.toDateString();
    }).length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Seguimientos</h1>
            <p className="text-muted-foreground">
              Gestión de seguimientos comerciales y oportunidades
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setVistaAgenda(!vistaAgenda)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {vistaAgenda ? 'Vista Lista' : 'Mi Agenda'}
            </Button>
            <Button
              variant="outline"
              onClick={loadSeguimientos}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={() => setSeguimientoDrawerOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Seguimiento
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.activos}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Gestión</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.enGestion}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Para Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{estadisticas.hoy}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{estadisticas.vencidos}</div>
            </CardContent>
          </Card>
        </div>

        {/* Semáforo de seguimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Semáforo de Seguimientos</CardTitle>
            <CardDescription>Estado de urgencia por próxima gestión</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">En Tiempo</div>
                  <div className="text-sm text-muted-foreground">
                    {seguimientos.filter(s => {
                      const dias = Math.ceil((new Date(s.proxima_gestion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return dias > 1;
                    }).length} seguimientos
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Por Vencer</div>
                  <div className="text-sm text-muted-foreground">
                    {seguimientos.filter(s => {
                      const dias = Math.ceil((new Date(s.proxima_gestion).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return dias >= 0 && dias <= 1;
                    }).length} seguimientos
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 rounded-lg border">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Vencidos</div>
                  <div className="text-sm text-muted-foreground">
                    {estadisticas.vencidos} seguimientos
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seguimientos urgentes */}
        {estadisticas.vencidos > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-red-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Seguimientos Vencidos - Requieren Atención Inmediata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {seguimientos
                  .filter(s => {
                    const fecha = new Date(s.proxima_gestion);
                    return fecha < new Date();
                  })
                  .slice(0, 3)
                  .map((seguimiento) => {
                    const cliente = seguimiento.clientes;
                    return (
                      <div key={seguimiento.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <div className="font-medium text-sm">{cliente?.nombre}</div>
                          <div className="text-xs text-muted-foreground">
                            Vencido el {new Date(seguimiento.proxima_gestion).toLocaleDateString('es-CL')}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => abrirLlamada(seguimiento)}>
                          <Phone className="h-4 w-4 mr-2" />
                          Contactar
                        </Button>
                      </div>
                    );
                  })}
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
              <Button variant="outline" size="sm">Todos</Button>
              <Button variant="outline" size="sm">Mis Seguimientos</Button>
              <Button variant="outline" size="sm">Para Hoy</Button>
              <Button variant="outline" size="sm">Esta Semana</Button>
              <Button variant="outline" size="sm">Vencidos</Button>
              <Button variant="outline" size="sm">Alta Prioridad</Button>
              <Button variant="outline" size="sm">Sin Gestión</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de seguimientos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Seguimientos</CardTitle>
            <CardDescription>
              {seguimientos.length} seguimientos en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={seguimientos}
              searchKey="notas"
              searchPlaceholder="Buscar en notas o cliente..."
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}