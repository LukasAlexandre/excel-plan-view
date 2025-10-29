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

// Fallback palette for lines not explicitly mapped above
const COLOR_VARS = [
  '--line-blue',
  '--line-cyan',
  '--line-purple',
  '--line-green',
  '--line-yellow',
  '--line-red',
  '--line-orange',
];

const colorClassForLine = (linha: string) => {
  if (LINE_COLORS[linha]) return LINE_COLORS[linha];
  // Deterministic color by hashing the line id
  let hash = 0;
  for (let i = 0; i < linha.length; i++) {
    hash = (hash * 31 + linha.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % COLOR_VARS.length;
  const varName = COLOR_VARS[idx];
  return `bg-[hsl(var(${varName}))]/20 border-l-4 border-[hsl(var(${varName}))]`;
};

export const ProductTable = ({ products }: ProductTableProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum produto ativo encontrado para este dia
      </div>
    );
  }

  const fmt = (n?: number) => {
    if (n === undefined || n === null) return '';
    return Number(n).toLocaleString('pt-BR');
  };

  // Group products by LINHA preserving the original order
  const groups = new Map<string, ProductRow[]>();
  for (const p of products) {
    const key = p.LINHA || '—';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
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
            <TableHead className="font-semibold text-foreground">OP</TableHead>
            <TableHead className="font-semibold text-foreground">HCs</TableHead>
            <TableHead className="font-semibold text-foreground">PROG. DIA</TableHead>
            <TableHead className="font-semibold text-foreground">RATE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...groups.entries()].map(([linha, rows]) => {
            const colorClass = colorClassForLine(linha);
            const totalProg = rows.reduce((acc, r) => acc + (Number(r.PROG_DIA) || 0), 0);
            const hcsLine = rows.reduce((acc, r) => {
              const val = Number(r.HCs ?? 0);
              return val > acc ? val : acc; // take max (usually same across rows)
            }, 0);

            return (
              <>
                <TableRow key={`group-${linha}`} className={`${colorClass} hover:bg-[hsl(var(--table-row-hover))]`}> 
                  <TableCell colSpan={8} className="font-semibold">
                    <div className="flex items-center justify-between">
                      <div>
                        LINHA {linha}
                        <span className="ml-3 text-xs text-muted-foreground">{rows.length} SKU(s)</span>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <span>HCs: <strong>{fmt(hcsLine)}</strong></span>
                        <span>Prog. do dia: <strong>{fmt(totalProg)}</strong></span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                {rows.map((product, index) => (
                  <TableRow key={`row-${linha}-${index}`} className={`hover:bg-[hsl(var(--table-row-hover))]`}>
                    {/* Não repetir a LINHA nas linhas do grupo */}
                    <TableCell className="font-medium">{/* vazio de propósito */}</TableCell>
                    <TableCell>{product.TURNO}</TableCell>
                    <TableCell className="font-mono text-sm">{product.CÓDIGO || (product as any)['CODIGO']}</TableCell>
                    <TableCell>{product.PRODUTO}</TableCell>
                    <TableCell>{(product as any).OP || ''}</TableCell>
                    <TableCell>{fmt((product as any).HCs as number)}</TableCell>
                    <TableCell>{fmt((product as any).PROG_DIA as number)}</TableCell>
                    <TableCell>{product.RATE}</TableCell>
                  </TableRow>
                ))}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
