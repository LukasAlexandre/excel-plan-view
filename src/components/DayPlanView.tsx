import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductTable } from './ProductTable';
import { DayData } from '@/types/excel';
import { exportToXLSX, exportToCSV } from '@/utils/excelParser';

interface DayPlanViewProps {
  dayData: DayData;
}

export const DayPlanView = ({ dayData }: DayPlanViewProps) => {
  const handleExportXLSX = () => {
    exportToXLSX(dayData.products, `plano_${dayData.dayName.toLowerCase()}.xlsx`);
  };

  const handleExportCSV = () => {
    exportToCSV(dayData.products, `plano_${dayData.dayName.toLowerCase()}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Plano do Dia</h2>
          <p className="text-muted-foreground mt-1">
            {dayData.dayName} - {dayData.products.length} produtos ativos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportXLSX} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            XLSX
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      <ProductTable products={dayData.products} />
    </div>
  );
};
