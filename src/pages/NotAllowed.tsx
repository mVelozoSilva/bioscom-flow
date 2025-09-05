import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function NotAllowed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Acceso Denegado</CardTitle>
          <CardDescription>
            No tienes permisos para acceder a esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Tu usuario no tiene los permisos necesarios para ver este contenido. 
            Contacta con el administrador del sistema si necesitas acceso.
          </p>
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Página Anterior
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}