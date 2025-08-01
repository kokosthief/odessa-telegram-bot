import fs from 'fs';
import path from 'path';

export interface DJInfo {
  name: string;
  shortDescription: string;
  image: string;
  soundcloud?: string | undefined;
  instagram?: string | undefined;
  website?: string | undefined;
  email?: string | undefined;
}

export class DJDataLoader {
  private djData: Map<string, DJInfo> = new Map();

  constructor() {
    this.loadDJData();
  }

  /**
   * Load DJ data from CSV file
   */
  private loadDJData(): void {
    try {
      const csvPath = path.join(process.cwd(), 'Musical_Facilitators.csv');
      console.log('Looking for CSV file at:', csvPath);
      
      if (!fs.existsSync(csvPath)) {
        console.warn('Musical_Facilitators.csv not found, DJ data will not be available');
        return;
      }

      console.log('CSV file found, loading data...');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n');
      console.log(`CSV has ${lines.length} lines`);
      
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse CSV line (handling quoted fields)
        const fields = this.parseCSVLine(line);
        console.log(`Line ${i}: ${fields.length} fields, first field: "${fields[0] || 'undefined'}"`);
        
        if (fields.length >= 8 && fields[0]) {
          const djInfo: DJInfo = {
            name: fields[0]?.replace(/"/g, '').trim() || '',
            shortDescription: fields[2]?.replace(/"/g, '').trim() || '',
            image: fields[1]?.replace(/"/g, '').trim() || '',
            soundcloud: fields[4]?.replace(/"/g, '').trim() || undefined,
            instagram: fields[5]?.replace(/"/g, '').trim() || undefined,
            website: fields[6]?.replace(/"/g, '').trim() || undefined,
            email: fields[7]?.replace(/"/g, '').trim() || undefined
          };

          // Store by normalized name (lowercase, no spaces)
          const normalizedName = this.normalizeName(djInfo.name);
          this.djData.set(normalizedName, djInfo);
          console.log(`Loaded DJ: "${djInfo.name}" -> normalized: "${normalizedName}"`);
        }
      }

      console.log(`Loaded ${this.djData.size} DJ records from CSV`);
      console.log('Available DJs:', Array.from(this.djData.keys()));
    } catch (error) {
      console.error('Error loading DJ data:', error);
    }
  }

  /**
   * Parse CSV line handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    fields.push(currentField);
    return fields;
  }

  /**
   * Normalize DJ name for matching
   */
  private normalizeName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  }

  /**
   * Get DJ information by name
   */
  getDJInfo(djName: string): DJInfo | null {
    const normalizedName = this.normalizeName(djName);
    console.log(`Looking for DJ: "${djName}" -> normalized: "${normalizedName}"`);
    console.log('Available normalized names:', Array.from(this.djData.keys()));
    
    const result = this.djData.get(normalizedName);
    if (result) {
      console.log(`Found DJ info for "${djName}":`, result);
      return result;
    } else {
      console.log(`No DJ info found for "${djName}"`);
      return null;
    }
  }

  /**
   * Get all DJ names
   */
  getAllDJNames(): string[] {
    return Array.from(this.djData.values()).map(dj => dj.name);
  }

  /**
   * Get the best online link for a DJ (SoundCloud preferred, then Instagram, then Website)
   */
  getBestOnlineLink(djInfo: DJInfo): { url: string; platform: string } | null {
    if (djInfo.soundcloud && djInfo.soundcloud.trim()) {
      return { url: djInfo.soundcloud.trim(), platform: 'SoundCloud' };
    }
    
    if (djInfo.instagram && djInfo.instagram.trim()) {
      return { url: djInfo.instagram.trim(), platform: 'Instagram' };
    }
    
    if (djInfo.website && djInfo.website.trim()) {
      return { url: djInfo.website.trim(), platform: 'Website' };
    }
    
    return null;
  }
} 