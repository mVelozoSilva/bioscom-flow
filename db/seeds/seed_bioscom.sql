-- Seed Bioscom CRM/ERP — seguro y re‑ejecutable
-- Requiere: pgcrypto (para gen_random_uuid). Supabase la trae habilitada.

-- === CATEGORÍAS ===
INSERT INTO public.categorias (id, nombre, descripcion)
VALUES
  (gen_random_uuid(), 'Conectividad', 'Productos de conectividad y redes'),
  (gen_random_uuid(), 'Seguridad', 'Sistemas de seguridad y monitoreo'),
  (gen_random_uuid(), 'Industrial', 'Equipos para uso industrial')
ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;

-- === CLIENTES ===
INSERT INTO public.clientes (id, rut, nombre, tipo, direccion, estado_relacional, score, tags)
VALUES
  (gen_random_uuid(), '76543210-5', 'Comercial Andina SpA', 'Privado', 'Av. Apoquindo 1234, Santiago', 'Activo', 85, '["vip", "tecnologia"]'::jsonb),
  (gen_random_uuid(), '65432109-4', 'Servicios Patagónicos Ltda.', 'Privado', 'Av. Cardonal 55, Puerto Montt', 'Nuevo', 70, '["regional"]'::jsonb),
  (gen_random_uuid(), '87654321-0', 'Minera del Norte SA', 'Privado', 'Av. Industrial 789, Antofagasta', 'Activo', 95, '["vip", "mineria"]'::jsonb)
ON CONFLICT (rut) DO UPDATE SET nombre = EXCLUDED.nombre;

-- === CONTACTOS ===
INSERT INTO public.contactos (id, cliente_id, nombre, cargo, telefono, email, principal)
SELECT gen_random_uuid(), c.id, 'María Torres', 'Jefe de Compras', '+56 2 2345 6789', 'maria.torres@andina.cl', true
FROM public.clientes c WHERE c.rut = '76543210-5'
ON CONFLICT DO NOTHING;

INSERT INTO public.contactos (id, cliente_id, nombre, cargo, telefono, email, principal)
SELECT gen_random_uuid(), c.id, 'José Pérez', 'Gerente General', '+56 65 225 1122', 'jose.perez@patagonicos.cl', true
FROM public.clientes c WHERE c.rut = '65432109-4'
ON CONFLICT DO NOTHING;

INSERT INTO public.contactos (id, cliente_id, nombre, cargo, telefono, email, principal)
SELECT gen_random_uuid(), c.id, 'Ana Gutiérrez', 'Coordinadora TI', '+56 55 334 5566', 'ana.gutierrez@mineranorte.cl', true
FROM public.clientes c WHERE c.rut = '87654321-0'
ON CONFLICT DO NOTHING;

-- === PRODUCTOS ===
INSERT INTO public.productos (id, codigo_producto, nombre, descripcion_corta, precio_neto, categoria_id, estado, stock_referencial, linea_negocio, tags)
SELECT 
  gen_random_uuid(), 
  'PROD-001', 
  'Router Industrial X1', 
  'Router LTE para IoT industrial con conectividad 4G', 
  189000, 
  c.id, 
  true, 
  25, 
  'conectividad',
  '["iot", "4g", "industrial"]'::jsonb
FROM public.categorias c WHERE c.nombre = 'Conectividad'
ON CONFLICT (codigo_producto) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.productos (id, codigo_producto, nombre, descripcion_corta, precio_neto, categoria_id, estado, stock_referencial, linea_negocio, tags)
SELECT 
  gen_random_uuid(), 
  'PROD-002', 
  'Switch 8p Gigabit', 
  'Switch administrable 8 puertos Gigabit', 
  99000, 
  c.id, 
  true, 
  12, 
  'conectividad',
  '["switch", "gigabit", "administrable"]'::jsonb
FROM public.categorias c WHERE c.nombre = 'Conectividad'
ON CONFLICT (codigo_producto) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.productos (id, codigo_producto, nombre, descripcion_corta, precio_neto, categoria_id, estado, stock_referencial, linea_negocio, tags)
SELECT 
  gen_random_uuid(), 
  'PROD-003', 
  'Antena Panel 9dBi', 
  'Antena panel direccional 9dBi para exteriores', 
  39000, 
  c.id, 
  true, 
  40, 
  'conectividad',
  '["antena", "exterior", "direccional"]'::jsonb
FROM public.categorias c WHERE c.nombre = 'Conectividad'
ON CONFLICT (codigo_producto) DO UPDATE SET nombre = EXCLUDED.nombre;

INSERT INTO public.productos (id, codigo_producto, nombre, descripcion_corta, precio_neto, categoria_id, estado, stock_referencial, linea_negocio, tags)
SELECT 
  gen_random_uuid(), 
  'PROD-004', 
  'Cámara IP PTZ', 
  'Cámara IP PTZ con visión nocturna y zoom 20x', 
  450000, 
  c.id, 
  true, 
  8, 
  'seguridad',
  '["camara", "ptz", "ip", "zoom"]'::jsonb
FROM public.categorias c WHERE c.nombre = 'Seguridad'
ON CONFLICT (codigo_producto) DO UPDATE SET nombre = EXCLUDED.nombre;

-- === INVENTARIO ===
INSERT INTO public.inventario (id, producto_id, codigo_producto, nombre_producto, stock_actual, stock_minimo, stock_reservado, proveedor, estado, costo_promedio, linea_negocio, ubicacion, ultimo_movimiento)
SELECT 
  gen_random_uuid(), 
  p.id, 
  p.codigo_producto, 
  p.nombre, 
  p.stock_referencial, 
  5, 
  0, 
  'Proveedor Chile SpA', 
  'activo', 
  p.precio_neto * 0.7, 
  p.linea_negocio,
  'Bodega A-1',
  now()
FROM public.productos p
ON CONFLICT DO NOTHING;

-- === COTIZACIONES ===
INSERT INTO public.cotizaciones (id, codigo, cliente_id, vendedor_id, estado, observaciones, fecha_expiracion, score)
SELECT 
  gen_random_uuid(), 
  'COT-2024-001', 
  c.id, 
  (SELECT id FROM auth.users LIMIT 1), 
  'Enviada', 
  'Cotización para implementación de red industrial', 
  CURRENT_DATE + INTERVAL '15 days', 
  75
FROM public.clientes c WHERE c.rut = '76543210-5'
ON CONFLICT (codigo) DO UPDATE SET estado = EXCLUDED.estado;

INSERT INTO public.cotizaciones (id, codigo, cliente_id, vendedor_id, estado, observaciones, fecha_expiracion, score)
SELECT 
  gen_random_uuid(), 
  'COT-2024-002', 
  c.id, 
  (SELECT id FROM auth.users LIMIT 1), 
  'Pendiente', 
  'Sistema de seguridad perimetral', 
  CURRENT_DATE + INTERVAL '20 days', 
  85
FROM public.clientes c WHERE c.rut = '87654321-0'
ON CONFLICT (codigo) DO UPDATE SET estado = EXCLUDED.estado;

-- === ÍTEMS DE COTIZACIÓN ===
INSERT INTO public.cotizacion_items (id, cotizacion_id, producto_id, cantidad, precio_unit, total_linea)
SELECT 
  gen_random_uuid(), 
  cot.id, 
  p.id, 
  3, 
  p.precio_neto, 
  3 * p.precio_neto
FROM public.cotizaciones cot
JOIN public.clientes c ON c.id = cot.cliente_id
JOIN public.productos p ON p.codigo_producto = 'PROD-001'
WHERE c.rut = '76543210-5'
ON CONFLICT DO NOTHING;

INSERT INTO public.cotizacion_items (id, cotizacion_id, producto_id, cantidad, precio_unit, total_linea)
SELECT 
  gen_random_uuid(), 
  cot.id, 
  p.id, 
  2, 
  p.precio_neto, 
  2 * p.precio_neto
FROM public.cotizaciones cot
JOIN public.clientes c ON c.id = cot.cliente_id
JOIN public.productos p ON p.codigo_producto = 'PROD-002'
WHERE c.rut = '76543210-5'
ON CONFLICT DO NOTHING;

INSERT INTO public.cotizacion_items (id, cotizacion_id, producto_id, cantidad, precio_unit, total_linea)
SELECT 
  gen_random_uuid(), 
  cot.id, 
  p.id, 
  4, 
  p.precio_neto, 
  4 * p.precio_neto
FROM public.cotizaciones cot
JOIN public.clientes c ON c.id = cot.cliente_id
JOIN public.productos p ON p.codigo_producto = 'PROD-004'
WHERE c.rut = '87654321-0'
ON CONFLICT DO NOTHING;

-- === TAREAS ===
INSERT INTO public.tareas (id, titulo, descripcion, prioridad, fecha_vencimiento, estado, cliente_id, origen, tags)
SELECT 
  gen_random_uuid(), 
  'Llamar para confirmar OC', 
  'Cliente solicita confirmación de orden de compra COT-2024-001', 
  'Alta', 
  CURRENT_DATE + INTERVAL '2 days', 
  'Pendiente', 
  c.id, 
  'Manual',
  '["comercial", "urgente"]'::jsonb
FROM public.clientes c WHERE c.rut = '76543210-5'
ON CONFLICT DO NOTHING;

INSERT INTO public.tareas (id, titulo, descripcion, prioridad, fecha_vencimiento, estado, cliente_id, origen, tags)
SELECT 
  gen_random_uuid(), 
  'Preparar presentación técnica', 
  'Presentación detallada del sistema de seguridad propuesto', 
  'Media', 
  CURRENT_DATE + INTERVAL '5 days', 
  'Pendiente', 
  c.id, 
  'Manual',
  '["comercial", "presentacion"]'::jsonb
FROM public.clientes c WHERE c.rut = '87654321-0'
ON CONFLICT DO NOTHING;

INSERT INTO public.tareas (id, titulo, descripcion, prioridad, fecha_vencimiento, estado, origen, tags)
VALUES
  (gen_random_uuid(), 'Actualizar inventario', 'Revisar stock de productos estrella', 'Baja', CURRENT_DATE + INTERVAL '7 days', 'Pendiente', 'Manual', '["inventario", "rutina"]'::jsonb),
  (gen_random_uuid(), 'Seguimiento cobranza', 'Contactar clientes con facturas vencidas', 'Urgente', CURRENT_DATE + INTERVAL '1 day', 'Pendiente', 'Cobranza', '["cobranza", "urgente"]'::jsonb)
ON CONFLICT DO NOTHING;

-- === SEGUIMIENTOS ===
INSERT INTO public.seguimientos (id, cliente_id, prioridad, proxima_gestion, notas, estado, origen)
SELECT 
  gen_random_uuid(), 
  c.id, 
  'alta', 
  CURRENT_DATE + INTERVAL '3 days', 
  'Cliente interesado en expandir la red actual. Seguimiento post-cotización.', 
  'Activo', 
  'Cotizacion'
FROM public.clientes c WHERE c.rut = '76543210-5'
ON CONFLICT DO NOTHING;

INSERT INTO public.seguimientos (id, cliente_id, prioridad, proxima_gestion, notas, estado, origen)
SELECT 
  gen_random_uuid(), 
  c.id, 
  'media', 
  CURRENT_DATE + INTERVAL '7 days', 
  'Evaluar necesidades de seguridad adicionales. Cliente consulta por mantenimiento.', 
  'Activo', 
  'Manual'
FROM public.clientes c WHERE c.rut = '87654321-0'
ON CONFLICT DO NOTHING;

-- === FACTURAS ===
INSERT INTO public.facturas (id, numero_factura, cliente_id, rut_cliente, monto, fecha_emision, fecha_vencimiento, estado, estado_documento, numero_ot_oc)
SELECT 
  gen_random_uuid(), 
  'F-2024-1001', 
  c.id, 
  c.rut, 
  590000, 
  CURRENT_DATE - INTERVAL '7 days', 
  CURRENT_DATE + INTERVAL '23 days', 
  'Pendiente', 
  'enviada', 
  'OC-001-2024'
FROM public.clientes c WHERE c.rut = '76543210-5'
ON CONFLICT (numero_factura) DO UPDATE SET estado = EXCLUDED.estado;

INSERT INTO public.facturas (id, numero_factura, cliente_id, rut_cliente, monto, fecha_emision, fecha_vencimiento, estado, estado_documento, numero_ot_oc)
SELECT 
  gen_random_uuid(), 
  'F-2024-1002', 
  c.id, 
  c.rut, 
  1800000, 
  CURRENT_DATE - INTERVAL '15 days', 
  CURRENT_DATE - INTERVAL '3 days', 
  'Vencida', 
  'enviada', 
  'OC-002-2024'
FROM public.clientes c WHERE c.rut = '87654321-0'
ON CONFLICT (numero_factura) DO UPDATE SET estado = EXCLUDED.estado;

INSERT INTO public.facturas (id, numero_factura, cliente_id, rut_cliente, monto, fecha_emision, fecha_vencimiento, estado, estado_documento)
SELECT 
  gen_random_uuid(), 
  'F-2024-1003', 
  c.id, 
  c.rut, 
  125000, 
  CURRENT_DATE - INTERVAL '45 days', 
  CURRENT_DATE - INTERVAL '15 days', 
  'Pagada', 
  'aceptada'
FROM public.clientes c WHERE c.rut = '65432109-4'
ON CONFLICT (numero_factura) DO UPDATE SET estado = EXCLUDED.estado;

-- === COBRANZAS ===
INSERT INTO public.cobranzas (id, factura_id, cliente_id, estado, ultima_gestion_at, proxima_gestion_at, dias_vencido, notas)
SELECT 
  gen_random_uuid(), 
  f.id, 
  f.cliente_id, 
  'pendiente', 
  now(), 
  CURRENT_DATE + INTERVAL '3 days', 
  0, 
  'Cliente confirmó recepción de factura'
FROM public.facturas f WHERE f.numero_factura = 'F-2024-1001'
ON CONFLICT DO NOTHING;

INSERT INTO public.cobranzas (id, factura_id, cliente_id, estado, ultima_gestion_at, proxima_gestion_at, dias_vencido, notas)
SELECT 
  gen_random_uuid(), 
  f.id, 
  f.cliente_id, 
  'en_gestion', 
  now(), 
  CURRENT_DATE + INTERVAL '1 day', 
  3, 
  'Factura vencida - Cliente solicita plan de pago'
FROM public.facturas f WHERE f.numero_factura = 'F-2024-1002'
ON CONFLICT DO NOTHING;

-- === GESTIONES DE COBRANZA ===
INSERT INTO public.gestiones_cobranza (id, factura_id, fecha, tipo, resultado, comentario, proxima_accion)
SELECT 
  gen_random_uuid(), 
  f.id, 
  CURRENT_DATE - INTERVAL '2 days', 
  'llamada', 
  'contactado', 
  'Cliente confirma recepción. Procesará pago esta semana.', 
  CURRENT_DATE + INTERVAL '5 days'
FROM public.facturas f WHERE f.numero_factura = 'F-2024-1001'
ON CONFLICT DO NOTHING;

INSERT INTO public.gestiones_cobranza (id, factura_id, fecha, tipo, resultado, comentario, proxima_accion)
SELECT 
  gen_random_uuid(), 
  f.id, 
  CURRENT_DATE - INTERVAL '1 day', 
  'email', 
  'pendiente_respuesta', 
  'Enviado recordatorio por email. Cliente no ha respondido.', 
  CURRENT_DATE + INTERVAL '2 days'
FROM public.facturas f WHERE f.numero_factura = 'F-2024-1002'
ON CONFLICT DO NOTHING;

-- === PAGOS ===
INSERT INTO public.pagos (id, factura_id, tipo, fecha_pago, monto, referencia, verificado)
SELECT 
  gen_random_uuid(), 
  f.id, 
  'transferencia', 
  CURRENT_DATE - INTERVAL '30 days', 
  125000, 
  'TRANSFER-001-2024', 
  true
FROM public.facturas f WHERE f.numero_factura = 'F-2024-1003'
ON CONFLICT DO NOTHING;

-- === SERVICIOS TÉCNICOS ===
INSERT INTO public.servicios_tecnicos (id, numero_ticket, tipo, cliente_id, equipo, descripcion, origen, prioridad, estado, fecha_programada, marca, modelo, numero_serie, contacto_cliente, telefono_contacto)
SELECT 
  gen_random_uuid(), 
  'ST-2024-00001', 
  'correctivo', 
  c.id, 
  'Router Industrial X1', 
  'Equipo presenta intermitencia en conexión 4G. Requiere diagnóstico.', 
  'cliente', 
  'alta', 
  'asignado', 
  CURRENT_DATE + INTERVAL '2 days', 
  'Industrial Tech', 
  'IT-R4G-001', 
  'ITR001234567', 
  'Carlos Méndez', 
  '+56 9 8765 4321'
FROM public.clientes c WHERE c.rut = '76543210-5'
ON CONFLICT (numero_ticket) DO UPDATE SET estado = EXCLUDED.estado;

INSERT INTO public.servicios_tecnicos (id, numero_ticket, tipo, cliente_id, equipo, descripcion, origen, prioridad, estado, fecha_programada, marca, modelo, contacto_cliente, telefono_contacto)
SELECT 
  gen_random_uuid(), 
  'ST-2024-00002', 
  'preventivo', 
  c.id, 
  'Cámara IP PTZ', 
  'Mantenimiento preventivo trimestral del sistema de cámaras.', 
  'interno', 
  'media', 
  'pendiente', 
  CURRENT_DATE + INTERVAL '5 days', 
  'SecureCam', 
  'SC-PTZ-200', 
  'Ana Gutiérrez', 
  '+56 55 334 5566'
FROM public.clientes c WHERE c.rut = '87654321-0'
ON CONFLICT (numero_ticket) DO UPDATE SET estado = EXCLUDED.estado;

-- === INFORMES TÉCNICOS ===
INSERT INTO public.informes_tecnicos (id, servicio_id, numero, diagnostico, acciones, recomendaciones, observaciones, estado_informe, tecnico_nombre, cliente_nombre, fecha_servicio)
SELECT 
  gen_random_uuid(), 
  st.id, 
  'IT-2024-0001', 
  'Módulo 4G con firmware desactualizado. Antena principal con conexión suelta.', 
  'Actualización de firmware versión 2.1.4. Refuerzo de conexión de antena principal.', 
  'Programar mantenimiento preventivo cada 6 meses. Monitorear calidad de señal semanalmente.', 
  'Equipo funcionando correctamente post-intervención. Cliente satisfecho con el servicio.', 
  'finalizado', 
  'Juan Técnico', 
  'Comercial Andina SpA', 
  CURRENT_DATE - INTERVAL '1 day'
FROM public.servicios_tecnicos st WHERE st.numero_ticket = 'ST-2024-00001'
ON CONFLICT (numero) DO UPDATE SET estado_informe = EXCLUDED.estado_informe;

-- === DESPACHOS ===
INSERT INTO public.despachos (id, codigo_despacho, cliente_id, contacto, telefono, direccion, institucion, plazo_entrega, hora_entrega, tipo_despacho, estado, transportista, numero_guia, observaciones)
SELECT 
  gen_random_uuid(), 
  'DESP-2024-00001', 
  c.id, 
  'María Torres', 
  '+56 2 2345 6789', 
  'Av. Apoquindo 1234, Oficina 501, Santiago', 
  'Comercial Andina SpA', 
  CURRENT_DATE + INTERVAL '2 days', 
  '14:00'::time, 
  'normal', 
  'Preparando', 
  'STARKEN', 
  'STK-789456123', 
  'Despacho de equipos de red según OC-001-2024'
FROM public.clientes c WHERE c.rut = '76543210-5'
ON CONFLICT (codigo_despacho) DO UPDATE SET estado = EXCLUDED.estado;

INSERT INTO public.despachos (id, codigo_despacho, cliente_id, contacto, telefono, direccion, institucion, plazo_entrega, tipo_despacho, estado, observaciones)
SELECT 
  gen_random_uuid(), 
  'DESP-2024-00002', 
  c.id, 
  'José Pérez', 
  '+56 65 225 1122', 
  'Av. Cardonal 55, Puerto Montt', 
  'Servicios Patagónicos Ltda.', 
  CURRENT_DATE + INTERVAL '5 days', 
  'normal', 
  'Pendiente', 
  'Productos para capacitación técnica'
FROM public.clientes c WHERE c.rut = '65432109-4'
ON CONFLICT (codigo_despacho) DO UPDATE SET estado = EXCLUDED.estado;

-- === CHECKLIST DESPACHO ===
INSERT INTO public.despacho_checklists (id, despacho_id, item, categoria, obligatorio, orden_display, cumplido, nota)
SELECT 
  gen_random_uuid(), 
  d.id, 
  'Verificar embalaje de equipos', 
  'preparacion', 
  true, 
  1, 
  true, 
  'Embalaje con protección antiestática'
FROM public.despachos d WHERE d.codigo_despacho = 'DESP-2024-00001'
ON CONFLICT DO NOTHING;

INSERT INTO public.despacho_checklists (id, despacho_id, item, categoria, obligatorio, orden_display, cumplido)
SELECT 
  gen_random_uuid(), 
  d.id, 
  'Incluir documentación técnica', 
  'documentacion', 
  true, 
  2, 
  false
FROM public.despachos d WHERE d.codigo_despacho = 'DESP-2024-00001'
ON CONFLICT DO NOTHING;

INSERT INTO public.despacho_checklists (id, despacho_id, item, categoria, obligatorio, orden_display, cumplido)
SELECT 
  gen_random_uuid(), 
  d.id, 
  'Confirmar dirección de entrega', 
  'logistica', 
  true, 
  3, 
  true
FROM public.despachos d WHERE d.codigo_despacho = 'DESP-2024-00001'
ON CONFLICT DO NOTHING;

-- === AUDITORÍA ===
INSERT INTO public.audit_log (id, entity, action, entity_id, payload)
VALUES
  (gen_random_uuid(), 'clientes', 'seed_created', gen_random_uuid(), '{"source": "seed_bioscom", "timestamp": "' || now()::text || '"}'),
  (gen_random_uuid(), 'productos', 'seed_created', gen_random_uuid(), '{"source": "seed_bioscom", "timestamp": "' || now()::text || '"}'),
  (gen_random_uuid(), 'cotizaciones', 'seed_created', gen_random_uuid(), '{"source": "seed_bioscom", "timestamp": "' || now()::text || '"}')
ON CONFLICT DO NOTHING;