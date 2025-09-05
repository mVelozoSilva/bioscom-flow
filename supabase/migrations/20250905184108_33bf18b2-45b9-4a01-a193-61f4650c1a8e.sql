-- Fix the last function search path warning and seed the database
-- ==============================================================

-- Fix the has_role function search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Seed data for Bioscom CRM/ERP
-- ================================

-- Insert roles (idempotent)
INSERT INTO public.roles (name, description) VALUES 
  ('admin', 'Administrador del sistema'),
  ('vendedor', 'Vendedor'),
  ('supervisor', 'Supervisor de ventas'),
  ('tecnico', 'Técnico de servicio'),
  ('cobranzas', 'Área de cobranzas'),
  ('logistica', 'Área de logística')
ON CONFLICT (name) DO NOTHING;

-- Insert categorias
INSERT INTO public.categorias (nombre, descripcion) VALUES 
  ('Monitoreo', 'Equipos de monitoreo de signos vitales'),
  ('Emergencia', 'Equipos de emergencia y reanimación'),
  ('Respiratorio', 'Equipos de soporte respiratorio'),
  ('Diagnóstico', 'Equipos de diagnóstico médico'),
  ('Laboratorio', 'Equipos de laboratorio clínico')
ON CONFLICT (nombre) DO NOTHING;

-- Get category IDs for products
DO $$
DECLARE
  cat_monitoreo UUID;
  cat_emergencia UUID;
  cat_respiratorio UUID;
  cat_diagnostico UUID;
  cat_laboratorio UUID;
BEGIN
  SELECT id INTO cat_monitoreo FROM public.categorias WHERE nombre = 'Monitoreo';
  SELECT id INTO cat_emergencia FROM public.categorias WHERE nombre = 'Emergencia';
  SELECT id INTO cat_respiratorio FROM public.categorias WHERE nombre = 'Respiratorio';
  SELECT id INTO cat_diagnostico FROM public.categorias WHERE nombre = 'Diagnóstico';
  SELECT id INTO cat_laboratorio FROM public.categorias WHERE nombre = 'Laboratorio';

  -- Insert productos
  INSERT INTO public.productos (nombre, codigo_producto, descripcion_corta, precio_neto, categoria_id, linea_negocio, estado, link_canva, tags) VALUES 
    ('Monitor de Signos Vitales MSV-2000', 'MSV-2000', 'Monitor multiparamétrico con pantalla táctil 15 pulgadas', 2500000, cat_monitoreo, 'Equipos Médicos', true, 'https://canva.com/design/msv2000', '["Monitor", "Signos vitales", "UCI"]'::jsonb),
    ('Desfibrilador AED Plus', 'AED-PLUS', 'Desfibrilador automático externo con análisis de RCP', 1800000, cat_emergencia, 'Equipos Médicos', true, null, '["Desfibrilador", "Emergencia", "RCP"]'::jsonb),
    ('Ventilador Mecánico VM-300', 'VM-300', 'Ventilador para cuidados intensivos con modos avanzados', 8500000, cat_respiratorio, 'Equipos Médicos', true, null, '["Ventilador", "UCI", "Respiratorio"]'::jsonb),
    ('Electrocardiógrafo EC-12', 'EC-12', 'Electrocardiógrafo de 12 derivaciones con interpretación', 650000, cat_diagnostico, 'Equipos Médicos', true, null, '["ECG", "Cardiología", "Diagnóstico"]'::jsonb),
    ('Oxímetro de Pulso OX-100', 'OX-100', 'Oxímetro de pulso portátil con pantalla OLED', 45000, cat_monitoreo, 'Equipos Médicos', true, null, '["Oxímetro", "Saturación", "Portátil"]'::jsonb),
    ('Bomba de Infusión BI-500', 'BI-500', 'Bomba de infusión volumétrica de alta precisión', 1200000, cat_monitoreo, 'Equipos Médicos', true, null, '["Bomba", "Infusión", "UCI"]'::jsonb),
    ('Autoclave AC-200', 'AC-200', 'Autoclave de vapor para esterilización de instrumentos', 850000, cat_laboratorio, 'Equipos Médicos', true, null, '["Autoclave", "Esterilización", "Laboratorio"]'::jsonb),
    ('Carro de Paro CP-300', 'CP-300', 'Carro de emergencia con desfibrilador integrado', 3200000, cat_emergencia, 'Equipos Médicos', true, null, '["Carro paro", "Emergencia", "UCI"]'::jsonb),
    ('Aspirador Quirúrgico AQ-150', 'AQ-150', 'Aspirador quirúrgico eléctrico de alta potencia', 320000, cat_emergencia, 'Equipos Médicos', true, null, '["Aspirador", "Quirúrgico", "Emergencia"]'::jsonb),
    ('Monitor Fetal MF-400', 'MF-400', 'Monitor fetal doppler con registro CTG', 980000, cat_monitoreo, 'Equipos Médicos', true, null, '["Monitor fetal", "Obstétrico", "CTG"]'::jsonb),
    ('Centrífuga de Laboratorio CL-800', 'CL-800', 'Centrífuga refrigerada para muestras de laboratorio', 420000, cat_laboratorio, 'Equipos Médicos', true, null, '["Centrífuga", "Laboratorio", "Muestras"]'::jsonb),
    ('Lámpara Quirúrgica LQ-600', 'LQ-600', 'Lámpara LED para cirugía con control táctil', 2100000, cat_emergencia, 'Equipos Médicos', true, null, '["Lámpara", "Quirúrgica", "LED"]'::jsonb),
    ('Estetoscopio Digital ED-200', 'ED-200', 'Estetoscopio electrónico con amplificación', 180000, cat_diagnostico, 'Equipos Médicos', true, null, '["Estetoscopio", "Digital", "Diagnóstico"]'::jsonb),
    ('Nebulizador Ultrasónico NU-300', 'NU-300', 'Nebulizador ultrasónico para terapia respiratoria', 95000, cat_respiratorio, 'Equipos Médicos', true, null, '["Nebulizador", "Respiratorio", "Terapia"]'::jsonb),
    ('Termómetro Infrarrojo TI-100', 'TI-100', 'Termómetro infrarrojo sin contacto', 25000, cat_diagnostico, 'Equipos Médicos', true, null, '["Termómetro", "Infrarrojo", "Sin contacto"]'::jsonb),
    ('Camilla Hidráulica CH-500', 'CH-500', 'Camilla hidráulica de altura variable', 480000, cat_emergencia, 'Equipos Médicos', true, null, '["Camilla", "Hidráulica", "Transporte"]'::jsonb),
    ('Balanza Médica BM-300', 'BM-300', 'Balanza digital con tallímetro incorporado', 120000, cat_diagnostico, 'Equipos Médicos', true, null, '["Balanza", "Peso", "Tallímetro"]'::jsonb),
    ('Glucómetro Digital GD-150', 'GD-150', 'Medidor de glucosa digital con memoria', 35000, cat_diagnostico, 'Equipos Médicos', true, null, '["Glucómetro", "Diabetes", "Digital"]'::jsonb),
    ('Tensiómetro Digital TD-200', 'TD-200', 'Tensiómetro automático con manguito universal', 55000, cat_diagnostico, 'Equipos Médicos', true, null, '["Tensiómetro", "Presión arterial", "Digital"]'::jsonb),
    ('Kit de Diagnóstico KD-100', 'KD-100', 'Kit diagnóstico con otoscopio y oftalmoscopio', 280000, cat_diagnostico, 'Equipos Médicos', true, null, '["Kit diagnóstico", "Otoscopio", "Oftalmoscopio"]'::jsonb)
  ON CONFLICT (codigo_producto) DO NOTHING;
END $$;

-- Insert clientes with valid Chilean RUTs
INSERT INTO public.clientes (nombre, rut, direccion, tipo, tags, score, estado_relacional) VALUES 
  ('Hospital Salvador', '70123456-7', 'Av. Salvador 364, Providencia', 'Público', '["Hospital", "Público", "Alta prioridad"]'::jsonb, 85, 'Activo'),
  ('Clínica Las Condes', '96789123-4', 'Lo Fontecilla 441, Las Condes', 'Privado', '["Clínica", "Privado", "Premium"]'::jsonb, 92, 'Activo'),
  ('CESFAM Maipú', '70987654-3', 'Av. Pajaritos 1652, Maipú', 'Público', '["CESFAM", "Público", "Preventivo"]'::jsonb, 76, 'Activo'),
  ('Laboratorio Bionet', '76543210-9', 'Av. Vitacura 3568, Vitacura', 'Revendedor', '["Laboratorio", "Revendedor", "B2B"]'::jsonb, 88, 'Activo'),
  ('Hospital Militar', '61234567-8', 'Av. Luis Calvo Mackenna 1234, Providencia', 'Público', '["Hospital", "Militar", "Especializado"]'::jsonb, 79, 'Activo'),
  ('Clínica Santa María', '96234567-1', 'Av. Santa María 0500, Providencia', 'Privado', '["Clínica", "Privado", "Ginecología"]'::jsonb, 83, 'Activo'),
  ('Centro Médico San Carlos', '76876543-2', 'Av. San Carlos 3456, Maipú', 'Privado', '["Centro médico", "Privado", "Consultas"]'::jsonb, 71, 'Nuevo'),
  ('CESFAM San Joaquín', '70456789-1', 'Av. Vicuña Mackenna 7890, San Joaquín', 'Público', '["CESFAM", "Público", "Atención primaria"]'::jsonb, 68, 'Activo'),
  ('Clínica Alemana', '96345678-2', 'Av. Vitacura 5951, Vitacura', 'Privado', '["Clínica", "Privado", "Premium"]'::jsonb, 94, 'Activo'),
  ('Laboratorio Central', '76987123-4', 'Av. Providencia 2134, Providencia', 'Revendedor', '["Laboratorio", "Revendedor", "Análisis"]'::jsonb, 81, 'Activo')
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

-- Insert inventario_items for all products
INSERT INTO public.inventario_items (producto_id, stock_actual, stock_minimo, ubicacion)
SELECT p.id, 
       CASE 
         WHEN p.precio_neto > 5000000 THEN 1 + (RANDOM() * 2)::INTEGER
         WHEN p.precio_neto > 1000000 THEN 2 + (RANDOM() * 3)::INTEGER  
         ELSE 5 + (RANDOM() * 10)::INTEGER
       END as stock_actual,
       CASE 
         WHEN p.precio_neto > 5000000 THEN 1
         WHEN p.precio_neto > 1000000 THEN 2
         ELSE 3
       END as stock_minimo,
       'Bodega A - Estante ' || ((ROW_NUMBER() OVER ()) % 10 + 1)::TEXT as ubicacion
FROM public.productos p
ON CONFLICT (producto_id) DO NOTHING;