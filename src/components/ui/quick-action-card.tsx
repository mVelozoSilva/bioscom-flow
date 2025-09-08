import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: {
    value: number | string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  };
  type?: 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  className?: string;
}

const typeClasses = {
  primary: 'hover:border-primary hover:shadow-primary/20 hover:bg-primary/5',
  success: 'hover:border-success hover:shadow-success/20 hover:bg-success/5',
  warning: 'hover:border-warning hover:shadow-warning/20 hover:bg-warning/5',
  danger: 'hover:border-destructive hover:shadow-destructive/20 hover:bg-destructive/5',
};

const iconClasses = {
  primary: 'text-primary bg-primary/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  danger: 'text-destructive bg-destructive/10',
};

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  badge,
  type = 'primary',
  onClick,
  className,
}: QuickActionCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
        'border border-border/50 hover:border-border',
        typeClasses[type],
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'p-2 rounded-lg',
                iconClasses[type]
              )}>
                <Icon className="h-5 w-5" />
              </div>
              {badge && (
                <Badge variant={badge.variant || 'default'} className="text-xs">
                  {badge.value}
                </Badge>
              )}
            </div>
            
            <h3 className="font-semibold text-foreground mb-1">
              {title}
            </h3>
            
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}