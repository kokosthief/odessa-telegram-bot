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
      console.log('DJ data loaded successfully');
      return this.djData || {};
    } catch (error) {
      console.error('Error loading DJ data:', error);
      return {};
    }
  }

  /**
   * Get DJ information by name
   */
  getDJInfo(djName: string): { link?: string } | null {
    const djData = this.loadDJData();
    return djData[djName] || null;
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