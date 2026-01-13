import { readFileSync } from 'fs';
import { join } from 'path';
import { DJDatabase } from '../types/dj';

export class DJLoader {
  private djData: DJDatabase | null = null;

  /**
   * Load DJ data from JSON file
   */
  loadDJData(): DJDatabase {
    if (this.djData) {
      return this.djData;
    }

    try {
      const filePath = join(process.cwd(), 'src', 'data', 'djs.json');
      const fileContent = readFileSync(filePath, 'utf-8');
      this.djData = JSON.parse(fileContent);
      console.log(`✅ DJ data loaded successfully (${Object.keys(this.djData || {}).length} DJs)`);
      return this.djData || {};
    } catch (error) {
      console.error('❌ Error loading DJ data:', error);
      if (error instanceof SyntaxError) {
        console.error('   JSON syntax error - check for missing commas or brackets');
      }
      return {};
    }
  }

  /**
   * Normalize DJ name for matching (trim, lowercase, normalize special characters)
   * Handles apostrophes, hyphens, and other special characters
   */
  private normalizeName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[''`]/g, "'") // Normalize different apostrophe types
      .replace(/[-–—]/g, "-") // Normalize different hyphen types
      .replace(/'/g, "-") // Treat apostrophe as hyphen for matching (Ma'rifa = Ma-rifa)
      .replace(/\s+/g, " "); // Normalize whitespace
  }

  /**
   * Find DJ by name with fuzzy matching
   * Tries exact match first, then case-insensitive, then normalized special chars, then partial match
   */
  private findDJByName(djName: string, djData: DJDatabase): string | null {
    const normalized = this.normalizeName(djName);
    
    // Try exact match first
    if (djData[normalized]) {
      return normalized;
    }
    
    // Try case-insensitive match
    const lowerNormalized = normalized.toLowerCase();
    for (const key in djData) {
      if (key.toLowerCase() === lowerNormalized) {
        return key;
      }
    }
    
    // Try normalized match (handles apostrophes, hyphens, etc.)
    for (const key in djData) {
      const normalizedKey = this.normalizeName(key);
      if (normalizedKey === normalized) {
        return key;
      }
    }
    
    // Try partial match (if "Ruby" is searched but "RubyDub" exists)
    for (const key in djData) {
      const keyLower = this.normalizeName(key);
      if (keyLower.includes(normalized) || normalized.includes(keyLower)) {
        return key;
      }
    }
    
    return null;
  }

  /**
   * Get DJ information by name with fuzzy matching
   */
  getDJInfo(djName: string): { link?: string; photo?: string } | null {
    const djData = this.loadDJData();
    
    // Try exact match first
    if (djData[djName]) {
      return djData[djName];
    }
    
    // Try fuzzy matching
    const matchedKey = this.findDJByName(djName, djData);
    if (matchedKey) {
      const result = djData[matchedKey];
      return result || null;
    }
    
    return null;
  }

  /**
   * Get all DJ names
   */
  getAllDJNames(): string[] {
    const djData = this.loadDJData();
    return Object.keys(djData);
  }

  /**
   * Check if DJ exists in database
   */
  hasDJ(djName: string): boolean {
    const djData = this.loadDJData();
    return djName in djData;
  }
} 