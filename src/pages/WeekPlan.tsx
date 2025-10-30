import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePlan } from '@/context/PlanContext';
import { WeekPlanView } from '@/components/WeekPlanView';
import { parseExcelFile } from '@/utils/excelParser';
import type { DayData } from '@/types/excel';

const startOfISOWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0..6, Sun..Sat
  const diff = (day === 0 ? -6 : 1 - day); // make Monday first
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatPt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const WeekPlan = () => {
  const { uploadedFile, selectedShift } = usePlan();
  const navigate = useNavigate();
  const [weekData, setWeekData] = useState<DayData[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uploadedFile) {
      navigate('/');
      return;
    }
    if (!selectedShift) {
      navigate('/turnos');
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const start = startOfISOWeek(today);
        const days = Array.from({ length: 5 }, (_, i) => {
          const d = new Date(start);
          d.setDate(start.getDate() + i); // Mon..Fri (5 dias úteis)
          return d;
        });

        const results = await Promise.all(
          days.map(async (d) => {
            const parsed = await parseExcelFile(uploadedFile, d, selectedShift);
            const label = `${formatPt(d)}`;
            return {
              day: formatPt(d),
              dayName: label,
              products: parsed.allRows,
            } as DayData;
          })
        );
        setWeekData(results);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [uploadedFile, selectedShift, navigate]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/planos')}>← Voltar</Button>
        </div>

        {!weekData || loading ? (
          <div className="rounded-lg border p-8 bg-card text-foreground">
            Carregando plano da semana...
          </div>
        ) : (
          <WeekPlanView weekData={weekData} />
        )}
      </div>
    </div>
  );
};

export default WeekPlan;
