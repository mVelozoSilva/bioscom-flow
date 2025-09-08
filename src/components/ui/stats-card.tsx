import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    label?: string;
  };
  icon?: LucideIcon;
  type?: 'default' | 'success' | 'warning' | 'danger';
  format?: 'currency' | 'percentage' | 'number';
  className?: string;
}

const typeClasses = {
  default: 'border-border',
  success: 'border-success/20 bg-success/5',
  warning: 'border-warning/20 bg-warning/5',
  danger: 'border-destructive/20 bg-destructive/5',
};

const iconClasses = {
  default: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
};

const formatValue = (value: string | number, format?: 'currency' | 'percentage' | 'number') => {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'number':
      return new Intl.NumberFormat('es-CL').format(value);
    default:
      return value.toString();
  }
};

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  type = 'default',
  format,
  className,
}: StatsCardProps) {
  const formattedValue = formatValue(value, format);
  
  return (
    <Card className={cn(typeClasses[type], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn('h-4 w-4', iconClasses[type])} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {formattedValue}
        </div>
        
        {change && (
          <div className="flex items-center text-xs">
            {change.type === 'increase' ? (
              <TrendingUp className="h-3 w-3 mr-1 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
            )}
            <span className={cn(
              change.type === 'increase' ? 'text-success' : 'text-destructive'
            )}>
              {change.value > 0 ? '+' : ''}{change.value}%
            </span>
            {change.label && (
              <span className="text-muted-foreground ml-1">
                {change.label}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}