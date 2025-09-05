// Cotizaciones DAL - Simplified
// =============================
import { supabase, handleDALError } from './supabase';

export interface Cotizacion {
  id: string;
  codigo: string;
  cliente_id: string;
  contacto_id?: string;
  vendedor_id?: string;
  estado: 'Pendiente' | 'Enviada' | 'Aceptada' | 'Rechazada' | 'Vencida' | 'Cancelada';
  score: number;
  fecha_expiracion?: string;
  observaciones?: string;
  motivo_rechazo?: string;
  pdf_url?: string;
  tarea_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CotizacionItem {
  id: string;
  cotizacion_id: string;
  producto_id?: string;
  cantidad: number;
  precio_unit: number;
  total_linea: number;
  created_at: string;
}

export class CotizacionesDAL {
  async listWithDetails(filters?: Record<string, any>, pagination?: { page: number; limit: number }) {
    try {
      let query = supabase
        .from('cotizaciones')
        .select(`
          *,
          cliente:clientes(nombre, rut, tipo),
          contacto:contactos(nombre, email, telefono),
          vendedor:user_profiles(nombre),
          items:cotizacion_items(
            *,
            producto:productos(nombre, codigo_producto)
          )
        `);

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            if (key === 'search') {
              query = query.or(`codigo.ilike.%${value}%,observaciones.ilike.%${value}%`);
            } else if (key === 'estado') {
              query = query.eq('estado', value);
            } else if (key === 'cliente_id') {
              query = query.eq('cliente_id', value);
            } else if (key === 'vendedor_id') {
              query = query.eq('vendedor_id', value);
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
        .from('cotizaciones')
        .select(`
          *,
          cliente:clientes(*),
          contacto:contactos(*),
          vendedor:user_profiles(nombre, email),
          items:cotizacion_items(
            *,
            producto:productos(*)
          )
        `)
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
        .from('cotizaciones')
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
        .from('cotizaciones')
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

  async generateNextCodigo() {
    try {
      const year = new Date().getFullYear();
      const { count, error } = await supabase
        .from('cotizaciones')
        .select('*', { count: 'exact', head: true })
        .like('codigo', `COT-${year}-%`);

      if (error) throw handleDALError(error);
      
      const nextNumber = (count || 0) + 1;
      return `COT-${year}-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      throw handleDALError(error);
    }
  }
}

// Export instances
export const cotizacionesDAL = new CotizacionesDAL();