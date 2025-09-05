# Seeds de Datos - Bioscom CRM/ERP

Este documento explica cómo ejecutar y gestionar los datos semilla del sistema Bioscom.

## Archivos de Seeds

### `db/seeds/seed_bioscom.sql`
Archivo principal que contiene todos los datos de prueba del sistema.

**Características:**
- **Idempotente**: Se puede ejecutar múltiples veces sin problemas
- **Seguro**: Usa `ON CONFLICT` para evitar duplicados
- **Completo**: Incluye datos para todos los módulos

## Instrucciones de Ejecución

### 1. Desde Supabase Dashboard

1. Accede al [SQL Editor de Supabase](https://supabase.com/dashboard/project/emwjnjqmyzuzuuwglwxf/sql/new)
2. Copia y pega el contenido completo de `db/seeds/seed_bioscom.sql`
3. Ejecuta el script completo (Ctrl+Enter o botón "Run")
4. Verifica que no haya errores en la consola

### 2. Verificación de Datos

Después de ejecutar el seed, verifica que los datos se crearon correctamente:

```sql
-- Verificar clientes
SELECT COUNT(*) as total_clientes FROM public.clientes;

-- Verificar productos
SELECT COUNT(*) as total_productos FROM public.productos;

-- Verificar cotizaciones con items
SELECT c.codigo, COUNT(ci.id) as items 
FROM public.cotizaciones c 
LEFT JOIN public.cotizacion_items ci ON ci.cotizacion_id = c.id 
GROUP BY c.codigo;

-- Verificar facturas y cobranzas
SELECT f.numero_factura, f.estado, c.estado as estado_cobranza
FROM public.facturas f 
LEFT JOIN public.cobranzas c ON c.factura_id = f.id;
```

## Datos Creados

### Clientes (3 registros)
- **Comercial Andina SpA** (76543210-5) - Cliente VIP activo
- **Servicios Patagónicos Ltda.** (65432109-4) - Cliente nuevo
- **Minera del Norte SA** (87654321-0) - Cliente VIP minería

### Productos (4 registros)
- Router Industrial X1 (PROD-001)
- Switch 8p Gigabit (PROD-002)  
- Antena Panel 9dBi (PROD-003)
- Cámara IP PTZ (PROD-004)

### Cotizaciones (2 registros)
- COT-2024-001: Red industrial para Comercial Andina
- COT-2024-002: Sistema seguridad para Minera del Norte

### Facturas (3 registros)
- F-2024-1001: $590.000 (Pendiente)
- F-2024-1002: $1.800.000 (Vencida) 
- F-2024-1003: $125.000 (Pagada)

### Servicios Técnicos (2 registros)
- ST-2024-00001: Correctivo router (Alta prioridad)
- ST-2024-00002: Preventivo cámaras (Media prioridad)

### Despachos (2 registros)
- DESP-2024-00001: Para Comercial Andina (Preparando)
- DESP-2024-00002: Para Servicios Patagónicos (Pendiente)

## Re-ejecución

El script es completamente **idempotente**, significa que:

- ✅ Se puede ejecutar múltiples veces
- ✅ No duplicará datos existentes  
- ✅ Actualizará campos permitidos
- ✅ Respetará restricciones FK y unique

### Limpiar Datos (Opcional)

Si necesitas limpiar todos los datos:

```sql
-- ⚠️ CUIDADO: Esto borra TODOS los datos
TRUNCATE TABLE public.audit_log CASCADE;
TRUNCATE TABLE public.despacho_checklists CASCADE;
TRUNCATE TABLE public.despachos CASCADE;
TRUNCATE TABLE public.informes_tecnicos CASCADE;
TRUNCATE TABLE public.servicios_tecnicos CASCADE;
TRUNCATE TABLE public.pagos CASCADE;
TRUNCATE TABLE public.gestiones_cobranza CASCADE;
TRUNCATE TABLE public.cobranzas CASCADE;
TRUNCATE TABLE public.facturas CASCADE;
TRUNCATE TABLE public.seguimientos CASCADE;
TRUNCATE TABLE public.tareas CASCADE;
TRUNCATE TABLE public.cotizacion_items CASCADE;
TRUNCATE TABLE public.cotizaciones CASCADE;
TRUNCATE TABLE public.inventario CASCADE;
TRUNCATE TABLE public.productos CASCADE;
TRUNCATE TABLE public.contactos CASCADE;
TRUNCATE TABLE public.clientes CASCADE;
TRUNCATE TABLE public.categorias CASCADE;
```

## Personalización

Para personalizar los datos:

1. Edita `db/seeds/seed_bioscom.sql`
2. Modifica valores como nombres, RUTs, montos, fechas
3. Mantén la estructura `ON CONFLICT` para idempotencia
4. Re-ejecuta el script

## Solución de Problemas

### Error: "relation does not exist"
- Verifica que todas las tablas estén creadas
- Ejecuta las migraciones primero

### Error: "duplicate key value"
- Normal en re-ejecuciones
- El script debería manejar conflictos automáticamente

### Error: "violates foreign key constraint"  
- Verifica que existan las tablas referenciadas
- Revisa el orden de inserción en el script

## Datos de Usuarios

Los seeds requieren al menos un usuario en `auth.users`. Si no hay usuarios:

1. Registra un usuario desde la aplicación
2. O crea uno manualmente en Supabase Auth
3. Luego ejecuta los seeds

## Contacto

Para problemas con los seeds, contacta al equipo de desarrollo.