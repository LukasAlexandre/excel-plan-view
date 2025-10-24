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
          console.log('🔍 Target Date:', targetDate);
          console.log('📅 Date Row:', dateRow);
          
          dateRow.forEach((cell: any, index: number) => {
            if (cell) {
              let cellDate: Date | null = null;
              
              // Try parsing as date object
              if (cell instanceof Date) {
                cellDate = cell;
              } else {
                // Try parsing string date (format: "23/out" or "23-Oct")
                const dateStr = String(cell).trim();
                
                // Match "23/out" format
                const matchPt = dateStr.match(/(\d+)\/(\w+)/);
                if (matchPt) {
                  const day = parseInt(matchPt[1]);
                  const monthStr = matchPt[2].toLowerCase();
                  const monthMapPt: { [key: string]: number } = {
                    'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
                    'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
                  };
                  const month = monthMapPt[monthStr];
                  if (month !== undefined) {
                    const year = targetDate.getFullYear();
                    cellDate = new Date(year, month, day);
                  }
                }
                
                // Match "23-Oct" format
                const matchEn = dateStr.match(/(\d+)-(\w+)/);
                if (matchEn && !cellDate) {
                  const day = parseInt(matchEn[1]);
                  const monthStr = matchEn[2];
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
                  console.log(`✅ Found matching date column at index ${index}: ${headers[index]}`);
                  targetDateColumns.push(index);
                }
              }
            }
          });
          
          console.log('📊 Target Date Columns:', targetDateColumns.map(idx => `${idx}: ${headers[idx]}`));
        }
        
        // Parse data rows
        const dataRows: ProductRow[] = [];
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowObj: any = {};
          
          headers.forEach((header, colIndex) => {
            rowObj[header] = row[colIndex] !== undefined ? String(row[colIndex]).trim() : '';
          });

          // Keep a reference to the raw cells so we can access columns by index
          // This avoids collisions when headers repeat (e.g., multiple REAL/PROG per dia)
          rowObj.__cells = row;

          // Skip if PRODUTO is empty
          const produto = rowObj['PRODUTO'] || rowObj['Produto'] || '';
          if (!produto) continue;

          dataRows.push(rowObj as ProductRow);
        }

        // Filter by shift if specified
        let filteredRows = dataRows;
        if (shift) {
          console.log(`🔄 Filtering by shift: ${shift}`);
          console.log(`📊 Total rows before shift filter: ${dataRows.length}`);
          
          filteredRows = dataRows.filter(row => {
            const turno = String(row['TURNO'] || '').trim();
            const linha = row['LINHA'] || '';
            const produto = row['PRODUTO'] || '';
            
            // Log first few rows to debug
            if (dataRows.indexOf(row) < 10) {
              console.log(`Row ${dataRows.indexOf(row)}: LINHA=${linha}, TURNO="${turno}", Match=${turno === shift}`);
            }
            
            return turno === shift;
          });
          
          console.log(`📊 Total rows after shift filter: ${filteredRows.length}`);
        }

        // If target date specified, filter by active products on that date
        let activeProducts = filteredRows;
        if (targetDate && targetDateColumns.length > 0) {
          console.log(`🔎 Filtering ${filteredRows.length} rows by target date columns...`);

          activeProducts = filteredRows.filter(row => {
            const linha = row['LINHA'] || '';
            const produto = row['PRODUTO'] || '';
            const turno = row['TURNO'] || '';

            // Check if any of the matched columns for the target date has a meaningful value
            const hasValue = targetDateColumns.some(colIndex => {
              const header = headers[colIndex];
              const rawCells = (row as any).__cells as any[] | undefined;
              const cellValue = rawCells ? rawCells[colIndex] : undefined;
              const value = String(cellValue ?? '').trim();

              // Debug first few rows
              if (filteredRows.indexOf(row) < 5) {
                console.log(`  📋 Row ${filteredRows.indexOf(row)}: LINHA=${linha}, Header="${header}"[${colIndex}], Value="${value}"`);
              }

              if (value === '' || value === 'undefined' || value === 'null') {
                return false;
              }

              // Numeric values must be > 0
              const numValue = Number(value.toString().replace(/\./g, '').replace(',', '.'));
              if (!isNaN(numValue)) {
                return numValue > 0;
              }

              // Non-numeric markers (like 'x'/'X') indicate activity
              return value.toLowerCase() === 'x';
            });

            if (hasValue) {
              console.log(`✅ Active: ${linha} - ${produto} (Turno ${turno})`);
            }

            return hasValue;
          });

          console.log(`✅ Found ${activeProducts.length} active products for target date`);
        } else if (targetDate && targetDateColumns.length === 0) {
          console.warn('⚠️ No columns found for target date!');
        }

        // Deduplicate by LINHA only (show only the first product for each line)
        const seenLines = new Set<string>();
        const uniqueRows = activeProducts.filter(row => {
          const linha = row['LINHA'] || '';
          
          if (!linha) return false; // Skip rows without LINHA
          
          if (seenLines.has(linha)) {
            console.log(`❌ Skipping duplicate LINHA: ${linha}`);
            return false;
          }
          
          seenLines.add(linha);
          console.log(`✅ Keeping LINHA: ${linha} - ${row['PRODUTO']}`);
          return true;
        });
        
        console.log(`🎯 Final unique rows: ${uniqueRows.length} (deduplicated by LINHA)`);

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
