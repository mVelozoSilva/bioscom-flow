import React, { useState } from 'react';
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
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react';
import { Cliente } from '@/types';
import { clientesSeed } from '@/data/seeds';

export default function Clientes() {
  const [clientes] = useState<Cliente[]>(clientesSeed);

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
        return (
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  const estadisticas = {
    total: clientes.length,
    nuevos: clientes.filter(c => c.estado_relacional === 'Nuevo').length,
    activos: clientes.filter(c => c.estado_relacional === 'Activo').length,
    scorePromedio: Math.round(clientes.reduce((acc, c) => acc + c.score, 0) / clientes.length),
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
          <Button>
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
          <CardHeader>
            <CardTitle className="text-lg">Filtros Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">Todos</Button>
              <Button variant="outline" size="sm">Públicos</Button>
              <Button variant="outline" size="sm">Privados</Button>
              <Button variant="outline" size="sm">Revendedores</Button>
              <Button variant="outline" size="sm">Score Alto (80+)</Button>
              <Button variant="outline" size="sm">Nuevos</Button>
              <Button variant="outline" size="sm">Sin interacción reciente</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {clientes.length} clientes registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={clientes}
              searchKey="nombre"
              searchPlaceholder="Buscar por nombre, RUT o contacto..."
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}