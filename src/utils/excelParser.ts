import * as XLSX from 'xlsx';
import { ProductRow, ParsedData, DayColumns } from '@/types/excel';

const DAY_NAMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

// Regex to match day columns: PROG, REAL, SET-UP, RAMP with optional .N suffix
const DAY_COLUMN_REGEX = /^(PROG|REAL|SET-UP|RAMP)(\.\d+)?$/i;

export const parseExcelFile = async (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as any[][];

        // Find header row (contains PRODUTO and CÓDIGO)
        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const hasProduct = row.some((cell: any) => 
            String(cell).toUpperCase().includes('PRODUTO')
          );
          const hasCode = row.some((cell: any) => 
            String(cell).toUpperCase().includes('CÓDIGO') || 
            String(cell).toUpperCase().includes('CODIGO')
          );
          
          if (hasProduct && hasCode) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('Header row not found (looking for PRODUTO and CÓDIGO columns)');
        }

        const headers = jsonData[headerRowIndex].map((h: any) => String(h).trim());
        
        // Identify day columns
        const dayColumnsMap = new Map<number, string[]>();
        headers.forEach((header, index) => {
          const match = header.match(DAY_COLUMN_REGEX);
          if (match) {
            const suffix = match[2] ? parseInt(match[2].substring(1)) : 0;
            if (!dayColumnsMap.has(suffix)) {
              dayColumnsMap.set(suffix, []);
            }
            dayColumnsMap.get(suffix)!.push(header);
          }
        });

        // Sort day indices and limit to 5 days
        const sortedDayIndices = Array.from(dayColumnsMap.keys()).sort((a, b) => a - b).slice(0, 5);
        
        // Parse data rows
        const dataRows: ProductRow[] = [];
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowObj: any = {};
          
          headers.forEach((header, colIndex) => {
            rowObj[header] = row[colIndex] !== undefined ? String(row[colIndex]).trim() : '';
          });

          // Skip if PRODUTO is empty
          const produto = rowObj['PRODUTO'] || rowObj['Produto'] || '';
          if (!produto) continue;

          dataRows.push(rowObj as ProductRow);
        }

        // Deduplicate by LINHA + PRODUTO
        const seenKeys = new Set<string>();
        const uniqueRows = dataRows.filter(row => {
          const linha = row['LINHA'] || '';
          const produto = row['PRODUTO'] || row['Produto'] || '';
          const key = `${linha}|${produto}`;
          
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });

        // Filter products by day
        const dayData = sortedDayIndices.map((dayIndex, i) => {
          const dayColumns = dayColumnsMap.get(dayIndex) || [];
          
          const activeProducts = uniqueRows.filter(row => {
            // Check if any column for this day has an active value
            return dayColumns.some(colName => {
              const value = String(row[colName] || '').trim().toLowerCase();
              // Active if: not empty, not "0", or is "x"
              return value && value !== '0' && value !== 'nan' || value === 'x';
            });
          });

          return {
            day: `D${i + 1}`,
            dayName: DAY_NAMES[i] || `Dia ${i + 1}`,
            products: activeProducts
          };
        });

        resolve({
          headers,
          allRows: uniqueRows,
          dayData
        });

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const exportToXLSX = (data: ProductRow[], filename: string) => {
  // Select only key columns
  const exportData = data.map(row => ({
    LINHA: row.LINHA || '',
    TURNO: row.TURNO || '',
    CÓDIGO: row.CÓDIGO || row['CODIGO'] || '',
    PRODUTO: row.PRODUTO || '',
    RATE: row.RATE || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plan');
  XLSX.writeFile(wb, filename);
};

export const exportToCSV = (data: ProductRow[], filename: string) => {
  const exportData = data.map(row => ({
    LINHA: row.LINHA || '',
    TURNO: row.TURNO || '',
    CÓDIGO: row.CÓDIGO || row['CODIGO'] || '',
    PRODUTO: row.PRODUTO || '',
    RATE: row.RATE || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
