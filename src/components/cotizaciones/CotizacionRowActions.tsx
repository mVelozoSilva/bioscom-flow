import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy, 
  Mail, 
  FileDown, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { ConfirmActionDialog } from '@/components/clientes/ConfirmActionDialog';
import { EnviarEmailDialog } from './EnviarEmailDialog';
import { CambiarEstadoDialog } from './CambiarEstadoDialog';

interface CotizacionRowActionsProps {
  cotizacion: any;
  onDuplicar: (id: string) => Promise<void>;
  onEnviarEmail: (id: string, data: any) => Promise<void>;
  onCambiarEstado: (id: string, nuevoEstado: string, motivo?: string) => Promise<void>;
  onExportarPDF: (id: string) => Promise<void>;
}

export function CotizacionRowActions({
  cotizacion,
  onDuplicar,
  onEnviarEmail,
  onCambiarEstado,
  onExportarPDF,
}: CotizacionRowActionsProps) {
  const navigate = useNavigate();
  const [duplicarDialogOpen, setDuplicarDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [cambiarEstadoDialogOpen, setCambiarEstadoDialogOpen] = useState(false);
  const [accionEstado, setAccionEstado] = useState<'aceptar' | 'rechazar'>('aceptar');

  const handleDuplicar = async () => {
    await onDuplicar(cotizacion.id);
    setDuplicarDialogOpen(false);
  };

  const handleCambiarEstado = (accion: 'aceptar' | 'rechazar') => {
    setAccionEstado(accion);
    setCambiarEstadoDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate(`/cotizaciones/${cotizacion.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/cotizaciones/${cotizacion.id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDuplicarDialogOpen(true)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Enviar por Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Cambiar Estado</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleCambiarEstado('aceptar')}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Aceptar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCambiarEstado('rechazar')}>
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                Rechazar
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={() => onExportarPDF(cotizacion.id)}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmActionDialog
        open={duplicarDialogOpen}
        onOpenChange={setDuplicarDialogOpen}
        title="Duplicar cotización"
        description={`¿Estás seguro de que deseas duplicar la cotización ${cotizacion.codigo}?`}
        onConfirm={handleDuplicar}
        confirmText="Duplicar"
      />

      <EnviarEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        cotizacion={cotizacion}
        onEnviar={(data) => onEnviarEmail(cotizacion.id, data)}
      />

      <CambiarEstadoDialog
        open={cambiarEstadoDialogOpen}
        onOpenChange={setCambiarEstadoDialogOpen}
        cotizacion={cotizacion}
        accion={accionEstado}
        onConfirmar={async (motivo) => {
          const nuevoEstado = accionEstado === 'aceptar' ? 'Aceptada' : 'Rechazada';
          await onCambiarEstado(cotizacion.id, nuevoEstado, motivo);
        }}
      />
    </>
  );
}
