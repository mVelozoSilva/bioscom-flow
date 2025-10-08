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

    const { seguimientoId, etapaNueva, datos } = await req.json();

    console.log('Moviendo seguimiento a nueva etapa:', {
      seguimientoId,
      etapaNueva,
      datos,
    });

    // Preparar actualización
    const updateData: any = {
      etapa: etapaNueva,
      updated_at: new Date().toISOString(),
    };

    if (etapaNueva === 'Cerrado Ganado' && datos) {
      if (datos.fechaCierre) {
        updateData.fecha_cierre = datos.fechaCierre;
      }
      if (datos.montoCerrado) {
        updateData.monto_cerrado = datos.montoCerrado;
      }
    }

    if (etapaNueva === 'Cerrado Perdido' && datos?.motivoPerdida) {
      updateData.motivo_perdida = datos.motivoPerdida;
    }

    // Actualizar seguimiento
    const { data: seguimiento, error } = await supabase
      .from('seguimientos')
      .update(updateData)
      .eq('id', seguimientoId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar seguimiento:', error);
      throw error;
    }

    console.log('Seguimiento actualizado exitosamente:', seguimiento);

    return new Response(JSON.stringify({ success: true, seguimiento }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error en mover-etapa-seguimiento:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
