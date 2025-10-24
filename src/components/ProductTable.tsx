import { ProductRow } from '@/types/excel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ProductTableProps {
  products: ProductRow[];
}

const LINE_COLORS: { [key: string]: string } = {
  'PD01': 'bg-[hsl(var(--line-blue))]/20 border-l-4 border-[hsl(var(--line-blue))]',
  'PD02': 'bg-[hsl(var(--line-cyan))]/20 border-l-4 border-[hsl(var(--line-cyan))]',
  'PD03': 'bg-[hsl(var(--line-purple))]/20 border-l-4 border-[hsl(var(--line-purple))]',
  'TL02': 'bg-[hsl(var(--line-green))]/20 border-l-4 border-[hsl(var(--line-green))]',
  'ME03': 'bg-[hsl(var(--line-yellow))]/20 border-l-4 border-[hsl(var(--line-yellow))]',
  'RD01': 'bg-[hsl(var(--line-red))]/20 border-l-4 border-[hsl(var(--line-red))]',
  'MB05': 'bg-[hsl(var(--line-orange))]/20 border-l-4 border-[hsl(var(--line-orange))]',
};

export const ProductTable = ({ products }: ProductTableProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum produto ativo encontrado para este dia
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[hsl(var(--table-header))] hover:bg-[hsl(var(--table-header))]">
            <TableHead className="font-semibold text-foreground">LINHA</TableHead>
            <TableHead className="font-semibold text-foreground">TURNO</TableHead>
            <TableHead className="font-semibold text-foreground">CÓDIGO</TableHead>
            <TableHead className="font-semibold text-foreground">PRODUTO</TableHead>
            <TableHead className="font-semibold text-foreground">RATE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const linha = product.LINHA || '';
            const colorClass = LINE_COLORS[linha] || '';
            
            return (
              <TableRow 
                key={index} 
                className={`${colorClass} hover:bg-[hsl(var(--table-row-hover))]`}
              >
                <TableCell className="font-medium">{product.LINHA}</TableCell>
                <TableCell>{product.TURNO}</TableCell>
                <TableCell className="font-mono text-sm">{product.CÓDIGO || product['CODIGO']}</TableCell>
                <TableCell>{product.PRODUTO}</TableCell>
                <TableCell>{product.RATE}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
