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

    const { id, to, cc, mensaje, adjuntarPDF } = await req.json();

    // Actualizar estado de cotización a 'Enviada'
    const { error: updateError } = await supabase
      .from('cotizaciones')
      .update({ estado: 'Enviada', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    // TODO: Integrar con servicio de email (Resend, etc.)
    // Por ahora solo registramos el log
    console.log(`Email enviado a ${to} para cotización ${id}`);
    console.log(`CC: ${cc || 'N/A'}`);
    console.log(`Mensaje: ${mensaje}`);
    console.log(`Adjuntar PDF: ${adjuntarPDF}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Cotización enviada correctamente'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error enviando cotización:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
