import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/context/PlanContext';

const MonthPlan = () => {
  const { parsedData, selectedShift } = usePlan();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedShift) navigate('/turnos');
  }, [selectedShift, navigate]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/planos')}>← Voltar</Button>
        </div>
        <div className="rounded-lg border p-8 bg-card text-foreground">
          <h2 className="text-2xl font-bold mb-2">Plano Mensal</h2>
          <p className="text-muted-foreground">Página genérica criada. Você pode implementar a lógica mensal aqui. Dados carregados: {parsedData ? parsedData.allRows.length : 0} linhas.</p>
        </div>
      </div>
    </div>
  );
};

export default MonthPlan;
