// Datos de ejemplo (seeds) para Bioscom CRM

import { 
  Usuario, Cliente, Producto, Cotizacion, Tarea, Seguimiento, 
  Factura, ServicioTecnico, Despacho, Inventario 
} from '@/types';
import { generateValidRut } from '@/lib/rut-validator';

// Usuarios seed
export const usuariosSeed: Usuario[] = [
  {
    id: '1',
    nombre: 'Admin Sistema',
    email: 'admin@bioscom.cl',
    rol: 'admin',
    activo: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    id: '2',
    nombre: 'Carlos Mendoza',
    email: 'cmendoza@bioscom.cl',
    rol: 'vendedor',
    activo: true,
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15')
  },
  {
    id: '3',
    nombre: 'María González',
    email: 'mgonzalez@bioscom.cl',
    rol: 'supervisor',
    activo: true,
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-01-20')
  },
  {
    id: '4',
    nombre: 'Juan Pérez',
    email: 'jperez@bioscom.cl',
    rol: 'tecnico',
    activo: true,
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-01')
  },
  {
    id: '5',
    nombre: 'Ana López',
    email: 'alopez@bioscom.cl',
    rol: 'cobranzas',
    activo: true,
    created_at: new Date('2024-02-10'),
    updated_at: new Date('2024-02-10')
  }
];

// Clientes seed
export const clientesSeed: Cliente[] = [
  {
    id: '1',
    nombre: 'Hospital Salvador',
    rut: '70.123.456-7',
    direccion: 'Av. Salvador 364, Providencia',
    tipo: 'Público',
    contactos: [
      {
        id: '1',
        nombre: 'Dr. Roberto Silva',
        cargo: 'Director Médico',
        email: 'rsilva@salvador.cl',
        telefono: '+56912345678',
        principal: true
      }
    ],
    vendedores: ['2'],
    tags: ['Hospital', 'Público', 'Alta prioridad'],
    last_interaction_at: new Date('2024-12-01'),
    score: 85,
    estado_relacional: 'Activo',
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-12-01')
  },
  {
    id: '2',
    nombre: 'Clínica Las Condes',
    rut: '96.789.123-4',
    direccion: 'Lo Fontecilla 441, Las Condes',
    tipo: 'Privado',
    contactos: [
      {
        id: '2',
        nombre: 'Ing. Patricia Morales',
        cargo: 'Jefe de Mantención',
        email: 'pmorales@clc.cl',
        telefono: '+56987654321',
        principal: true
      }
    ],
    vendedores: ['2', '3'],
    tags: ['Clínica', 'Privado', 'Premium'],
    last_interaction_at: new Date('2024-11-28'),
    score: 92,
    estado_relacional: 'Activo',
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-11-28')
  },
  {
    id: '3',
    nombre: 'CESFAM Maipú',
    rut: '70.987.654-3',
    direccion: 'Av. Pajaritos 1652, Maipú',
    tipo: 'Público',
    contactos: [
      {
        id: '3',
        nombre: 'Enf. Carmen Torres',
        cargo: 'Coordinadora',
        email: 'ctorres@cesfam.maipu.cl',
        telefono: '+56976543210',
        principal: true
      }
    ],
    vendedores: ['2'],
    tags: ['CESFAM', 'Público', 'Preventivo'],
    last_interaction_at: new Date('2024-11-25'),
    score: 76,
    estado_relacional: 'Activo',
    created_at: new Date('2024-03-01'),
    updated_at: new Date('2024-11-25')
  },
  {
    id: '4',
    nombre: 'Laboratorio Bionet',
    rut: '76.543.210-9',
    direccion: 'Av. Vitacura 3568, Vitacura',
    tipo: 'Revendedor',
    contactos: [
      {
        id: '4',
        nombre: 'Sr. Luis Ramírez',
        cargo: 'Gerente Comercial',
        email: 'lramirez@bionet.cl',
        telefono: '+56965432109',
        principal: true
      }
    ],
    vendedores: ['3'],
    tags: ['Laboratorio', 'Revendedor', 'B2B'],
    last_interaction_at: new Date('2024-11-30'),
    score: 88,
    estado_relacional: 'Activo',
    created_at: new Date('2024-04-01'),
    updated_at: new Date('2024-11-30')
  }
];

// Productos seed
export const productosSeed: Producto[] = [
  {
    id: '1',
    nombre: 'Monitor de Signos Vitales MSV-2000',
    codigo_producto: 'MSV-2000',
    descripcion_corta: 'Monitor multiparamétrico con pantalla táctil 15 pulgadas',
    precio_neto: 2500000,
    categoria: 'Monitoreo',
    linea_negocio: 'Equipos Médicos',
    estado: 'Activo',
    link_canva: 'https://canva.com/design/msv2000',
    tags: ['Monitor', 'Signos vitales', 'UCI'],
    productos_relacionados: ['2', '3'],
    version_visual: 1,
    actualizado_por: '1',
    fecha_actualizacion: new Date('2024-11-01'),
    created_at: new Date('2024-01-01')
  },
  {
    id: '2',
    nombre: 'Desfibrilador AED Plus',
    codigo_producto: 'AED-PLUS',
    descripcion_corta: 'Desfibrilador automático externo con análisis de RCP',
    precio_neto: 1800000,
    categoria: 'Emergencia',
    linea_negocio: 'Equipos Médicos',
    estado: 'Activo',
    tags: ['Desfibrilador', 'Emergencia', 'RCP'],
    productos_relacionados: ['1'],
    version_visual: 1,
    actualizado_por: '1',
    fecha_actualizacion: new Date('2024-10-15'),
    created_at: new Date('2024-01-01')
  },
  {
    id: '3',
    nombre: 'Ventilador Mecánico VM-300',
    codigo_producto: 'VM-300',
    descripcion_corta: 'Ventilador para cuidados intensivos con modos avanzados',
    precio_neto: 8500000,
    categoria: 'Respiratorio',
    linea_negocio: 'Equipos Médicos',
    estado: 'Activo',
    tags: ['Ventilador', 'UCI', 'Respiratorio'],
    productos_relacionados: ['1'],
    version_visual: 1,
    actualizado_por: '1',
    fecha_actualizacion: new Date('2024-11-10'),
    created_at: new Date('2024-01-01')
  },
  {
    id: '4',
    nombre: 'Electrocardiógrafo EC-12',
    codigo_producto: 'EC-12',
    descripcion_corta: 'Electrocardiógrafo de 12 derivaciones con interpretación',
    precio_neto: 650000,
    categoria: 'Diagnóstico',
    linea_negocio: 'Equipos Médicos',
    estado: 'Activo',
    tags: ['ECG', 'Cardiología', 'Diagnóstico'],
    productos_relacionados: ['1'],
    version_visual: 1,
    actualizado_por: '1',
    fecha_actualizacion: new Date('2024-10-20'),
    created_at: new Date('2024-01-01')
  }
];

// Cotizaciones seed
export const cotizacionesSeed: Cotizacion[] = [
  {
    id: '1',
    codigo: 'COT-2024-001',
    cliente_id: '1',
    contacto_id: '1',
    vendedor_id: '2',
    productos: [
      {
        producto_id: '1',
        cantidad: 2,
        precio_unit: 2500000,
        total_linea: 5000000
      },
      {
        producto_id: '4',
        cantidad: 1,
        precio_unit: 650000,
        total_linea: 650000
      }
    ],
    estado: 'Enviada',
    score: 75,
    fecha_expiracion: new Date('2024-12-31'),
    observaciones: 'Cotización para renovación de equipos UCI',
    track_event: [
      {
        fecha: new Date('2024-11-15'),
        evento: 'Creada',
        usuario: 'Carlos Mendoza'
      },
      {
        fecha: new Date('2024-11-16'),
        evento: 'Enviada',
        usuario: 'Carlos Mendoza'
      }
    ],
    tarea_id: '1',
    created_at: new Date('2024-11-15'),
    updated_at: new Date('2024-11-16')
  },
  {
    id: '2',
    codigo: 'COT-2024-002',
    cliente_id: '2',
    contacto_id: '2',
    vendedor_id: '2',
    productos: [
      {
        producto_id: '3',
        cantidad: 1,
        precio_unit: 8500000,
        total_linea: 8500000
      }
    ],
    estado: 'Aceptada',
    score: 95,
    fecha_expiracion: new Date('2024-12-20'),
    observaciones: 'Ventilador para nueva sala UCI',
    track_event: [
      {
        fecha: new Date('2024-11-01'),
        evento: 'Creada',
        usuario: 'Carlos Mendoza'
      },
      {
        fecha: new Date('2024-11-02'),
        evento: 'Enviada',
        usuario: 'Carlos Mendoza'
      },
      {
        fecha: new Date('2024-11-10'),
        evento: 'Aceptada',
        usuario: 'Sistema'
      }
    ],
    created_at: new Date('2024-11-01'),
    updated_at: new Date('2024-11-10')
  }
];

// Tareas seed
export const tareasSeed: Tarea[] = [
  {
    id: '1',
    titulo: 'Seguimiento cotización Hospital Salvador',
    descripcion: 'Realizar seguimiento de cotización COT-2024-001 para renovación UCI',
    cliente_id: '1',
    origen: 'cotizacion',
    origen_id: '1',
    usuario_asignado: '2',
    prioridad: 'Alta',
    estado: 'Pendiente',
    fecha_vencimiento: new Date('2024-12-10'),
    hora_estimada: 30,
    tags: ['Seguimiento', 'UCI', 'Urgente'],
    recurrente: false,
    historial_reasignacion: [],
    creado_por: 'Sistema',
    created_at: new Date('2024-11-16'),
    updated_at: new Date('2024-11-16')
  },
  {
    id: '2',
    titulo: 'Preparar despacho Clínica Las Condes',
    descripcion: 'Coordinar despacho del ventilador VM-300 según cotización aceptada',
    cliente_id: '2',
    origen: 'cotizacion',
    origen_id: '2',
    usuario_asignado: '5',
    prioridad: 'Alta',
    estado: 'En Proceso',
    fecha_vencimiento: new Date('2024-12-15'),
    hora_estimada: 60,
    tags: ['Despacho', 'Logística'],
    recurrente: false,
    historial_reasignacion: [],
    creado_por: 'Sistema',
    created_at: new Date('2024-11-10'),
    updated_at: new Date('2024-11-12')
  },
  {
    id: '3',
    titulo: 'Mantención preventiva CESFAM',
    descripcion: 'Realizar mantención preventiva trimestral de equipos',
    cliente_id: '3',
    origen: 'tecnico',
    usuario_asignado: '4',
    prioridad: 'Media',
    estado: 'Pendiente',
    fecha_vencimiento: new Date('2024-12-20'),
    hora_estimada: 120,
    tags: ['Mantención', 'Preventivo'],
    recurrente: true,
    regla_recurrencia: 'trimestral',
    intervalo_dias: 90,
    historial_reasignacion: [],
    creado_por: '3',
    created_at: new Date('2024-11-01'),
    updated_at: new Date('2024-11-01')
  }
];

// Seguimientos seed
export const seguimientosSeed: Seguimiento[] = [
  {
    id: '1',
    cliente_id: '1',
    cotizacion_id: '1',
    vendedor_id: '2',
    estado: 'Activo',
    prioridad: 'Alta',
    ultima_gestion: new Date('2024-11-16'),
    proxima_gestion: new Date('2024-12-05'),
    notas: 'Cliente interesado, espera aprobación presupuestaria',
    origen: 'Cotizacion',
    tarea_programada_id: '1',
    created_at: new Date('2024-11-16'),
    updated_at: new Date('2024-11-16')
  },
  {
    id: '2',
    cliente_id: '4',
    vendedor_id: '3',
    estado: 'En gestión',
    prioridad: 'Media',
    ultima_gestion: new Date('2024-11-25'),
    proxima_gestion: new Date('2024-12-08'),
    notas: 'Evalúan expansión de línea de productos para reventa',
    origen: 'Manual',
    created_at: new Date('2024-11-20'),
    updated_at: new Date('2024-11-25')
  }
];

// Facturas seed
export const facturasSeed: Factura[] = [
  {
    id: '1',
    cliente_id: '2',
    monto: 8500000,
    fecha_emision: new Date('2024-11-15'),
    fecha_vencimiento: new Date('2024-12-15'),
    numero_factura: 'F-2024-1001',
    numero_ot_oc: 'OC-2024-456',
    estado: 'Pendiente',
    created_at: new Date('2024-11-15'),
    updated_at: new Date('2024-11-15')
  },
  {
    id: '2',
    cliente_id: '1',
    monto: 1200000,
    fecha_emision: new Date('2024-10-01'),
    fecha_vencimiento: new Date('2024-11-01'),
    numero_factura: 'F-2024-0987',
    estado: 'Vencida',
    created_at: new Date('2024-10-01'),
    updated_at: new Date('2024-11-01')
  }
];

// Servicios técnicos seed
export const serviciosTecnicosSeed: ServicioTecnico[] = [
  {
    id: '1',
    tipo: 'Preventivo',
    cliente_id: '3',
    equipo: 'Monitor MSV-2000 S/N: 12345',
    prioridad: 'Media',
    origen: 'Preventivo',
    estado: 'Pendiente',
    descripcion: 'Mantención preventiva trimestral programada',
    tecnico_asignado: '4',
    fecha_programada: new Date('2024-12-20'),
    created_at: new Date('2024-11-01'),
    updated_at: new Date('2024-11-01')
  },
  {
    id: '2',
    tipo: 'Correctivo',
    cliente_id: '1',
    equipo: 'Desfibrilador AED Plus S/N: 67890',
    prioridad: 'Urgente',
    origen: 'Cliente',
    estado: 'En Proceso',
    descripcion: 'Falla en pantalla, no enciende',
    solucion: 'Reemplazo de módulo de alimentación en proceso',
    tecnico_asignado: '4',
    fecha_inicio: new Date('2024-12-02'),
    created_at: new Date('2024-12-01'),
    updated_at: new Date('2024-12-02')
  }
];

// Despachos seed
export const despachosSeed: Despacho[] = [
  {
    id: '1',
    cotizacion_id: '2',
    institucion: 'Clínica Las Condes',
    rut_institucion: '96.789.123-4',
    contacto: 'Patricia Morales',
    telefono: '+56987654321',
    email: 'pmorales@clc.cl',
    direccion: 'Lo Fontecilla 441, Las Condes',
    plazo_entrega: new Date('2024-12-15'),
    estado: 'Preparando',
    transportista: 'STARKEN',
    checklist: [
      { item: 'Verificar equipo completo', completado: true, responsable: 'Logística', fecha_completado: new Date('2024-12-01') },
      { item: 'Embalaje especializado', completado: true, responsable: 'Logística', fecha_completado: new Date('2024-12-01') },
      { item: 'Documentación técnica', completado: false },
      { item: 'Coordinar entrega con cliente', completado: false }
    ],
    created_at: new Date('2024-11-10'),
    updated_at: new Date('2024-12-01')
  }
];

// Inventario seed
export const inventarioSeed: Inventario[] = [
  {
    id: '1',
    producto_id: '1',
    stock_actual: 5,
    stock_minimo: 2,
    ubicacion: 'Bodega A - Estante 1',
    ultimo_movimiento: new Date('2024-11-15'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-11-15')
  },
  {
    id: '2',
    producto_id: '2',
    stock_actual: 3,
    stock_minimo: 1,
    ubicacion: 'Bodega A - Estante 2',
    ultimo_movimiento: new Date('2024-11-10'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-11-10')
  },
  {
    id: '3',
    producto_id: '3',
    stock_actual: 1,
    stock_minimo: 1,
    ubicacion: 'Bodega B - Área Especial',
    ultimo_movimiento: new Date('2024-11-10'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-11-10')
  },
  {
    id: '4',
    producto_id: '4',
    stock_actual: 8,
    stock_minimo: 3,
    ubicacion: 'Bodega A - Estante 3',
    ultimo_movimiento: new Date('2024-11-20'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-11-20')
  }
];

// Función para obtener todos los datos seed
export function getAllSeedData() {
  return {
    usuarios: usuariosSeed,
    clientes: clientesSeed,
    productos: productosSeed,
    cotizaciones: cotizacionesSeed,
    tareas: tareasSeed,
    seguimientos: seguimientosSeed,
    facturas: facturasSeed,
    serviciosTecnicos: serviciosTecnicosSeed,
    despachos: despachosSeed,
    inventario: inventarioSeed
  };
}