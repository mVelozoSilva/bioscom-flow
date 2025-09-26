-- Update the trigger function to use correct origen value
CREATE OR REPLACE FUNCTION public.crear_cobranza_automatica()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.cobranzas (factura_id, cliente_id, proxima_gestion_at)
  VALUES (NEW.id, NEW.cliente_id, NEW.fecha_vencimiento + INTERVAL '1 day');
  
  -- Crear tarea de cobranza con origen válido
  INSERT INTO public.tareas (
    titulo, 
    descripcion, 
    origen, 
    origen_id, 
    cliente_id,
    fecha_vencimiento,
    estado
  ) VALUES (
    'Cobranza Factura ' || NEW.numero_factura,
    'Gestionar cobro de factura por $' || NEW.monto::text,
    'Manual',  -- Changed from 'Cobranza' to 'Manual'
    NEW.id,
    NEW.cliente_id,
    NEW.fecha_vencimiento + INTERVAL '1 day',
    'Pendiente'
  );
  
  RETURN NEW;
END;
$function$;