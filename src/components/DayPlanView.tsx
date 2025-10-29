import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductTable } from './ProductTable';
import { DayData, PlanStats } from '@/types/excel';
import { exportToXLSX, exportToCSV } from '@/utils/excelParser';

interface DayPlanViewProps {
  dayData: DayData;
  stats?: PlanStats;
}

export const DayPlanView = ({ dayData, stats }: DayPlanViewProps) => {
  const handleExportXLSX = () => {
    exportToXLSX(dayData.products, `plano_${dayData.dayName.toLowerCase()}.xlsx`);
  };

  const handleExportCSV = () => {
    exportToCSV(dayData.products, `plano_${dayData.dayName.toLowerCase()}.csv`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Plano do Dia</h2>
          <p className="text-muted-foreground mt-1">
            {dayData.dayName}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 text-sm">
            <div className="text-foreground/90">
              <span className="font-semibold">Produtos ativos:</span> {dayData.products.length}
            </div>
            {stats?.opList && stats.opList.length > 0 && (
              <div className="text-foreground/90">
                <span className="font-semibold">OP{stats.opList.length > 1 ? 's' : ''}:</span> {stats.opList.join(', ')}
              </div>
            )}
            {typeof stats?.totalHCs === 'number' && (
              <div className="text-foreground/90">
                <span className="font-semibold">HCs:</span> {stats.totalHCs}
              </div>
            )}
            {typeof stats?.totalProg === 'number' && (
              <div className="text-foreground/90">
                <span className="font-semibold">Prog. total do dia:</span> {stats.totalProg}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportXLSX} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar XLSX
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar CSV
          </Button>
        </div>
      </div>

      <ProductTable products={dayData.products} />
    </div>
  );
};
