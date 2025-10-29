import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SelectShift from "./pages/SelectShift";
import DayPlan from "./pages/DayPlan";
import { PlanProvider } from "@/context/PlanContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PlanProvider>
        <BrowserRouter>
          <Routes>
            {/* Upload */}
            <Route path="/" element={<Index />} />
            {/* Shift selection */}
            <Route path="/turnos" element={<SelectShift />} />
            {/* Day plan */}
            <Route path="/plano-do-dia" element={<DayPlan />} />
            {/* Backward compatibility paths */}
            <Route path="/upload" element={<Navigate to="/" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PlanProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
