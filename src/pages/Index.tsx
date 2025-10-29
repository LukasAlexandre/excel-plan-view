import { FileUpload } from '@/components/FileUpload';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '@/context/PlanContext';

// This page now serves as the Upload page (route: "/")
const Index = () => {
  const { setUploadedFile, isLoading, resetAll } = usePlan();
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    resetAll();
    setUploadedFile(file);
    navigate('/turnos');
  };

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
};

export default Index;
