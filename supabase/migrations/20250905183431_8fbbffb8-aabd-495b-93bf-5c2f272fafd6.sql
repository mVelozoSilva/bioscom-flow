-- Bioscom CRM/ERP - Initial Schema Migration
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table (linked to auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles junction table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Create clientes table
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  rut TEXT UNIQUE NOT NULL,
  direccion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('Público', 'Privado', 'Revendedor')),
  tags JSONB DEFAULT '[]'::jsonb,
  last_interaction_at TIMESTAMPTZ,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  estado_relacional TEXT DEFAULT 'Nuevo' CHECK (estado_relacional IN ('Nuevo', 'Activo', 'Inactivo', 'Problemático')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contactos table
CREATE TABLE public.contactos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cargo TEXT,
  email TEXT,
  telefono TEXT,
  principal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categorias table
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create productos table
CREATE TABLE public.productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  codigo_producto TEXT UNIQUE NOT NULL,
  descripcion_corta TEXT,
  precio_neto NUMERIC(12,2) NOT NULL,
  categoria_id UUID REFERENCES public.categorias(id),
  linea_negocio TEXT,
  estado BOOLEAN DEFAULT TRUE,
  link_canva TEXT,
  pdf_presentacion_url TEXT,
  imagen_miniatura_url TEXT,
  stock_referencial INTEGER DEFAULT 0,
  alerta_stock BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]'::jsonb,
  version_visual INTEGER DEFAULT 1,
  actualizado_por UUID REFERENCES public.user_profiles(id),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create producto_relacion table (self-referencing many-to-many)
CREATE TABLE public.producto_relacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
  relacionado_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
  tipo_relacion TEXT DEFAULT 'compatible',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(producto_id, relacionado_id)
);

-- Create cotizaciones table
CREATE TABLE public.cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE RESTRICT,
  contacto_id UUID REFERENCES public.contactos(id),
  vendedor_id UUID REFERENCES public.user_profiles(id),
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Enviada', 'Aceptada', 'Rechazada', 'Vencida', 'Cancelada')),
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  fecha_expiracion DATE,
  observaciones TEXT,
  motivo_rechazo TEXT,
  pdf_url TEXT,
  tarea_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cotizacion_items table
CREATE TABLE public.cotizacion_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotizacion_id UUID REFERENCES public.cotizaciones(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES public.productos(id),
  cantidad INTEGER NOT NULL CHECK (cantidad > 0),
  precio_unit NUMERIC(12,2) NOT NULL,
  total_linea NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tareas table
CREATE TABLE public.tareas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  cliente_id UUID REFERENCES public.clientes(id),
  origen TEXT NOT NULL CHECK (origen IN ('cotizacion', 'cobranza', 'seguimiento', 'tecnico', 'otro')),
  origen_id UUID,
  usuario_asignado UUID REFERENCES public.user_profiles(id),
  prioridad TEXT DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Completada', 'Cancelada')),
  fecha_vencimiento DATE,
  hora_estimada INTEGER, -- en minutos
  bloque_inicio TIME,
  bloque_fin TIME,
  tags JSONB DEFAULT '[]'::jsonb,
  recurrente BOOLEAN DEFAULT FALSE,
  regla_recurrencia TEXT,
  intervalo_dias INTEGER,
  creado_por UUID REFERENCES public.user_profiles(id),
  sugerida_por UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create seguimientos table
CREATE TABLE public.seguimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  cotizacion_id UUID REFERENCES public.cotizaciones(id),
  vendedor_id UUID REFERENCES public.user_profiles(id),
  estado TEXT DEFAULT 'Activo' CHECK (estado IN ('Activo', 'En gestión', 'Pausado', 'Cerrado', 'Vencido')),
  prioridad TEXT DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
  ultima_gestion DATE,
  proxima_gestion DATE,
  notas TEXT,
  origen TEXT DEFAULT 'Manual' CHECK (origen IN ('Manual', 'Cotizacion', 'Tarea', 'Otro')),
  tarea_programada_id UUID REFERENCES public.tareas(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create facturas table
CREATE TABLE public.facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID REFERENCES public.clientes(id),
  monto NUMERIC(12,2) NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  numero_factura TEXT UNIQUE NOT NULL,
  numero_ot_oc TEXT,
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagada', 'Vencida', 'Parcial')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pagos table
CREATE TABLE public.pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factura_id UUID REFERENCES public.facturas(id) ON DELETE CASCADE,
  monto NUMERIC(12,2) NOT NULL,
  fecha_pago DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Transferencia', 'Cheque', 'Efectivo', 'Tarjeta')),
  referencia TEXT,
  archivo_url TEXT,
  verificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create gestiones_cobranza table
CREATE TABLE public.gestiones_cobranza (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factura_id UUID REFERENCES public.facturas(id) ON DELETE CASCADE,
  responsable UUID REFERENCES public.user_profiles(id),
  fecha DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('llamada', 'correo', 'visita', 'whatsapp')),
  resultado TEXT NOT NULL CHECK (resultado IN ('Contactado', 'No contactado', 'Compromiso', 'Rechazo')),
  comentario TEXT,
  proxima_accion DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tickets_tecnicos table
CREATE TABLE public.tickets_tecnicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo TEXT NOT NULL CHECK (tipo IN ('Correctivo', 'Preventivo')),
  cliente_id UUID REFERENCES public.clientes(id),
  equipo TEXT NOT NULL,
  prioridad TEXT DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
  origen TEXT NOT NULL CHECK (origen IN ('Cliente', 'Preventivo', 'Garantía', 'Venta')),
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'En Espera', 'Finalizado')),
  descripcion TEXT NOT NULL,
  solucion TEXT,
  tecnico_asignado UUID REFERENCES public.user_profiles(id),
  fecha_programada DATE,
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create informes_tecnicos table
CREATE TABLE public.informes_tecnicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.tickets_tecnicos(id) ON DELETE CASCADE,
  numero TEXT UNIQUE NOT NULL,
  diagnostico TEXT,
  acciones TEXT,
  recomendaciones TEXT,
  observaciones TEXT,
  firma_tecnico TEXT,
  pdf_url TEXT,
  qr_code TEXT,
  enviado_cliente BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create adjuntos_tecnicos table
CREATE TABLE public.adjuntos_tecnicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  informe_id UUID REFERENCES public.informes_tecnicos(id) ON DELETE CASCADE,
  archivo_url TEXT NOT NULL,
  nombre_archivo TEXT,
  tipo_archivo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventario_items table
CREATE TABLE public.inventario_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  ubicacion TEXT,
  ultimo_movimiento TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(producto_id)
);

-- Create despachos table
CREATE TABLE public.despachos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotizacion_id UUID REFERENCES public.cotizaciones(id),
  cliente_id UUID REFERENCES public.clientes(id),
  vendedor_id UUID REFERENCES public.user_profiles(id),
  institucion TEXT NOT NULL,
  rut_institucion TEXT,
  contacto TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  direccion TEXT NOT NULL,
  plazo_entrega DATE,
  estado TEXT DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Preparando', 'Despachado', 'Entregado')),
  transportista TEXT,
  numero_orden TEXT,
  numero_guia TEXT,
  observaciones TEXT,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notificaciones table
CREATE TABLE public.notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  leida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_log table
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id),
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_clientes_rut ON public.clientes(rut);
CREATE INDEX idx_clientes_tipo ON public.clientes(tipo);
CREATE INDEX idx_clientes_estado ON public.clientes(estado_relacional);
CREATE INDEX idx_productos_codigo ON public.productos(codigo_producto);
CREATE INDEX idx_productos_categoria ON public.productos(categoria_id);
CREATE INDEX idx_cotizaciones_codigo ON public.cotizaciones(codigo);
CREATE INDEX idx_cotizaciones_estado ON public.cotizaciones(estado);
CREATE INDEX idx_cotizaciones_vendedor ON public.cotizaciones(vendedor_id);
CREATE INDEX idx_tareas_estado ON public.tareas(estado);
CREATE INDEX idx_tareas_vencimiento ON public.tareas(fecha_vencimiento);
CREATE INDEX idx_tareas_asignado ON public.tareas(usuario_asignado);
CREATE INDEX idx_facturas_estado ON public.facturas(estado);
CREATE INDEX idx_facturas_vencimiento ON public.facturas(fecha_vencimiento);
CREATE INDEX idx_seguimientos_proxima ON public.seguimientos(proxima_gestion);
CREATE INDEX idx_tickets_estado ON public.tickets_tecnicos(estado);

-- Create utility functions
CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur 
    JOIN public.roles r ON r.id = ur.role_id 
    WHERE ur.user_id = auth.uid() 
    AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RUT normalization and validation functions
CREATE OR REPLACE FUNCTION public.fn_normaliza_rut(rut_input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove dots, hyphens, and spaces, convert to uppercase
  RETURN UPPER(REGEXP_REPLACE(rut_input, '[^0-9kK]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.fn_valida_rut(rut_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  clean_rut TEXT;
  rut_body TEXT;
  dv_char TEXT;
  calculated_dv TEXT;
  sum_value INTEGER;
  multiplier INTEGER;
  i INTEGER;
BEGIN
  -- Normalize RUT
  clean_rut := public.fn_normaliza_rut(rut_input);
  
  -- Check minimum length
  IF LENGTH(clean_rut) < 2 THEN
    RETURN FALSE;
  END IF;
  
  -- Split RUT body and check digit
  rut_body := SUBSTRING(clean_rut FROM 1 FOR LENGTH(clean_rut) - 1);
  dv_char := SUBSTRING(clean_rut FROM LENGTH(clean_rut));
  
  -- Validate that body contains only numbers
  IF rut_body !~ '^[0-9]+$' THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate check digit
  sum_value := 0;
  multiplier := 2;
  
  FOR i IN REVERSE LENGTH(rut_body)..1 LOOP
    sum_value := sum_value + (SUBSTRING(rut_body FROM i FOR 1)::INTEGER * multiplier);
    multiplier := multiplier + 1;
    IF multiplier > 7 THEN
      multiplier := 2;
    END IF;
  END LOOP;
  
  -- Calculate final check digit
  calculated_dv := CASE (11 - (sum_value % 11))
    WHEN 11 THEN '0'
    WHEN 10 THEN 'K'
    ELSE (11 - (sum_value % 11))::TEXT
  END;
  
  RETURN calculated_dv = dv_char;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add trigger for RUT validation on clientes
CREATE OR REPLACE FUNCTION public.validate_and_normalize_rut()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize RUT
  NEW.rut := public.fn_normaliza_rut(NEW.rut);
  
  -- Validate RUT
  IF NOT public.fn_valida_rut(NEW.rut) THEN
    RAISE EXCEPTION 'RUT inválido: %', NEW.rut;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_rut
  BEFORE INSERT OR UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_and_normalize_rut();

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON public.cotizaciones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON public.tareas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seguimientos_updated_at BEFORE UPDATE ON public.seguimientos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_facturas_updated_at BEFORE UPDATE ON public.facturas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets_tecnicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventario_updated_at BEFORE UPDATE ON public.inventario_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_despachos_updated_at BEFORE UPDATE ON public.despachos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_relacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizacion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestiones_cobranza ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets_tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.informes_tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adjuntos_tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despachos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for basic read access
CREATE POLICY "Allow authenticated users to read roles" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read user profiles" ON public.user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow users to read their own user roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Admin policies (full access)
CREATE POLICY "Admins have full access to all tables" ON public.clientes FOR ALL TO authenticated USING (public.has_role('admin'));
CREATE POLICY "Admins have full access to contactos" ON public.contactos FOR ALL TO authenticated USING (public.has_role('admin'));
CREATE POLICY "Admins have full access to productos" ON public.productos FOR ALL TO authenticated USING (public.has_role('admin'));
CREATE POLICY "Admins have full access to cotizaciones" ON public.cotizaciones FOR ALL TO authenticated USING (public.has_role('admin'));
CREATE POLICY "Admins have full access to tareas" ON public.tareas FOR ALL TO authenticated USING (public.has_role('admin'));

-- Vendedor policies
CREATE POLICY "Vendedores can manage clientes" ON public.clientes FOR ALL TO authenticated USING (public.has_role('vendedor') OR public.has_role('admin'));
CREATE POLICY "Vendedores can manage cotizaciones" ON public.cotizaciones FOR ALL TO authenticated USING (public.has_role('vendedor') OR public.has_role('admin'));
CREATE POLICY "Vendedores can manage seguimientos" ON public.seguimientos FOR ALL TO authenticated USING (public.has_role('vendedor') OR public.has_role('admin'));

-- Productos read access for authenticated users
CREATE POLICY "Authenticated users can read productos" ON public.productos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read categorias" ON public.categorias FOR SELECT TO authenticated USING (true);

-- Tareas policies by role
CREATE POLICY "Users can read their assigned tareas" ON public.tareas FOR SELECT TO authenticated USING (usuario_asignado = auth.uid() OR public.has_role('admin') OR public.has_role('supervisor'));
CREATE POLICY "Users can update their assigned tareas" ON public.tareas FOR UPDATE TO authenticated USING (usuario_asignado = auth.uid() OR public.has_role('admin'));

-- Cobranzas role policies
CREATE POLICY "Cobranzas can manage facturas" ON public.facturas FOR ALL TO authenticated USING (public.has_role('cobranzas') OR public.has_role('admin'));
CREATE POLICY "Cobranzas can manage pagos" ON public.pagos FOR ALL TO authenticated USING (public.has_role('cobranzas') OR public.has_role('admin'));
CREATE POLICY "Cobranzas can manage gestiones" ON public.gestiones_cobranza FOR ALL TO authenticated USING (public.has_role('cobranzas') OR public.has_role('admin'));

-- Tecnico role policies
CREATE POLICY "Tecnicos can manage tickets" ON public.tickets_tecnicos FOR ALL TO authenticated USING (public.has_role('tecnico') OR public.has_role('admin'));
CREATE POLICY "Tecnicos can manage informes" ON public.informes_tecnicos FOR ALL TO authenticated USING (public.has_role('tecnico') OR public.has_role('admin'));

-- Logistica role policies
CREATE POLICY "Logistica can manage inventario" ON public.inventario_items FOR ALL TO authenticated USING (public.has_role('logistica') OR public.has_role('admin'));
CREATE POLICY "Logistica can manage despachos" ON public.despachos FOR ALL TO authenticated USING (public.has_role('logistica') OR public.has_role('admin'));

-- Notificaciones - users can only see their own
CREATE POLICY "Users can read their own notifications" ON public.notificaciones FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notificaciones FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('adjuntos', 'adjuntos', false);

-- Storage policies for pdfs bucket (public read)
CREATE POLICY "Public read access for PDFs" ON storage.objects FOR SELECT USING (bucket_id = 'pdfs');
CREATE POLICY "Authenticated users can upload PDFs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pdfs');

-- Storage policies for adjuntos bucket (role-based)
CREATE POLICY "Role-based access for adjuntos" ON storage.objects FOR ALL TO authenticated USING (
  bucket_id = 'adjuntos' AND (
    public.has_role('admin') OR 
    public.has_role('tecnico') OR 
    public.has_role('cobranzas')
  )
);