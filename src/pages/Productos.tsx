import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Package, AlertTriangle, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productosDAL, categoriasDAL, inventarioDAL } from '@/dal/productos';
import { useToast } from '@/hooks/use-toast';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    search: '',
    categoria_id: '',
    estado: 'true'
  });
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [productosData, categoriasData, alertasData] = await Promise.all([
        productosDAL.listWithCategoria(filtros),
        categoriasDAL.listWithProductCount(),
        inventarioDAL.getAlertas()
      ]);
      
      setProductos(productosData);
      setCategorias(categoriasData);
      setAlertasStock(alertasData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filtros]);

  const columns = [
    {
      accessorKey: "codigo_producto",
      header: "Código",
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.getValue("codigo_producto")}
        </div>
      ),
    },
    {
      accessorKey: "nombre",
      header: "Producto",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("nombre")}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.descripcion_corta}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoría",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.categoria?.nombre || 'Sin categoría'}
        </Badge>
      ),
    },
    {
      accessorKey: "precio_neto",
      header: "Precio",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ${Number(row.getValue("precio_neto")).toLocaleString('es-CL')}
        </div>
      ),
    },
    {
      accessorKey: "inventario",
      header: "Stock",
      cell: ({ row }) => {
        const inventario = row.original.inventario?.[0];
        if (!inventario) return <span className="text-muted-foreground">-</span>;
        
        const isLowStock = inventario.stock_actual <= inventario.stock_minimo;
        return (
          <div className="flex items-center gap-2">
            <span className={isLowStock ? 'text-destructive font-medium' : ''}>
              {inventario.stock_actual}
            </span>
            {isLowStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </div>
        );
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.getValue("estado") ? "default" : "secondary"}>
          {row.getValue("estado") ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.link_canva && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(row.original.link_canva, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">
            Gestión del catálogo de productos médicos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productos.length}</div>
            <p className="text-xs text-muted-foreground">
              En catálogo activo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorias.length}</div>
            <p className="text-xs text-muted-foreground">
              Líneas de negocio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{alertasStock.length}</div>
            <p className="text-xs text-muted-foreground">
              Productos con stock bajo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${productos.reduce((acc, p) => {
                const stock = p.inventario?.[0]?.stock_actual || 0;
                return acc + (Number(p.precio_neto) * stock);
              }, 0).toLocaleString('es-CL')}
            </div>
            <p className="text-xs text-muted-foreground">
              Total en stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alertasStock.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Stock Bajo
            </CardTitle>
            <CardDescription>
              Los siguientes productos requieren reposición urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertasStock.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <span className="font-medium">{item.producto?.nombre}</span>
                    <span className="text-muted-foreground ml-2">({item.producto?.codigo_producto})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-destructive font-medium">
                      Stock: {item.stock_actual}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      Mínimo: {item.stock_minimo}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={filtros.search}
                  onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filtros.categoria_id}
              onValueChange={(value) => setFiltros({ ...filtros, categoria_id: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filtros.estado}
              onValueChange={(value) => setFiltros({ ...filtros, estado: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos</CardTitle>
          <CardDescription>
            {productos.length} productos en el catálogo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={productos}
            searchKey="nombre"
            searchPlaceholder="Buscar productos..."
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Productos;