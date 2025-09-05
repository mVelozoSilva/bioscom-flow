import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Cotizaciones from "./pages/Cotizaciones";
import Tareas from "./pages/Tareas";
import Seguimientos from "./pages/Seguimientos";
import Productos from "./pages/Productos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/cotizaciones" element={<Cotizaciones />} />
          <Route path="/tareas" element={<Tareas />} />
          <Route path="/seguimientos" element={<Seguimientos />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/cobranzas" element={<Dashboard />} />
          <Route path="/facturas" element={<Dashboard />} />
          <Route path="/pagos" element={<Dashboard />} />
          <Route path="/servicio-tecnico" element={<Dashboard />} />
          <Route path="/mantenciones" element={<Dashboard />} />
          <Route path="/historial-servicios" element={<Dashboard />} />
          <Route path="/dashboard-ejecutivo" element={<Dashboard />} />
          <Route path="/inventario" element={<Dashboard />} />
          <Route path="/despachos" element={<Dashboard />} />
          <Route path="/usuarios" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
