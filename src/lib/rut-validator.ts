// Validador de RUT chileno

export interface RutValidation {
  valid: boolean;
  formatted: string;
  error?: string;
}

/**
 * Valida y formatea un RUT chileno
 */
export function validateRut(rut: string): RutValidation {
  if (!rut) {
    return { valid: false, formatted: '', error: 'RUT es requerido' };
  }

  // Limpiar RUT: remover puntos, guiones y espacios
  const cleanRut = rut.replace(/[^0-9kK]/g, '');

  if (cleanRut.length < 2) {
    return { valid: false, formatted: '', error: 'RUT muy corto' };
  }

  // Separar número y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1).toLowerCase();

  if (body.length < 1) {
    return { valid: false, formatted: '', error: 'RUT inválido' };
  }

  // Validar que el cuerpo sea numérico
  if (!/^\d+$/.test(body)) {
    return { valid: false, formatted: '', error: 'RUT debe contener solo números' };
  }

  // Calcular dígito verificador
  const calculatedDv = calculateDv(parseInt(body));

  if (dv !== calculatedDv) {
    return { 
      valid: false, 
      formatted: formatRut(body, dv), 
      error: 'Dígito verificador incorrecto' 
    };
  }

  return {
    valid: true,
    formatted: formatRut(body, dv),
  };
}

/**
 * Calcula el dígito verificador de un RUT
 */
function calculateDv(rut: number): string {
  let sum = 0;
  let multiplier = 2;

  const rutStr = rut.toString();
  
  for (let i = rutStr.length - 1; i >= 0; i--) {
    sum += parseInt(rutStr[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const dv = 11 - remainder;

  if (dv === 11) return '0';
  if (dv === 10) return 'k';
  return dv.toString();
}

/**
 * Formatea un RUT con puntos y guión
 */
function formatRut(body: string, dv: string): string {
  // Agregar puntos cada 3 dígitos desde la derecha
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv.toUpperCase()}`;
}

/**
 * Limpia un RUT para almacenamiento (solo números y DV)
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '');
}

/**
 * Genera RUTs válidos para testing
 */
export function generateValidRut(): string {
  const body = Math.floor(Math.random() * 99999999) + 1000000; // Entre 1M y 99M
  const dv = calculateDv(body);
  return formatRut(body.toString(), dv);
}