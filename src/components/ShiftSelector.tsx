import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface ShiftSelectorProps {
  onSelectShift: (shift: '1' | '2') => void;
  selectedFile: string;
  onBack?: () => void;
}

export const ShiftSelector = ({ onSelectShift, selectedFile, onBack }: ShiftSelectorProps) => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              ← Voltar
            </Button>
          )}
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Selecione o Turno
          </h1>
          <p className="text-xl text-muted-foreground">
            Arquivo: {selectedFile}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 bg-card"
            onClick={() => onSelectShift('1')}
          >
            <CardHeader>
              <Clock className="w-12 h-12 text-primary mb-4" />
              <CardTitle className="text-3xl">1° Turno</CardTitle>
              <CardDescription className="text-lg">
                Visualizar produtos do primeiro turno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Selecionar 1° Turno
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 bg-card"
            onClick={() => onSelectShift('2')}
          >
            <CardHeader>
              <Clock className="w-12 h-12 text-primary mb-4" />
              <CardTitle className="text-3xl">2° Turno</CardTitle>
              <CardDescription className="text-lg">
                Visualizar produtos do segundo turno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="lg">
                Selecionar 2° Turno
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
