import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayPlanView } from '@/components/DayPlanView';
import { Button } from '@/components/ui/button';
import { Upload as UploadIcon } from 'lucide-react';
import { usePlan } from '@/context/PlanContext';

const DayPlan = () => {
  const { parsedData, selectedShift, resetAll } = usePlan();
  const navigate = useNavigate();

  useEffect(() => {
    if (!parsedData || !selectedShift) {
      navigate('/turnos');
    }
  }, [parsedData, selectedShift, navigate]);

  const dayData = useMemo(() => {
    if (!parsedData || !selectedShift) return null;
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return {
      day: dateStr,
      dayName: `${dateStr} - ${selectedShift}° Turno`,
      products: parsedData.allRows,
    };
  }, [parsedData, selectedShift]);

  if (!dayData) return null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/turnos')}>
            ← Voltar para Turnos
          </Button>
          <Button variant="ghost" onClick={() => { resetAll(); navigate('/'); }}>
            <UploadIcon className="w-4 h-4 mr-2" />
            Nova Planilha
          </Button>
        </div>

        <DayPlanView dayData={dayData} stats={parsedData.stats} />
      </div>
    </div>
  );
};

export default DayPlan;
