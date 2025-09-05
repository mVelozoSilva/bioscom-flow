import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { value: string; label: string }[];
}

interface FiltersDialogProps {
  title?: string;
  filters: FilterOption[];
  values: Record<string, any>;
  onValuesChange: (values: Record<string, any>) => void;
  onApply: () => void;
  onClear: () => void;
  children: React.ReactNode;
}

export function FiltersDialog({
  title = "Filtros Avanzados",
  filters,
  values,
  onValuesChange,
  onApply,
  onClear,
  children
}: FiltersDialogProps) {
  const [open, setOpen] = useState(false);

  const handleValueChange = (key: string, value: any) => {
    onValuesChange({ ...values, [key]: value });
  };

  const handleApply = () => {
    onApply();
    setOpen(false);
  };

  const handleClear = () => {
    onClear();
  };

  const hasActiveFilters = Object.values(values).some(value => value !== undefined && value !== '');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                {title}
              </DialogTitle>
              <DialogDescription>
                Configura filtros específicos para refinar los resultados
              </DialogDescription>
            </div>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <Label htmlFor={filter.key}>{filter.label}</Label>
              
              {filter.type === 'text' && (
                <Input
                  id={filter.key}
                  value={values[filter.key] || ''}
                  onChange={(e) => handleValueChange(filter.key, e.target.value)}
                  placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
                />
              )}
              
              {filter.type === 'select' && (
                <Select
                  value={values[filter.key] || ''}
                  onValueChange={(value) => handleValueChange(filter.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Seleccionar ${filter.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {filter.type === 'date' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !values[filter.key] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {values[filter.key] ? (
                        format(values[filter.key], "PPP", { locale: es })
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={values[filter.key]}
                      onSelect={(date) => handleValueChange(filter.key, date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}