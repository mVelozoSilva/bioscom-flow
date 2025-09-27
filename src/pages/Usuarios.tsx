import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/bioscom/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  ultimo_acceso: string;
  activo: boolean;
  fecha_creacion: string;
}
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const getEstadoColor = (activo: boolean) => {
    return activo 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'vendedor': return 'bg-blue-100 text-blue-800';
      case 'tecnico': return 'bg-orange-100 text-orange-800';
      case 'cobranza': return 'bg-green-100 text-green-800';
      case 'logistica': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartamentoColor = (departamento: string) => {
    switch (departamento) {
      case 'ventas': return 'bg-blue-100 text-blue-800';
      case 'tecnico': return 'bg-orange-100 text-orange-800';
      case 'cobranza': return 'bg-green-100 text-green-800';
      case 'logistica': return 'bg-cyan-100 text-cyan-800';
      case 'administracion': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'nombre',
      header: 'Usuario',
      cell: ({ row }) => {
        const usuario = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{usuario.nombre}</div>
            <div className="text-sm text-muted-foreground">{usuario.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({ row }) => {
        const rol = row.getValue('rol') as string;
        return (
          <Badge className={getRolColor(rol)}>
            {rol}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'departamento',
      header: 'Departamento',
      cell: ({ row }) => {
        const departamento = row.getValue('departamento') as string;
        return (
          <Badge variant="outline" className={getDepartamentoColor(departamento)}>
            {departamento}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'ultimo_acceso',
      header: 'Último Acceso',
      cell: ({ row }) => {
        const fecha = row.getValue('ultimo_acceso') as string;
        if (!fecha) return <span className="text-muted-foreground">Nunca</span>;
        return (
          <div className="text-sm">
            {format(new Date(fecha), "PPp", { locale: es })}
          </div>
        );
      },
    },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: ({ row }) => {
        const activo = row.getValue('activo') as boolean;
        return (
          <Badge className={getEstadoColor(activo)}>
            {activo ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Creado',
      cell: ({ row }) => {
        const fecha = row.getValue('created_at') as string;
        return (
          <div className="text-sm">
            {format(new Date(fecha), "PPP", { locale: es })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const usuario = row.original;
        return (
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" title="Editar">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Enviar Magic Link">
              <Mail className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              title={usuario.activo ? "Desactivar" : "Activar"}
            >
              {usuario.activo ? (
                <UserX className="h-4 w-4 text-red-500" />
              ) : (
                <UserCheck className="h-4 w-4 text-green-500" />
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const estadisticas = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.activo === true).length,
    admins: usuarios.filter(u => u.rol === 'admin').length,
    vendedores: usuarios.filter(u => u.rol === 'vendedor').length,
    tecnicos: usuarios.filter(u => u.rol === 'tecnico').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">
              Administración de usuarios, roles y permisos del sistema
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{estadisticas.total}</div>
              <p className="text-xs text-muted-foreground">
                En el sistema
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{estadisticas.activos}</div>
              <p className="text-xs text-muted-foreground">
                {((estadisticas.activos / estadisticas.total) * 100).toFixed(1)}% del total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Shield className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{estadisticas.admins}</div>
              <p className="text-xs text-muted-foreground">
                Acceso completo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{estadisticas.vendedores}</div>
              <p className="text-xs text-muted-foreground">
                Equipo comercial
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Técnicos</CardTitle>
              <Settings className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{estadisticas.tecnicos}</div>
              <p className="text-xs text-muted-foreground">
                Servicio técnico
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
              <Button variant="outline" size="sm">Activos</Button>
              <Button variant="outline" size="sm">Inactivos</Button>
              <Button variant="outline" size="sm">Administradores</Button>
              <Button variant="outline" size="sm">Vendedores</Button>
              <Button variant="outline" size="sm">Técnicos</Button>
              <Button variant="outline" size="sm">Cobranza</Button>
              <Button variant="outline" size="sm">Logística</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              {usuarios.length} usuarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={usuarios}
              searchKey="nombre"
              searchPlaceholder="Buscar por nombre, email o departamento..."
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}