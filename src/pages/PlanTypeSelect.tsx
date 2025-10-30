import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarRange, CalendarDays } from 'lucide-react';
import { usePlan } from '@/context/PlanContext';

const PlanTypeSelect = () => {
  const { uploadedFile, selectedShift } = usePlan();
  const navigate = useNavigate();

  useEffect(() => {
    // If no file/shift selected, go back to the flow
    if (!uploadedFile) navigate('/');
    else if (!selectedShift) navigate('/turnos');
  }, [uploadedFile, selectedShift, navigate]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Selecione o Plano</h1>
          <p className="text-muted-foreground">Arquivo carregado e turno definido. Escolha qual plano deseja visualizar.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 bg-card" onClick={() => navigate('/plano-do-dia')}>
            <CardHeader>
              <Calendar className="w-12 h-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Plano Diário</CardTitle>
              <CardDescription>Ver programação do dia selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">Abrir Plano Diário</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 bg-card" onClick={() => navigate('/plano-da-semana')}>
            <CardHeader>
              <CalendarRange className="w-12 h-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Plano da Semana</CardTitle>
              <CardDescription>Visão consolidada por dia da semana</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">Abrir Plano da Semana</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 bg-card" onClick={() => navigate('/plano-do-mes')}>
            <CardHeader>
              <CalendarDays className="w-12 h-12 text-primary mb-4" />
              <CardTitle className="text-2xl">Plano Mensal</CardTitle>
              <CardDescription>Resumo mensal por linha e SKU</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">Abrir Plano Mensal</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button variant="ghost" onClick={() => navigate('/turnos')}>← Voltar</Button>
        </div>
      </div>
    </div>
  );
};

export default PlanTypeSelect;
