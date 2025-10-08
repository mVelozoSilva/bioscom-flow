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

    const { id, nuevoEstado } = await req.json()

    if (!id || !nuevoEstado) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros requeridos: id y nuevoEstado' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validar que el estado sea válido
    const estadosValidos = ['Nuevo', 'Activo', 'Inactivo', 'Problemático']
    if (!estadosValidos.includes(nuevoEstado)) {
      return new Response(
        JSON.stringify({ error: 'Estado inválido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Cambiando estado del cliente ${id} a ${nuevoEstado}`)

    // Actualizar el estado del cliente
    const { data: cliente, error: updateError } = await supabaseClient
      .from('clientes')
      .update({ 
        estado_relacional: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error al actualizar cliente:', updateError)
      return new Response(
        JSON.stringify({ error: 'Error al actualizar el estado del cliente' }),
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
          campo: 'estado_relacional',
          valor_anterior: null,
          valor_nuevo: nuevoEstado
        }
      })

    console.log('Estado actualizado correctamente:', cliente)

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
    console.error('Error en cambiar-estado-cliente:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
