import React, { useState, useEffect } from 'react';
import { FormPanel } from '@/components/ui/form-panel';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  Accessibility, 
  Eye, 
  Type, 
  Zap, 
  Focus, 
  Space,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessibilitySettings {
  dyslexicFont: boolean;
  highContrast: boolean;
  fontSize: number; // 1-4 scale
  reducedMotion: boolean;
  focusMode: boolean;
  increasedSpacing: boolean;
}

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultSettings: AccessibilitySettings = {
  dyslexicFont: false,
  highContrast: false,
  fontSize: 1,
  reducedMotion: false,
  focusMode: false,
  increasedSpacing: false,
};

export function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Dyslexic font
    if (settings.dyslexicFont) {
      root.style.setProperty('--font-family', '"OpenDyslexic", "Comic Sans MS", sans-serif');
    } else {
      root.style.removeProperty('--font-family');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    const fontScale = 1 + (settings.fontSize - 1) * 0.25; // 1, 1.25, 1.5, 1.75
    root.style.setProperty('--font-scale', fontScale.toString());

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Focus mode (ADHD friendly)
    if (settings.focusMode) {
      root.classList.add('focus-mode');
    } else {
      root.classList.remove('focus-mode');
    }

    // Increased spacing
    if (settings.increasedSpacing) {
      root.classList.add('increased-spacing');
    } else {
      root.classList.remove('increased-spacing');
    }
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
    toast({
      title: 'Configuración restaurada',
      description: 'Se han restaurado los valores por defecto de accesibilidad.',
    });
  };

  const getFontSizeLabel = (value: number) => {
    const labels = ['Pequeño', 'Normal', 'Grande', 'Muy grande'];
    return labels[value - 1] || 'Normal';
  };

  return (
    <FormPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración de Accesibilidad"
      size="md"
      showFooter={false}
    >
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Personaliza la interfaz para mejorar tu experiencia de usuario.
          Los cambios se aplicarán inmediatamente y se guardarán automáticamente.
        </p>

        {/* Dyslexic Font */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3">
            <Type className="h-5 w-5 text-primary" />
            <div>
              <Label htmlFor="dyslexic-font" className="text-sm font-medium">
                Fuente OpenDyslexic
              </Label>
              <p className="text-xs text-muted-foreground">
                Fuente optimizada para personas con dislexia
              </p>
            </div>
          </div>
          <Switch
            id="dyslexic-font"
            checked={settings.dyslexicFont}
            onCheckedChange={(checked) => updateSetting('dyslexicFont', checked)}
          />
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-primary" />
            <div>
              <Label htmlFor="high-contrast" className="text-sm font-medium">
                Alto Contraste
              </Label>
              <p className="text-xs text-muted-foreground">
                Aumenta el contraste para mejor visibilidad
              </p>
            </div>
          </div>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSetting('highContrast', checked)}
          />
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Type className="h-5 w-5 text-primary" />
            <div>
              <Label className="text-sm font-medium">
                Tamaño de Texto: {getFontSizeLabel(settings.fontSize)}
              </Label>
              <p className="text-xs text-muted-foreground">
                Ajusta el tamaño del texto en toda la aplicación
              </p>
            </div>
          </div>
          <Slider
            value={[settings.fontSize]}
            onValueChange={([value]) => updateSetting('fontSize', value)}
            max={4}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <Label htmlFor="reduced-motion" className="text-sm font-medium">
                Animaciones Reducidas
              </Label>
              <p className="text-xs text-muted-foreground">
                Reduce las animaciones para evitar distracciones
              </p>
            </div>
          </div>
          <Switch
            id="reduced-motion"
            checked={settings.reducedMotion}
            onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
          />
        </div>

        {/* Focus Mode */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3">
            <Focus className="h-5 w-5 text-primary" />
            <div>
              <Label htmlFor="focus-mode" className="text-sm font-medium">
                Modo Foco (TDAH)
              </Label>
              <p className="text-xs text-muted-foreground">
                Reduce elementos visuales para mejorar la concentración
              </p>
            </div>
          </div>
          <Switch
            id="focus-mode"
            checked={settings.focusMode}
            onCheckedChange={(checked) => updateSetting('focusMode', checked)}
          />
        </div>

        {/* Increased Spacing */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-3">
            <Space className="h-5 w-5 text-primary" />
            <div>
              <Label htmlFor="increased-spacing" className="text-sm font-medium">
                Espaciado Aumentado
              </Label>
              <p className="text-xs text-muted-foreground">
                Aumenta el espacio entre elementos para facilitar la lectura
              </p>
            </div>
          </div>
          <Switch
            id="increased-spacing"
            checked={settings.increasedSpacing}
            onCheckedChange={(checked) => updateSetting('increasedSpacing', checked)}
          />
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar Valores por Defecto
          </Button>
        </div>
      </div>
    </FormPanel>
  );
}

// Add CSS for accessibility features
const accessibilityStyles = `
  .high-contrast {
    filter: contrast(150%) brightness(110%);
  }
  
  .reduce-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .focus-mode {
    --ring: transparent;
  }
  
  .focus-mode :focus {
    outline: 3px solid var(--primary) !important;
    outline-offset: 2px !important;
  }
  
  .increased-spacing {
    line-height: 1.8 !important;
  }
  
  .increased-spacing * {
    margin-top: calc(var(--spacing, 1) * 1.5) !important;
    margin-bottom: calc(var(--spacing, 1) * 1.5) !important;
  }
  
  body {
    font-family: var(--font-family, inherit);
    font-size: calc(1rem * var(--font-scale, 1));
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = accessibilityStyles;
  document.head.appendChild(styleElement);
}