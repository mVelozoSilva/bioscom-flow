import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Cotizaciones from "./pages/Cotizaciones";
import Tareas from "./pages/Tareas";
import Seguimientos from "./pages/Seguimientos";
import Productos from "./pages/Productos";
import Cobranzas from "./pages/Cobranzas";
import ServicioTecnico from "./pages/ServicioTecnico";
import Inventario from "./pages/Inventario";
import NotFound from "./pages/NotFound";
import MiDiaSemana from "./pages/MiDiaSemana";
import Facturas from "./pages/Facturas";
import Pagos from "./pages/Pagos";
import Mantenciones from "./pages/Mantenciones";
import HistorialServicios from "./pages/HistorialServicios";
import Despachos from "./pages/Despachos";
import Usuarios from "./pages/Usuarios";
import NotAllowed from "./pages/NotAllowed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute>
                <Clientes />
              </ProtectedRoute>
            } />
            <Route path="/cotizaciones" element={
              <ProtectedRoute>
                <Cotizaciones />
              </ProtectedRoute>
            } />
            <Route path="/tareas" element={
              <ProtectedRoute>
                <Tareas />
              </ProtectedRoute>
            } />
            <Route path="/seguimientos" element={
              <ProtectedRoute>
                <Seguimientos />
              </ProtectedRoute>
            } />
            <Route path="/productos" element={
              <ProtectedRoute>
                <Productos />
              </ProtectedRoute>
            } />
            <Route path="/cobranzas" element={
              <ProtectedRoute>
                <Cobranzas />
              </ProtectedRoute>
            } />
            <Route path="/mi-dia/semana" element={
              <ProtectedRoute>
                <MiDiaSemana />
              </ProtectedRoute>
            } />
            <Route path="/facturas" element={
              <ProtectedRoute>
                <Facturas />
              </ProtectedRoute>
            } />
            <Route path="/pagos" element={
              <ProtectedRoute>
                <Pagos />
              </ProtectedRoute>
            } />
            <Route path="/servicio-tecnico" element={
              <ProtectedRoute>
                <ServicioTecnico />
              </ProtectedRoute>
            } />
            <Route path="/mantenciones" element={
              <ProtectedRoute>
                <Mantenciones />
              </ProtectedRoute>
            } />
            <Route path="/historial-servicios" element={
              <ProtectedRoute>
                <HistorialServicios />
              </ProtectedRoute>
            } />
            <Route path="/inventario" element={
              <ProtectedRoute>
                <Inventario />
              </ProtectedRoute>
            } />
            <Route path="/despachos" element={
              <ProtectedRoute>
                <Despachos />
              </ProtectedRoute>
            } />
            <Route path="/dashboard-ejecutivo" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/usuarios" element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Usuarios />
              </ProtectedRoute>
            } />
            
            {/* Error pages */}
            <Route path="/403" element={<NotAllowed />} />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;