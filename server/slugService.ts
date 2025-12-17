/**
 * Slug generation service with collision detection
 * Ensures unique slugs by checking against existing slugs in memory set AND database
 */
import { storage } from './storage';

export class SlugService {
  /**
   * Generate a unique slug from a title
   * Checks against existing slugs set AND database to avoid collisions
   */
  async generateUniqueSlug(baseTitle: string, existingSlugs: Set<string>): Promise<string> {
    // Generate base slug from title
    let slug = baseTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    // If slug is empty, use timestamp fallback
    if (!slug) {
      slug = `idea-${Date.now()}`;
    }
    
    // Check for collisions and append counter if needed
    let finalSlug = slug;
    let counter = 1;
    
    // Check both in-memory set AND database
    while (existingSlugs.has(finalSlug) || await this.slugExistsInDatabase(finalSlug)) {
      finalSlug = `${slug}-${counter}`;
      counter++;
      
      // Safety check - if too many collisions, use timestamp
      if (counter > 1000) {
        finalSlug = `${slug}-${Date.now()}`;
        break;
      }
    }
    
    // Add to set to track for future collisions
    existingSlugs.add(finalSlug);
    
    return finalSlug;
  }

  /**
   * Check if a slug exists in the database (both published and unpublished)
   */
  private async slugExistsInDatabase(slug: string): Promise<boolean> {
    try {
      // Check database for any idea with this slug (published or unpublished)
      const exists = await storage.slugExists(slug);
      return exists;
    } catch (error) {
      // If there's an error checking, assume it doesn't exist to avoid blocking
      console.warn(`[SlugService] Error checking slug existence for "${slug}":`, error);
      return false;
    }
  }

  /**
   * Generate slug from title (without collision checking)
   * Useful for single slug generation
   */
  generateSlug(title: string): string {
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    if (!slug) {
      slug = `idea-${Date.now()}`;
    }
    
    return slug;
  }
}

export const slugService = new SlugService();

