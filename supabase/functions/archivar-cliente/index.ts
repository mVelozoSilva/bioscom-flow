import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar autenticación
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('Error de autenticación:', userError)
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { id } = await req.json()

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Falta parámetro requerido: id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Archivando cliente ${id}`)

    // Cambiar el estado a Inactivo como forma de archivado
    const { data: cliente, error: updateError } = await supabaseClient
      .from('clientes')
      .update({ 
        estado_relacional: 'Inactivo',
        updated_at: new Date().toISOString(),
        tags: ['archivado'] // Agregar tag de archivado
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error al archivar cliente:', updateError)
      return new Response(
        JSON.stringify({ error: 'Error al archivar el cliente' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Crear registro de auditoría
    await supabaseClient
      .from('audit_log')
      .insert({
        entity: 'clientes',
        entity_id: id,
        action: 'update',
        user_id: user.id,
        payload: {
          accion: 'archivar',
          timestamp: new Date().toISOString()
        }
      })

    console.log('Cliente archivado correctamente:', cliente)

    return new Response(
      JSON.stringify({ 
        success: true,
        cliente 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error en archivar-cliente:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
