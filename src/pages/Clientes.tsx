import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Eye,
  Edit,
  FileText,
  ListTodo,
  Trash2,
  PhoneCall,
  X
} from 'lucide-react';
import { Cliente } from '@/types';
import { clientesSeed } from '@/data/seeds';

type FilterType = 'todos' | 'publicos' | 'privados' | 'revendedores' | 'score-alto' | 'nuevos' | 'sin-interaccion';

export default function Clientes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientes] = useState<Cliente[]>(clientesSeed);
  const [filtroActivo, setFiltroActivo] = useState<FilterType>('todos');
  const [clienteDrawerOpen, setClienteDrawerOpen] = useState(false);
  const [clienteDetalleOpen, setClienteDetalleOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [filtrosAvanzadosOpen, setFiltrosAvanzadosOpen] = useState(false);
  const [filtroAvanzado, setFiltroAvanzado] = useState({
    tipo: 'todos',
    vendedor: '',
    fechaCreacion: ''
  });

  // Filtrar clientes basado en filtros activos
  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes];

    // Aplicar filtro rápido
    switch (filtroActivo) {
      case 'publicos':
        resultado = resultado.filter(c => c.tipo === 'Público');
        break;
      case 'privados':
        resultado = resultado.filter(c => c.tipo === 'Privado');
        break;
      case 'revendedores':
        resultado = resultado.filter(c => c.tipo === 'Revendedor');
        break;
      case 'score-alto':
        resultado = resultado.filter(c => c.score >= 80);
        break;
      case 'nuevos':
        resultado = resultado.filter(c => c.estado_relacional === 'Nuevo');
        break;
      case 'sin-interaccion':
        resultado = resultado.filter(c => !c.last_interaction_at);
        break;
    }

    // Aplicar filtros avanzados
    if (filtroAvanzado.tipo && filtroAvanzado.tipo !== 'todos') {
      resultado = resultado.filter(c => c.tipo === filtroAvanzado.tipo);
    }

    return resultado;
  }, [clientes, filtroActivo, filtroAvanzado]);

  const abrirDetalleCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setClienteDetalleOpen(true);
  };

  const editarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setClienteDrawerOpen(true);
  };

  const eliminarCliente = async (cliente: Cliente) => {
    try {
      // TODO: Implementar eliminación en Supabase
      toast({
        title: "Cliente eliminado",
        description: `${cliente.nombre} ha sido eliminado correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente.",
        variant: "destructive"
      });
    }
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

  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: 'nombre',
      header: 'Cliente',
      cell: ({ row }) => {
        const cliente = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{cliente.nombre}</div>
            <div className="text-sm text-muted-foreground">{cliente.rut}</div>
          </div>
        );
      },
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
      accessorKey: 'estado_relacional',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.getValue('estado_relacional') as string;
        return (
          <Badge variant="outline" className={getEstadoColor(estado)}>
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
            <Star className="h-4 w-4 inline mr-1" />
            {score}
          </div>
        );
      },
    },
    {
      accessorKey: 'contactos',
      header: 'Contacto Principal',
      cell: ({ row }) => {
        const contactos = row.getValue('contactos') as any[];
        const principal = contactos.find(c => c.principal) || contactos[0];
        return principal ? (
          <div className="space-y-1">
            <div className="text-sm font-medium">{principal.nombre}</div>
            <div className="text-xs text-muted-foreground">{principal.cargo}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span>{principal.email}</span>
            </div>
          </div>
        ) : null;
      },
    },
    {
      accessorKey: 'last_interaction_at',
      header: 'Última Interacción',
      cell: ({ row }) => {
        const fecha = row.getValue('last_interaction_at') as Date;
        return fecha ? (
          <div className="text-sm">
            {new Date(fecha).toLocaleDateString('es-CL')}
          </div>
        ) : (
          <span className="text-muted-foreground">Sin interacciones</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const cliente = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => abrirDetalleCliente(cliente)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editarCliente(cliente)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/cotizaciones?cliente=${cliente.id}`)}>
                <FileText className="mr-2 h-4 w-4" />
                Ver cotizaciones
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/tareas?cliente=${cliente.id}`)}>
                <ListTodo className="mr-2 h-4 w-4" />
                Ver tareas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/seguimientos?cliente=${cliente.id}`)}>
                <PhoneCall className="mr-2 h-4 w-4" />
                Ver seguimientos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => eliminarCliente(cliente)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const estadisticas = {
    total: clientesFiltrados.length,
    nuevos: clientesFiltrados.filter(c => c.estado_relacional === 'Nuevo').length,
    activos: clientesFiltrados.filter(c => c.estado_relacional === 'Activo').length,
    scorePromedio: clientesFiltrados.length > 0 ? Math.round(clientesFiltrados.reduce((acc, c) => acc + c.score, 0) / clientesFiltrados.length) : 0,
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

        {/* Filtros rápidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Filtros Rápidos</CardTitle>
            <Popover open={filtrosAvanzadosOpen} onOpenChange={setFiltrosAvanzadosOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Avanzados
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tipo">Tipo de Cliente</Label>
                    <Select value={filtroAvanzado.tipo} onValueChange={(value) => setFiltroAvanzado(prev => ({ ...prev, tipo: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="Público">Público</SelectItem>
                        <SelectItem value="Privado">Privado</SelectItem>
                        <SelectItem value="Revendedor">Revendedor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => setFiltrosAvanzadosOpen(false)} className="w-full">
                    Aplicar Filtros
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'todos', label: 'Todos' },
                { key: 'publicos', label: 'Públicos' },
                { key: 'privados', label: 'Privados' },
                { key: 'revendedores', label: 'Revendedores' },
                { key: 'score-alto', label: 'Score Alto (80+)' },
                { key: 'nuevos', label: 'Nuevos' },
                { key: 'sin-interaccion', label: 'Sin interacción reciente' },
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

        {/* Tabla de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {clientesFiltrados.length} clientes {filtroActivo !== 'todos' ? 'filtrados' : 'registrados'} en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={clientesFiltrados}
              searchKey="nombre"
              searchPlaceholder="Buscar por nombre, RUT o contacto..."
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
      </div>
    </Layout>
  );
}

// Componente de formulario de cliente
function ClienteForm({ cliente, onSuccess, onCancel }: { 
  cliente: Cliente | null; 
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
function ClienteDetalle({ cliente }: { cliente: Cliente }) {
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