import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SelectShift from "./pages/SelectShift";
import DayPlan from "./pages/DayPlan";
import PlanTypeSelect from "./pages/PlanTypeSelect";
import WeekPlan from "./pages/WeekPlan";
import MonthPlan from "./pages/MonthPlan";
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
            {/* Plan type hub */}
            <Route path="/planos" element={<PlanTypeSelect />} />
            {/* Day plan */}
            <Route path="/plano-do-dia" element={<DayPlan />} />
            {/* Placeholders for week and month */}
            <Route path="/plano-da-semana" element={<WeekPlan />} />
            <Route path="/plano-do-mes" element={<MonthPlan />} />
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
