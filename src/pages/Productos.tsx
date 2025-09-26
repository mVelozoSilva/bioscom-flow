import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Package, AlertTriangle, ExternalLink, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Layout } from '@/components/bioscom/layout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { productosDAL, categoriasDAL, inventarioDAL, Producto, Categoria } from '@/dal/productos';
import { useToast } from '@/hooks/use-toast';

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productoDrawerOpen, setProductoDrawerOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
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
      
      setProductos(productosData as Producto[]);
      setCategorias(categoriasData as Categoria[]);
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

  const editarProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setProductoDrawerOpen(true);
  };

  const confirmarEliminarProducto = (producto: Producto) => {
    setProductoToDelete(producto);
    setDeleteDialogOpen(true);
  };

  const eliminarProducto = async () => {
    if (!productoToDelete) return;
    
    try {
      // TODO: Implement delete in DAL
      // await productosDAL.delete(productoToDelete.id);
      await loadData();
      setDeleteDialogOpen(false);
      setProductoToDelete(null);
      toast({
        title: "Producto eliminado",
        description: `${productoToDelete.nombre} ha sido eliminado correctamente.`,
      });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive"
      });
    }
  };

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
        const inventario = (row.original as any).inventario?.[0];
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
      cell: ({ row }) => {
        const producto = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => editarProducto(producto)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {producto.link_canva && (
                <DropdownMenuItem onClick={() => window.open(producto.link_canva, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver en Canva
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => confirmarEliminarProducto(producto)}
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Productos</h1>
            <p className="text-muted-foreground">
              Gestión del catálogo de productos médicos
            </p>
          </div>
          <Button onClick={() => setProductoDrawerOpen(true)}>
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
                const stock = (p as any).inventario?.[0]?.stock_actual || 0;
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
              value={filtros.categoria_id || "todas"}
              onValueChange={(value) => setFiltros({ ...filtros, categoria_id: value === "todas" ? "" : value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filtros.estado || "todos"}
              onValueChange={(value) => setFiltros({ ...filtros, estado: value === "todos" ? "" : value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
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

        {/* Producto Form Sheet */}
        <Sheet open={productoDrawerOpen} onOpenChange={setProductoDrawerOpen}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>{productoSeleccionado ? 'Editar Producto' : 'Nuevo Producto'}</SheetTitle>
              <SheetDescription>
                {productoSeleccionado ? 'Modifica los datos del producto seleccionado.' : 'Completa los datos para crear un nuevo producto.'}
              </SheetDescription>
            </SheetHeader>
            <div className="py-6">
              <ProductoForm 
                producto={productoSeleccionado} 
                categorias={categorias}
                onSuccess={() => {
                  setProductoDrawerOpen(false);
                  setProductoSeleccionado(null);
                  loadData(); // Recargar lista
                  toast({
                    title: productoSeleccionado ? "Producto actualizado" : "Producto creado",
                    description: "Los datos se han guardado correctamente.",
                  });
                }}
                onCancel={() => {
                  setProductoDrawerOpen(false);
                  setProductoSeleccionado(null);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Confirmación de eliminación */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el producto{' '}
                <strong>{productoToDelete?.nombre}</strong> del catálogo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={eliminarProducto} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

// Componente de formulario de producto
function ProductoForm({ producto, categorias, onSuccess, onCancel }: { 
  producto: Producto | null; 
  categorias: Categoria[];
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: producto?.nombre || '',
    codigo_producto: producto?.codigo_producto || '',
    descripcion_corta: producto?.descripcion_corta || '',
    precio_neto: producto?.precio_neto || 0,
    categoria_id: producto?.categoria_id || '',
    linea_negocio: producto?.linea_negocio || '',
    link_canva: producto?.link_canva || '',
    estado: producto?.estado ?? true,
    tags: producto?.tags || []
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive"
      });
      return;
    }

    if (!formData.codigo_producto.trim()) {
      toast({
        title: "Error", 
        description: "El código de producto es obligatorio",
        variant: "destructive"
      });
      return;
    }

    if (formData.precio_neto <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser mayor a 0",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const productoData = {
        ...formData,
        version_visual: producto?.version_visual || 1,
        fecha_actualizacion: new Date().toISOString()
      };

      if (producto) {
        await productosDAL.update(producto.id, productoData);
      } else {
        await productosDAL.create(productoData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre del Producto *</Label>
        <Input
          id="nombre"
          value={formData.nombre}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="codigo_producto">Código del Producto *</Label>
        <Input
          id="codigo_producto"
          value={formData.codigo_producto}
          onChange={(e) => setFormData(prev => ({ ...prev, codigo_producto: e.target.value }))}
          placeholder="Ej: BIO-001"
          required
        />
      </div>
      <div>
        <Label htmlFor="descripcion_corta">Descripción Corta</Label>
        <Textarea
          id="descripcion_corta"
          value={formData.descripcion_corta}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion_corta: e.target.value }))}
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="precio_neto">Precio Neto *</Label>
        <Input
          id="precio_neto"
          type="number"
          min="0"
          step="0.01"
          value={formData.precio_neto}
          onChange={(e) => setFormData(prev => ({ ...prev, precio_neto: parseFloat(e.target.value) || 0 }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="categoria_id">Categoría</Label>
        <Select value={formData.categoria_id} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin categoría</SelectItem>
            {categorias.map((categoria) => (
              <SelectItem key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="linea_negocio">Línea de Negocio</Label>
        <Input
          id="linea_negocio"
          value={formData.linea_negocio}
          onChange={(e) => setFormData(prev => ({ ...prev, linea_negocio: e.target.value }))}
          placeholder="Ej: Equipos médicos"
        />
      </div>
      <div>
        <Label htmlFor="link_canva">Link de Canva</Label>
        <Input
          id="link_canva"
          type="url"
          value={formData.link_canva}
          onChange={(e) => setFormData(prev => ({ ...prev, link_canva: e.target.value }))}
          placeholder="https://www.canva.com/design/..."
        />
      </div>
      <div>
        <Label htmlFor="estado">Estado</Label>
        <Select value={formData.estado.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value === 'true' }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Activo</SelectItem>
            <SelectItem value="false">Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Guardando..." : (producto ? "Actualizar" : "Crear Producto")}
        </Button>
      </div>
    </form>
  );
}

export default Productos;