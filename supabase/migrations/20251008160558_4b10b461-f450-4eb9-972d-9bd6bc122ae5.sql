-- Agregar campos faltantes a la tabla seguimientos para soportar oportunidades
ALTER TABLE public.seguimientos 
ADD COLUMN IF NOT EXISTS nombre text,
ADD COLUMN IF NOT EXISTS etapa text DEFAULT 'Prospecto' CHECK (etapa IN ('Prospecto', 'Propuesta', 'Negociación', 'Cerrado Ganado', 'Cerrado Perdido')),
ADD COLUMN IF NOT EXISTS monto numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS probabilidad integer DEFAULT 0 CHECK (probabilidad >= 0 AND probabilidad <= 100),
ADD COLUMN IF NOT EXISTS cierre_esperado date,
ADD COLUMN IF NOT EXISTS motivo_perdida text,
ADD COLUMN IF NOT EXISTS fecha_cierre date,
ADD COLUMN IF NOT EXISTS monto_cerrado numeric;

-- Actualizar registros existentes con valores por defecto
UPDATE public.seguimientos 
SET etapa = 'Prospecto' 
WHERE etapa IS NULL;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_seguimientos_etapa ON public.seguimientos(etapa);
CREATE INDEX IF NOT EXISTS idx_seguimientos_cierre_esperado ON public.seguimientos(cierre_esperado);
CREATE INDEX IF NOT EXISTS idx_seguimientos_vendedor ON public.seguimientos(vendedor_id);

-- Vista materializada para listado optimizado
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_seguimientos_listado AS
SELECT 
  s.id,
  COALESCE(s.nombre, 'Seguimiento sin nombre') as nombre,
  c.nombre as cliente,
  s.etapa,
  s.monto,
  s.probabilidad,
  s.cierre_esperado,
  s.vendedor_id,
  up.nombre as propietario,
  s.created_at as fecha_creacion,
  s.prioridad,
  s.estado,
  s.notas,
  s.motivo_perdida,
  s.fecha_cierre,
  s.monto_cerrado,
  s.cotizacion_id,
  s.cliente_id
FROM public.seguimientos s
LEFT JOIN public.clientes c ON c.id = s.cliente_id
LEFT JOIN public.user_profiles up ON up.id = s.vendedor_id;

-- Índice para la vista
CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_seguimientos_listado_id 
ON public.vw_seguimientos_listado(id);

-- Función para refrescar la vista
CREATE OR REPLACE FUNCTION public.refresh_seguimientos_listado()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_seguimientos_listado;
  RETURN NULL;
END;
$function$;

-- Trigger para refrescar vista automáticamente
DROP TRIGGER IF EXISTS trigger_refresh_seguimientos_listado ON public.seguimientos;
CREATE TRIGGER trigger_refresh_seguimientos_listado
AFTER INSERT OR UPDATE OR DELETE ON public.seguimientos
FOR EACH STATEMENT
EXECUTE FUNCTION public.refresh_seguimientos_listado();