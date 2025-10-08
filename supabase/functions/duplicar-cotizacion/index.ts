import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { id } = await req.json();

    // Obtener cotización original con items
    const { data: cotizacion, error: fetchError } = await supabase
      .from('cotizaciones')
      .select('*, items:cotizacion_items(*)')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Generar nuevo código
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('cotizaciones')
      .select('*', { count: 'exact', head: true })
      .like('codigo', `COT-${year}-%`);

    const nextNumber = (count || 0) + 1;
    const nuevoCodigo = `COT-${year}-${nextNumber.toString().padStart(3, '0')}`;

    // Crear nueva cotización
    const { data: nuevaCotizacion, error: createError } = await supabase
      .from('cotizaciones')
      .insert({
        codigo: nuevoCodigo,
        cliente_id: cotizacion.cliente_id,
        contacto_id: cotizacion.contacto_id,
        vendedor_id: cotizacion.vendedor_id,
        estado: 'Borrador',
        score: cotizacion.score,
        observaciones: cotizacion.observaciones,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Duplicar items si existen
    if (cotizacion.items && cotizacion.items.length > 0) {
      const nuevosItems = cotizacion.items.map((item: any) => ({
        cotizacion_id: nuevaCotizacion.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unit: item.precio_unit,
        total_linea: item.total_linea,
      }));

      const { error: itemsError } = await supabase
        .from('cotizacion_items')
        .insert(nuevosItems);

      if (itemsError) throw itemsError;
    }

    console.log(`Cotización duplicada: ${nuevoCodigo}`);

    return new Response(
      JSON.stringify({ cotizacion: nuevaCotizacion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error duplicando cotización:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
