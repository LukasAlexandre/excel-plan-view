import * as XLSX from 'xlsx';
import { ProductRow, ParsedData } from '@/types/excel';

// Regex to match day columns: PROG, REAL, SET-UP, RAMP
const DAY_COLUMN_REGEX = /^(PROG|REAL|SET-UP|RAMP)$/i;

export const parseExcelFile = async (file: File, targetDate?: Date, shift?: string): Promise<ParsedData> => {
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
        
        // Get date row (one row above header)
        const dateRow = headerRowIndex > 0 ? jsonData[headerRowIndex - 1] : [];
        
        // Find columns that match the target date
        const targetDateColumns: number[] = [];
        if (targetDate) {
          dateRow.forEach((cell: any, index: number) => {
            if (cell) {
              let cellDate: Date | null = null;
              
              // Try parsing as date object
              if (cell instanceof Date) {
                cellDate = cell;
              } else {
                // Try parsing string date (format: "23-Oct")
                const dateStr = String(cell).trim();
                const match = dateStr.match(/(\d+)-(\w+)/);
                if (match) {
                  const day = parseInt(match[1]);
                  const monthStr = match[2];
                  const monthMap: { [key: string]: number } = {
                    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                  };
                  const month = monthMap[monthStr];
                  if (month !== undefined) {
                    const year = targetDate.getFullYear();
                    cellDate = new Date(year, month, day);
                  }
                }
              }
              
              // Check if dates match (same day, month, year)
              if (cellDate) {
                if (
                  cellDate.getDate() === targetDate.getDate() &&
                  cellDate.getMonth() === targetDate.getMonth()
                ) {
                  targetDateColumns.push(index);
                }
              }
            }
          });
        }
        
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

        // Filter by shift if specified
        let filteredRows = dataRows;
        if (shift) {
          filteredRows = dataRows.filter(row => {
            const turno = String(row['TURNO'] || '').trim();
            return turno === shift;
          });
        }

        // If target date specified, filter by active products on that date
        let activeProducts = filteredRows;
        if (targetDate && targetDateColumns.length > 0) {
          activeProducts = filteredRows.filter(row => {
            // Check if any column for the target date has an active value
            return targetDateColumns.some(colIndex => {
              const header = headers[colIndex];
              const value = String(row[header] || '').trim().toLowerCase();
              // Active if: "x" or any non-zero number
              return value === 'x' || (value && value !== '0' && value !== 'nan' && !isNaN(Number(value)));
            });
          });
        }

        // Deduplicate by LINHA + PRODUTO
        const seenKeys = new Set<string>();
        const uniqueRows = activeProducts.filter(row => {
          const linha = row['LINHA'] || '';
          const produto = row['PRODUTO'] || row['Produto'] || '';
          const key = `${linha}|${produto}`;
          
          if (seenKeys.has(key)) return false;
          seenKeys.add(key);
          return true;
        });

        resolve({
          headers,
          allRows: uniqueRows,
          dayData: []
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
