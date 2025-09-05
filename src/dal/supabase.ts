// Supabase DAL Base Configuration - Simplified
// ============================================
import { supabase } from '@/integrations/supabase/client';

// Error handling
export class DALError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DALError';
  }
}

// Utility functions
export const handleDALError = (error: any): DALError => {
  if (error.code === 'PGRST116') {
    return new DALError('No se encontraron resultados', error);
  }
  if (error.code === '23505') {
    return new DALError('Ya existe un registro con estos datos', error);
  }
  if (error.code === '23503') {
    return new DALError('No se puede eliminar: existen registros relacionados', error);
  }
  return new DALError(error.message || 'Error en la base de datos', error);
};

export { supabase };