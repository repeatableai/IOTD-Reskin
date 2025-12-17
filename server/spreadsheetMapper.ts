import type { SpreadsheetRow } from './spreadsheetParser';

export interface MappedIdeaData {
  title?: string;
  description?: string;
  content?: string;
  problem?: string;
  solution?: string;
  targetAudience?: string;
  market?: string;
  type?: string;
  previewUrl?: string | null;
  imageUrl?: string | null;
  [key: string]: any; // Allow additional fields for AI prompt
}

export class SpreadsheetMapper {
  /**
   * Case-insensitive column name matching
   */
  private findColumn(row: SpreadsheetRow, ...names: string[]): any {
    const lowerNames = names.map(n => n.toLowerCase().trim());
    for (const key in row) {
      const lowerKey = key.toLowerCase().trim();
      if (lowerNames.includes(lowerKey)) {
        return row[key];
      }
    }
    return undefined;
  }

  /**
   * Validate and normalize URL
   */
  private validateUrl(url: any): string | null {
    if (!url || typeof url !== 'string') return null;
    
    const trimmed = url.trim();
    if (!trimmed) return null;
    
    try {
      // Normalize URL - add https:// if missing
      let normalized = trimmed;
      if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
        normalized = `https://${normalized}`;
      }
      
      // Validate URL format
      new URL(normalized);
      return normalized;
    } catch {
      console.warn(`[Mapper] Invalid URL: ${trimmed}`);
      return null;
    }
  }

  /**
   * Coerce to number with validation
   */
  private coerceNumber(value: any, defaultValue: number): number {
    if (typeof value === 'number') {
      return isNaN(value) ? defaultValue : value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) return parsed;
    }
    return defaultValue;
  }

  /**
   * Map spreadsheet row to idea data structure
   * Adaptive mapping that works with ANY CSV format by intelligently detecting URLs, titles, and descriptions
   */
  async mapRow(row: SpreadsheetRow): Promise<MappedIdeaData> {
    const columnKeys = Object.keys(row);
    
    // STEP 1: Find URL in ANY column (required)
    let previewUrl: string | null = null;
    let urlColumnKey: string | null = null;
    
    // First, try column name matching for URL
    previewUrl = this.validateUrl(
      this.findColumn(row, 
        'preview_url', 'previewUrl', 'preview', 'demo_url', 'demo', 
        'app_preview', 'preview_link', 'url', 'link', 'website', 
        'app_url', 'linked for app/site/presentation', 'linked',
        'app/site/presentation'
      )
    );
    
    // If not found by name, scan all columns for URL patterns
    if (!previewUrl) {
      for (const key of columnKeys) {
        const value = row[key];
        if (value && typeof value === 'string') {
          const trimmed = value.trim();
          // Check if it looks like a URL
          if (trimmed.match(/^(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|app|dev|co|ai|tech|xyz|me|ly))/i)) {
            const detectedUrl = this.validateUrl(trimmed);
            if (detectedUrl) {
              previewUrl = detectedUrl;
              urlColumnKey = key;
              console.log(`[Mapper] Found URL in column "${key}": ${previewUrl}`);
              break;
            }
          }
        }
      }
    } else {
      // Find which column had the URL for exclusion later
      for (const key of columnKeys) {
        const value = row[key];
        if (value && typeof value === 'string' && this.validateUrl(value) === previewUrl) {
          urlColumnKey = key;
          break;
        }
      }
    }
    
    // STEP 2: Find title (optional - will be extracted from URL if missing)
    let title = '';
    
    // Try column name matching first
    title = this.findColumn(row, 
      'title', 'name', 'app_name', 'solution_name', 'idea_name',
      'format name/description', 'format name', 'format description'
    ) || '';
    
    // If not found, try first non-URL column that looks like a title
    if (!title) {
      for (const key of columnKeys) {
        if (key !== urlColumnKey) {
          const value = row[key];
          if (value && typeof value === 'string') {
            const trimmed = value.trim();
            // If it's a short string (likely a title) and not empty
            if (trimmed.length > 0 && trimmed.length < 200) {
              title = trimmed;
              break;
            }
          }
        }
      }
    }
    
    // STEP 3: Find description (optional - will be extracted from URL if missing)
    let description = '';
    
    // Try column name matching
    description = this.findColumn(row,
      'description', 'desc', 'summary', 'overview', 'brief',
      'app details', 'app_details', 'details'
    ) || '';
    
    // If not found, try second non-URL column
    if (!description) {
      let foundFirst = false;
      for (const key of columnKeys) {
        if (key !== urlColumnKey) {
          if (!foundFirst) {
            foundFirst = true;
            continue; // Skip first non-URL column (likely title)
          }
          const value = row[key];
          if (value && typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed.length > 0) {
              description = trimmed;
              break;
            }
          }
        }
      }
    }
    
    // STEP 4: Extract other optional fields
    const content = description || this.findColumn(row, 'content', 'details', 'full_description', 'long_description', 'body') || '';
    const problem = this.findColumn(row, 'problem', 'pain_point', 'issue', 'challenge', 'problem_statement');
    const solution = this.findColumn(row, 'solution', 'answer', 'fix', 'approach', 'solution_description');
    const targetAudience = this.findColumn(row,
      'target_audience', 'audience', 'target', 'users', 'customer', 'target_market',
      'ideal for industries', 'ideal for industry', 'industries'
    ) || '';
    
    // Infer market from targetAudience
    const market = targetAudience.toLowerCase().includes('business') || 
                   targetAudience.toLowerCase().includes('enterprise') || 
                   targetAudience.toLowerCase().includes('b2b') 
                   ? 'B2B' : 'B2C';
    
    const type = this.findColumn(row,
      'type', 'app_type', 'category', 'product_type', 'category'
    ) || 'web_app';
    
    const imageUrl = this.validateUrl(
      this.findColumn(row, 'image_url', 'imageUrl', 'image', 'logo_url', 'logo', 'thumbnail', 'thumbnail_url')
    );
    
    // Build mapped data object
    const mapped: MappedIdeaData = {
      title: title.trim(),
      description: description.trim(),
      content: content.trim() || description.trim(),
      problem,
      solution,
      targetAudience,
      market: market as string,
      type: type as string,
      previewUrl,
      imageUrl,
    };
    
    // Include ALL other columns as context for AI (even if we don't recognize them)
    for (const key in row) {
      if (!mapped.hasOwnProperty(key.toLowerCase()) && key !== urlColumnKey) {
        mapped[key] = row[key];
      }
    }
    
    return mapped;
  }

  /**
   * Validate mapped data has minimum required fields
   * Only previewUrl is required - title and description can be extracted from URL
   */
  validateMappedData(data: MappedIdeaData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Only previewUrl is required - title and description can be extracted from the URL
    if (!data.previewUrl || data.previewUrl.trim().length === 0) {
      errors.push('Preview URL is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const spreadsheetMapper = new SpreadsheetMapper();

