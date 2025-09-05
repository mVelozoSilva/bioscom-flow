// Bioscom CRM/ERP - Tipos de datos principales

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor' | 'supervisor' | 'tecnico' | 'cobranzas' | 'logistica';
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Cliente {
  id: string;
  nombre: string;
  rut: string;
  direccion: string;
  tipo: 'Público' | 'Privado' | 'Revendedor';
  contactos: Contacto[];
  vendedores: string[]; // IDs de usuarios
  tags: string[];
  last_interaction_at?: Date;
  score: number; // 0-100
  estado_relacional: 'Nuevo' | 'Activo' | 'Inactivo' | 'Problemático';
  created_at: Date;
  updated_at: Date;
}

export interface Contacto {
  id: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono: string;
  principal: boolean;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  cliente_id?: string;
  origen: 'cotizacion' | 'cobranza' | 'seguimiento' | 'tecnico' | 'otro';
  origen_id?: string;
  usuario_asignado: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  estado: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
  fecha_vencimiento: Date;
  hora_estimada?: number; // en minutos
  bloque_inicio?: Date;
  bloque_fin?: Date;
  tags: string[];
  recurrente: boolean;
  regla_recurrencia?: string;
  intervalo_dias?: number;
  historial_reasignacion: ReasignacionHistorial[];
  creado_por: string;
  sugerida_por?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReasignacionHistorial {
  fecha: Date;
  de: string;
  para: string;
  motivo: string;
}

export interface Producto {
  id: string;
  nombre: string;
  codigo_producto: string;
  descripcion_corta: string;
  precio_neto: number;
  categoria: string;
  linea_negocio: string;
  estado: 'Activo' | 'Inactivo' | 'Descontinuado';
  link_canva?: string;
  pdf_presentacion?: string;
  imagen_miniatura?: string;
  stock_referencial?: number;
  alerta_stock?: number;
  tags: string[];
  productos_relacionados: string[];
  version_visual: number;
  actualizado_por: string;
  fecha_actualizacion: Date;
  created_at: Date;
}

export interface Cotizacion {
  id: string;
  codigo: string;
  cliente_id: string;
  contacto_id: string;
  vendedor_id: string;
  productos: LineaCotizacion[];
  estado: 'Pendiente' | 'Enviada' | 'Aceptada' | 'Rechazada' | 'Vencida' | 'Cancelada';
  score: number; // 0-100
  fecha_expiracion: Date;
  observaciones?: string;
  motivo_rechazo?: string;
  pdf_version?: string;
  track_event: TrackEvent[];
  tarea_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LineaCotizacion {
  producto_id: string;
  cantidad: number;
  precio_unit: number;
  total_linea: number;
}

export interface TrackEvent {
  fecha: Date;
  evento: string;
  usuario: string;
  detalles?: string;
}

export interface Seguimiento {
  id: string;
  cliente_id: string;
  cotizacion_id?: string;
  vendedor_id: string;
  estado: 'Activo' | 'En gestión' | 'Pausado' | 'Cerrado' | 'Vencido';
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Urgente';
  ultima_gestion?: Date;
  proxima_gestion: Date;
  notas: string;
  origen: 'Manual' | 'Cotizacion' | 'Tarea' | 'Otro';
  tarea_programada_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Factura {
  id: string;
  cliente_id: string;
  monto: number;
  fecha_emision: Date;
  fecha_vencimiento: Date;
  numero_factura: string;
  numero_ot_oc?: string;
  estado: 'Pendiente' | 'Pagada' | 'Vencida' | 'Parcial';
  created_at: Date;
  updated_at: Date;
}

export interface Cobranza {
  id: string;
  factura_id: string;
  estado: 'Sin gestión' | 'En gestión' | 'Comprometida' | 'Judicial';
  asignado_a: string;
  ultima_gestion?: Date;
  proxima_gestion?: Date;
  observaciones: string;
  created_at: Date;
  updated_at: Date;
}

export interface HistorialGestion {
  id: string;
  factura_id: string;
  cobranza_id: string;
  responsable: string;
  fecha: Date;
  tipo: 'llamada' | 'correo' | 'visita' | 'whatsapp';
  resultado: 'Contactado' | 'No contactado' | 'Compromiso' | 'Rechazo';
  comentario: string;
  proxima_accion?: Date;
  adjuntos: any[];
  user_id: string;
  proxima_accion_at?: string;
  created_at: Date;
}

export interface Pago {
  id: string;
  factura_id: string;
  monto: number;
  fecha_pago: Date;
  tipo: 'Transferencia' | 'Cheque' | 'Efectivo' | 'Tarjeta';
  referencia?: string;
  archivo_comprobante?: string;
  verificado: boolean;
  created_at: Date;
}

export interface ServicioTecnico {
  id: string;
  tipo: 'correctivo' | 'preventivo' | 'instalacion' | 'capacitacion';
  cliente_id: string;
  equipo: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  origen: 'whatsapp' | 'preventivo' | 'telefono' | 'email' | 'presencial';
  estado: 'pendiente' | 'asignado' | 'en_proceso' | 'completado' | 'cancelado';
  descripcion: string;
  solucion?: string;
  tecnico_asignado?: string;
  contacto_cliente?: string;
  telefono_contacto?: string;
  direccion_servicio?: string;
  observaciones_cliente?: string;
  costo_estimado?: number;
  costo_real?: number;
  fecha_programada?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InformeTecnico {
  id: string;
  servicio_id: string;
  observaciones: string;
  firma_cliente?: string;
  firma_tecnico?: string;
  materiales_utilizados: any[];
  tiempo_total_horas: number;
  diagnostico: string;
  acciones: string;
  estado_informe: 'borrador' | 'finalizado' | 'enviado';
  fecha_servicio: string;
  cliente_nombre: string;
  adjuntos: string[];
  qr_validacion: string;
  pdf_generado?: string;
  enviado_cliente: boolean;
  created_at: Date;
}

export interface InventarioItem {
  id: string;
  producto_id: string;
  codigo_producto: string;
  nombre_producto: string;
  stock_actual: number;
  stock_minimo: number;
  stock_disponible: number;
  stock_comprometido: number;
  costo_promedio: number;
  ubicacion: string;
  linea_negocio: string;
  proveedor: string;
  estado: 'activo' | 'descontinuado' | 'agotado';
  ultimo_movimiento: string;
  created_at: Date;
  updated_at: Date;
}

export interface Despacho {
  id: string;
  cotizacion_id: string;
  institucion: string;
  rut_institucion: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  plazo_entrega: Date;
  estado: 'Pendiente' | 'Preparando' | 'Despachado' | 'Entregado';
  transportista?: string;
  numero_orden?: string;
  numero_guia?: string;
  observaciones?: string;
  checklist: ChecklistItem[];
  created_at: Date;
  updated_at: Date;
}

export interface ChecklistItem {
  item: string;
  completado: boolean;
  responsable?: string;
  fecha_completado?: Date;
}

// Tipos para validación de RUT chileno
export interface RutValidation {
  valid: boolean;
  formatted: string;
  error?: string;
}

// Tipos para permisos
export type Permiso = 
  | 'clientes.ver' | 'clientes.crear' | 'clientes.editar' | 'clientes.eliminar' | 'clientes.vincular' | 'clientes.etiquetar'
  | 'tareas.ver' | 'tareas.crear' | 'tareas.editar' | 'tareas.eliminar' | 'tareas.reasignar' | 'tareas.redistribuir' | 'tareas.recurrentes' | 'tareas.panel'
  | 'productos.ver' | 'productos.crear' | 'productos.editar' | 'productos.eliminar' | 'productos.subir_media' | 'productos.etiquetar' | 'productos.relacionar' | 'productos.ver_historial'
  | 'cotizaciones.ver' | 'cotizaciones.crear' | 'cotizaciones.editar' | 'cotizaciones.eliminar' | 'cotizaciones.ver_pdf' | 'cotizaciones.enviar' | 'cotizaciones.estado' | 'cotizaciones.clonar' | 'cotizaciones.derivar'
  | 'seguimientos.ver' | 'seguimientos.crear' | 'seguimientos.editar' | 'seguimientos.eliminar' | 'seguimientos.asignar' | 'seguimientos.importar' | 'seguimientos.ver_panel' | 'seguimientos.reasignar_masivo'
  | 'facturas.ver' | 'facturas.crear' | 'facturas.editar' | 'facturas.eliminar' | 'facturas.importar'
  | 'cobranzas.ver' | 'cobranzas.crear' | 'cobranzas.editar' | 'cobranzas.gestionar'
  | 'pagos.ver' | 'pagos.crear' | 'pagos.verificar'
  | 'tecnico.ver' | 'tecnico.crear' | 'tecnico.editar' | 'tecnico.asignar' | 'tecnico.finalizar'
  | 'inventario.ver' | 'inventario.editar' | 'inventario.movimientos'
  | 'despachos.ver' | 'despachos.crear' | 'despachos.editar' | 'despachos.completar';

// Dashboard KPIs
export interface KPI {
  titulo: string;
  valor: string | number;
  cambio?: number; // porcentaje de cambio
  tipo: 'numero' | 'moneda' | 'porcentaje';
  color: 'success' | 'warning' | 'error' | 'info' | 'primary';
}

export interface DashboardData {
  miDia: {
    tareas: Tarea[];
    seguimientos: Seguimiento[];
    alertas: string[];
  };
  kpis: KPI[];
}