import { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileSelect, isLoading }: FileUploadProps) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xlsm'))) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
        "border-border hover:border-primary/50 bg-card",
        isLoading && "opacity-50 pointer-events-none"
      )}
    >
      <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        Upload Planilha PCP
      </h3>
      <p className="text-muted-foreground mb-4">
        Arraste e solte seu arquivo .xlsx ou .xlsm aqui
      </p>
      <label className="inline-block">
        <input
          type="file"
          accept=".xlsx,.xlsm"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />
        <span className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors font-medium">
          Selecionar Arquivo
        </span>
      </label>
    </div>
  );
};
