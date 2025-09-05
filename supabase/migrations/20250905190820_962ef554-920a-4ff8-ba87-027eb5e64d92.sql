-- ===============================================
-- TRIGGERS Y AUTOMATIZACIONES + CORRECCIÓN DE SEGURIDAD
-- ===============================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para actualizar gestiones de cobranza
DROP TRIGGER IF EXISTS trigger_actualizar_proxima_gestion ON public.historial_gestiones;
CREATE TRIGGER trigger_actualizar_proxima_gestion
  AFTER INSERT ON public.historial_gestiones
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_proxima_gestion();

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear cobranza automática
DROP TRIGGER IF EXISTS trigger_crear_cobranza_automatica ON public.facturas;
CREATE TRIGGER trigger_crear_cobranza_automatica
  AFTER INSERT ON public.facturas
  FOR EACH ROW EXECUTE FUNCTION public.crear_cobranza_automatica();

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para notificar stock bajo
DROP TRIGGER IF EXISTS trigger_notificar_stock_bajo ON public.inventario;
CREATE TRIGGER trigger_notificar_stock_bajo
  AFTER UPDATE ON public.inventario
  FOR EACH ROW EXECUTE FUNCTION public.notificar_stock_bajo();

-- Función para calcular días vencido en cobranzas
CREATE OR REPLACE FUNCTION public.calcular_dias_vencido()
RETURNS trigger AS $$
DECLARE
  fecha_vencimiento_factura date;
BEGIN
  -- Obtener fecha de vencimiento de la factura
  SELECT fecha_vencimiento INTO fecha_vencimiento_factura
  FROM public.facturas
  WHERE id = NEW.factura_id;
  
  -- Calcular días vencido
  IF fecha_vencimiento_factura < CURRENT_DATE THEN
    NEW.dias_vencido := CURRENT_DATE - fecha_vencimiento_factura;
  ELSE
    NEW.dias_vencido := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para calcular días vencido en cobranzas
DROP TRIGGER IF EXISTS trigger_calcular_dias_vencido ON public.cobranzas;
CREATE TRIGGER trigger_calcular_dias_vencido
  BEFORE INSERT OR UPDATE ON public.cobranzas
  FOR EACH ROW EXECUTE FUNCTION public.calcular_dias_vencido();

-- Triggers para updated_at
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