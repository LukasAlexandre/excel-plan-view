import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DayPlanView } from '@/components/DayPlanView';
import { WeekPlanView } from '@/components/WeekPlanView';
import { parseExcelFile } from '@/utils/excelParser';
import { ParsedData } from '@/types/excel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CalendarDays, Upload as UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [view, setView] = useState<'upload' | 'menu' | 'day' | 'week'>('upload');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const data = await parseExcelFile(file);
      setParsedData(data);
      setView('menu');
      toast.success('Planilha carregada com sucesso!');
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Erro ao processar arquivo. Verifique o formato da planilha.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setParsedData(null);
    setView('upload');
  };

  if (view === 'upload' || !parsedData) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Plano PCP
            </h1>
            <p className="text-xl text-muted-foreground">
              Sistema de visualização de planejamento de produção
            </p>
          </div>

          <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Plano Carregado
              </h1>
              <p className="text-muted-foreground">
                Selecione uma visualização
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">
              <UploadIcon className="w-4 h-4 mr-2" />
              Nova Planilha
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 bg-card"
              onClick={() => setView('day')}
            >
              <CardHeader>
                <Calendar className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Plano do Dia</CardTitle>
                <CardDescription>
                  Visualize os produtos ativos para hoje (Segunda-feira)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  {parsedData.dayData[0]?.products.length || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  produtos ativos
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 bg-card"
              onClick={() => setView('week')}
            >
              <CardHeader>
                <CalendarDays className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Plano da Semana</CardTitle>
                <CardDescription>
                  Visualize o planejamento completo de Segunda a Sexta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  5
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  dias de produção
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button onClick={() => setView('menu')} variant="ghost" className="mb-4">
            ← Voltar ao Menu
          </Button>
        </div>

        {view === 'day' && parsedData.dayData[0] && (
          <DayPlanView dayData={parsedData.dayData[0]} />
        )}

        {view === 'week' && (
          <WeekPlanView weekData={parsedData.dayData} />
        )}
      </div>
    </div>
  );
};

export default Index;
