-- Seed database with corrected RUT format
-- =======================================

-- Insert clientes with properly formatted Chilean RUTs
INSERT INTO public.clientes (nombre, rut, direccion, tipo, tags, score, estado_relacional) VALUES 
  ('Hospital Salvador', '70.123.456-7', 'Av. Salvador 364, Providencia', 'Público', '["Hospital", "Público", "Alta prioridad"]'::jsonb, 85, 'Activo'),
  ('Clínica Las Condes', '96.789.123-4', 'Lo Fontecilla 441, Las Condes', 'Privado', '["Clínica", "Privado", "Premium"]'::jsonb, 92, 'Activo'),
  ('CESFAM Maipú', '70.987.654-3', 'Av. Pajaritos 1652, Maipú', 'Público', '["CESFAM", "Público", "Preventivo"]'::jsonb, 76, 'Activo'),
  ('Laboratorio Bionet', '76.543.210-9', 'Av. Vitacura 3568, Vitacura', 'Revendedor', '["Laboratorio", "Revendedor", "B2B"]'::jsonb, 88, 'Activo'),
  ('Hospital Militar', '61.234.567-8', 'Av. Luis Calvo Mackenna 1234, Providencia', 'Público', '["Hospital", "Militar", "Especializado"]'::jsonb, 79, 'Activo'),
  ('Clínica Santa María', '96.234.567-1', 'Av. Santa María 0500, Providencia', 'Privado', '["Clínica", "Privado", "Ginecología"]'::jsonb, 83, 'Activo'),
  ('Centro Médico San Carlos', '76.876.543-2', 'Av. San Carlos 3456, Maipú', 'Privado', '["Centro médico", "Privado", "Consultas"]'::jsonb, 71, 'Nuevo'),
  ('CESFAM San Joaquín', '70.456.789-1', 'Av. Vicuña Mackenna 7890, San Joaquín', 'Público', '["CESFAM", "Público", "Atención primaria"]'::jsonb, 68, 'Activo'),
  ('Clínica Alemana', '96.345.678-2', 'Av. Vitacura 5951, Vitacura', 'Privado', '["Clínica", "Privado", "Premium"]'::jsonb, 94, 'Activo'),
  ('Laboratorio Central', '76.987.123-4', 'Av. Providencia 2134, Providencia', 'Revendedor', '["Laboratorio", "Revendedor", "Análisis"]'::jsonb, 81, 'Activo')
ON CONFLICT (rut) DO NOTHING;

-- Insert contactos for clientes
DO $$
DECLARE
  cliente_rec RECORD;
BEGIN
  FOR cliente_rec IN SELECT id, nombre FROM public.clientes LOOP
    INSERT INTO public.contactos (cliente_id, nombre, cargo, email, telefono, principal) VALUES 
      (cliente_rec.id, 'Dr. Roberto Silva', 'Director Médico', 'rsilva@' || LOWER(REPLACE(cliente_rec.nombre, ' ', '')) || '.cl', '+56912345678', true)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- Generate sample cotizaciones with items
DO $$
DECLARE
  cliente_ids UUID[];
  producto_ids UUID[];
  cotizacion_id UUID;
  i INTEGER;
BEGIN
  -- Get sample client and product IDs
  SELECT ARRAY_AGG(id) INTO cliente_ids FROM public.clientes LIMIT 5;
  SELECT ARRAY_AGG(id) INTO producto_ids FROM public.productos LIMIT 10;
  
  -- Create sample cotizaciones
  FOR i IN 1..8 LOOP
    INSERT INTO public.cotizaciones (codigo, cliente_id, contacto_id, estado, score, fecha_expiracion, observaciones)
    SELECT 
      'COT-2024-' || LPAD(i::TEXT, 3, '0'),
      cliente_ids[((i-1) % array_length(cliente_ids, 1)) + 1],
      c.id,
      CASE (i % 6)
        WHEN 0 THEN 'Pendiente'
        WHEN 1 THEN 'Enviada'
        WHEN 2 THEN 'Aceptada'
        WHEN 3 THEN 'Rechazada'
        WHEN 4 THEN 'Vencida'
        ELSE 'Enviada'
      END,
      50 + (RANDOM() * 50)::INTEGER,
      CURRENT_DATE + INTERVAL '30 days',
      'Cotización generada automáticamente para pruebas'
    FROM public.contactos c 
    WHERE c.cliente_id = cliente_ids[((i-1) % array_length(cliente_ids, 1)) + 1]
    AND c.principal = true
    LIMIT 1
    RETURNING id INTO cotizacion_id;
    
    -- Add items to cotizacion
    INSERT INTO public.cotizacion_items (cotizacion_id, producto_id, cantidad, precio_unit, total_linea)
    SELECT 
      cotizacion_id,
      p.id,
      1 + (RANDOM() * 3)::INTEGER as cantidad,
      p.precio_neto,
      (1 + (RANDOM() * 3)::INTEGER) * p.precio_neto
    FROM public.productos p
    WHERE p.id = producto_ids[((i-1) % array_length(producto_ids, 1)) + 1];
  END LOOP;
END $$;

-- Generate sample tareas
DO $$
DECLARE
  cliente_ids UUID[];
  i INTEGER;
BEGIN
  SELECT ARRAY_AGG(id) INTO cliente_ids FROM public.clientes LIMIT 5;
  
  FOR i IN 1..12 LOOP
    INSERT INTO public.tareas (titulo, descripcion, cliente_id, origen, prioridad, estado, fecha_vencimiento, hora_estimada, tags)
    VALUES (
      'Tarea de ejemplo #' || i,
      'Descripción de la tarea número ' || i || ' generada automáticamente',
      cliente_ids[((i-1) % array_length(cliente_ids, 1)) + 1],
      CASE (i % 5)
        WHEN 0 THEN 'cotizacion'
        WHEN 1 THEN 'seguimiento'
        WHEN 2 THEN 'tecnico'
        WHEN 3 THEN 'cobranza'
        ELSE 'otro'
      END,
      CASE (i % 4)
        WHEN 0 THEN 'Baja'
        WHEN 1 THEN 'Media'
        WHEN 2 THEN 'Alta'
        ELSE 'Urgente'
      END,
      CASE (i % 4)
        WHEN 0 THEN 'Pendiente'
        WHEN 1 THEN 'En Proceso'
        WHEN 2 THEN 'Completada'
        ELSE 'Pendiente'
      END,
      CURRENT_DATE + (i % 14)::INTEGER,
      30 + (RANDOM() * 120)::INTEGER,
      '["Ejemplo", "Automático"]'::jsonb
    );
  END LOOP;
END $$;

-- Generate sample seguimientos
DO $$
DECLARE
  cliente_ids UUID[];
  cotizacion_ids UUID[];
  i INTEGER;
BEGIN
  SELECT ARRAY_AGG(id) INTO cliente_ids FROM public.clientes LIMIT 5;
  SELECT ARRAY_AGG(id) INTO cotizacion_ids FROM public.cotizaciones LIMIT 5;
  
  FOR i IN 1..6 LOOP
    INSERT INTO public.seguimientos (cliente_id, cotizacion_id, estado, prioridad, proxima_gestion, notas, origen)
    VALUES (
      cliente_ids[((i-1) % array_length(cliente_ids, 1)) + 1],
      CASE WHEN i <= array_length(cotizacion_ids, 1) THEN cotizacion_ids[i] ELSE NULL END,
      CASE (i % 5)
        WHEN 0 THEN 'Activo'
        WHEN 1 THEN 'En gestión'
        WHEN 2 THEN 'Pausado'
        WHEN 3 THEN 'Cerrado'
        ELSE 'Activo'
      END,
      CASE (i % 4)
        WHEN 0 THEN 'Baja'
        WHEN 1 THEN 'Media'
        WHEN 2 THEN 'Alta'
        ELSE 'Media'
      END,
      CURRENT_DATE + (i % 10 + 1)::INTEGER,
      'Notas de seguimiento número ' || i || ' - Cliente con interés en productos',
      CASE (i % 3)
        WHEN 0 THEN 'Cotizacion'
        WHEN 1 THEN 'Manual'
        ELSE 'Tarea'
      END
    );
  END LOOP;
END $$;

-- Generate sample facturas
DO $$
DECLARE
  cliente_ids UUID[];
  i INTEGER;
BEGIN
  SELECT ARRAY_AGG(id) INTO cliente_ids FROM public.clientes LIMIT 5;
  
  FOR i IN 1..8 LOOP
    INSERT INTO public.facturas (cliente_id, monto, fecha_emision, fecha_vencimiento, numero_factura, numero_ot_oc, estado)
    VALUES (
      cliente_ids[((i-1) % array_length(cliente_ids, 1)) + 1],
      500000 + (RANDOM() * 5000000)::INTEGER,
      CURRENT_DATE - (RANDOM() * 60)::INTEGER,
      CURRENT_DATE - (RANDOM() * 60)::INTEGER + 30,
      'F-2024-' || LPAD(i::TEXT, 4, '0'),
      CASE WHEN i % 3 = 0 THEN 'OC-2024-' || LPAD(i::TEXT, 3, '0') ELSE NULL END,
      CASE (i % 4)
        WHEN 0 THEN 'Pendiente'
        WHEN 1 THEN 'Pagada'
        WHEN 2 THEN 'Vencida'
        ELSE 'Pendiente'
      END
    );
  END LOOP;
END $$;

-- Generate sample tickets técnicos
DO $$
DECLARE
  cliente_ids UUID[];
  i INTEGER;
BEGIN
  SELECT ARRAY_AGG(id) INTO cliente_ids FROM public.clientes LIMIT 5;
  
  FOR i IN 1..6 LOOP
    INSERT INTO public.tickets_tecnicos (tipo, cliente_id, equipo, prioridad, origen, estado, descripcion, fecha_programada)
    VALUES (
      CASE (i % 2) WHEN 0 THEN 'Correctivo' ELSE 'Preventivo' END,
      cliente_ids[((i-1) % array_length(cliente_ids, 1)) + 1],
      'Equipo MSV-' || (1000 + i)::TEXT || ' S/N: ' || (10000 + i)::TEXT,
      CASE (i % 4)
        WHEN 0 THEN 'Baja'
        WHEN 1 THEN 'Media'
        WHEN 2 THEN 'Alta'
        ELSE 'Urgente'
      END,
      CASE (i % 4)
        WHEN 0 THEN 'Cliente'
        WHEN 1 THEN 'Preventivo'
        WHEN 2 THEN 'Garantía'
        ELSE 'Venta'
      END,
      CASE (i % 4)
        WHEN 0 THEN 'Pendiente'
        WHEN 1 THEN 'En Proceso'
        WHEN 2 THEN 'En Espera'
        ELSE 'Pendiente'
      END,
      'Descripción del ticket técnico #' || i || ' - Requiere revisión del equipo',
      CURRENT_DATE + (i % 7 + 1)::INTEGER
    );
  END LOOP;
END $$;