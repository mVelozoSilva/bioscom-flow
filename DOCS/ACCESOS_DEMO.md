# Accesos Demo - Bioscom CRM/ERP

## Usuarios de Demostración

Para probar el sistema, puedes crear usuarios con los siguientes roles y permisos:

### 1. Administrador
- **Email**: admin@bioscom.cl
- **Rol**: admin
- **Acceso**: Completo a todos los módulos
- **Departamento**: administracion

**Permisos**:
- Gestión de usuarios
- Acceso a todos los datos
- Configuración del sistema
- Reportes ejecutivos

### 2. Vendedor
- **Email**: vendedor@bioscom.cl
- **Rol**: vendedor  
- **Acceso**: Módulo de ventas completo
- **Departamento**: ventas

**Permisos**:
- Gestionar clientes
- Crear y editar cotizaciones
- Ver productos y precios
- Seguimientos comerciales

### 3. Cobranzas
- **Email**: cobranzas@bioscom.cl
- **Rol**: cobranzas
- **Acceso**: Módulo de cobranzas y facturas
- **Departamento**: cobranza

**Permisos**:
- Ver y gestionar facturas
- Registrar gestiones de cobranza
- Acceso a historial de pagos
- Generar reportes de cartera

### 4. Técnico
- **Email**: tecnico@bioscom.cl
- **Rol**: tecnico
- **Acceso**: Servicios técnicos asignados
- **Departamento**: tecnico

**Permisos**:
- Ver tickets asignados
- Crear informes técnicos
- Actualizar estado de servicios
- Generar PDFs de informes

### 5. Logística
- **Email**: logistica@bioscom.cl
- **Rol**: logistica
- **Acceso**: Inventario y despachos
- **Departamento**: logistica

**Permisos**:
- Gestionar inventario
- Crear y gestionar despachos
- Control de stock
- Alertas de reposición

## Configuración de Roles

### Para crear los usuarios demo:

1. **Registrar usuarios** a través de la interfaz `/auth`
2. **Asignar roles** ejecutando SQL en Supabase:

```sql
-- Insertar roles si no existen
INSERT INTO public.roles (name, description) VALUES
('admin', 'Administrador del sistema'),
('vendedor', 'Vendedor / Comercial'),
('cobranzas', 'Gestor de cobranzas'),
('tecnico', 'Técnico de servicio'),
('logistica', 'Encargado de logística')
ON CONFLICT (name) DO NOTHING;

-- Asignar rol de admin (reemplazar {user-id} con el UUID real)
INSERT INTO public.user_roles (user_id, role_id)
SELECT '{user-id}', id FROM public.roles WHERE name = 'admin';

-- Actualizar perfil de usuario
UPDATE public.user_profiles 
SET departamento = 'administracion', cargo = 'Administrador'
WHERE id = '{user-id}';
```

### Datos de Prueba

Para una demostración completa, el sistema incluye seeds con:

- **5 clientes** de diferentes tipos y sectores
- **10 productos** en diferentes categorías  
- **8 cotizaciones** en varios estados
- **6 facturas** para testing de cobranzas
- **4 servicios técnicos** en diferentes estados
- **15 items de inventario** con algunos en stock bajo

## Funcionalidades a Demostrar

### Flujo de Ventas
1. Crear nueva cotización
2. Asignar productos y calcular totales
3. Aceptar cotización → Ver tarea de despacho automática

### Flujo de Cobranzas  
1. Ver facturas vencidas en dashboard
2. Registrar gestión telefónica
3. Usar plantillas WhatsApp/Email
4. Actualizar próxima gestión

### Flujo Técnico
1. Crear nuevo ticket de servicio
2. Asignar técnico y programar
3. Completar servicio → Generar informe
4. Crear PDF con QR público

### Flujo de Inventario
1. Ver alertas de stock bajo
2. Registrar movimiento de entrada
3. Generar mensaje WhatsApp para reposición
4. Crear despacho con checklist

## URLs Importantes

- **Login**: `/auth`
- **Dashboard Principal**: `/`
- **Cobranzas**: `/cobranzas` 
- **Servicio Técnico**: `/servicio-tecnico`
- **Inventario**: `/inventario`

## Credenciales de Supabase

- **URL**: https://emwjnjqmyzuzuuwglwxf.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtd2puanFteXp1enV1d2dsd3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTMxOTksImV4cCI6MjA3MjY2OTE5OX0.3gY1vpHAqACM2A3hLJ1yjG_Mgy--INM2ABnBwsEwIBc

## Configuración de Email

Para el correcto funcionamiento del sistema de autenticación:

1. Ir a Supabase Dashboard → Authentication → Settings
2. Configurar **Site URL**: https://tu-dominio.com
3. Agregar **Redirect URLs**: 
   - https://tu-dominio.com
   - http://localhost:3000 (para desarrollo)
4. Habilitar **Confirm email** (opcional para demo)

## Testing de Automatizaciones

### Trigger de Cobranzas
```sql
-- Insertar factura para probar trigger
INSERT INTO public.facturas (
  numero_factura, cliente_id, monto, fecha_emision, fecha_vencimiento
) VALUES (
  'F-TEST-001', 
  'uuid-cliente', 
  100000, 
  CURRENT_DATE, 
  CURRENT_DATE + INTERVAL '30 days'
);
-- Verificar que se creó la cobranza y tarea automáticamente
```

### Trigger de Stock Bajo
```sql
-- Simular stock bajo
UPDATE public.inventario 
SET stock_actual = stock_minimo - 1
WHERE codigo_producto = 'PROD-001';
-- Verificar notificación automática
```

### Trigger de Despacho
```sql
-- Aceptar cotización para crear tarea de despacho
UPDATE public.cotizaciones 
SET estado = 'Aceptada'
WHERE codigo = 'COT-001';
-- Verificar tarea de despacho creada
```

## Contacto y Soporte

Para consultas sobre el sistema demo:
- **Desarrollador**: Sistema implementado con Lovable
- **Base de Datos**: Supabase PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS

El sistema está listo para producción con todas las características principales implementadas.