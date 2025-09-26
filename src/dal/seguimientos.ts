import { supabase, handleDALError, DALError } from './supabase';
import type { Database } from '@/integrations/supabase/types';

type Seguimiento = Database['public']['Tables']['seguimientos']['Row'];
type SeguimientoInsert = Database['public']['Tables']['seguimientos']['Insert'];
type SeguimientoUpdate = Database['public']['Tables']['seguimientos']['Update'];

export class SeguimientosDAL {
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('seguimientos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nombre,
            rut
          ),
          user_profiles:vendedor_id (
            id,
            nombre,
            email
          ),
          cotizaciones:cotizacion_id (
            id,
            codigo
          )
        `)
        .order('proxima_gestion', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleDALError(error);
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('seguimientos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nombre,
            rut
          ),
          user_profiles:vendedor_id (
            id,
            nombre,
            email
          ),
          cotizaciones:cotizacion_id (
            id,
            codigo
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleDALError(error);
    }
  }

  static async create(seguimiento: SeguimientoInsert) {
    try {
      const { data, error } = await supabase
        .from('seguimientos')
        .insert(seguimiento)
        .select(`
          *,
          clientes:cliente_id (
            id,
            nombre,
            rut
          ),
          user_profiles:vendedor_id (
            id,
            nombre,
            email
          ),
          cotizaciones:cotizacion_id (
            id,
            codigo
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleDALError(error);
    }
  }

  static async update(id: string, seguimiento: SeguimientoUpdate) {
    try {
      const { data, error } = await supabase
        .from('seguimientos')
        .update(seguimiento)
        .eq('id', id)
        .select(`
          *,
          clientes:cliente_id (
            id,
            nombre,
            rut
          ),
          user_profiles:vendedor_id (
            id,
            nombre,
            email
          ),
          cotizaciones:cotizacion_id (
            id,
            codigo
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleDALError(error);
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabase
        .from('seguimientos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleDALError(error);
    }
  }

  static async getByVendedor(vendedorId: string) {
    try {
      const { data, error } = await supabase
        .from('seguimientos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nombre,
            rut
          ),
          user_profiles:vendedor_id (
            id,
            nombre,
            email
          ),
          cotizaciones:cotizacion_id (
            id,
            codigo
          )
        `)
        .eq('vendedor_id', vendedorId)
        .order('proxima_gestion', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleDALError(error);
    }
  }

  static async getVencidos() {
    try {
      const { data, error } = await supabase
        .from('seguimientos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nombre,
            rut
          ),
          user_profiles:vendedor_id (
            id,
            nombre,
            email
          ),
          cotizaciones:cotizacion_id (
            id,
            codigo
          )
        `)
        .lt('proxima_gestion', new Date().toISOString().split('T')[0])
        .eq('estado', 'Activo')
        .order('proxima_gestion', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleDALError(error);
    }
  }

  static async getHoy() {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('seguimientos')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nombre,
            rut
          ),
          user_profiles:vendedor_id (
            id,
            nombre,
            email
          ),
          cotizaciones:cotizacion_id (
            id,
            codigo
          )
        `)
        .eq('proxima_gestion', hoy)
        .order('proxima_gestion', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleDALError(error);
    }
  }
}