import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { AdvancedDataTable, DataTableFilter } from '@/components/ui/advanced-data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Users, 
  Plus, 
  Star,
  TrendingUp,
  Eye,
  Edit,
  FileText,
  ListTodo,
  Trash2,
  PhoneCall,
  MoreHorizontal,
  ArrowUpDown,
  Mail,
  Archive,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { clientesDAL, Cliente } from '@/dal/clientes';
import { exportToCSV, formatDateForExport, ExportColumn } from '@/lib/export-utils';
import { ConfirmActionDialog } from '@/components/clientes/ConfirmActionDialog';
import { CambiarEstadoDialog } from '@/components/clientes/CambiarEstadoDialog';
import { supabase } from '@/integrations/supabase/client';

// Tipos extendidos para incluir información de vendedor y próxima acción
interface ClienteExtendido extends Cliente {
  vendedor?: string;
  proximaAccion?: string;
  contactos?: any[];
}

export default function Clientes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes, setClientes] = useState<ClienteExtendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteDrawerOpen, setClienteDrawerOpen] = useState(false);
  const [clienteDetalleOpen, setClienteDetalleOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteExtendido | null>(null);
  
  // Estados para diálogos de confirmación
  const [cambiarEstadoDialogOpen, setCambiarEstadoDialogOpen] = useState(false);
  const [archivarDialogOpen, setArchivarDialogOpen] = useState(false);
  const [clienteParaAccion, setClienteParaAccion] = useState<ClienteExtendido | null>(null);

  // Cargar clientes desde Supabase
  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesDAL.listWithContacts();
      
      // Extender datos con información adicional (vendedor, próxima acción)
      const extendedData: ClienteExtendido[] = data.map((cliente: any) => ({
        ...cliente,
        vendedor: 'Sin asignar', // TODO: Obtener desde seguimientos o cotizaciones
        proximaAccion: cliente.last_interaction_at 
          ? new Date(new Date(cliente.last_interaction_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
      }));
      
      setClientes(extendedData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers para acciones de clientes
  const handleVerDetalle = (cliente: ClienteExtendido) => {
    setClienteSeleccionado(cliente);
    setClienteDetalleOpen(true);
  };

  const handleEditar = (cliente: ClienteExtendido) => {
    setClienteSeleccionado(cliente);
    setClienteDrawerOpen(true);
  };

  const handleCrearTarea = (cliente: ClienteExtendido) => {
    navigate(`/tareas?accion=crear&cliente=${cliente.id}`);
    toast({
      title: "Redirigiendo...",
      description: `Creando nueva tarea para ${cliente.nombre}`,
    });
  };

  const handleAgendarLlamada = (cliente: ClienteExtendido) => {
    navigate(`/seguimientos?accion=crear&cliente=${cliente.id}&tipo=llamada`);
    toast({
      title: "Redirigiendo...",
      description: `Agendando llamada con ${cliente.nombre}`,
    });
  };

  const handleCambiarEstado = (cliente: ClienteExtendido) => {
    setClienteParaAccion(cliente);
    setCambiarEstadoDialogOpen(true);
  };

  const handleArchivar = (cliente: ClienteExtendido) => {
    setClienteParaAccion(cliente);
    setArchivarDialogOpen(true);
  };

  // Confirmar cambio de estado
  const confirmarCambioEstado = async (nuevoEstado: string) => {
    if (!clienteParaAccion) return;

    // Actualización optimista
    const clienteAnterior = clientes.find(c => c.id === clienteParaAccion.id);
    setClientes(prev => 
      prev.map(c => 
        c.id === clienteParaAccion.id 
          ? { ...c, estado_relacional: nuevoEstado as any } 
          : c
      )
    );

    try {
      const { data, error } = await supabase.functions.invoke('cambiar-estado-cliente', {
        body: { id: clienteParaAccion.id, nuevoEstado }
      });

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `El estado de ${clienteParaAccion.nombre} se cambió a ${nuevoEstado}.`,
      });

      // Recargar datos reales del servidor
      await loadClientes();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      
      // Revertir cambio optimista
      if (clienteAnterior) {
        setClientes(prev => 
          prev.map(c => 
            c.id === clienteParaAccion.id 
              ? clienteAnterior 
              : c
          )
        );
      }

      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del cliente.",
        variant: "destructive"
      });
    }
  };

  // Confirmar archivado
  const confirmarArchivar = async () => {
    if (!clienteParaAccion) return;

    // Actualización optimista - marcar como archivado
    const clienteAnterior = clientes.find(c => c.id === clienteParaAccion.id);
    setClientes(prev => 
      prev.map(c => 
        c.id === clienteParaAccion.id 
          ? { ...c, estado_relacional: 'Inactivo' as any, tags: [...(c.tags || []), 'archivado'] } 
          : c
      )
    );

    try {
      const { data, error } = await supabase.functions.invoke('archivar-cliente', {
        body: { id: clienteParaAccion.id }
      });

      if (error) throw error;

      toast({
        title: "Cliente archivado",
        description: `${clienteParaAccion.nombre} ha sido archivado correctamente.`,
      });

      setArchivarDialogOpen(false);
      
      // Recargar datos reales del servidor
      await loadClientes();
    } catch (error) {
      console.error('Error al archivar cliente:', error);
      
      // Revertir cambio optimista
      if (clienteAnterior) {
        setClientes(prev => 
          prev.map(c => 
            c.id === clienteParaAccion.id 
              ? clienteAnterior 
              : c
          )
        );
      }

      toast({
        title: "Error",
        description: "No se pudo archivar el cliente.",
        variant: "destructive"
      });
    }
  };

  // Función para exportar clientes a CSV
  const handleExportCSV = () => {
    const exportColumns: ExportColumn[] = [
      { key: 'rut', header: 'RUT' },
      { key: 'nombre', header: 'Razón Social' },
      { key: 'tipo', header: 'Tipo' },
      { key: 'estado_relacional', header: 'Estado' },
      { key: 'vendedor', header: 'Vendedor' },
      { 
        key: 'last_interaction_at', 
        header: 'Último Contacto',
        format: formatDateForExport
      },
      { 
        key: 'proximaAccion', 
        header: 'Próxima Acción',
        format: formatDateForExport
      },
      { key: 'score', header: 'Score' },
      { key: 'direccion', header: 'Dirección' },
    ];

    exportToCSV(clientes, exportColumns, `clientes-${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "Exportación exitosa",
      description: `Se exportaron ${clientes.length} clientes a CSV.`,
    });
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Público': return 'bg-blue-100 text-blue-800';
      case 'Privado': return 'bg-green-100 text-green-800';
      case 'Revendedor': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Nuevo': return 'bg-yellow-100 text-yellow-800';
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Inactivo': return 'bg-gray-100 text-gray-800';
      case 'Problemático': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Definición de columnas para la tabla
  const columns: ColumnDef<ClienteExtendido>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'rut',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            RUT
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-mono">{row.getValue('rut')}</div>,
    },
    {
      accessorKey: 'nombre',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Razón Social
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="max-w-[300px]">
            <div className="font-medium truncate">{row.getValue('nombre')}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'estado_relacional',
      id: 'estado_relacional',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Estado
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const estado = row.getValue('estado_relacional') as string;
        return (
          <Badge variant="outline" className={getEstadoColor(estado)}>
            {estado}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value === row.getValue(id);
      },
    },
    {
      accessorKey: 'vendedor',
      header: 'Vendedor',
      cell: ({ row }) => {
        const vendedor = row.getValue('vendedor') as string;
        return <div className="text-sm">{vendedor || 'Sin asignar'}</div>;
      },
    },
    {
      accessorKey: 'last_interaction_at',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Último Contacto
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const fecha = row.getValue('last_interaction_at') as string;
        return fecha ? (
          <div className="text-sm">
            {new Date(fecha).toLocaleDateString('es-CL')}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Sin contacto</span>
        );
      },
    },
    {
      accessorKey: 'proximaAccion',
      header: 'Próxima Acción',
      cell: ({ row }) => {
        const fecha = row.getValue('proximaAccion') as string;
        return fecha ? (
          <div className="text-sm">
            {new Date(fecha).toLocaleDateString('es-CL')}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No programada</span>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const cliente = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleVerDetalle(cliente)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditar(cliente)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCrearTarea(cliente)}>
                <ListTodo className="mr-2 h-4 w-4" />
                Crear Tarea
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAgendarLlamada(cliente)}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Llamada
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCambiarEstado(cliente)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Cambiar Estado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArchivar(cliente)}>
                <Archive className="mr-2 h-4 w-4" />
                Archivar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Filtros para el DataTable
  const filters: DataTableFilter[] = [
    {
      id: 'estado_relacional',
      label: 'Estado',
      options: [
        { label: 'Nuevo', value: 'Nuevo' },
        { label: 'Activo', value: 'Activo' },
        { label: 'Inactivo', value: 'Inactivo' },
        { label: 'Problemático', value: 'Problemático' },
      ],
    },
  ];

  const estadisticas = {
    total: clientes.length,
    nuevos: clientes.filter(c => c.estado_relacional === 'Nuevo').length,
    activos: clientes.filter(c => c.estado_relacional === 'Activo').length,
    scorePromedio: clientes.length > 0 ? Math.round(clientes.reduce((acc, c) => acc + c.score, 0) / clientes.length) : 0,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">
              Gestión de clientes y relaciones comerciales
            </p>
          </div>
          <Button onClick={() => setClienteDrawerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
              <Plus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.nuevos}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.activos}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(estadisticas.scorePromedio)}`}>
                {estadisticas.scorePromedio}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {clientes.length} clientes registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedDataTable 
              columns={columns} 
              data={clientes}
              searchPlaceholder="Buscar por RUT, razón social..."
              filters={filters}
              onExport={handleExportCSV}
              loading={loading}
              emptyMessage="No se encontraron clientes."
              pageSize={10}
              storageKey="clientes-table"
            />
          </CardContent>
        </Card>

        {/* Cliente Drawer para crear/editar */}
        <Sheet open={clienteDrawerOpen} onOpenChange={setClienteDrawerOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>{clienteSeleccionado ? 'Editar Cliente' : 'Nuevo Cliente'}</SheetTitle>
              <SheetDescription>
                {clienteSeleccionado ? 'Modifica los datos del cliente seleccionado.' : 'Completa los datos para crear un nuevo cliente.'}
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <ClienteForm 
                cliente={clienteSeleccionado} 
                onSuccess={() => {
                  setClienteDrawerOpen(false);
                  setClienteSeleccionado(null);
                  toast({
                    title: clienteSeleccionado ? "Cliente actualizado" : "Cliente creado",
                    description: "Los datos se han guardado correctamente.",
                  });
                }}
                onCancel={() => {
                  setClienteDrawerOpen(false);
                  setClienteSeleccionado(null);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Cliente Detalle Sheet */}
        <Sheet open={clienteDetalleOpen} onOpenChange={setClienteDetalleOpen}>
          <SheetContent className="w-[600px] sm:w-[700px]">
            <SheetHeader>
              <SheetTitle>Detalle de Cliente</SheetTitle>
              <SheetDescription>
                Información completa y actividades del cliente
              </SheetDescription>
            </SheetHeader>
            {clienteSeleccionado && (
              <ClienteDetalle cliente={clienteSeleccionado} />
            )}
          </SheetContent>
        </Sheet>

        {/* Diálogo para cambiar estado */}
        <CambiarEstadoDialog
          open={cambiarEstadoDialogOpen}
          onOpenChange={setCambiarEstadoDialogOpen}
          cliente={clienteParaAccion}
          onConfirm={confirmarCambioEstado}
        />

        {/* Diálogo de confirmación para archivar */}
        <ConfirmActionDialog
          open={archivarDialogOpen}
          onOpenChange={setArchivarDialogOpen}
          title="¿Archivar cliente?"
          description={`¿Está seguro de que desea archivar a ${clienteParaAccion?.nombre}? El cliente se marcará como Inactivo.`}
          onConfirm={confirmarArchivar}
          confirmText="Archivar"
          cancelText="Cancelar"
          variant="default"
        />
      </div>
    </Layout>
  );
}

// Componente de formulario de cliente
function ClienteForm({ cliente, onSuccess, onCancel }: { 
  cliente: ClienteExtendido | null; 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<{
    nombre: string;
    rut: string;
    direccion: string;
    tipo: 'Público' | 'Privado' | 'Revendedor';
    email: string;
    telefono: string;
  }>({
    nombre: cliente?.nombre || '',
    rut: cliente?.rut || '',
    direccion: cliente?.direccion || '',
    tipo: cliente?.tipo || 'Privado',
    email: '',
    telefono: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // TODO: Implementar guardado en Supabase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      onSuccess();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre de la Institución *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="rut">RUT *</Label>
        <Input
          id="rut"
          value={formData.rut}
          onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
          placeholder="XX.XXX.XXX-X"
          required
        />
      </div>
      <div>
        <Label htmlFor="tipo">Tipo de Cliente</Label>
        <Select value={formData.tipo} onValueChange={(value: 'Público' | 'Privado' | 'Revendedor') => setFormData(prev => ({ ...prev, tipo: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Público">Público</SelectItem>
            <SelectItem value="Privado">Privado</SelectItem>
            <SelectItem value="Revendedor">Revendedor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="direccion">Dirección</Label>
        <Textarea
          id="direccion"
          value={formData.direccion}
          onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          value={formData.telefono}
          onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
          placeholder="+56 9 XXXX XXXX"
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : (cliente ? "Actualizar" : "Crear Cliente")}
        </Button>
      </div>
    </form>
  );
}

// Componente de detalle de cliente
function ClienteDetalle({ cliente }: { cliente: ClienteExtendido }) {
  return (
    <div className="py-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
          <p className="text-sm">{cliente.nombre}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">RUT</Label>
          <p className="text-sm">{cliente.rut}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
          <Badge className="text-xs">{cliente.tipo}</Badge>
        </div>
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Score</Label>
          <p className="text-sm font-semibold">{cliente.score}</p>
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
        <p className="text-sm">{cliente.direccion || 'No especificada'}</p>
      </div>

      <div className="pt-4">
        <p className="text-sm text-muted-foreground">
          Las tabs de Cotizaciones, Tareas y Seguimientos estarán disponibles próximamente.
        </p>
      </div>
    </div>
  );
}