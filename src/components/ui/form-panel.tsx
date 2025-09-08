import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface FormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  isLoading?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  showFooter?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-[400px]',
  md: 'w-[500px]',
  lg: 'w-[600px]',
  xl: 'w-[800px]',
};

export function FormPanel({
  isOpen,
  onClose,
  onSave,
  title,
  size = 'md',
  children,
  isLoading = false,
  saveLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  showFooter = true,
  className,
}: FormPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-full bg-card border-l shadow-lg z-50 flex flex-col",
          "animate-in slide-in-from-right duration-300",
          sizeMap[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-muted/5">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          {children}
        </ScrollArea>

        {/* Footer */}
        {showFooter && (
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/5">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            {onSave && (
              <Button
                onClick={onSave}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  saveLabel
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}