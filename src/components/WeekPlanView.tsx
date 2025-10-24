import { useState } from 'react';
import { Download, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductTable } from './ProductTable';
import { DayData } from '@/types/excel';
import { exportToXLSX, exportToCSV } from '@/utils/excelParser';
import * as XLSX from 'xlsx';

interface WeekPlanViewProps {
  weekData: DayData[];
}

export const WeekPlanView = ({ weekData }: WeekPlanViewProps) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const handleExportDay = (day: DayData, format: 'xlsx' | 'csv') => {
    if (format === 'xlsx') {
      exportToXLSX(day.products, `plano_${day.dayName.toLowerCase()}.xlsx`);
    } else {
      exportToCSV(day.products, `plano_${day.dayName.toLowerCase()}.csv`);
    }
  };

  const handleExportWeek = () => {
    const wb = XLSX.utils.book_new();
    
    weekData.forEach(day => {
      const exportData = day.products.map(row => ({
        LINHA: row.LINHA || '',
        TURNO: row.TURNO || '',
        CÓDIGO: row.CÓDIGO || row['CODIGO'] || '',
        PRODUTO: row.PRODUTO || '',
        RATE: row.RATE || ''
      }));
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, day.dayName);
    });
    
    XLSX.writeFile(wb, 'plano_semana_completa.xlsx');
  };

  if (selectedDay !== null) {
    const day = weekData[selectedDay];
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedDay(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Voltar
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-foreground">{day.dayName}</h2>
              <p className="text-muted-foreground mt-1">
                {day.products.length} produtos ativos
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExportDay(day, 'xlsx')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              XLSX
            </Button>
            <Button onClick={() => handleExportDay(day, 'csv')} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        <ProductTable products={day.products} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Plano da Semana</h2>
          <p className="text-muted-foreground mt-1">
            Clique em um dia para ver os detalhes
          </p>
        </div>
        <Button onClick={handleExportWeek} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Baixar Semana Completa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {weekData.map((day, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 bg-card"
            onClick={() => setSelectedDay(index)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                {day.dayName}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {day.products.length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                produtos ativos
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
