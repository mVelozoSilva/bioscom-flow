-- Add inventory data for the medical products
INSERT INTO public.inventario (producto_id, codigo_producto, nombre_producto, stock_actual, stock_minimo, costo_promedio, ubicacion, linea_negocio, estado)
SELECT 
  p.id,
  p.codigo_producto,
  p.nombre,
  CASE 
    WHEN p.linea_negocio = 'Equipamiento Médico' THEN FLOOR(RANDOM() * 10) + 3
    WHEN p.linea_negocio = 'Insumos Médicos' THEN FLOOR(RANDOM() * 500) + 100
    ELSE FLOOR(RANDOM() * 50) + 10
  END,
  CASE 
    WHEN p.linea_negocio = 'Equipamiento Médico' THEN FLOOR(RANDOM() * 3) + 1
    WHEN p.linea_negocio = 'Insumos Médicos' THEN FLOOR(RANDOM() * 100) + 50
    ELSE FLOOR(RANDOM() * 20) + 5
  END,
  p.precio_neto,
  CASE 
    WHEN p.linea_negocio = 'Equipamiento Médico' THEN 'Almacén A-' || (FLOOR(RANDOM() * 2) + 1)::text
    WHEN p.linea_negocio = 'Insumos Médicos' THEN 'Almacén B-' || (FLOOR(RANDOM() * 2) + 1)::text
    ELSE 'Almacén C-' || (FLOOR(RANDOM() * 2) + 1)::text
  END,
  p.linea_negocio,
  'activo'
FROM productos p
WHERE NOT EXISTS (
  SELECT 1 FROM inventario i WHERE i.producto_id = p.id
);