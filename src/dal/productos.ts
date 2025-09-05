// Productos DAL - Simplified
// ==========================
import { supabase, handleDALError } from './supabase';

export interface Producto {
  id: string;
  nombre: string;
  codigo_producto: string;
  descripcion_corta?: string;
  precio_neto: number;
  categoria_id?: string;
  linea_negocio?: string;
  estado: boolean;
  link_canva?: string;
  pdf_presentacion_url?: string;
  imagen_miniatura_url?: string;
  stock_referencial?: number;
  alerta_stock?: boolean;
  tags: any[];
  version_visual: number;
  actualizado_por?: string;
  fecha_actualizacion: string;
  created_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: string;
}

export interface InventarioItem {
  id: string;
  producto_id: string;
  stock_actual: number;
  stock_minimo: number;
  ubicacion?: string;
  ultimo_movimiento: string;
  created_at: string;
  updated_at: string;
}

export class ProductosDAL {
  async listWithCategoria(filters?: Record<string, any>, pagination?: { page: number; limit: number }) {
    try {
      let query = supabase
        .from('productos')
        .select(`
          *,
          categoria:categorias(nombre),
          inventario:inventario_items(stock_actual, stock_minimo, ubicacion)
        `);

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            if (key === 'search') {
              query = query.or(`nombre.ilike.%${value}%,codigo_producto.ilike.%${value}%,descripcion_corta.ilike.%${value}%`);
            } else if (key === 'categoria_id') {
              query = query.eq('categoria_id', value);
            } else if (key === 'estado') {
              query = query.eq('estado', value === 'true');
            } else if (key === 'linea_negocio') {
              query = query.eq('linea_negocio', value);
            }
          }
        }
      }

      query = query.order('created_at', { ascending: false });

      if (pagination) {
        const { page, limit } = pagination;
        query = query.range((page - 1) * limit, page * limit - 1);
      }

      const { data, error } = await query;
      if (error) throw handleDALError(error);
      
      return data || [];
    } catch (error) {
      throw handleDALError(error);
    }
  }

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw handleDALError(error);
      return data;
    } catch (error) {
      throw handleDALError(error);
    }
  }

  async create(data: any) {
    try {
      const { data: result, error } = await supabase
        .from('productos')
        .insert(data)
        .select()
        .single();

      if (error) throw handleDALError(error);
      return result;
    } catch (error) {
      throw handleDALError(error);
    }
  }

  async update(id: string, data: any) {
    try {
      const { data: result, error } = await supabase
        .from('productos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw handleDALError(error);
      return result;
    } catch (error) {
      throw handleDALError(error);
    }
  }
}

export class CategoriasDAL {
  async listWithProductCount() {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select(`
          *,
          productos(count)
        `)
        .order('nombre');

      if (error) throw handleDALError(error);
      return data || [];
    } catch (error) {
      throw handleDALError(error);
    }
  }
}

export class InventarioDAL {
  async getAlertas() {
    try {
      const { data, error } = await supabase
        .from('inventario_items')
        .select(`
          *,
          producto:productos(nombre, codigo_producto)
        `)
        .order('ultimo_movimiento', { ascending: false });

      if (error) throw handleDALError(error);
      
      // Filter locally for simplicity
      const alertas = (data || []).filter(item => 
        item.stock_actual <= item.stock_minimo
      );
      
      return alertas;
    } catch (error) {
      throw handleDALError(error);
    }
  }
}

// Export instances
export const productosDAL = new ProductosDAL();
export const categoriasDAL = new CategoriasDAL();
export const inventarioDAL = new InventarioDAL();