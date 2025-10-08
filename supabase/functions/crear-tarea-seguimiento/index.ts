import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { seguimientoId, datos } = await req.json();

    console.log('Creando tarea para seguimiento:', { seguimientoId, datos });

    // Obtener datos del seguimiento
    const { data: seguimiento, error: seguimientoError } = await supabase
      .from('seguimientos')
      .select('*, cliente_id')
      .eq('id', seguimientoId)
      .single();

    if (seguimientoError) {
      console.error('Error al obtener seguimiento:', seguimientoError);
      throw seguimientoError;
    }

    // Crear la tarea
    const { data: tarea, error: tareaError } = await supabase
      .from('tareas')
      .insert({
        titulo: datos.titulo,
        descripcion: datos.descripcion || '',
        fecha_vencimiento: datos.fecha_vencimiento,
        usuario_asignado: datos.usuario_asignado,
        origen: 'Seguimiento',
        origen_id: seguimientoId,
        cliente_id: seguimiento.cliente_id,
        estado: 'Pendiente',
        prioridad: 'Media',
      })
      .select()
      .single();

    if (tareaError) {
      console.error('Error al crear tarea:', tareaError);
      throw tareaError;
    }

    console.log('Tarea creada exitosamente:', tarea);

    return new Response(JSON.stringify({ success: true, tarea }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error en crear-tarea-seguimiento:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
