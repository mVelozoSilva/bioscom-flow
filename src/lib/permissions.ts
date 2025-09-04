// Sistema de permisos y roles

import { Permiso } from '@/types';

export const ROLES_PERMISOS: Record<string, Permiso[]> = {
  admin: [
    // Todos los permisos
    'clientes.ver', 'clientes.crear', 'clientes.editar', 'clientes.eliminar', 'clientes.vincular', 'clientes.etiquetar',
    'tareas.ver', 'tareas.crear', 'tareas.editar', 'tareas.eliminar', 'tareas.reasignar', 'tareas.redistribuir', 'tareas.recurrentes', 'tareas.panel',
    'productos.ver', 'productos.crear', 'productos.editar', 'productos.eliminar', 'productos.subir_media', 'productos.etiquetar', 'productos.relacionar', 'productos.ver_historial',
    'cotizaciones.ver', 'cotizaciones.crear', 'cotizaciones.editar', 'cotizaciones.eliminar', 'cotizaciones.ver_pdf', 'cotizaciones.enviar', 'cotizaciones.estado', 'cotizaciones.clonar', 'cotizaciones.derivar',
    'seguimientos.ver', 'seguimientos.crear', 'seguimientos.editar', 'seguimientos.eliminar', 'seguimientos.asignar', 'seguimientos.importar', 'seguimientos.ver_panel', 'seguimientos.reasignar_masivo',
    'facturas.ver', 'facturas.crear', 'facturas.editar', 'facturas.eliminar', 'facturas.importar',
    'cobranzas.ver', 'cobranzas.crear', 'cobranzas.editar', 'cobranzas.gestionar',
    'pagos.ver', 'pagos.crear', 'pagos.verificar',
    'tecnico.ver', 'tecnico.crear', 'tecnico.editar', 'tecnico.asignar', 'tecnico.finalizar',
    'inventario.ver', 'inventario.editar', 'inventario.movimientos',
    'despachos.ver', 'despachos.crear', 'despachos.editar', 'despachos.completar'
  ],
  
  vendedor: [
    'clientes.ver', 'clientes.crear', 'clientes.editar', 'clientes.vincular', 'clientes.etiquetar',
    'tareas.ver', 'tareas.crear', 'tareas.editar',
    'productos.ver',
    'cotizaciones.ver', 'cotizaciones.crear', 'cotizaciones.editar', 'cotizaciones.ver_pdf', 'cotizaciones.enviar', 'cotizaciones.estado', 'cotizaciones.clonar',
    'seguimientos.ver', 'seguimientos.crear', 'seguimientos.editar',
    'despachos.ver'
  ],
  
  supervisor: [
    'clientes.ver', 'clientes.crear', 'clientes.editar', 'clientes.vincular', 'clientes.etiquetar',
    'tareas.ver', 'tareas.crear', 'tareas.editar', 'tareas.reasignar', 'tareas.redistribuir', 'tareas.panel',
    'productos.ver',
    'cotizaciones.ver', 'cotizaciones.crear', 'cotizaciones.editar', 'cotizaciones.ver_pdf', 'cotizaciones.enviar', 'cotizaciones.estado', 'cotizaciones.clonar', 'cotizaciones.derivar',
    'seguimientos.ver', 'seguimientos.crear', 'seguimientos.editar', 'seguimientos.asignar', 'seguimientos.ver_panel', 'seguimientos.reasignar_masivo',
    'despachos.ver', 'despachos.crear', 'despachos.editar'
  ],
  
  tecnico: [
    'clientes.ver',
    'tareas.ver', 'tareas.editar',
    'productos.ver',
    'tecnico.ver', 'tecnico.crear', 'tecnico.editar', 'tecnico.finalizar',
    'inventario.ver'
  ],
  
  cobranzas: [
    'clientes.ver',
    'tareas.ver', 'tareas.crear', 'tareas.editar',
    'facturas.ver', 'facturas.crear', 'facturas.editar', 'facturas.importar',
    'cobranzas.ver', 'cobranzas.crear', 'cobranzas.editar', 'cobranzas.gestionar',
    'pagos.ver', 'pagos.crear', 'pagos.verificar'
  ],
  
  logistica: [
    'clientes.ver',
    'tareas.ver', 'tareas.crear', 'tareas.editar',
    'productos.ver',
    'inventario.ver', 'inventario.editar', 'inventario.movimientos',
    'despachos.ver', 'despachos.crear', 'despachos.editar', 'despachos.completar'
  ]
};

export function tienePermiso(rol: string, permiso: Permiso): boolean {
  return ROLES_PERMISOS[rol]?.includes(permiso) || false;
}

export function getPermisos(rol: string): Permiso[] {
  return ROLES_PERMISOS[rol] || [];
}