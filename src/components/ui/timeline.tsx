import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  date: Date | string;
  title: string;
  description: string;
  details?: string;
  icon?: LucideIcon;
  type?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  user?: string;
  expandable?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const typeClasses = {
  default: 'bg-muted text-muted-foreground border-border',
  success: 'bg-success text-success-foreground border-success',
  warning: 'bg-warning text-warning-foreground border-warning',
  danger: 'bg-destructive text-destructive-foreground border-destructive',
  info: 'bg-info text-info-foreground border-info',
};

const lineClasses = {
  default: 'bg-border',
  success: 'bg-success/30',
  warning: 'bg-warning/30',
  danger: 'bg-destructive/30',
  info: 'bg-info/30',
};

export function Timeline({ events, className }: TimelineProps) {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className={cn('relative', className)}>
      {events.map((event, index) => {
        const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
        const isLast = index === events.length - 1;
        const isExpanded = expandedItems.has(event.id);
        const Icon = event.icon;
        const eventType = event.type || 'default';

        return (
          <div key={event.id} className="relative flex gap-4 pb-6">
            {/* Timeline line */}
            {!isLast && (
              <div 
                className={cn(
                  'absolute left-4 top-8 w-0.5 h-full',
                  lineClasses[eventType]
                )}
              />
            )}

            {/* Timeline icon */}
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2',
              typeClasses[eventType]
            )}>
              {Icon ? (
                <Icon className="h-4 w-4" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-current" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground">
                      {event.title}
                    </h4>
                    <time className="text-xs text-muted-foreground">
                      {format(eventDate, 'PPp', { locale: es })}
                    </time>
                  </div>
                  
                  {event.user && (
                    <p className="text-xs text-muted-foreground mb-2">
                      por {event.user}
                    </p>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>

                {event.expandable && event.details && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(event.id)}
                    className="h-6 w-6 p-0 ml-2"
                  >
                    <ChevronDown 
                      className={cn(
                        'h-3 w-3 transition-transform',
                        isExpanded && 'rotate-180'
                      )} 
                    />
                  </Button>
                )}
              </div>

              {/* Expandable details */}
              {event.expandable && event.details && (
                <Collapsible open={isExpanded}>
                  <CollapsibleContent className="mt-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {event.details}
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}