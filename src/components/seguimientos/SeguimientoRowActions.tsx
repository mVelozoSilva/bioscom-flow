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
  GitBranch,
  CheckCircle2,
  XCircle,
  ClipboardList,
} from 'lucide-react';
import { MoverEtapaDialog } from './MoverEtapaDialog';
import { CrearTareaDialog } from './CrearTareaDialog';

interface SeguimientoRowActionsProps {
  seguimiento: any;
  onMoverEtapa: (id: string, etapaNueva: string, datos?: any) => Promise<void>;
  onCrearTarea: (seguimientoId: string, datos: any) => Promise<void>;
}

export function SeguimientoRowActions({
  seguimiento,
  onMoverEtapa,
  onCrearTarea,
}: SeguimientoRowActionsProps) {
  const navigate = useNavigate();
  const [moverEtapaOpen, setMoverEtapaOpen] = useState(false);
  const [etapaSeleccionada, setEtapaSeleccionada] = useState('');
  const [crearTareaOpen, setCrearTareaOpen] = useState(false);

  const handleMoverEtapa = (etapa: string) => {
    setEtapaSeleccionada(etapa);
    setMoverEtapaOpen(true);
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
          <DropdownMenuItem onClick={() => navigate(`/seguimientos/${seguimiento.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalle
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/seguimientos/${seguimiento.id}/editar`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <GitBranch className="mr-2 h-4 w-4" />
              Mover a Etapa
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleMoverEtapa('Prospecto')}>
                Prospecto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMoverEtapa('Propuesta')}>
                Propuesta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMoverEtapa('Negociación')}>
                Negociación
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMoverEtapa('Cerrado Ganado')}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Cerrado Ganado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMoverEtapa('Cerrado Perdido')}>
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                Cerrado Perdido
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem onClick={() => setCrearTareaOpen(true)}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Crear Tarea
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleMoverEtapa('Cerrado Ganado')}>
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
            Marcar Ganado
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleMoverEtapa('Cerrado Perdido')}>
            <XCircle className="mr-2 h-4 w-4 text-red-600" />
            Marcar Perdido
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MoverEtapaDialog
        open={moverEtapaOpen}
        onOpenChange={setMoverEtapaOpen}
        seguimiento={seguimiento}
        etapaNueva={etapaSeleccionada}
        onConfirmar={async (datos) => {
          await onMoverEtapa(seguimiento.id, etapaSeleccionada, datos);
        }}
      />

      <CrearTareaDialog
        open={crearTareaOpen}
        onOpenChange={setCrearTareaOpen}
        seguimiento={seguimiento}
        onCrear={(datos) => onCrearTarea(seguimiento.id, datos)}
      />
    </>
  );
}
