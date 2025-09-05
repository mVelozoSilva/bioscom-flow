import React, { useState, useEffect } from 'react';
import { Layout as BioscomLayout } from '@/components/bioscom/layout';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  Settings,
  FileText,
  Download,
  QrCode,
  Calendar,
  Plus,
  Edit,
  Eye
} from 'lucide-react';

interface ServicioTecnico {
  id: string;
  numero_ticket: string;
  tipo: 'correctivo' | 'preventivo' | 'instalacion' | 'capacitacion';
  cliente_id: string;
  contacto_cliente?: string;
  telefono_contacto?: string;
  equipo: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  estado: 'pendiente' | 'asignado' | 'en_proceso' | 'completado' | 'cancelado';
  tecnico_id?: string;
  origen: 'telefono' | 'email' | 'whatsapp' | 'presencial' | 'preventivo';
  descripcion: string;
  fecha_programada?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  solucion?: string;
  observaciones?: string;
  referencias_cotizacion?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  clientes?: {
    nombre: string;
    rut: string;
    tipo: string;
  };
  user_profiles?: {
    nombre: string;
  };
}

interface InformeTecnico {
  id: string;
  servicio_id: string;
  numero: string;
  diagnostico?: string;
  acciones?: string;
  recomendaciones?: string;
  observaciones?: string;
  tecnico_nombre?: string;
  cliente_nombre?: string;
  fecha_servicio: string;
  tiempo_total_horas?: number;
  materiales_utilizados: any[];
  estado_informe: 'borrador' | 'finalizado' | 'enviado';
  firma_tecnico?: string;
  pdf_url?: string;
  qr_code?: string;
  created_at: string;
}

export default function ServicioTecnico() {
  const [servicios, setServicios] = useState<ServicioTecnico[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<ServicioTecnico | null>(null);
  const [informeActual, setInformeActual] = useState<InformeTecnico | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInformeModal, setShowInformeModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');
  const { toast } = useToast();

  // Estados para formulario
  const [formData, setFormData] = useState({
    tipo: '',
    cliente_id: '',
    contacto_cliente: '',
    telefono_contacto: '',
    equipo: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    prioridad: 'media',
    origen: '',
    descripcion: '',
    fecha_programada: '',
    observaciones: ''
  });

  // Estados para informe técnico
  const [informeData, setInformeData] = useState({
    diagnostico: '',
    acciones: '',
    recomendaciones: '',
    observaciones: '',
    tiempo_total_horas: '',
    materiales_utilizados: [] as any[]
  });

  const estadoColors = {
    pendiente: 'destructive',
    asignado: 'default',
    en_proceso: 'default',
    completado: 'success',
    cancelado: 'secondary'
  } as const;

  const estadoLabels = {
    pendiente: 'Pendiente',
    asignado: 'Asignado',
    en_proceso: 'En Proceso',
    completado: 'Completado',
    cancelado: 'Cancelado'
  };

  const prioridadColors = {
    baja: 'secondary',
    media: 'default',
    alta: 'default',
    urgente: 'destructive'
  } as const;

  const prioridadLabels = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    urgente: 'Urgente'
  };

  const tipoLabels = {
    correctivo: 'Correctivo',
    preventivo: 'Preventivo',
    instalacion: 'Instalación',
    capacitacion: 'Capacitación'
  };

  const origenLabels = {
    telefono: 'Teléfono',
    email: 'Email',
    whatsapp: 'WhatsApp',
    presencial: 'Presencial',
    preventivo: 'Preventivo'
  };

  const columns: ColumnDef<ServicioTecnico>[] = [
    {
      accessorKey: 'numero_ticket',
      header: 'N° Ticket',
      cell: ({ row }) => {
        const numero = row.original.numero_ticket;
        return <span className="font-mono text-sm">{numero}</span>;
      }
    },
    {
      accessorKey: 'clientes.nombre',
      header: 'Cliente',
      cell: ({ row }) => {
        const cliente = row.original.clientes;
        return (
          <div>
            <div className="font-medium">{cliente?.nombre}</div>
            <div className="text-sm text-muted-foreground">{row.original.contacto_cliente}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'equipo',
      header: 'Equipo',
      cell: ({ row }) => {
        const servicio = row.original;
        return (
          <div>
            <div className="font-medium">{servicio.equipo}</div>
            <div className="text-sm text-muted-foreground">
              {servicio.marca} {servicio.modelo}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: ({ row }) => {
        const tipo = row.original.tipo;
        return <Badge variant="outline">{tipoLabels[tipo]}</Badge>;
      }
    },
    {
      accessorKey: 'prioridad',
      header: 'Prioridad',
      cell: ({ row }) => {
        const prioridad = row.original.prioridad;
        return (
          <Badge variant={prioridadColors[prioridad]}>
            {prioridadLabels[prioridad]}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.original.estado;
        return (
          <Badge variant={estadoColors[estado]}>
            {estadoLabels[estado]}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'user_profiles.nombre',
      header: 'Técnico',
      cell: ({ row }) => {
        const tecnico = row.original.user_profiles?.nombre;
        return tecnico ? (
          <span className="text-sm">{tecnico}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Sin asignar</span>
        );
      }
    },
    {
      accessorKey: 'fecha_programada',
      header: 'Fecha Programada',
      cell: ({ row }) => {
        const fecha = row.original.fecha_programada;
        return fecha ? (
          <span className="text-sm">
            {format(new Date(fecha), 'dd/MM/yyyy', { locale: es })}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const servicio = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedServicio(servicio);
                setModalMode('view');
                setShowModal(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedServicio(servicio);
                setModalMode('edit');
                setFormData({
                  tipo: servicio.tipo,
                  cliente_id: servicio.cliente_id,
                  contacto_cliente: servicio.contacto_cliente || '',
                  telefono_contacto: servicio.telefono_contacto || '',
                  equipo: servicio.equipo,
                  marca: servicio.marca || '',
                  modelo: servicio.modelo || '',
                  numero_serie: servicio.numero_serie || '',
                  prioridad: servicio.prioridad,
                  origen: servicio.origen,
                  descripcion: servicio.descripcion,
                  fecha_programada: servicio.fecha_programada || '',
                  observaciones: servicio.observaciones || ''
                });
                setShowModal(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {servicio.estado === 'completado' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => abrirInforme(servicio)}
              >
                <FileText className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  const loadServicios = async () => {
    try {
      const { data, error } = await supabase
        .from('servicios_tecnicos')
        .select(`
          *,
          clientes (
            nombre,
            rut,
            tipo
          ),
          user_profiles (
            nombre
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServicios((data || []).map(item => {
        const { user_profiles, ...cleanItem } = item;
        return {
          ...cleanItem,
          tipo: item.tipo as 'correctivo' | 'preventivo' | 'instalacion' | 'capacitacion',
          prioridad: item.prioridad?.toLowerCase() as 'baja' | 'media' | 'alta' | 'urgente',
          estado: item.estado?.toLowerCase() as 'pendiente' | 'asignado' | 'en_proceso' | 'completado' | 'cancelado',
          origen: item.origen?.toLowerCase() as 'whatsapp' | 'preventivo' | 'telefono' | 'email' | 'presencial'
        };
      }));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios técnicos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const crearServicio = async () => {
    try {
      const { error } = await supabase
        .from('servicios_tecnicos')
        .insert({
          ...formData,
          fecha_programada: formData.fecha_programada || null,
        });

      if (error) throw error;

      toast({
        title: "Servicio creado",
        description: "El servicio técnico se ha creado correctamente",
      });

      setShowModal(false);
      setFormData({
        tipo: '',
        cliente_id: '',
        contacto_cliente: '',
        telefono_contacto: '',
        equipo: '',
        marca: '',
        modelo: '',
        numero_serie: '',
        prioridad: 'media',
        origen: '',
        descripcion: '',
        fecha_programada: '',
        observaciones: ''
      });
      loadServicios();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear el servicio",
        variant: "destructive",
      });
    }
  };

  const actualizarServicio = async () => {
    if (!selectedServicio) return;

    try {
      const { error } = await supabase
        .from('servicios_tecnicos')
        .update({
          ...formData,
          fecha_programada: formData.fecha_programada || null,
        })
        .eq('id', selectedServicio.id);

      if (error) throw error;

      toast({
        title: "Servicio actualizado",
        description: "El servicio técnico se ha actualizado correctamente",
      });

      setShowModal(false);
      loadServicios();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el servicio",
        variant: "destructive",
      });
    }
  };

  const abrirInforme = async (servicio: ServicioTecnico) => {
    try {
      // Buscar informe existente
      const { data: informeExistente } = await supabase
        .from('informes_tecnicos')
        .select('*')
        .eq('servicio_id', servicio.id)
        .single();

      if (informeExistente) {
        setInformeActual({
          ...informeExistente,
          materiales_utilizados: Array.isArray(informeExistente.materiales_utilizados) 
            ? informeExistente.materiales_utilizados 
            : [],
          estado_informe: informeExistente.estado_informe as 'borrador' | 'finalizado' | 'enviado'
        });
        setInformeData({
          diagnostico: informeExistente.diagnostico || '',
          acciones: informeExistente.acciones || '',
          recomendaciones: informeExistente.recomendaciones || '',
          observaciones: informeExistente.observaciones || '',
          tiempo_total_horas: informeExistente.tiempo_total_horas?.toString() || '',
          materiales_utilizados: Array.isArray(informeExistente.materiales_utilizados) 
            ? informeExistente.materiales_utilizados 
            : []
        });
      } else {
        // Crear nuevo informe
        const numeroInforme = `INF-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
        
        const { data: nuevoInforme, error } = await supabase
          .from('informes_tecnicos')
          .insert({
            servicio_id: servicio.id,
            numero: numeroInforme,
            tecnico_nombre: servicio.user_profiles?.nombre || '',
            cliente_nombre: servicio.clientes?.nombre || '',
            fecha_servicio: servicio.fecha_fin ? servicio.fecha_fin.split('T')[0] : new Date().toISOString().split('T')[0],
          })
          .select()
          .single();

        if (error) throw error;
        
        setInformeActual({
          ...nuevoInforme,
          materiales_utilizados: Array.isArray(nuevoInforme.materiales_utilizados) 
            ? nuevoInforme.materiales_utilizados 
            : [],
          estado_informe: nuevoInforme.estado_informe as 'borrador' | 'finalizado' | 'enviado'
        });
        setInformeData({
          diagnostico: '',
          acciones: '',
          recomendaciones: '',
          observaciones: '',
          tiempo_total_horas: '',
          materiales_utilizados: []
        });
      }

      setSelectedServicio(servicio);
      setShowInformeModal(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo abrir el informe técnico",
        variant: "destructive",
      });
    }
  };

  const guardarInforme = async () => {
    if (!informeActual) return;

    try {
      const { error } = await supabase
        .from('informes_tecnicos')
        .update({
          diagnostico: informeData.diagnostico,
          acciones: informeData.acciones,
          recomendaciones: informeData.recomendaciones,
          observaciones: informeData.observaciones,
          tiempo_total_horas: parseFloat(informeData.tiempo_total_horas) || null,
          materiales_utilizados: informeData.materiales_utilizados,
          estado_informe: 'finalizado'
        })
        .eq('id', informeActual.id);

      if (error) throw error;

      toast({
        title: "Informe guardado",
        description: "El informe técnico se ha guardado correctamente",
      });

      setShowInformeModal(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo guardar el informe",
        variant: "destructive",
      });
    }
  };

  const generarPDFInforme = async () => {
    if (!informeActual) return;

    try {
      // Simular generación de PDF
      const pdfUrl = `/informes/${informeActual.numero}.pdf`;
      const qrUrl = `https://bioscom.cl/informe-publico/${informeActual.id}`;

      const { error } = await supabase
        .from('informes_tecnicos')
        .update({
          pdf_url: pdfUrl,
          qr_code: qrUrl,
          estado_informe: 'enviado'
        })
        .eq('id', informeActual.id);

      if (error) throw error;

      toast({
        title: "PDF generado",
        description: "El informe PDF se ha generado con éxito",
      });

      // Actualizar el informe actual
      setInformeActual(prev => prev ? {
        ...prev,
        pdf_url: pdfUrl,
        qr_code: qrUrl,
        estado_informe: 'enviado' as const
      } : null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadServicios();
  }, []);

  // KPIs de servicio técnico
  const kpis = {
    ticketsActivos: servicios.filter(s => ['pendiente', 'asignado', 'en_proceso'].includes(s.estado)).length,
    completadosHoy: servicios.filter(s => {
      if (!s.fecha_fin) return false;
      return new Date(s.fecha_fin).toDateString() === new Date().toDateString();
    }).length,
    tiempoPromedio: '2.3h', // Calcular dinámicamente en implementación real
    satisfaccion: '4.7/5'    // Obtener de encuestas de satisfacción
  };

  return (
    <BioscomLayout>
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tickets Activos</p>
                  <p className="text-2xl font-bold">{kpis.ticketsActivos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completados Hoy</p>
                  <p className="text-2xl font-bold text-success">{kpis.completadosHoy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-info" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
                  <p className="text-2xl font-bold">{kpis.tiempoPromedio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Satisfacción</p>
                  <p className="text-2xl font-bold text-success">{kpis.satisfaccion}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de servicios */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Servicios Técnicos</CardTitle>
                <CardDescription>
                  Gestiona los servicios técnicos, mantenciones e informes
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setModalMode('create');
                  setSelectedServicio(null);
                  setShowModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Servicio
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={servicios}
              loading={loading}
              searchKey="numero_ticket"
              searchPlaceholder="Buscar por número de ticket..."
            />
          </CardContent>
        </Card>

        {/* Modal de Servicio */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {modalMode === 'create' ? 'Nuevo Servicio Técnico' : 
                 modalMode === 'edit' ? 'Editar Servicio' : 'Detalle del Servicio'}
              </DialogTitle>
              <DialogDescription>
                {selectedServicio ? `Ticket: ${selectedServicio.numero_ticket}` : 'Crear un nuevo servicio técnico'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Servicio</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="correctivo">Correctivo</SelectItem>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                      <SelectItem value="instalacion">Instalación</SelectItem>
                      <SelectItem value="capacitacion">Capacitación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Prioridad</Label>
                  <Select
                    value={formData.prioridad}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, prioridad: value }))}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contacto Cliente</Label>
                  <Input
                    value={formData.contacto_cliente}
                    onChange={(e) => setFormData(prev => ({ ...prev, contacto_cliente: e.target.value }))}
                    placeholder="Nombre del contacto"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.telefono_contacto}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono_contacto: e.target.value }))}
                    placeholder="Teléfono de contacto"
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div>
                <Label>Equipo</Label>
                <Input
                  value={formData.equipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipo: e.target.value }))}
                  placeholder="Nombre del equipo"
                  disabled={modalMode === 'view'}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Marca</Label>
                  <Input
                    value={formData.marca}
                    onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                    placeholder="Marca del equipo"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <Label>Modelo</Label>
                  <Input
                    value={formData.modelo}
                    onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                    placeholder="Modelo del equipo"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div>
                  <Label>Número de Serie</Label>
                  <Input
                    value={formData.numero_serie}
                    onChange={(e) => setFormData(prev => ({ ...prev, numero_serie: e.target.value }))}
                    placeholder="N° de serie"
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Origen del Servicio</Label>
                  <Select
                    value={formData.origen}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, origen: value }))}
                    disabled={modalMode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar origen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telefono">Teléfono</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="preventivo">Preventivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fecha Programada</Label>
                  <Input
                    type="date"
                    value={formData.fecha_programada}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_programada: e.target.value }))}
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div>
                <Label>Descripción del Problema</Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe el problema o servicio requerido..."
                  rows={3}
                  disabled={modalMode === 'view'}
                  required
                />
              </div>

              <div>
                <Label>Observaciones</Label>
                <Textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones adicionales..."
                  rows={2}
                  disabled={modalMode === 'view'}
                />
              </div>

              {modalMode !== 'view' && (
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={modalMode === 'create' ? crearServicio : actualizarServicio}
                    disabled={!formData.equipo || !formData.descripcion}
                    className="flex-1"
                  >
                    {modalMode === 'create' ? 'Crear Servicio' : 'Actualizar'}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Informe Técnico */}
        <Dialog open={showInformeModal} onOpenChange={setShowInformeModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Informe Técnico</DialogTitle>
              <DialogDescription>
                {informeActual?.numero} - {selectedServicio?.clientes?.nombre}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="informe" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="informe">Informe</TabsTrigger>
                <TabsTrigger value="pdf">PDF y QR</TabsTrigger>
              </TabsList>

              <TabsContent value="informe" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información del Servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ticket:</span>
                        <span className="font-mono">{selectedServicio?.numero_ticket}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente:</span>
                        <span>{selectedServicio?.clientes?.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Equipo:</span>
                        <span>{selectedServicio?.equipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Técnico:</span>
                        <span>{informeActual?.tecnico_nombre}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <div>
                      <Label>Tiempo Total (horas)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={informeData.tiempo_total_horas}
                        onChange={(e) => setInformeData(prev => ({ ...prev, tiempo_total_horas: e.target.value }))}
                        placeholder="Ej: 2.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Diagnóstico</Label>
                    <Textarea
                      value={informeData.diagnostico}
                      onChange={(e) => setInformeData(prev => ({ ...prev, diagnostico: e.target.value }))}
                      placeholder="Describe el diagnóstico del problema..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Acciones Realizadas</Label>
                    <Textarea
                      value={informeData.acciones}
                      onChange={(e) => setInformeData(prev => ({ ...prev, acciones: e.target.value }))}
                      placeholder="Describe las acciones realizadas..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Recomendaciones</Label>
                    <Textarea
                      value={informeData.recomendaciones}
                      onChange={(e) => setInformeData(prev => ({ ...prev, recomendaciones: e.target.value }))}
                      placeholder="Recomendaciones para el cliente..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Observaciones</Label>
                    <Textarea
                      value={informeData.observaciones}
                      onChange={(e) => setInformeData(prev => ({ ...prev, observaciones: e.target.value }))}
                      placeholder="Observaciones adicionales..."
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowInformeModal(false)} className="flex-1">
                    Cerrar
                  </Button>
                  <Button onClick={guardarInforme} className="flex-1">
                    Guardar Informe
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="pdf" className="space-y-4">
                <div className="text-center space-y-4">
                  {informeActual?.pdf_url ? (
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-success/5">
                        <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                        <p className="text-success font-medium">PDF generado exitosamente</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Estado: {informeActual.estado_informe === 'enviado' ? 'Enviado al cliente' : 'Finalizado'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" asChild>
                          <a href={informeActual.pdf_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar PDF
                          </a>
                        </Button>

                        {informeActual.qr_code && (
                          <Button variant="outline" asChild>
                            <a href={informeActual.qr_code} target="_blank" rel="noopener noreferrer">
                              <QrCode className="h-4 w-4 mr-2" />
                              Ver Público
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-8 border-2 border-dashed rounded-lg">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                          El PDF aún no ha sido generado
                        </p>
                        <Button onClick={generarPDFInforme}>
                          <FileText className="h-4 w-4 mr-2" />
                          Generar PDF
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </BioscomLayout>
  );
}