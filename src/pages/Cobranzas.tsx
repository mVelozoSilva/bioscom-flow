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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  Mail, 
  MessageSquare, 
  FileText,
  Calendar,
  User,
  Upload,
  Download,
  ExternalLink
} from 'lucide-react';

interface Cobranza {
  id: string;
  factura_id: string;
  cliente_id: string;
  estado: string;
  ultima_gestion_at?: string;
  proxima_gestion_at?: string;
  asignado_a?: string;
  notas?: string;
  dias_vencido: number;
  created_at: string;
  updated_at: string;
  // Relaciones
  facturas?: {
    numero_factura: string;
    monto: number;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: string;
  };
  clientes?: {
    nombre: string;
    rut: string;
    tipo: string;
  };
}

interface HistorialGestion {
  id: string;
  cobranza_id: string;
  factura_id: string;
  user_id?: string;
  tipo: string;
  resultado: string;
  comentario?: string;
  proxima_accion_at?: string;
  adjuntos: any[];
  created_at: string;
}

export default function Cobranzas() {
  const [cobranzas, setCobranzas] = useState<Cobranza[]>([]);
  const [historial, setHistorial] = useState<HistorialGestion[]>([]);
  const [selectedCobranza, setSelectedCobranza] = useState<Cobranza | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGestionModal, setShowGestionModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const { toast } = useToast();

  // Estados para nueva gestión
  const [nuevaGestion, setNuevaGestion] = useState({
    tipo: '',
    resultado: '',
    comentario: '',
    proxima_accion_at: '',
  });

  const estadoColors = {
    pendiente: 'destructive',
    gestionando: 'default',
    pagada: 'success',
    incobrable: 'secondary'
  } as const;

  const estadoLabels = {
    pendiente: 'Pendiente',
    gestionando: 'En Gestión',
    pagada: 'Pagada',
    incobrable: 'Incobrable'
  };

  const tipoGestionOptions = [
    { value: 'llamada', label: 'Llamada telefónica', icon: Phone },
    { value: 'email', label: 'Correo electrónico', icon: Mail },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { value: 'visita', label: 'Visita presencial', icon: User },
    { value: 'carta', label: 'Carta formal', icon: FileText }
  ];

  const resultadoOptions = [
    { value: 'contactado', label: 'Contactado exitosamente' },
    { value: 'sin_respuesta', label: 'Sin respuesta' },
    { value: 'promesa_pago', label: 'Promesa de pago' },
    { value: 'reclamo', label: 'Reclamo/Objeción' },
    { value: 'pagado', label: 'Pago confirmado' }
  ];

  const columns: ColumnDef<Cobranza>[] = [
    {
      accessorKey: 'facturas.numero_factura',
      header: 'N° Factura',
      cell: ({ row }) => {
        const numero = row.original.facturas?.numero_factura;
        return <span className="font-medium">{numero}</span>;
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
            <div className="text-sm text-muted-foreground">{cliente?.rut}</div>
          </div>
        );
      }
    },
    {
      accessorKey: 'facturas.monto',
      header: 'Monto',
      cell: ({ row }) => {
        const monto = row.original.facturas?.monto;
        return <span className="font-semibold">${monto?.toLocaleString()}</span>;
      }
    },
    {
      accessorKey: 'dias_vencido',
      header: 'Días Vencido',
      cell: ({ row }) => {
        const dias = row.original.dias_vencido;
        return (
          <Badge variant={dias > 30 ? 'destructive' : dias > 15 ? 'default' : 'secondary'}>
            {dias} días
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
          <Badge variant={estadoColors[estado as keyof typeof estadoColors] || 'default'}>
            {estadoLabels[estado as keyof typeof estadoLabels] || estado}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'proxima_gestion_at',
      header: 'Próxima Gestión',
      cell: ({ row }) => {
        const fecha = row.original.proxima_gestion_at;
        if (!fecha) return <span className="text-muted-foreground">-</span>;
        
        const fechaGestion = new Date(fecha);
        const hoy = new Date();
        const esHoy = fechaGestion.toDateString() === hoy.toDateString();
        const esPasada = fechaGestion < hoy;
        
        return (
          <div className={`text-sm ${esPasada ? 'text-error font-medium' : esHoy ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
            {format(fechaGestion, 'dd/MM/yyyy', { locale: es })}
            {esHoy && <div className="text-xs">¡Hoy!</div>}
            {esPasada && <div className="text-xs">¡Vencida!</div>}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const cobranza = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCobranza(cobranza);
                setShowDetalleModal(true);
                loadHistorial(cobranza.id);
              }}
            >
              <FileText className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setSelectedCobranza(cobranza);
                setShowGestionModal(true);
              }}
            >
              <Phone className="h-4 w-4 mr-1" />
              Gestionar
            </Button>
          </div>
        );
      }
    }
  ];

  const loadCobranzas = async () => {
    try {
      const { data, error } = await supabase
        .from('cobranzas')
        .select(`
          *,
          facturas (
            numero_factura,
            monto,
            fecha_emision,
            fecha_vencimiento,
            estado
          ),
          clientes (
            nombre,
            rut,
            tipo
          )
        `)
        .order('proxima_gestion_at', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setCobranzas(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las cobranzas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistorial = async (cobranzaId: string) => {
    try {
      const { data, error } = await supabase
        .from('historial_gestiones')
        .select('*')
        .eq('cobranza_id', cobranzaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistorial((data || []).map(item => ({
        ...item,
        adjuntos: Array.isArray(item.adjuntos) ? item.adjuntos : [],
        fecha: new Date(item.created_at),
        responsable: item.user_id,
        proxima_accion: item.proxima_accion_at ? new Date(item.proxima_accion_at) : undefined
      })));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar el historial",
        variant: "destructive",
      });
    }
  };

  const crearGestion = async () => {
    if (!selectedCobranza || !nuevaGestion.tipo || !nuevaGestion.resultado) return;

    try {
      const { error } = await supabase
        .from('historial_gestiones')
        .insert({
          cobranza_id: selectedCobranza.id,
          factura_id: selectedCobranza.factura_id,
          tipo: nuevaGestion.tipo,
          resultado: nuevaGestion.resultado,
          comentario: nuevaGestion.comentario,
          proxima_accion_at: nuevaGestion.proxima_accion_at || null,
        });

      if (error) throw error;

      // Actualizar estado de cobranza si es necesario
      if (nuevaGestion.resultado === 'pagado') {
        await supabase
          .from('cobranzas')
          .update({ estado: 'pagada' })
          .eq('id', selectedCobranza.id);
      }

      toast({
        title: "Gestión registrada",
        description: "La gestión se ha registrado correctamente",
      });

      setShowGestionModal(false);
      setNuevaGestion({ tipo: '', resultado: '', comentario: '', proxima_accion_at: '' });
      loadCobranzas();
      
      if (showDetalleModal) {
        loadHistorial(selectedCobranza.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo registrar la gestión",
        variant: "destructive",
      });
    }
  };

  const generateWhatsAppLink = (cliente: any, factura: any) => {
    const mensaje = `Hola, le escribimos desde Bioscom Chile. Queremos recordarle que tiene una factura pendiente de pago:

📄 Factura: ${factura?.numero_factura}
💰 Monto: $${factura?.monto?.toLocaleString()}
📅 Vencimiento: ${factura?.fecha_vencimiento ? format(new Date(factura.fecha_vencimiento), 'dd/MM/yyyy') : ''}

¿Podríamos coordinar el pago? Quedamos atentos.`;
    
    return `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
  };

  const generateEmailLink = (cliente: any, factura: any) => {
    const subject = `Recordatorio de Pago - Factura ${factura?.numero_factura}`;
    const body = `Estimado/a ${cliente?.nombre},

Esperamos que se encuentre bien. Le escribimos para recordarle que tiene una factura pendiente de pago:

Número de Factura: ${factura?.numero_factura}
Monto: $${factura?.monto?.toLocaleString()}
Fecha de Vencimiento: ${factura?.fecha_vencimiento ? format(new Date(factura.fecha_vencimiento), 'dd/MM/yyyy') : ''}

Agradecemos pueda gestionar el pago a la brevedad posible.

Saludos cordiales,
Equipo de Cobranzas
Bioscom Chile`;

    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  useEffect(() => {
    loadCobranzas();
  }, []);

  // KPIs de cobranza
  const kpis = {
    totalPorCobrar: cobranzas.reduce((sum, c) => sum + (c.facturas?.monto || 0), 0),
    vencidas: cobranzas.filter(c => c.dias_vencido > 0).length,
    gestionesHoy: cobranzas.filter(c => {
      if (!c.proxima_gestion_at) return false;
      return new Date(c.proxima_gestion_at).toDateString() === new Date().toDateString();
    }).length,
    tasaRecuperacion: Math.round((cobranzas.filter(c => c.estado === 'pagada').length / Math.max(cobranzas.length, 1)) * 100)
  };

  return (
    <BioscomLayout>
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Por Cobrar</p>
                  <p className="text-2xl font-bold">${kpis.totalPorCobrar.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-error" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Facturas Vencidas</p>
                  <p className="text-2xl font-bold text-error">{kpis.vencidas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-info" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gestiones Hoy</p>
                  <p className="text-2xl font-bold">{kpis.gestionesHoy}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tasa Recuperación</p>
                  <p className="text-2xl font-bold text-success">{kpis.tasaRecuperacion}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de cobranzas */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Cobranzas</CardTitle>
            <CardDescription>
              Gestiona las facturas pendientes de cobro y registra las gestiones realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={cobranzas}
              loading={loading}
              searchKey="clientes.nombre"
              searchPlaceholder="Buscar por cliente..."
            />
          </CardContent>
        </Card>

        {/* Modal de Nueva Gestión */}
        <Dialog open={showGestionModal} onOpenChange={setShowGestionModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Gestión</DialogTitle>
              <DialogDescription>
                Factura: {selectedCobranza?.facturas?.numero_factura} - {selectedCobranza?.clientes?.nombre}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Tipo de Gestión</Label>
                <Select value={nuevaGestion.tipo} onValueChange={(value) => setNuevaGestion(prev => ({ ...prev, tipo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoGestionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Resultado</Label>
                <Select value={nuevaGestion.resultado} onValueChange={(value) => setNuevaGestion(prev => ({ ...prev, resultado: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar resultado" />
                  </SelectTrigger>
                  <SelectContent>
                    {resultadoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Comentarios</Label>
                <Textarea
                  value={nuevaGestion.comentario}
                  onChange={(e) => setNuevaGestion(prev => ({ ...prev, comentario: e.target.value }))}
                  placeholder="Detalles de la gestión..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Próxima Acción (opcional)</Label>
                <Input
                  type="datetime-local"
                  value={nuevaGestion.proxima_accion_at}
                  onChange={(e) => setNuevaGestion(prev => ({ ...prev, proxima_accion_at: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowGestionModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={crearGestion} disabled={!nuevaGestion.tipo || !nuevaGestion.resultado} className="flex-1">
                  Registrar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalle */}
        <Dialog open={showDetalleModal} onOpenChange={setShowDetalleModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalle de Cobranza</DialogTitle>
              <DialogDescription>
                Factura {selectedCobranza?.facturas?.numero_factura} - {selectedCobranza?.clientes?.nombre}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="detalle" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="detalle">Detalle</TabsTrigger>
                <TabsTrigger value="historial">Historial</TabsTrigger>
                <TabsTrigger value="acciones">Acciones Rápidas</TabsTrigger>
              </TabsList>

              <TabsContent value="detalle" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información de Factura</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Número:</span>
                        <span className="font-medium">{selectedCobranza?.facturas?.numero_factura}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monto:</span>
                        <span className="font-semibold">${selectedCobranza?.facturas?.monto?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vencimiento:</span>
                        <span>{selectedCobranza?.facturas?.fecha_vencimiento ? format(new Date(selectedCobranza.facturas.fecha_vencimiento), 'dd/MM/yyyy') : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Días vencido:</span>
                        <Badge variant={selectedCobranza?.dias_vencido && selectedCobranza.dias_vencido > 30 ? 'destructive' : 'default'}>
                          {selectedCobranza?.dias_vencido} días
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nombre:</span>
                        <span className="font-medium">{selectedCobranza?.clientes?.nombre}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RUT:</span>
                        <span>{selectedCobranza?.clientes?.rut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span>{selectedCobranza?.clientes?.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado:</span>
                        <Badge variant={selectedCobranza?.estado ? estadoColors[selectedCobranza.estado] : 'secondary'}>
                          {selectedCobranza?.estado ? estadoLabels[selectedCobranza.estado] : 'N/A'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedCobranza?.notas && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedCobranza.notas}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="historial" className="space-y-4">
                <div className="space-y-4">
                  {historial.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hay gestiones registradas</p>
                  ) : (
                    historial.map((gestion) => (
                      <Card key={gestion.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                {(() => {
                                  const tipoOption = tipoGestionOptions.find(t => t.value === gestion.tipo);
                                  return tipoOption?.icon ? React.createElement(tipoOption.icon, { className: "h-4 w-4 text-primary" }) : null;
                                })()}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {tipoGestionOptions.find(t => t.value === gestion.tipo)?.label || gestion.tipo}
                                  </span>
                                  <Badge variant="outline">
                                    {resultadoOptions.find(r => r.value === gestion.resultado)?.label || gestion.resultado}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(gestion.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </p>
                                {gestion.comentario && (
                                  <p className="text-sm mt-2">{gestion.comentario}</p>
                                )}
                                {gestion.proxima_accion_at && (
                                  <p className="text-sm text-primary">
                                    Próxima acción: {format(new Date(gestion.proxima_accion_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <Button
                  onClick={() => {
                    setShowDetalleModal(false);
                    setShowGestionModal(true);
                  }}
                  className="w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Nueva Gestión
                </Button>
              </TabsContent>

              <TabsContent value="acciones" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => window.open(generateWhatsAppLink(selectedCobranza?.clientes, selectedCobranza?.facturas), '_blank')}
                  >
                    <MessageSquare className="h-6 w-6" />
                    Enviar WhatsApp
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => window.open(generateEmailLink(selectedCobranza?.clientes, selectedCobranza?.facturas), '_blank')}
                  >
                    <Mail className="h-6 w-6" />
                    Enviar Email
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      setShowDetalleModal(false);
                      setShowGestionModal(true);
                    }}
                  >
                    <Phone className="h-6 w-6" />
                    Registrar Llamada
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    disabled
                  >
                    <FileText className="h-6 w-6" />
                    Generar Carta
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Enlaces Útiles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href={generateWhatsAppLink(selectedCobranza?.clientes, selectedCobranza?.facturas)} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Plantilla WhatsApp
                      </a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <a href={generateEmailLink(selectedCobranza?.clientes, selectedCobranza?.facturas)} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Plantilla Email
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </BioscomLayout>
  );
}