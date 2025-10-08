/**
 * Utilidades para exportar datos a diferentes formatos
 */

export interface ExportColumn {
  key: string;
  header: string;
  format?: (value: any) => string;
}

/**
 * Exporta datos a formato CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string = 'export.csv'
) {
  if (data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Crear encabezados
  const headers = columns.map(col => col.header).join(',');
  
  // Crear filas
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      
      // Aplicar formato si existe
      if (col.format && value !== undefined && value !== null) {
        value = col.format(value);
      }
      
      // Manejar valores nulos/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Convertir a string y escapar
      const stringValue = String(value);
      
      // Escapar comillas dobles y envolver en comillas si contiene coma, nueva línea o comillas
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      
      return stringValue;
    }).join(',');
  });
  
  // Combinar encabezados y filas
  const csv = [headers, ...rows].join('\n');
  
  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Formatea una fecha para exportación
 */
export function formatDateForExport(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  return d.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Formatea un número para exportación
 */
export function formatNumberForExport(num: number | null | undefined, decimals: number = 0): string {
  if (num === null || num === undefined) return '';
  return num.toFixed(decimals);
}
