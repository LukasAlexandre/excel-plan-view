import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ShiftSelector } from '@/components/ShiftSelector';
import { DayPlanView } from '@/components/DayPlanView';
import { parseExcelFile } from '@/utils/excelParser';
import { ParsedData } from '@/types/excel';
import { Button } from '@/components/ui/button';
import { Upload as UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [view, setView] = useState<'upload' | 'shift' | 'plan'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedShift, setSelectedShift] = useState<'1' | '2' | null>(null);

  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setView('shift');
  };

  const handleShiftSelect = async (shift: '1' | '2') => {
    if (!uploadedFile) return;
    
    setIsLoading(true);
    setSelectedShift(shift);
    
    try {
      // Use today's date for filtering
      const today = new Date();
      const data = await parseExcelFile(uploadedFile, today, shift);
      setParsedData(data);
      setView('plan');
      toast.success(`Plano carregado - ${shift}° Turno`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Erro ao processar arquivo. Verifique o formato da planilha.');
      setView('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setParsedData(null);
    setUploadedFile(null);
    setSelectedShift(null);
    setView('upload');
  };

  if (view === 'upload') {
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

  if (view === 'shift' && uploadedFile) {
    return (
      <ShiftSelector 
        onSelectShift={handleShiftSelect}
        selectedFile={uploadedFile.name}
      />
    );
  }

  if (view === 'plan' && parsedData) {
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
    
    const dayData = {
      day: dateStr,
      dayName: `${dateStr} - ${selectedShift}° Turno`,
      products: parsedData.allRows
    };

    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Button onClick={handleReset} variant="ghost" className="mb-4">
              <UploadIcon className="w-4 h-4 mr-2" />
              Nova Planilha
            </Button>
          </div>

          <DayPlanView dayData={dayData} />
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
