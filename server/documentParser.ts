/**
 * Document Parser Service
 * Extracts text content from various document formats
 */

import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
// pdf-parse is a CommonJS module, import it dynamically
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface ParsedDocument {
  text: string;
  type: 'docx' | 'xlsx' | 'pdf' | 'md' | 'json' | 'html' | 'txt';
  metadata?: {
    pages?: number;
    sheets?: string[];
    wordCount?: number;
  };
}

export class DocumentParser {
  /**
   * Parse DOCX file
   */
  async parseDocx(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      
      return {
        text,
        type: 'docx',
        metadata: {
          wordCount: text.split(/\s+/).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Excel file (XLSX, XLS)
   */
  async parseExcel(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;
      
      // Extract text from all sheets
      const allText: string[] = [];
      
      sheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        // Convert to readable text
        const sheetText = jsonData
          .map((row: any) => Array.isArray(row) ? row.join(' | ') : String(row))
          .join('\n');
        
        allText.push(`=== Sheet: ${sheetName} ===\n${sheetText}`);
      });
      
      const text = allText.join('\n\n');
      
      return {
        text,
        type: 'xlsx',
        metadata: {
          sheets: sheetNames,
          wordCount: text.split(/\s+/).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse PDF file
   */
  async parsePdf(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const data = await pdfParse(buffer);
      
      return {
        text: data.text,
        type: 'pdf',
        metadata: {
          pages: data.numpages,
          wordCount: data.text.split(/\s+/).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Markdown file
   */
  async parseMarkdown(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const text = buffer.toString('utf-8');
      
      return {
        text,
        type: 'md',
        metadata: {
          wordCount: text.split(/\s+/).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse Markdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse JSON file
   */
  async parseJson(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const jsonString = buffer.toString('utf-8');
      const json = JSON.parse(jsonString);
      
      // Convert JSON to readable text format
      const text = JSON.stringify(json, null, 2);
      
      return {
        text,
        type: 'json',
        metadata: {
          wordCount: text.split(/\s+/).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse HTML file
   * Returns full HTML content (not just text) for deep analysis
   */
  async parseHtml(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const html = buffer.toString('utf-8');
      // Return full HTML content for deep analysis
      // Also extract text for metadata purposes
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return {
        text: html, // Return full HTML for analysis, not just text
        type: 'html',
        metadata: {
          wordCount: text.split(/\s+/).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse text file
   */
  async parseText(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const text = buffer.toString('utf-8');
      
      return {
        text,
        type: 'txt',
        metadata: {
          wordCount: text.split(/\s+/).length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Auto-detect file type and parse
   */
  async parseDocument(buffer: Buffer, filename: string, mimeType?: string): Promise<ParsedDocument> {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Determine file type
    if (mimeType?.includes('wordprocessingml') || extension === 'docx') {
      return this.parseDocx(buffer);
    } else if (
      mimeType?.includes('spreadsheetml') || 
      mimeType?.includes('excel') ||
      extension === 'xlsx' || 
      extension === 'xls'
    ) {
      return this.parseExcel(buffer);
    } else if (mimeType === 'application/pdf' || extension === 'pdf') {
      return this.parsePdf(buffer);
    } else if (extension === 'md' || extension === 'markdown') {
      return this.parseMarkdown(buffer);
    } else if (mimeType === 'application/json' || extension === 'json') {
      return this.parseJson(buffer);
    } else if (mimeType === 'text/html' || extension === 'html' || extension === 'htm') {
      return this.parseHtml(buffer);
    } else {
      // Default to text parsing
      return this.parseText(buffer);
    }
  }
}

export const documentParser = new DocumentParser();

