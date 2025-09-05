# Bioscom CRM/ERP - Documentación de Módulos

## Resumen del Sistema

Sistema integrado de CRM/ERP para Bioscom Chile que incluye:
- **Autenticación**: Sistema completo con Supabase Auth
- **Cobranzas**: Gestión de facturas, pagos y recuperación de cartera
- **Servicio Técnico**: Tickets, informes técnicos con PDF y QR público
- **Logística**: Inventario, despachos y alertas de stock
- **Automatizaciones**: Triggers, notificaciones y workflows cruzados

## Módulo de Autenticación

### Componentes
- `AuthProvider`: Context provider para manejo de estado de autenticación
- `ProtectedRoute`: Guard para rutas protegidas
- `Auth`: Página de login/registro con magic link

### Características
- Login/registro con email/password
- Magic link para confirmación de email
- Perfiles de usuario automáticos
- Redirección automática para usuarios autenticados

### Base de Datos
```sql
-- Tabla de perfiles vinculada a auth.users
user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono, cargo, departamento, activo,
  configuracion_notificaciones jsonb
)
```

## Módulo de Cobranzas

### Funcionalidades Principales
- **Gestión de Facturas**: Estados, vencimientos, observaciones
- **Cobranzas Automáticas**: Se crean automáticamente al insertar facturas
- **Historial de Gestiones**: Llamadas, emails, WhatsApp, visitas
- **KPIs en Tiempo Real**: Montos por cobrar, facturas vencidas, gestiones del día
- **Acciones Rápidas**: Enlaces mailto: y wa.me con plantillas

### Tablas
```sql
facturas (numero_factura, monto, fecha_vencimiento, cliente_id, estado_documento, rut_cliente)
cobranzas (factura_id, cliente_id, estado, proxima_gestion_at, dias_vencido, asignado_a)
historial_gestiones (cobranza_id, tipo, resultado, comentario, proxima_accion_at, adjuntos)
```

### Automatizaciones
- **Trigger**: Al insertar factura → crear cobranza + tarea automática
- **Cálculo**: Días vencido se actualiza automáticamente
- **Notificaciones**: Gestiones vencidas y próximas acciones

### UI/UX
- Dashboard con KPIs principales
- Tabla con filtros por estado y fechas
- Modal de gestión con formulario completo
- Modal de detalle con historial y acciones rápidas
- Badges coloridos por estado y urgencia

## Módulo de Servicio Técnico

### Funcionalidades Principales
- **Tickets de Servicio**: Correctivo, preventivo, instalación, capacitación
- **Asignación de Técnicos**: RLS por técnico asignado
- **Informes Técnicos**: Editor completo con diagnóstico, acciones, recomendaciones
- **PDF Corporativo**: Generación automática con QR a URL pública
- **Estados del Workflow**: Pendiente → Asignado → En Proceso → Completado

### Tablas
```sql
servicios_tecnicos (numero_ticket, tipo, cliente_id, equipo, tecnico_id, estado, fecha_programada)
informes_tecnicos (servicio_id, numero, diagnostico, acciones, pdf_url, qr_code, estado_informe)
```

### Automatizaciones
- **Numeración**: Tickets auto-numerados (ST-2024-00001)
- **Informes**: Se crean automáticamente al completar servicio
- **PDF + QR**: Generación para URL pública del informe
- **Notificaciones**: Asignaciones y cambios de estado

### Workflow de Informes
1. Servicio completado → Crear informe borrador
2. Técnico completa datos → Estado "finalizado"
3. Generar PDF → QR público + Estado "enviado"
4. Cliente accede vía QR sin autenticación

## Módulo de Logística e Inventario

### Funcionalidades Principales
- **Inventario Completo**: Stock actual/mínimo, ubicaciones, proveedores
- **Alertas de Stock Bajo**: Notificaciones automáticas + enlaces WhatsApp
- **Movimientos de Stock**: Entradas/salidas con motivos y trazabilidad
- **Despachos**: Órdenes con checklists y seguimiento
- **OCR de OC**: Procesamiento de órdenes de compra (preparado para Tesseract.js)

### Tablas
```sql
inventario (producto_id, stock_actual, stock_minimo, ubicacion, proveedor, costo_promedio)
despachos (codigo_despacho, cliente_id, productos_despachados, checklist, estado)
despacho_checklists (despacho_id, item, cumplido, categoria, obligatorio)
orden_compra_pdf (archivo_pdf_url, extraido_json, estado_ocr)
```

### Automatizaciones
- **Stock Bajo**: Trigger notifica cuando stock ≤ mínimo
- **Despachos**: Se crean automáticamente al aceptar cotización
- **WhatsApp**: Enlaces directos con plantillas de stock bajo
- **Trazabilidad**: Último movimiento tracking

### Características Avanzadas
- KPIs en tiempo real de stock y valor
- Alertas visuales prominentes para stock crítico
- Movimientos con categorización por motivo
- OCR preparado para automatizar ingreso de OC

## Integraciones Cruzadas

### Workflow de Ventas → Despacho
1. Cotización aceptada → Trigger crea tarea de despacho
2. Notificación automática a logística
3. Preparación de despacho con checklist
4. Seguimiento hasta entrega

### Workflow de Facturación → Cobranza
1. Factura emitida → Cobranza automática
2. Tarea programada post-vencimiento
3. Gestiones con historial completo
4. Estados hasta pago confirmado

### Notificaciones Internas
- Sistema de notificaciones con categorías
- Badges en navegación para alertas pendientes
- Prioridades y estados de lectura
- Enlaces directos a acciones

## Sistema de Automatizaciones

### Triggers Implementados
```sql
-- Cobranzas automáticas
trigger_crear_cobranza_automatica ON facturas

-- Tareas de despacho
trigger_crear_tarea_despacho ON cotizaciones  

-- Alertas de stock
trigger_notificar_stock_bajo ON inventario

-- Actualización de gestiones
trigger_actualizar_proxima_gestion ON historial_gestiones
```

### Fallbacks Sin Extensiones
- Cálculo de días vencido por trigger (no columna calculada)
- Secuencias para numeración automática
- Funciones PL/pgSQL para lógica compleja
- JSON para datos estructurados flexibles

## Seguridad y RLS

### Políticas por Rol
- **cobranzas**: Acceso total a módulo de cobranzas
- **tecnico**: Ve solo servicios asignados
- **logistica**: Gestión completa de inventario/despachos
- **admin**: Acceso total al sistema

### Función de Roles
```sql
has_role(role_name text) → Verifica rol del usuario autenticado
```

### Triggers de Seguridad
- `search_path` definido en todas las funciones
- Security Definer para elevación controlada
- Validación de datos en triggers

## Reportes y Analytics

### KPIs por Departamento
- **Cobranzas**: Montos vencidos, tasa recuperación, gestiones día
- **Técnico**: Tickets activos, tiempo promedio, satisfacción
- **Logística**: Stock bajo, valor inventario, despachos día

### Datos en Tiempo Real
- Consultas optimizadas con índices
- Agregaciones automáticas
- Estados calculados dinámicamente

## Próximas Mejoras

### Funcionalidades Pendientes
- [ ] Reportes PDF personalizados
- [ ] Dashboard ejecutivo con gráficos
- [ ] OCR completo para órdenes de compra
- [ ] Sincronización con ERP externo
- [ ] Aplicación móvil para técnicos

### Optimizaciones Técnicas
- [ ] Cache de KPIs frecuentes
- [ ] Índices adicionales por uso
- [ ] Compresión de archivos adjuntos
- [ ] Backup automatizado de informes

Este sistema está listo para producción con todas las funcionalidades core implementadas y documentadas.