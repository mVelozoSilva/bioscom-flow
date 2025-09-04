import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  TrendingUp, 
  CreditCard, 
  Wrench, 
  Settings,
  Bell,
  User,
  Menu,
  BarChart3,
  Users,
  FileText,
  Phone,
  DollarSign,
  Receipt,
  Truck,
  ClipboardList,
  Calendar,
  Package,
  UserCog
} from 'lucide-react';

interface NavItem {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  color: string;
}

const departamentos = {
  ventas: {
    title: 'Ventas',
    icon: TrendingUp,
    items: [
      {
        title: 'Clientes',
        description: 'Gestión de clientes y contactos',
        icon: Users,
        href: '/clientes',
        color: 'bg-blue-500'
      },
      {
        title: 'Cotizaciones',
        description: 'Crear y gestionar cotizaciones',
        icon: FileText,
        href: '/cotizaciones',
        badge: '3 pendientes',
        color: 'bg-green-500'
      },
      {
        title: 'Seguimiento',
        description: 'Seguimiento de oportunidades',
        icon: Phone,
        href: '/seguimientos',
        badge: '8 activos',
        color: 'bg-yellow-500'
      },
      {
        title: 'Productos',
        description: 'Catálogo de productos',
        icon: Package,
        href: '/productos',
        color: 'bg-purple-500'
      }
    ]
  },
  cobranza: {
    title: 'Cobranza',
    icon: CreditCard,
    items: [
      {
        title: 'Cobranzas',
        description: 'Gestión de cobranzas',
        icon: DollarSign,
        href: '/cobranzas',
        badge: '5 vencidas',
        color: 'bg-red-500'
      },
      {
        title: 'Facturas',
        description: 'Administrar facturas',
        icon: Receipt,
        href: '/facturas',
        color: 'bg-blue-500'
      },
      {
        title: 'Pagos',
        description: 'Registro de pagos',
        icon: CreditCard,
        href: '/pagos',
        color: 'bg-green-500'
      }
    ]
  },
  servicio: {
    title: 'Servicio Técnico',
    icon: Wrench,
    items: [
      {
        title: 'Tickets',
        description: 'Órdenes de servicio',
        icon: ClipboardList,
        href: '/servicio-tecnico',
        badge: '2 urgentes',
        color: 'bg-orange-500'
      },
      {
        title: 'Mantenciones',
        description: 'Planes de mantención',
        icon: Calendar,
        href: '/mantenciones',
        color: 'bg-indigo-500'
      },
      {
        title: 'Historial',
        description: 'Historial de servicios',
        icon: FileText,
        href: '/historial-servicios',
        color: 'bg-gray-500'
      }
    ]
  },
  administracion: {
    title: 'Administración',
    icon: Settings,
    items: [
      {
        title: 'Dashboard Ejecutivo',
        description: 'Métricas y KPIs',
        icon: BarChart3,
        href: '/dashboard-ejecutivo',
        color: 'bg-teal-500'
      },
      {
        title: 'Inventario',
        description: 'Control de stock',
        icon: Package,
        href: '/inventario',
        color: 'bg-cyan-500'
      },
      {
        title: 'Despachos',
        description: 'Logística y despachos',
        icon: Truck,
        href: '/despachos',
        color: 'bg-emerald-500'
      },
      {
        title: 'Usuarios',
        description: 'Gestión de usuarios',
        icon: UserCog,
        href: '/usuarios',
        color: 'bg-pink-500'
      }
    ]
  }
};

export function BioscomNavbar() {
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const handleSheetChange = (isOpen: boolean, department: string) => {
    setActiveSheet(isOpen ? department : null);
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/b1805360-65c2-4cde-8156-9c49a5c5c0ce.png" 
              alt="Bioscom" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Navegación principal */}
          <nav className="hidden md:flex items-center space-x-1">
            {Object.entries(departamentos).map(([key, dept]) => (
              <Sheet key={key} onOpenChange={(isOpen) => handleSheetChange(isOpen, key)}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 text-bioscom-fg hover:bg-primary/10 hover:text-primary"
                  >
                    <dept.icon className="h-4 w-4" />
                    <span>{dept.title}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="w-full h-auto max-h-[80vh]">
                  <div className="container mx-auto py-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-foreground flex items-center">
                        <dept.icon className="h-6 w-6 mr-2 text-primary" />
                        {dept.title}
                      </h2>
                      <p className="text-muted-foreground">
                        Herramientas y funciones para {dept.title.toLowerCase()}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {dept.items.map((item) => (
                        <Link key={item.href} to={item.href}>
                          <Card className="hover:shadow-md transition-shadow border border-border hover:border-primary/20">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className={`p-2 rounded-lg ${item.color} text-white`}>
                                  <item.icon className="h-5 w-5" />
                                </div>
                                {item.badge && (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription>{item.description}</CardDescription>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </nav>

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
            
            {/* Menú móvil */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col space-y-4 mt-8">
                  {Object.entries(departamentos).map(([key, dept]) => (
                    <div key={key} className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        {dept.title}
                      </h3>
                      {dept.items.map((item) => (
                        <Link key={item.href} to={item.href}>
                          <Button variant="ghost" className="w-full justify-start">
                            <item.icon className="h-4 w-4 mr-2" />
                            {item.title}
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}