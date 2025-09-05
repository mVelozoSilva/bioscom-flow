-- ===============================================
-- BIOSCOM CRM/ERP - SISTEMA COMPLETO DE AUTENTICACIÓN Y MÓDULOS
-- ===============================================

-- 1. PROFILES Y AUTENTICACIÓN
-- ===========================================

-- Perfiles de usuario vinculados a auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users ON DELETE CASCADE,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  cargo text,
  departamento text DEFAULT 'general',
  activo boolean DEFAULT true,
  avatar_url text,
  configuracion_notificaciones jsonb DEFAULT '{"email": true, "push": true, "whatsapp": false}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Activar RLS en profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" 
  ON public.user_profiles FOR SELECT 
  USING (has_role('admin'));

CREATE POLICY "Admins can update all profiles" 
  ON public.user_profiles FOR UPDATE 
  USING (has_role('admin'));

-- Función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nombre, email)
  VALUES (NEW.id, 
          COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email), 
          NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. COBRANZAS - SISTEMA COMPLETO
-- ===========================================

-- Actualizar tabla facturas con campos necesarios
ALTER TABLE public.facturas 
ADD COLUMN IF NOT EXISTS rut_cliente text,
ADD COLUMN IF NOT EXISTS estado_documento text DEFAULT 'emitida',
ADD COLUMN IF NOT EXISTS observaciones text,
ADD COLUMN IF NOT EXISTS archivo_pdf_url text;

-- Crear tabla cobranzas
CREATE TABLE IF NOT EXISTS public.cobranzas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  factura_id uuid REFERENCES public.facturas(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE,
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'gestionando', 'pagada', 'incobrable')),
  ultima_gestion_at timestamp with time zone,
  proxima_gestion_at timestamp with time zone,
  asignado_a uuid REFERENCES auth.users(id),
  notas text,
  dias_vencido integer GENERATED ALWAYS AS (
    CASE 
      WHEN (SELECT fecha_vencimiento FROM public.facturas WHERE id = factura_id) < CURRENT_DATE 
      THEN CURRENT_DATE - (SELECT fecha_vencimiento FROM public.facturas WHERE id = factura_id)
      ELSE 0 
    END
  ) STORED,
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

-- Función para crear cobranza automáticamente al insertar factura
CREATE OR REPLACE FUNCTION public.crear_cobranza_automatica()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.cobranzas (factura_id, cliente_id, proxima_gestion_at)
  VALUES (NEW.id, NEW.cliente_id, NEW.fecha_vencimiento + INTERVAL '1 day');
  
  -- Crear tarea de cobranza
  INSERT INTO public.tareas (
    titulo, 
    descripcion, 
    origen, 
    origen_id, 
    cliente_id,
    fecha_vencimiento,
    estado
  ) VALUES (
    'Cobranza Factura ' || NEW.numero_factura,
    'Gestionar cobro de factura por $' || NEW.monto::text,
    'Cobranza',
    NEW.id,
    NEW.cliente_id,
    NEW.fecha_vencimiento + INTERVAL '1 day',
    'Pendiente'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear cobranza automática
DROP TRIGGER IF EXISTS trigger_crear_cobranza_automatica ON public.facturas;
CREATE TRIGGER trigger_crear_cobranza_automatica
  AFTER INSERT ON public.facturas
  FOR EACH ROW EXECUTE FUNCTION public.crear_cobranza_automatica();

-- 3. SERVICIO TÉCNICO - SISTEMA COMPLETO
-- ===========================================

-- Crear tabla servicios_tecnicos (reemplaza tickets_tecnicos)
DROP TABLE IF EXISTS public.servicios_tecnicos CASCADE;
CREATE TABLE public.servicios_tecnicos (
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

-- Crear secuencia para números de ticket
CREATE SEQUENCE IF NOT EXISTS public.ticket_sequence START 1;

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

-- Actualizar tabla informes_tecnicos
ALTER TABLE public.informes_tecnicos 
RENAME COLUMN ticket_id TO servicio_id;

ALTER TABLE public.informes_tecnicos 
ADD COLUMN IF NOT EXISTS tecnico_nombre text,
ADD COLUMN IF NOT EXISTS cliente_nombre text,
ADD COLUMN IF NOT EXISTS fecha_servicio date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS tiempo_total_horas decimal(4,2),
ADD COLUMN IF NOT EXISTS materiales_utilizados jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS estado_informe text DEFAULT 'borrador' CHECK (estado_informe IN ('borrador', 'finalizado', 'enviado'));

-- 4. LOGÍSTICA E INVENTARIO - SISTEMA COMPLETO
-- ===========================================

-- Crear tabla inventario (reemplaza inventario_items)
DROP TABLE IF EXISTS public.inventario CASCADE;
CREATE TABLE public.inventario (
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
ALTER TABLE public.despachos 
ADD COLUMN IF NOT EXISTS codigo_despacho text UNIQUE DEFAULT 'DESP-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('public.despacho_sequence')::text, 5, '0'),
ADD COLUMN IF NOT EXISTS tipo_despacho text DEFAULT 'normal' CHECK (tipo_despacho IN ('normal', 'urgente', 'programado')),
ADD COLUMN IF NOT EXISTS fecha_confirmacion timestamp with time zone,
ADD COLUMN IF NOT EXISTS responsable_entrega text,
ADD COLUMN IF NOT EXISTS telefono_responsable text,
ADD COLUMN IF NOT EXISTS hora_entrega time,
ADD COLUMN IF NOT EXISTS productos_despachados jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS archivos_adjuntos jsonb DEFAULT '[]';

-- Crear secuencia para números de despacho
CREATE SEQUENCE IF NOT EXISTS public.despacho_sequence START 1;

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

-- 5. NOTIFICACIONES INTERNAS
-- ===========================================

-- Actualizar tabla notificaciones
ALTER TABLE public.notificaciones 
ADD COLUMN IF NOT EXISTS categoria text DEFAULT 'general' CHECK (categoria IN ('cobranza', 'tecnico', 'logistica', 'ventas', 'sistema', 'general')),
ADD COLUMN IF NOT EXISTS prioridad text DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
ADD COLUMN IF NOT EXISTS origen_id uuid,
ADD COLUMN IF NOT EXISTS accion_url text,
ADD COLUMN IF NOT EXISTS archivada boolean DEFAULT false;

-- 6. TRIGGERS Y AUTOMATIZACIONES
-- ===========================================

-- Función para actualizar proxima_gestion en cobranzas al crear historial
CREATE OR REPLACE FUNCTION public.actualizar_proxima_gestion()
RETURNS trigger AS $$
BEGIN
  UPDATE public.cobranzas 
  SET ultima_gestion_at = NEW.created_at,
      proxima_gestion_at = NEW.proxima_accion_at,
      updated_at = now()
  WHERE id = NEW.cobranza_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar gestiones de cobranza
DROP TRIGGER IF EXISTS trigger_actualizar_proxima_gestion ON public.historial_gestiones;
CREATE TRIGGER trigger_actualizar_proxima_gestion
  AFTER INSERT ON public.historial_gestiones
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_proxima_gestion();

-- Función para crear tarea de despacho al aceptar cotización
CREATE OR REPLACE FUNCTION public.crear_tarea_despacho()
RETURNS trigger AS $$
BEGIN
  IF OLD.estado != 'Aceptada' AND NEW.estado = 'Aceptada' THEN
    INSERT INTO public.tareas (
      titulo, 
      descripcion, 
      origen, 
      origen_id, 
      cliente_id,
      fecha_vencimiento,
      estado,
      prioridad
    ) VALUES (
      'Despacho Cotización ' || NEW.codigo,
      'Preparar despacho para cotización aceptada',
      'Despacho',
      NEW.id,
      NEW.cliente_id,
      CURRENT_DATE + INTERVAL '2 days',
      'Pendiente',
      'Alta'
    );
    
    -- Crear notificación para logística
    INSERT INTO public.notificaciones (
      user_id,
      titulo,
      mensaje,
      categoria,
      origen_id
    )
    SELECT 
      up.id,
      'Nueva Cotización Aceptada',
      'Cotización ' || NEW.codigo || ' requiere preparación de despacho',
      'logistica',
      NEW.id
    FROM public.user_profiles up
    WHERE up.departamento = 'logistica' AND up.activo = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear tareas de despacho
DROP TRIGGER IF EXISTS trigger_crear_tarea_despacho ON public.cotizaciones;
CREATE TRIGGER trigger_crear_tarea_despacho
  AFTER UPDATE ON public.cotizaciones
  FOR EACH ROW EXECUTE FUNCTION public.crear_tarea_despacho();

-- Función para notificar stock bajo
CREATE OR REPLACE FUNCTION public.notificar_stock_bajo()
RETURNS trigger AS $$
BEGIN
  IF NEW.stock_actual <= NEW.stock_minimo AND NEW.stock_actual != OLD.stock_actual THEN
    INSERT INTO public.notificaciones (
      user_id,
      titulo,
      mensaje,
      categoria,
      prioridad,
      origen_id
    )
    SELECT 
      up.id,
      'Stock Bajo: ' || NEW.nombre_producto,
      'El producto ' || NEW.nombre_producto || ' tiene stock bajo (' || NEW.stock_actual || ' unidades)',
      'logistica',
      'alta',
      NEW.id
    FROM public.user_profiles up
    WHERE up.departamento = 'logistica' AND up.activo = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificar stock bajo
DROP TRIGGER IF EXISTS trigger_notificar_stock_bajo ON public.inventario;
CREATE TRIGGER trigger_notificar_stock_bajo
  AFTER UPDATE ON public.inventario
  FOR EACH ROW EXECUTE FUNCTION public.notificar_stock_bajo();

-- 7. TRIGGERS PARA UPDATED_AT
-- ===========================================

-- Aplicar trigger de updated_at a todas las tablas
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cobranzas_updated_at ON public.cobranzas;
CREATE TRIGGER update_cobranzas_updated_at
  BEFORE UPDATE ON public.cobranzas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_servicios_tecnicos_updated_at ON public.servicios_tecnicos;
CREATE TRIGGER update_servicios_tecnicos_updated_at
  BEFORE UPDATE ON public.servicios_tecnicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventario_updated_at ON public.inventario;
CREATE TRIGGER update_inventario_updated_at
  BEFORE UPDATE ON public.inventario
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orden_compra_pdf_updated_at ON public.orden_compra_pdf;
CREATE TRIGGER update_orden_compra_pdf_updated_at
  BEFORE UPDATE ON public.orden_compra_pdf
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();