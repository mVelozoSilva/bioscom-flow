-- ===============================================
-- BIOSCOM CRM/ERP - MIGRACIÓN CORREGIDA SIN GENERATED COLUMNS
-- ===============================================

-- 1. PROFILES Y AUTENTICACIÓN (ya existía, actualizar)
-- ===========================================

-- Crear tabla cobranzas sin columna calculada problemática
CREATE TABLE IF NOT EXISTS public.cobranzas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES public.facturas(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'gestionando', 'pagada', 'incobrable')),
  ultima_gestion_at timestamp with time zone,
  proxima_gestion_at timestamp with time zone,
  asignado_a uuid REFERENCES auth.users(id),
  notas text,
  dias_vencido integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Activar RLS en cobranzas
ALTER TABLE public.cobranzas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cobranzas
CREATE POLICY "Cobranzas can manage cobranzas" 
  ON public.cobranzas FOR ALL 
  USING (has_role('cobranzas') OR has_role('admin'));

-- Crear tabla historial_gestiones
CREATE TABLE IF NOT EXISTS public.historial_gestiones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cobranza_id uuid REFERENCES public.cobranzas(id) ON DELETE CASCADE,
  factura_id uuid REFERENCES public.facturas(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  tipo text NOT NULL CHECK (tipo IN ('llamada', 'email', 'visita', 'whatsapp', 'carta')),
  resultado text NOT NULL CHECK (resultado IN ('contactado', 'sin_respuesta', 'promesa_pago', 'reclamo', 'pagado')),
  comentario text,
  proxima_accion_at timestamp with time zone,
  adjuntos jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Activar RLS en historial_gestiones
ALTER TABLE public.historial_gestiones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para historial_gestiones
CREATE POLICY "Cobranzas can manage historial_gestiones" 
  ON public.historial_gestiones FOR ALL 
  USING (has_role('cobranzas') OR has_role('admin'));

-- Actualizar tabla facturas con campos necesarios
ALTER TABLE public.facturas 
ADD COLUMN IF NOT EXISTS rut_cliente text,
ADD COLUMN IF NOT EXISTS estado_documento text DEFAULT 'emitida',
ADD COLUMN IF NOT EXISTS observaciones text,
ADD COLUMN IF NOT EXISTS archivo_pdf_url text;

-- Crear tabla servicios_tecnicos (reemplaza tickets_tecnicos)
CREATE SEQUENCE IF NOT EXISTS public.ticket_sequence START 1;

CREATE TABLE IF NOT EXISTS public.servicios_tecnicos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_ticket text NOT NULL UNIQUE DEFAULT 'ST-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('public.ticket_sequence')::text, 5, '0'),
  tipo text NOT NULL CHECK (tipo IN ('correctivo', 'preventivo', 'instalacion', 'capacitacion')),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  contacto_cliente text,
  telefono_contacto text,
  equipo text NOT NULL,
  marca text,
  modelo text,
  numero_serie text,
  prioridad text DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'asignado', 'en_proceso', 'completado', 'cancelado')),
  tecnico_id uuid REFERENCES auth.users(id),
  origen text NOT NULL CHECK (origen IN ('telefono', 'email', 'whatsapp', 'presencial', 'preventivo')),
  descripcion text NOT NULL,
  fecha_programada date,
  fecha_inicio timestamp with time zone,
  fecha_fin timestamp with time zone,
  solucion text,
  observaciones text,
  referencias_cotizacion uuid REFERENCES public.cotizaciones(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Activar RLS en servicios_tecnicos
ALTER TABLE public.servicios_tecnicos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para servicios_tecnicos
CREATE POLICY "Tecnicos can view assigned services" 
  ON public.servicios_tecnicos FOR SELECT 
  USING (tecnico_id = auth.uid() OR has_role('tecnico') OR has_role('admin'));

CREATE POLICY "Tecnicos can update assigned services" 
  ON public.servicios_tecnicos FOR UPDATE 
  USING (tecnico_id = auth.uid() OR has_role('admin'));

CREATE POLICY "Supervisors can manage all services" 
  ON public.servicios_tecnicos FOR ALL 
  USING (has_role('supervisor_tecnico') OR has_role('admin'));

-- Actualizar tabla informes_tecnicos si existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'informes_tecnicos') THEN
    -- Renombrar columna si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'informes_tecnicos' AND column_name = 'ticket_id') THEN
      ALTER TABLE public.informes_tecnicos RENAME COLUMN ticket_id TO servicio_id;
    END IF;
    
    -- Agregar nuevas columnas
    ALTER TABLE public.informes_tecnicos 
    ADD COLUMN IF NOT EXISTS tecnico_nombre text,
    ADD COLUMN IF NOT EXISTS cliente_nombre text,
    ADD COLUMN IF NOT EXISTS fecha_servicio date DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS tiempo_total_horas decimal(4,2),
    ADD COLUMN IF NOT EXISTS materiales_utilizados jsonb DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS estado_informe text DEFAULT 'borrador' CHECK (estado_informe IN ('borrador', 'finalizado', 'enviado'));
  END IF;
END $$;

-- Crear tabla inventario
CREATE TABLE IF NOT EXISTS public.inventario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  producto_id uuid REFERENCES public.productos(id) ON DELETE CASCADE,
  codigo_producto text NOT NULL,
  nombre_producto text NOT NULL,
  stock_actual integer DEFAULT 0,
  stock_minimo integer DEFAULT 0,
  stock_reservado integer DEFAULT 0,
  ubicacion text,
  proveedor text,
  estado text DEFAULT 'activo' CHECK (estado IN ('activo', 'descontinuado', 'agotado')),
  linea_negocio text,
  costo_promedio decimal(12,2),
  ultimo_ingreso timestamp with time zone,
  ultimo_movimiento timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(producto_id)
);

-- Activar RLS en inventario
ALTER TABLE public.inventario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para inventario
CREATE POLICY "Logistica can manage inventario" 
  ON public.inventario FOR ALL 
  USING (has_role('logistica') OR has_role('admin'));

-- Actualizar tabla despachos con campos necesarios
CREATE SEQUENCE IF NOT EXISTS public.despacho_sequence START 1;

ALTER TABLE public.despachos 
ADD COLUMN IF NOT EXISTS codigo_despacho text UNIQUE DEFAULT 'DESP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('public.despacho_sequence')::text, 5, '0'),
ADD COLUMN IF NOT EXISTS tipo_despacho text DEFAULT 'normal' CHECK (tipo_despacho IN ('normal', 'urgente', 'programado')),
ADD COLUMN IF NOT EXISTS fecha_confirmacion timestamp with time zone,
ADD COLUMN IF NOT EXISTS responsable_entrega text,
ADD COLUMN IF NOT EXISTS telefono_responsable text,
ADD COLUMN IF NOT EXISTS hora_entrega time,
ADD COLUMN IF NOT EXISTS productos_despachados jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS archivos_adjuntos jsonb DEFAULT '[]';

-- Crear tabla despacho_checklists
CREATE TABLE IF NOT EXISTS public.despacho_checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  despacho_id uuid REFERENCES public.despachos(id) ON DELETE CASCADE,
  item text NOT NULL,
  categoria text DEFAULT 'general' CHECK (categoria IN ('documentos', 'empaque', 'transporte', 'entrega')),
  cumplido boolean DEFAULT false,
  nota text,
  verificado_por uuid REFERENCES auth.users(id),
  verificado_at timestamp with time zone,
  obligatorio boolean DEFAULT true,
  orden_display integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Activar RLS en despacho_checklists
ALTER TABLE public.despacho_checklists ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para despacho_checklists
CREATE POLICY "Logistica can manage despacho_checklists" 
  ON public.despacho_checklists FOR ALL 
  USING (has_role('logistica') OR has_role('admin'));

-- Crear tabla orden_compra_pdf para OCR
CREATE TABLE IF NOT EXISTS public.orden_compra_pdf (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  cotizacion_id uuid REFERENCES public.cotizaciones(id),
  numero_oc text,
  archivo_pdf_url text NOT NULL,
  archivo_nombre text,
  extraido_json jsonb,
  estado_ocr text DEFAULT 'pendiente' CHECK (estado_ocr IN ('pendiente', 'procesando', 'completado', 'error')),
  fecha_oc date,
  monto_total decimal(12,2),
  observaciones text,
  procesado_por uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Activar RLS en orden_compra_pdf
ALTER TABLE public.orden_compra_pdf ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orden_compra_pdf
CREATE POLICY "Logistica can manage orden_compra_pdf" 
  ON public.orden_compra_pdf FOR ALL 
  USING (has_role('logistica') OR has_role('admin'));

-- Actualizar tabla notificaciones
ALTER TABLE public.notificaciones 
ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'general' CHECK (categoria IN ('cobranza', 'tecnico', 'logistica', 'ventas', 'sistema', 'general')),
ADD COLUMN IF NOT EXISTS prioridad text DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
ADD COLUMN IF NOT EXISTS origen_id uuid,
ADD COLUMN IF NOT EXISTS accion_url text,
ADD COLUMN IF NOT EXISTS archivada boolean DEFAULT false;