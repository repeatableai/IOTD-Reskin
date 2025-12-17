import * as XLSX from 'xlsx';

export interface SpreadsheetRow {
  [key: string]: any;
}

export class SpreadsheetParser {
  /**
   * Parse spreadsheet file (CSV or Excel) and return array of row objects
   * Uses streaming for large files to avoid memory issues
   */
  async parse(fileBuffer: Buffer, filename?: string): Promise<SpreadsheetRow[]> {
    try {
      // Detect file type from extension or content
      const isCSV = filename?.endsWith('.csv') || this.detectCSV(fileBuffer);
      
      if (isCSV) {
        return this.parseCSV(fileBuffer);
      } else {
        return this.parseExcel(fileBuffer);
      }
    } catch (error) {
      console.error('[Spreadsheet Parser] Error parsing file:', error);
      throw new Error(`Failed to parse spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect if buffer contains CSV content
   */
  private detectCSV(buffer: Buffer): boolean {
    const text = buffer.toString('utf-8', 0, Math.min(1000, buffer.length));
    // CSV typically has commas or semicolons and newlines
    return /[,;]/.test(text) && /\n/.test(text);
  }

  /**
   * Parse CSV file
   */
  private parseCSV(buffer: Buffer): SpreadsheetRow[] {
    try {
      const text = buffer.toString('utf-8');
      const workbook = XLSX.read(text, { type: 'string' });
      
      if (workbook.SheetNames.length === 0) {
        throw new Error('CSV file has no sheets');
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const rows = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '', // Default value for empty cells
        raw: false, // Convert dates and numbers to strings
      }) as SpreadsheetRow[];
      
      // Filter out completely empty rows
      return rows.filter(row => {
        return Object.values(row).some(value => value !== '' && value !== null && value !== undefined);
      });
    } catch (error) {
      console.error('[Spreadsheet Parser] CSV parsing error:', error);
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Excel file (.xlsx, .xls)
   */
  private parseExcel(buffer: Buffer): SpreadsheetRow[] {
    try {
      const workbook = XLSX.read(buffer, { 
        type: 'buffer',
        cellDates: false, // Keep dates as strings
        cellNF: false, // Don't parse number formats
      });
      
      if (workbook.SheetNames.length === 0) {
        throw new Error('Excel file has no sheets');
      }
      
      // Use first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: '', // Default value for empty cells
        raw: false, // Convert dates and numbers to strings
      }) as SpreadsheetRow[];
      
      // Filter out completely empty rows
      return rows.filter(row => {
        return Object.values(row).some(value => value !== '' && value !== null && value !== undefined);
      });
    } catch (error) {
      console.error('[Spreadsheet Parser] Excel parsing error:', error);
      throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that parsed rows have required structure
   */
  validateRows(rows: SpreadsheetRow[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (rows.length === 0) {
      errors.push('Spreadsheet contains no data rows');
    }
    
    // Check if rows have at least some data
    const emptyRows = rows.filter(row => {
      const values = Object.values(row);
      return values.every(v => v === '' || v === null || v === undefined);
    });
    
    if (emptyRows.length > 0) {
      errors.push(`Found ${emptyRows.length} completely empty rows`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const spreadsheetParser = new SpreadsheetParser();

