// Clientes DAL - Simplified
// =========================
import { supabase, handleDALError } from './supabase';

export interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  direccion?: string;
  tipo: 'Público' | 'Privado' | 'Revendedor';
  tags: any[];
  last_interaction_at?: string;
  score: number;
  estado_relacional: 'Nuevo' | 'Activo' | 'Inactivo' | 'Problemático';
  created_at: string;
  updated_at: string;
}

export interface Contacto {
  id: string;
  cliente_id: string;
  nombre: string;
  cargo?: string;
  email?: string;
  telefono?: string;
  principal: boolean;
  created_at: string;
}

export class ClientesDAL {
  async listWithContacts(filters?: Record<string, any>, pagination?: { page: number; limit: number }) {
    try {
      let query = supabase
        .from('clientes')
        .select(`
          *,
          contactos (*)
        `);

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            if (key === 'search') {
              query = query.or(`nombre.ilike.%${value}%,rut.ilike.%${value}%`);
            } else if (key === 'tipo') {
              query = query.eq('tipo', value);
            } else if (key === 'estado_relacional') {
              query = query.eq('estado_relacional', value);
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
        .from('clientes')
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
        .from('clientes')
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
        .from('clientes')
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

  async searchByRutOrName(query: string) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .or(`nombre.ilike.%${query}%,rut.ilike.%${query}%`)
        .limit(10);

      if (error) throw handleDALError(error);
      return data || [];
    } catch (error) {
      throw handleDALError(error);
    }
  }
}

export class ContactosDAL {
  async getByCliente(clienteId: string) {
    try {
      const { data, error } = await supabase
        .from('contactos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('principal', { ascending: false });

      if (error) throw handleDALError(error);
      return data || [];
    } catch (error) {
      throw handleDALError(error);
    }
  }
}

// Export instances
export const clientesDAL = new ClientesDAL();
export const contactosDAL = new ContactosDAL();