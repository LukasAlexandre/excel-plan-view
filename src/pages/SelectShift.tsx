import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShiftSelector } from '@/components/ShiftSelector';
import { usePlan } from '@/context/PlanContext';
import { parseExcelFile } from '@/utils/excelParser';
import { toast } from 'sonner';

const SelectShift = () => {
  const { uploadedFile, setParsedData, setSelectedShift, setIsLoading, isLoading } = usePlan();
  const navigate = useNavigate();

  useEffect(() => {
    if (!uploadedFile) {
      navigate('/');
    }
  }, [uploadedFile, navigate]);

  const handleShiftSelect = async (shift: '1' | '2') => {
    if (!uploadedFile) return;
    setIsLoading(true);
    setSelectedShift(shift);
    try {
      const today = new Date();
      const data = await parseExcelFile(uploadedFile, today, shift);
      setParsedData(data);
      toast.success(`Plano carregado - ${shift}° Turno`);
      navigate('/plano-do-dia');
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Erro ao processar arquivo. Verifique o formato da planilha.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!uploadedFile) return null;

  return (
    <ShiftSelector 
      onSelectShift={handleShiftSelect} 
      selectedFile={uploadedFile.name}
      onBack={() => navigate('/')}
    />
  );
};

export default SelectShift;
