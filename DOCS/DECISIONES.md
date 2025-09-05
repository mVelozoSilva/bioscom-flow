# Decisiones de Arquitectura - Bioscom CRM/ERP

## Supuestos y Decisiones Técnicas

### Autenticación y Autorización

**Decisión**: Usar Supabase Auth con magic links
**Supuesto**: Los usuarios prefieren autenticación sin contraseñas complejas
**Alternativa considerada**: Auth0, pero Supabase integra mejor con la base de datos
**Implementación**: 
- Magic links por email
- Backup con email/password
- RLS basado en roles

### Base de Datos

**Decisión**: PostgreSQL con Supabase
**Supuesto**: La empresa necesita un backend gestionado sin complejidad de DevOps
**Ventajas**:
- RLS nativo para seguridad
- JSON para datos flexibles
- Triggers para automatizaciones
- Escalabilidad automática

**Decisión**: No usar columnas calculadas con subqueries
**Razón**: PostgreSQL no permite subqueries en columnas generadas
**Solución**: Triggers para calcular campos como `dias_vencido`

### Roles y Permisos

**Decisión**: Modelo simple de roles por departamento
**Supuesto**: La estructura organizacional es estable
**Roles implementados**:
- admin: Acceso total
- vendedor: Ventas y clientes
- cobranzas: Facturas y pagos
- tecnico: Servicios asignados
- logistica: Inventario y despachos

**Decisión**: RLS a nivel de fila vs aplicación
**Ventaja**: Seguridad a nivel de base de datos
**Desventaja**: Mayor complejidad en consultas

### Automatizaciones

**Decisión**: Triggers PostgreSQL vs Supabase Edge Functions
**Razón**: Los triggers son más confiables para lógica crítica
**Implementación**:
- Triggers para crear cobranzas automáticas
- Triggers para notificaciones de stock
- Triggers para tareas de despacho

**Decisión**: Notificaciones internas vs email externo
**Supuesto**: Los usuarios trabajan principalmente en el sistema
**Complemento**: Enlaces mailto: y wa.me para comunicación externa

### Integraciones Externas

**Decisión**: Enlaces wa.me vs API de WhatsApp Business
**Razón**: Simplicidad y no requiere aprobación/costos de API
**Limitación**: No automatiza envío, requiere acción manual
**Beneficio**: Plantillas pre-llenadas para eficiencia

**Decisión**: Enlaces mailto: vs SMTP directo
**Razón**: Usa el cliente de email configurado del usuario
**Ventaja**: No requiere configuración de servidor SMTP
**Limitación**: Depende del cliente de email local

### Manejo de Archivos

**Decisión**: Supabase Storage para PDFs y adjuntos
**Supuesto**: Volumen de archivos moderado
**Configuración**:
- Bucket 'pdfs' público para informes técnicos
- Bucket 'adjuntos' privado para documentos sensibles

**Decisión**: URLs públicas para informes técnicos
**Razón**: Clientes deben acceder sin autenticación vía QR
**Seguridad**: URLs únicas y difíciles de adivinar

### Frontend

**Decisión**: React + TypeScript vs frameworks full-stack
**Razón**: Lovable está optimizado para React
**Beneficios**:
- Type safety con TypeScript
- Componentes reutilizables
- Integración directa con Supabase

**Decisión**: Tailwind CSS + shadcn/ui
**Razón**: Rapidez de desarrollo y consistencia visual
**Configuración**: Sistema de colores corporativo de Bioscom

### Generación de PDFs

**Decisión**: jsPDF en cliente vs PDFs en servidor
**Supuesto**: Informes técnicos son simples y no requieren diseño complejo
**Ventaja**: No requiere infraestructura adicional
**Limitación**: Diseños básicos, no tan profesionales como LaTeX/ReportLab

**Decisión**: QR codes para acceso público
**Implementación**: QR apunta a URL pública del informe
**Seguridad**: UUID como identificador, no secuencial

### Numeración Automática

**Decisión**: Sequences PostgreSQL vs UUID únicos
**Razón**: Los usuarios prefieren números consecutivos legibles
**Implementación**:
- Tickets: ST-2024-00001
- Despachos: DESP-2024-00001
- Informes: INF-2024-00001

### OCR y Automatización

**Decisión**: Preparado para OCR pero no implementado
**Razón**: Tesseract.js requiere archivos grandes y configuración compleja
**Estructura**: Tabla `orden_compra_pdf` lista para integración
**Alternativa**: Ingreso manual con campos optimizados

### Manejo de Errores

**Decisión**: Toasts para feedback vs modales
**Razón**: Menos intrusivos, mejor UX
**Implementación**: shadcn toast con categorías por tipo

**Decisión**: Validación en cliente y servidor
**Cliente**: Validación inmediata para UX
**Servidor**: RLS y constraints para seguridad

### Performance

**Decisión**: Paginación vs carga completa
**Supuesto**: Tablas no excederán 1000 registros por empresa
**Implementación**: DataTable con búsqueda en memoria
**Escalabilidad**: Fácil migrar a paginación server-side

**Decisión**: Real-time vs polling para actualizaciones
**Implementación**: Refresco manual por ahora
**Justificación**: Complejidad vs beneficio para equipo pequeño

### Backup y Disaster Recovery

**Decisión**: Confiar en backups automáticos de Supabase
**Supuesto**: Supabase Pro incluye backups diarios
**Complemento**: Exports manuales de datos críticos
**Monitoring**: Alertas en dashboard de Supabase

### Testing

**Decisión**: Seeds completos vs tests unitarios
**Razón**: Datos realistas para testing manual
**Implementación**: SQL seeds con relaciones consistentes
**Validación**: Smoke tests documentados en README

### Deployment

**Decisión**: Vercel/Netlify vs servidor propio
**Ventaja**: Deploy automático desde Git
**Configuración**: Variables de entorno para Supabase
**SSL**: Automático con custom domain

## Limitaciones Conocidas

### Técnicas
- PDFs generados en cliente (diseño básico)
- OCR no implementado (requiere desarrollo adicional)
- Notificaciones push no implementadas
- Sincronización offline no disponible

### Funcionales  
- Un usuario, un rol (no roles múltiples)
- Inventario simple (no múltiples bodegas)
- Reportes básicos (no Business Intelligence)
- Workflow fijo (no configurable por usuario)

### Escalabilidad
- Diseñado para equipos de 10-50 usuarios
- Tablas optimizadas para <10K registros cada una
- Un tenant por instancia (no multi-tenant)

## Decisiones de Seguridad

**RLS obligatorio**: Todas las tablas sensibles tienen RLS
**Función has_role()**: Evita recursión infinita en políticas
**Search path fijo**: Todas las funciones usan `SET search_path = public`
**Triggers seguros**: SECURITY DEFINER con validaciones

## Próximas Decisiones

### Corto Plazo
- [ ] Implementar paginación server-side
- [ ] Agregar exportación a CSV/Excel
- [ ] Configurar monitoring de errores
- [ ] Implementar cache de KPIs

### Mediano Plazo
- [ ] OCR con Tesseract.js o API externa
- [ ] Notificaciones push web
- [ ] Reportes con gráficos (Recharts)
- [ ] Workflow configurable

### Largo Plazo
- [ ] Aplicación móvil (React Native)
- [ ] Integraciones ERP (SAP, Odoo)
- [ ] BI dashboard ejecutivo
- [ ] Multi-tenancy

Estas decisiones priorizan simplicidad, confiabilidad y velocidad de desarrollo sobre características avanzadas que pueden agregarse iterativamente.