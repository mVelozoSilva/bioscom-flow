-- Fix security warnings: Add missing RLS policies and fix function search paths
-- =========================================================================

-- Fix function search paths by setting them explicitly
CREATE OR REPLACE FUNCTION public.fn_normaliza_rut(rut_input TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove dots, hyphens, and spaces, convert to uppercase
  RETURN UPPER(REGEXP_REPLACE(rut_input, '[^0-9kK]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.fn_valida_rut(rut_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  clean_rut TEXT;
  rut_body TEXT;
  dv_char TEXT;
  calculated_dv TEXT;
  sum_value INTEGER;
  multiplier INTEGER;
  i INTEGER;
BEGIN
  -- Normalize RUT
  clean_rut := public.fn_normaliza_rut(rut_input);
  
  -- Check minimum length
  IF LENGTH(clean_rut) < 2 THEN
    RETURN FALSE;
  END IF;
  
  -- Split RUT body and check digit
  rut_body := SUBSTRING(clean_rut FROM 1 FOR LENGTH(clean_rut) - 1);
  dv_char := SUBSTRING(clean_rut FROM LENGTH(clean_rut));
  
  -- Validate that body contains only numbers
  IF rut_body !~ '^[0-9]+$' THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate check digit
  sum_value := 0;
  multiplier := 2;
  
  FOR i IN REVERSE LENGTH(rut_body)..1 LOOP
    sum_value := sum_value + (SUBSTRING(rut_body FROM i FOR 1)::INTEGER * multiplier);
    multiplier := multiplier + 1;
    IF multiplier > 7 THEN
      multiplier := 2;
    END IF;
  END LOOP;
  
  -- Calculate final check digit
  calculated_dv := CASE (11 - (sum_value % 11))
    WHEN 11 THEN '0'
    WHEN 10 THEN 'K'
    ELSE (11 - (sum_value % 11))::TEXT
  END;
  
  RETURN calculated_dv = dv_char;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.validate_and_normalize_rut()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize RUT
  NEW.rut := public.fn_normaliza_rut(NEW.rut);
  
  -- Validate RUT
  IF NOT public.fn_valida_rut(NEW.rut) THEN
    RAISE EXCEPTION 'RUT inválido: %', NEW.rut;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add missing RLS policies for tables without any policies

-- cotizacion_items policies
CREATE POLICY "Authenticated users can read cotizacion_items" ON public.cotizacion_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vendedores and admins can manage cotizacion_items" ON public.cotizacion_items FOR ALL TO authenticated USING (public.has_role('vendedor') OR public.has_role('admin'));

-- producto_relacion policies  
CREATE POLICY "Authenticated users can read producto_relacion" ON public.producto_relacion FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage producto_relacion" ON public.producto_relacion FOR ALL TO authenticated USING (public.has_role('admin'));

-- adjuntos_tecnicos policies
CREATE POLICY "Tecnicos and admins can manage adjuntos_tecnicos" ON public.adjuntos_tecnicos FOR ALL TO authenticated USING (public.has_role('tecnico') OR public.has_role('admin'));

-- audit_log policies
CREATE POLICY "Admins can read audit_log" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role('admin'));
CREATE POLICY "System can write to audit_log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);