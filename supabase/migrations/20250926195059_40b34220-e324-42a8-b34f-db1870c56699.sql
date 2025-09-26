-- Insert some test seguimientos with proper origen values
INSERT INTO public.seguimientos (
  cliente_id, 
  prioridad, 
  estado, 
  proxima_gestion, 
  ultima_gestion,
  notas,
  origen
) VALUES 
  (
    '0b6ecfbc-73d2-4c83-a5dd-69e35d12edb0', 
    'Alta',
    'Activo',
    CURRENT_DATE + INTERVAL '2 days',
    CURRENT_DATE - INTERVAL '3 days',
    'Cliente interesado en equipos de laboratorio. Solicita cotización urgente.',
    'Manual'
  ),
  (
    'fd9651f1-da4d-4ac4-a337-682cfbe285f2', 
    'Media',
    'En gestión',
    CURRENT_DATE,
    CURRENT_DATE - INTERVAL '1 day',
    'Seguimiento de propuesta comercial. Pendiente respuesta del director.',
    'Manual'
  ),
  (
    '1c74566f-827f-4f7b-b19a-c7ceef251d0f', 
    'Urgente',
    'Activo',
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '5 days',
    'Cliente reporta problemas con equipo instalado. Requiere atención inmediata.',
    'Manual'
  ),
  (
    '304c97d7-299c-4487-97e1-77a664208e6b', 
    'Baja',
    'Pausado',
    CURRENT_DATE + INTERVAL '1 week',
    CURRENT_DATE - INTERVAL '2 weeks',
    'Cliente en proceso de evaluación presupuestaria. Seguimiento mensual.',
    'Manual'
  ),
  (
    '2de8e23a-7f63-4984-b241-4d63f2c988f4', 
    'Alta',
    'Activo',
    CURRENT_DATE + INTERVAL '1 day',
    CURRENT_DATE - INTERVAL '2 days',
    'Renovación de contrato anual. Cliente satisfecho con el servicio actual.',
    'Manual'
  );