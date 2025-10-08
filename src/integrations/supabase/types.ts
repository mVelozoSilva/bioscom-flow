export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      adjuntos_tecnicos: {
        Row: {
          archivo_url: string
          created_at: string | null
          id: string
          informe_id: string | null
          nombre_archivo: string | null
          tipo_archivo: string | null
        }
        Insert: {
          archivo_url: string
          created_at?: string | null
          id?: string
          informe_id?: string | null
          nombre_archivo?: string | null
          tipo_archivo?: string | null
        }
        Update: {
          archivo_url?: string
          created_at?: string | null
          id?: string
          informe_id?: string | null
          nombre_archivo?: string | null
          tipo_archivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adjuntos_tecnicos_informe_id_fkey"
            columns: ["informe_id"]
            isOneToOne: false
            referencedRelation: "informes_tecnicos"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          entity: string
          entity_id: string
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity: string
          entity_id: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity?: string
          entity_id?: string
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string | null
          direccion: string | null
          estado_relacional: string | null
          id: string
          last_interaction_at: string | null
          nombre: string
          rut: string
          score: number | null
          tags: Json | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          direccion?: string | null
          estado_relacional?: string | null
          id?: string
          last_interaction_at?: string | null
          nombre: string
          rut: string
          score?: number | null
          tags?: Json | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          direccion?: string | null
          estado_relacional?: string | null
          id?: string
          last_interaction_at?: string | null
          nombre?: string
          rut?: string
          score?: number | null
          tags?: Json | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cobranzas: {
        Row: {
          asignado_a: string | null
          cliente_id: string | null
          created_at: string | null
          dias_vencido: number | null
          estado: string | null
          factura_id: string | null
          id: string
          notas: string | null
          proxima_gestion_at: string | null
          ultima_gestion_at: string | null
          updated_at: string | null
        }
        Insert: {
          asignado_a?: string | null
          cliente_id?: string | null
          created_at?: string | null
          dias_vencido?: number | null
          estado?: string | null
          factura_id?: string | null
          id?: string
          notas?: string | null
          proxima_gestion_at?: string | null
          ultima_gestion_at?: string | null
          updated_at?: string | null
        }
        Update: {
          asignado_a?: string | null
          cliente_id?: string | null
          created_at?: string | null
          dias_vencido?: number | null
          estado?: string | null
          factura_id?: string | null
          id?: string
          notas?: string | null
          proxima_gestion_at?: string | null
          ultima_gestion_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cobranzas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cobranzas_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
        ]
      }
      contactos: {
        Row: {
          cargo: string | null
          cliente_id: string | null
          created_at: string | null
          email: string | null
          id: string
          nombre: string
          principal: boolean | null
          telefono: string | null
        }
        Insert: {
          cargo?: string | null
          cliente_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre: string
          principal?: boolean | null
          telefono?: string | null
        }
        Update: {
          cargo?: string | null
          cliente_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nombre?: string
          principal?: boolean | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contactos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizacion_items: {
        Row: {
          cantidad: number
          cotizacion_id: string | null
          created_at: string | null
          id: string
          precio_unit: number
          producto_id: string | null
          total_linea: number
        }
        Insert: {
          cantidad: number
          cotizacion_id?: string | null
          created_at?: string | null
          id?: string
          precio_unit: number
          producto_id?: string | null
          total_linea: number
        }
        Update: {
          cantidad?: number
          cotizacion_id?: string | null
          created_at?: string | null
          id?: string
          precio_unit?: number
          producto_id?: string | null
          total_linea?: number
        }
        Relationships: [
          {
            foreignKeyName: "cotizacion_items_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizacion_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          cliente_id: string | null
          codigo: string
          contacto_id: string | null
          created_at: string | null
          estado: string | null
          fecha_expiracion: string | null
          id: string
          motivo_rechazo: string | null
          observaciones: string | null
          pdf_url: string | null
          score: number | null
          tarea_id: string | null
          updated_at: string | null
          vendedor_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          codigo: string
          contacto_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_expiracion?: string | null
          id?: string
          motivo_rechazo?: string | null
          observaciones?: string | null
          pdf_url?: string | null
          score?: number | null
          tarea_id?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          codigo?: string
          contacto_id?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_expiracion?: string | null
          id?: string
          motivo_rechazo?: string | null
          observaciones?: string | null
          pdf_url?: string | null
          score?: number | null
          tarea_id?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "contactos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      despacho_checklists: {
        Row: {
          categoria: string | null
          created_at: string | null
          cumplido: boolean | null
          despacho_id: string | null
          id: string
          item: string
          nota: string | null
          obligatorio: boolean | null
          orden_display: number | null
          verificado_at: string | null
          verificado_por: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          cumplido?: boolean | null
          despacho_id?: string | null
          id?: string
          item: string
          nota?: string | null
          obligatorio?: boolean | null
          orden_display?: number | null
          verificado_at?: string | null
          verificado_por?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          cumplido?: boolean | null
          despacho_id?: string | null
          id?: string
          item?: string
          nota?: string | null
          obligatorio?: boolean | null
          orden_display?: number | null
          verificado_at?: string | null
          verificado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "despacho_checklists_despacho_id_fkey"
            columns: ["despacho_id"]
            isOneToOne: false
            referencedRelation: "despachos"
            referencedColumns: ["id"]
          },
        ]
      }
      despachos: {
        Row: {
          archivos_adjuntos: Json | null
          checklist: Json | null
          cliente_id: string | null
          codigo_despacho: string | null
          contacto: string
          cotizacion_id: string | null
          created_at: string | null
          direccion: string
          email: string | null
          estado: string | null
          fecha_confirmacion: string | null
          hora_entrega: string | null
          id: string
          institucion: string
          numero_guia: string | null
          numero_orden: string | null
          observaciones: string | null
          plazo_entrega: string | null
          productos_despachados: Json | null
          responsable_entrega: string | null
          rut_institucion: string | null
          telefono: string | null
          telefono_responsable: string | null
          tipo_despacho: string | null
          transportista: string | null
          updated_at: string | null
          vendedor_id: string | null
        }
        Insert: {
          archivos_adjuntos?: Json | null
          checklist?: Json | null
          cliente_id?: string | null
          codigo_despacho?: string | null
          contacto: string
          cotizacion_id?: string | null
          created_at?: string | null
          direccion: string
          email?: string | null
          estado?: string | null
          fecha_confirmacion?: string | null
          hora_entrega?: string | null
          id?: string
          institucion: string
          numero_guia?: string | null
          numero_orden?: string | null
          observaciones?: string | null
          plazo_entrega?: string | null
          productos_despachados?: Json | null
          responsable_entrega?: string | null
          rut_institucion?: string | null
          telefono?: string | null
          telefono_responsable?: string | null
          tipo_despacho?: string | null
          transportista?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Update: {
          archivos_adjuntos?: Json | null
          checklist?: Json | null
          cliente_id?: string | null
          codigo_despacho?: string | null
          contacto?: string
          cotizacion_id?: string | null
          created_at?: string | null
          direccion?: string
          email?: string | null
          estado?: string | null
          fecha_confirmacion?: string | null
          hora_entrega?: string | null
          id?: string
          institucion?: string
          numero_guia?: string | null
          numero_orden?: string | null
          observaciones?: string | null
          plazo_entrega?: string | null
          productos_despachados?: Json | null
          responsable_entrega?: string | null
          rut_institucion?: string | null
          telefono?: string | null
          telefono_responsable?: string | null
          tipo_despacho?: string | null
          transportista?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "despachos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despachos_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despachos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas: {
        Row: {
          archivo_pdf_url: string | null
          cliente_id: string | null
          created_at: string | null
          estado: string | null
          estado_documento: string | null
          fecha_emision: string
          fecha_vencimiento: string
          id: string
          monto: number
          numero_factura: string
          numero_ot_oc: string | null
          observaciones: string | null
          rut_cliente: string | null
          updated_at: string | null
        }
        Insert: {
          archivo_pdf_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          estado?: string | null
          estado_documento?: string | null
          fecha_emision: string
          fecha_vencimiento: string
          id?: string
          monto: number
          numero_factura: string
          numero_ot_oc?: string | null
          observaciones?: string | null
          rut_cliente?: string | null
          updated_at?: string | null
        }
        Update: {
          archivo_pdf_url?: string | null
          cliente_id?: string | null
          created_at?: string | null
          estado?: string | null
          estado_documento?: string | null
          fecha_emision?: string
          fecha_vencimiento?: string
          id?: string
          monto?: number
          numero_factura?: string
          numero_ot_oc?: string | null
          observaciones?: string | null
          rut_cliente?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      gestiones_cobranza: {
        Row: {
          comentario: string | null
          created_at: string | null
          factura_id: string | null
          fecha: string
          id: string
          proxima_accion: string | null
          responsable: string | null
          resultado: string
          tipo: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string | null
          factura_id?: string | null
          fecha: string
          id?: string
          proxima_accion?: string | null
          responsable?: string | null
          resultado: string
          tipo: string
        }
        Update: {
          comentario?: string | null
          created_at?: string | null
          factura_id?: string | null
          fecha?: string
          id?: string
          proxima_accion?: string | null
          responsable?: string | null
          resultado?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "gestiones_cobranza_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gestiones_cobranza_responsable_fkey"
            columns: ["responsable"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_gestiones: {
        Row: {
          adjuntos: Json | null
          cobranza_id: string | null
          comentario: string | null
          created_at: string | null
          factura_id: string | null
          id: string
          proxima_accion_at: string | null
          resultado: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          adjuntos?: Json | null
          cobranza_id?: string | null
          comentario?: string | null
          created_at?: string | null
          factura_id?: string | null
          id?: string
          proxima_accion_at?: string | null
          resultado: string
          tipo: string
          user_id?: string | null
        }
        Update: {
          adjuntos?: Json | null
          cobranza_id?: string | null
          comentario?: string | null
          created_at?: string | null
          factura_id?: string | null
          id?: string
          proxima_accion_at?: string | null
          resultado?: string
          tipo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historial_gestiones_cobranza_id_fkey"
            columns: ["cobranza_id"]
            isOneToOne: false
            referencedRelation: "cobranzas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_gestiones_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
        ]
      }
      informes_tecnicos: {
        Row: {
          acciones: string | null
          cliente_nombre: string | null
          created_at: string | null
          diagnostico: string | null
          enviado_cliente: boolean | null
          estado_informe: string | null
          fecha_servicio: string | null
          firma_tecnico: string | null
          id: string
          materiales_utilizados: Json | null
          numero: string
          observaciones: string | null
          pdf_url: string | null
          qr_code: string | null
          recomendaciones: string | null
          servicio_id: string | null
          tecnico_nombre: string | null
          tiempo_total_horas: number | null
        }
        Insert: {
          acciones?: string | null
          cliente_nombre?: string | null
          created_at?: string | null
          diagnostico?: string | null
          enviado_cliente?: boolean | null
          estado_informe?: string | null
          fecha_servicio?: string | null
          firma_tecnico?: string | null
          id?: string
          materiales_utilizados?: Json | null
          numero: string
          observaciones?: string | null
          pdf_url?: string | null
          qr_code?: string | null
          recomendaciones?: string | null
          servicio_id?: string | null
          tecnico_nombre?: string | null
          tiempo_total_horas?: number | null
        }
        Update: {
          acciones?: string | null
          cliente_nombre?: string | null
          created_at?: string | null
          diagnostico?: string | null
          enviado_cliente?: boolean | null
          estado_informe?: string | null
          fecha_servicio?: string | null
          firma_tecnico?: string | null
          id?: string
          materiales_utilizados?: Json | null
          numero?: string
          observaciones?: string | null
          pdf_url?: string | null
          qr_code?: string | null
          recomendaciones?: string | null
          servicio_id?: string | null
          tecnico_nombre?: string | null
          tiempo_total_horas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "informes_tecnicos_ticket_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "tickets_tecnicos"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario: {
        Row: {
          codigo_producto: string
          costo_promedio: number | null
          created_at: string | null
          estado: string | null
          id: string
          linea_negocio: string | null
          nombre_producto: string
          producto_id: string | null
          proveedor: string | null
          stock_actual: number | null
          stock_minimo: number | null
          stock_reservado: number | null
          ubicacion: string | null
          ultimo_ingreso: string | null
          ultimo_movimiento: string | null
          updated_at: string | null
        }
        Insert: {
          codigo_producto: string
          costo_promedio?: number | null
          created_at?: string | null
          estado?: string | null
          id?: string
          linea_negocio?: string | null
          nombre_producto: string
          producto_id?: string | null
          proveedor?: string | null
          stock_actual?: number | null
          stock_minimo?: number | null
          stock_reservado?: number | null
          ubicacion?: string | null
          ultimo_ingreso?: string | null
          ultimo_movimiento?: string | null
          updated_at?: string | null
        }
        Update: {
          codigo_producto?: string
          costo_promedio?: number | null
          created_at?: string | null
          estado?: string | null
          id?: string
          linea_negocio?: string | null
          nombre_producto?: string
          producto_id?: string | null
          proveedor?: string | null
          stock_actual?: number | null
          stock_minimo?: number | null
          stock_reservado?: number | null
          ubicacion?: string | null
          ultimo_ingreso?: string | null
          ultimo_movimiento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: true
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_items: {
        Row: {
          created_at: string | null
          id: string
          producto_id: string | null
          stock_actual: number | null
          stock_minimo: number | null
          ubicacion: string | null
          ultimo_movimiento: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          producto_id?: string | null
          stock_actual?: number | null
          stock_minimo?: number | null
          ubicacion?: string | null
          ultimo_movimiento?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          producto_id?: string | null
          stock_actual?: number | null
          stock_minimo?: number | null
          ubicacion?: string | null
          ultimo_movimiento?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventario_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: true
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          accion_url: string | null
          archivada: boolean | null
          categoria: string | null
          created_at: string | null
          id: string
          leida: boolean | null
          mensaje: string | null
          origen_id: string | null
          payload: Json | null
          prioridad: string | null
          tipo: string
          titulo: string
          user_id: string | null
        }
        Insert: {
          accion_url?: string | null
          archivada?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          leida?: boolean | null
          mensaje?: string | null
          origen_id?: string | null
          payload?: Json | null
          prioridad?: string | null
          tipo: string
          titulo: string
          user_id?: string | null
        }
        Update: {
          accion_url?: string | null
          archivada?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          leida?: boolean | null
          mensaje?: string | null
          origen_id?: string | null
          payload?: Json | null
          prioridad?: string | null
          tipo?: string
          titulo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orden_compra_pdf: {
        Row: {
          archivo_nombre: string | null
          archivo_pdf_url: string
          cliente_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          estado_ocr: string | null
          extraido_json: Json | null
          fecha_oc: string | null
          id: string
          monto_total: number | null
          numero_oc: string | null
          observaciones: string | null
          procesado_por: string | null
          updated_at: string | null
        }
        Insert: {
          archivo_nombre?: string | null
          archivo_pdf_url: string
          cliente_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          estado_ocr?: string | null
          extraido_json?: Json | null
          fecha_oc?: string | null
          id?: string
          monto_total?: number | null
          numero_oc?: string | null
          observaciones?: string | null
          procesado_por?: string | null
          updated_at?: string | null
        }
        Update: {
          archivo_nombre?: string | null
          archivo_pdf_url?: string
          cliente_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          estado_ocr?: string | null
          extraido_json?: Json | null
          fecha_oc?: string | null
          id?: string
          monto_total?: number | null
          numero_oc?: string | null
          observaciones?: string | null
          procesado_por?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orden_compra_pdf_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orden_compra_pdf_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      pagos: {
        Row: {
          archivo_url: string | null
          created_at: string | null
          factura_id: string | null
          fecha_pago: string
          id: string
          monto: number
          referencia: string | null
          tipo: string
          verificado: boolean | null
        }
        Insert: {
          archivo_url?: string | null
          created_at?: string | null
          factura_id?: string | null
          fecha_pago: string
          id?: string
          monto: number
          referencia?: string | null
          tipo: string
          verificado?: boolean | null
        }
        Update: {
          archivo_url?: string | null
          created_at?: string | null
          factura_id?: string | null
          fecha_pago?: string
          id?: string
          monto?: number
          referencia?: string | null
          tipo?: string
          verificado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
        ]
      }
      producto_relacion: {
        Row: {
          created_at: string | null
          id: string
          producto_id: string | null
          relacionado_id: string | null
          tipo_relacion: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          producto_id?: string | null
          relacionado_id?: string | null
          tipo_relacion?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          producto_id?: string | null
          relacionado_id?: string | null
          tipo_relacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producto_relacion_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producto_relacion_relacionado_id_fkey"
            columns: ["relacionado_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          actualizado_por: string | null
          alerta_stock: boolean | null
          categoria_id: string | null
          codigo_producto: string
          created_at: string | null
          descripcion_corta: string | null
          estado: boolean | null
          fecha_actualizacion: string | null
          id: string
          imagen_miniatura_url: string | null
          linea_negocio: string | null
          link_canva: string | null
          nombre: string
          pdf_presentacion_url: string | null
          precio_neto: number
          stock_referencial: number | null
          tags: Json | null
          version_visual: number | null
        }
        Insert: {
          actualizado_por?: string | null
          alerta_stock?: boolean | null
          categoria_id?: string | null
          codigo_producto: string
          created_at?: string | null
          descripcion_corta?: string | null
          estado?: boolean | null
          fecha_actualizacion?: string | null
          id?: string
          imagen_miniatura_url?: string | null
          linea_negocio?: string | null
          link_canva?: string | null
          nombre: string
          pdf_presentacion_url?: string | null
          precio_neto: number
          stock_referencial?: number | null
          tags?: Json | null
          version_visual?: number | null
        }
        Update: {
          actualizado_por?: string | null
          alerta_stock?: boolean | null
          categoria_id?: string | null
          codigo_producto?: string
          created_at?: string | null
          descripcion_corta?: string | null
          estado?: boolean | null
          fecha_actualizacion?: string | null
          id?: string
          imagen_miniatura_url?: string | null
          linea_negocio?: string | null
          link_canva?: string | null
          nombre?: string
          pdf_presentacion_url?: string | null
          precio_neto?: number
          stock_referencial?: number | null
          tags?: Json | null
          version_visual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_actualizado_por_fkey"
            columns: ["actualizado_por"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      seguimientos: {
        Row: {
          cierre_esperado: string | null
          cliente_id: string | null
          cotizacion_id: string | null
          created_at: string | null
          estado: string | null
          etapa: string | null
          fecha_cierre: string | null
          id: string
          monto: number | null
          monto_cerrado: number | null
          motivo_perdida: string | null
          nombre: string | null
          notas: string | null
          origen: string | null
          prioridad: string | null
          probabilidad: number | null
          proxima_gestion: string | null
          tarea_programada_id: string | null
          ultima_gestion: string | null
          updated_at: string | null
          vendedor_id: string | null
        }
        Insert: {
          cierre_esperado?: string | null
          cliente_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          estado?: string | null
          etapa?: string | null
          fecha_cierre?: string | null
          id?: string
          monto?: number | null
          monto_cerrado?: number | null
          motivo_perdida?: string | null
          nombre?: string | null
          notas?: string | null
          origen?: string | null
          prioridad?: string | null
          probabilidad?: number | null
          proxima_gestion?: string | null
          tarea_programada_id?: string | null
          ultima_gestion?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Update: {
          cierre_esperado?: string | null
          cliente_id?: string | null
          cotizacion_id?: string | null
          created_at?: string | null
          estado?: string | null
          etapa?: string | null
          fecha_cierre?: string | null
          id?: string
          monto?: number | null
          monto_cerrado?: number | null
          motivo_perdida?: string | null
          nombre?: string | null
          notas?: string | null
          origen?: string | null
          prioridad?: string | null
          probabilidad?: number | null
          proxima_gestion?: string | null
          tarea_programada_id?: string | null
          ultima_gestion?: string | null
          updated_at?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguimientos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimientos_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimientos_tarea_programada_id_fkey"
            columns: ["tarea_programada_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimientos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      servicios_tecnicos: {
        Row: {
          cliente_id: string | null
          contacto_cliente: string | null
          created_at: string | null
          descripcion: string
          equipo: string
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          fecha_programada: string | null
          id: string
          marca: string | null
          modelo: string | null
          numero_serie: string | null
          numero_ticket: string
          observaciones: string | null
          origen: string
          prioridad: string | null
          referencias_cotizacion: string | null
          solucion: string | null
          tecnico_id: string | null
          telefono_contacto: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          contacto_cliente?: string | null
          created_at?: string | null
          descripcion: string
          equipo: string
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_programada?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          numero_ticket?: string
          observaciones?: string | null
          origen: string
          prioridad?: string | null
          referencias_cotizacion?: string | null
          solucion?: string | null
          tecnico_id?: string | null
          telefono_contacto?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          contacto_cliente?: string | null
          created_at?: string | null
          descripcion?: string
          equipo?: string
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_programada?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          numero_serie?: string | null
          numero_ticket?: string
          observaciones?: string | null
          origen?: string
          prioridad?: string | null
          referencias_cotizacion?: string | null
          solucion?: string | null
          tecnico_id?: string | null
          telefono_contacto?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servicios_tecnicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicios_tecnicos_referencias_cotizacion_fkey"
            columns: ["referencias_cotizacion"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      tareas: {
        Row: {
          bloque_fin: string | null
          bloque_inicio: string | null
          cliente_id: string | null
          creado_por: string | null
          created_at: string | null
          descripcion: string | null
          estado: string | null
          fecha_vencimiento: string | null
          hora_estimada: number | null
          id: string
          intervalo_dias: number | null
          origen: string
          origen_id: string | null
          prioridad: string | null
          recurrente: boolean | null
          regla_recurrencia: string | null
          sugerida_por: string | null
          tags: Json | null
          titulo: string
          updated_at: string | null
          usuario_asignado: string | null
        }
        Insert: {
          bloque_fin?: string | null
          bloque_inicio?: string | null
          cliente_id?: string | null
          creado_por?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_vencimiento?: string | null
          hora_estimada?: number | null
          id?: string
          intervalo_dias?: number | null
          origen: string
          origen_id?: string | null
          prioridad?: string | null
          recurrente?: boolean | null
          regla_recurrencia?: string | null
          sugerida_por?: string | null
          tags?: Json | null
          titulo: string
          updated_at?: string | null
          usuario_asignado?: string | null
        }
        Update: {
          bloque_fin?: string | null
          bloque_inicio?: string | null
          cliente_id?: string | null
          creado_por?: string | null
          created_at?: string | null
          descripcion?: string | null
          estado?: string | null
          fecha_vencimiento?: string | null
          hora_estimada?: number | null
          id?: string
          intervalo_dias?: number | null
          origen?: string
          origen_id?: string | null
          prioridad?: string | null
          recurrente?: boolean | null
          regla_recurrencia?: string | null
          sugerida_por?: string | null
          tags?: Json | null
          titulo?: string
          updated_at?: string | null
          usuario_asignado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tareas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_sugerida_por_fkey"
            columns: ["sugerida_por"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_usuario_asignado_fkey"
            columns: ["usuario_asignado"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_tecnicos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          descripcion: string
          equipo: string
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          fecha_programada: string | null
          id: string
          origen: string
          prioridad: string | null
          solucion: string | null
          tecnico_asignado: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          descripcion: string
          equipo: string
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_programada?: string | null
          id?: string
          origen: string
          prioridad?: string | null
          solucion?: string | null
          tecnico_asignado?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          descripcion?: string
          equipo?: string
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_programada?: string | null
          id?: string
          origen?: string
          prioridad?: string | null
          solucion?: string | null
          tecnico_asignado?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_tecnicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tecnicos_tecnico_asignado_fkey"
            columns: ["tecnico_asignado"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          activo: boolean | null
          created_at: string | null
          email: string
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          email: string
          id: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_seguimientos_listado: {
        Row: {
          cierre_esperado: string | null
          cliente: string | null
          cliente_id: string | null
          cotizacion_id: string | null
          estado: string | null
          etapa: string | null
          fecha_cierre: string | null
          fecha_creacion: string | null
          id: string | null
          monto: number | null
          monto_cerrado: number | null
          motivo_perdida: string | null
          nombre: string | null
          notas: string | null
          prioridad: string | null
          probabilidad: number | null
          propietario: string | null
          vendedor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguimientos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimientos_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimientos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      fn_normaliza_rut: {
        Args: { rut_input: string }
        Returns: string
      }
      fn_valida_rut: {
        Args: { rut_input: string }
        Returns: boolean
      }
      has_role: {
        Args: { role_name: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
