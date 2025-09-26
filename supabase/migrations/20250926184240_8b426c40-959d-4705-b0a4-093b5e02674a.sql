-- Insert medical categories
INSERT INTO public.categorias (nombre, descripcion) VALUES 
  ('Equipamiento Médico', 'Equipos y dispositivos médicos especializados'),
  ('Insumos Médicos', 'Suministros médicos y material consumible'),
  ('Diagnóstico', 'Equipos y kits de diagnóstico médico');

-- Insert medical products with proper JSON casting
WITH category_ids AS (
  SELECT id, nombre FROM categorias WHERE nombre IN ('Equipamiento Médico', 'Insumos Médicos', 'Diagnóstico')
)
INSERT INTO public.productos (nombre, codigo_producto, descripcion_corta, precio_neto, categoria_id, estado, stock_referencial, tags, linea_negocio, alerta_stock) 
SELECT 
  producto.nombre,
  producto.codigo_producto,
  producto.descripcion_corta,
  producto.precio_neto,
  category_ids.id,
  producto.estado,
  producto.stock_referencial,
  producto.tags::jsonb,
  producto.linea_negocio,
  producto.alerta_stock
FROM (VALUES
  -- Equipamiento Médico
  ('Monitor de Signos Vitales PM-9000', 'MSV-PM9000', 'Monitor multiparamétrico para UCI con pantalla táctil de 15 pulgadas', 2850000, 'Equipamiento Médico', true, 5, '["monitor", "signos vitales", "UCI", "multiparamétrico"]', 'Equipamiento Médico', true),
  ('Ventilador Mecánico VentMax Pro', 'VM-VMAX-PRO', 'Ventilador mecánico invasivo y no invasivo con modos avanzados', 4200000, 'Equipamiento Médico', true, 3, '["ventilador", "respirador", "UCI", "invasivo"]', 'Equipamiento Médico', true),
  ('Desfibrilador Automático DEA-250', 'DEA-250-AUTO', 'Desfibrilador externo automático con análisis de ritmo cardíaco', 1850000, 'Equipamiento Médico', true, 8, '["desfibrilador", "DEA", "emergencia", "automático"]', 'Equipamiento Médico', true),
  ('Bomba de Infusión Smart Pump SP-400', 'BI-SP400', 'Bomba de infusión volumétrica con biblioteca de medicamentos', 980000, 'Equipamiento Médico', true, 12, '["bomba infusión", "volumétrica", "medicamentos"]', 'Equipamiento Médico', false),
  ('Electrocardiógrafo ECG-12D Digital', 'ECG-12D-DIG', 'Electrocardiógrafo de 12 derivaciones con interpretación automática', 750000, 'Equipamiento Médico', true, 6, '["ECG", "electrocardiograma", "12 derivaciones", "digital"]', 'Equipamiento Médico', false),
  
  -- Insumos Médicos
  ('Jeringas Desechables 10ml x100', 'JER-10ML-100', 'Jeringas estériles desechables de 10ml, caja x100 unidades', 15000, 'Insumos Médicos', true, 200, '["jeringas", "desechables", "estériles", "10ml"]', 'Insumos Médicos', false),
  ('Guantes Nitrilo Talla M x100', 'GUA-NIT-M-100', 'Guantes de nitrilo sin polvo, resistentes a químicos, talla M', 25000, 'Insumos Médicos', true, 500, '["guantes", "nitrilo", "sin polvo", "talla M"]', 'Insumos Médicos', false),
  ('Mascarillas Quirúrgicas x50', 'MAS-QUI-50', 'Mascarillas quirúrgicas tipo IIR con elásticos, caja x50', 8500, 'Insumos Médicos', true, 300, '["mascarillas", "quirúrgicas", "tipo IIR", "elásticos"]', 'Insumos Médicos', false),
  ('Catéter Venoso Periférico 18G', 'CAT-VP-18G', 'Catéter venoso periférico calibre 18G con aletas de fijación', 1200, 'Insumos Médicos', true, 150, '["catéter", "venoso", "18G", "periférico"]', 'Insumos Médicos', true),
  ('Gasas Estériles 10x10cm x25', 'GAS-EST-10x10', 'Gasas estériles de algodón 10x10cm, sobre individual x25', 12000, 'Insumos Médicos', true, 400, '["gasas", "estériles", "algodón", "10x10cm"]', 'Insumos Médicos', false),
  
  -- Diagnóstico
  ('Oxímetro de Pulso OX-500', 'OXI-500-PULSE', 'Oxímetro de pulso digital con pantalla LED y alarmas', 85000, 'Diagnóstico', true, 25, '["oxímetro", "pulso", "digital", "LED"]', 'Diagnóstico', false),
  ('Termómetro Infrarrojo TI-200', 'TERM-IR-200', 'Termómetro infrarrojo sin contacto con memoria de lecturas', 45000, 'Diagnóstico', true, 35, '["termómetro", "infrarrojo", "sin contacto", "memoria"]', 'Diagnóstico', false),
  ('Kit Test Rápido COVID-19 x25', 'TEST-COV-25', 'Kit de test rápido antígeno COVID-19, caja x25 pruebas', 180000, 'Diagnóstico', true, 50, '["test rápido", "COVID-19", "antígeno", "diagnóstico"]', 'Diagnóstico', false),
  ('Glucómetro Digital GLU-Pro', 'GLU-PRO-DIG', 'Glucómetro digital con 50 tiras reactivas incluidas', 35000, 'Diagnóstico', true, 40, '["glucómetro", "digital", "tiras reactivas", "diabetes"]', 'Diagnóstico', false),
  ('Estetoscopio Cardiólogo Premium', 'EST-CARD-PREM', 'Estetoscopio de cardiología con campana de doble frecuencia', 120000, 'Diagnóstico', true, 15, '["estetoscopio", "cardiología", "doble frecuencia", "premium"]', 'Diagnóstico', false)
) AS producto(nombre, codigo_producto, descripcion_corta, precio_neto, categoria_nombre, estado, stock_referencial, tags, linea_negocio, alerta_stock)
JOIN category_ids ON category_ids.nombre = producto.categoria_nombre;