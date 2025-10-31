import { Download, Copy as CopyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductTable } from './ProductTable';
import { DayData, PlanStats } from '@/types/excel';
import { exportToXLSX, exportToCSV, exportToPlanJSON, copyPlanJSONToClipboard } from '@/utils/excelParser';
import { toast } from '@/components/ui/use-toast';

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

  const handleExportJSON = () => {
    // Name file using ISO date if possible
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    exportToPlanJSON(dayData.products, `plano_${iso}.json`, { reportDate: iso });
  };

  const handleCopyJSON = async () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const iso = `${yyyy}-${mm}-${dd}`;
    const ok = await copyPlanJSONToClipboard(dayData.products, { reportDate: iso });
    if (ok) {
      toast({ title: 'JSON copiado', description: 'Conteúdo do plano copiado para a área de transferência.' });
    } else {
      toast({ title: 'Falha ao copiar', description: 'Não foi possível copiar o JSON. Tente exportar o arquivo.', variant: 'destructive' });
    }
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
          <Button onClick={handleExportJSON} variant="default" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar JSON
          </Button>
          <Button onClick={handleCopyJSON} variant="secondary" size="sm">
            <CopyIcon className="w-4 h-4 mr-2" />
            Copiar JSON
          </Button>
        </div>
      </div>

      <ProductTable products={dayData.products} />
    </div>
  );
};
