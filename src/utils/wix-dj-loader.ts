import { DJLoader } from './dj-loader';

export interface WixDJData {
  _id: string;
  name: string;
  slug?: string;
  photo?: string;
  shortDescription?: string;
  longDescription?: string;
  soundcloudUrl?: string;
  instagramUrl?: string;
  website?: string;
  email?: string;
}

export interface WixQueryResponse {
  data: WixDJData[];
  pagingMetadata: {
    count: number;
    offset: number;
    total: number;
  };
}

export class WixDJLoader {
  private apiKey: string;
  private siteId: string;
  private baseUrl: string;
  private fallbackLoader: DJLoader;
  private cache: Map<string, { data: WixDJData | null; timestamp: number }>;
  private cacheDuration: number;

  constructor() {
    this.apiKey = process.env['WIX_API_KEY'] || '';
    this.siteId = process.env['WIX_SITE_ID'] || '';
    this.baseUrl = 'https://www.wixapis.com/wix-data/v2';
    this.fallbackLoader = new DJLoader();
    this.cache = new Map();
    this.cacheDuration = parseInt(process.env['WIX_CACHE_DURATION'] || '3600') * 1000; // Convert to milliseconds
  }

  /**
   * Get enhanced DJ information from Wix CMS
   */
  async getEnhancedDJInfo(djName: string): Promise<WixDJData | null> {
    try {
      console.log(`🔍 Looking up DJ "${djName}" in Wix CMS...`);
      
      // Check cache first
      const cached = this.getCachedDJInfo(djName);
      if (cached) {
        console.log(`✅ Using cached Wix data for DJ: ${djName}`);
        return cached;
      }

      // Query Wix API
      console.log(`🌐 Querying Wix API for DJ: ${djName}`);
      const djData = await this.queryWixAPI(djName);
      
      if (djData) {
        console.log(`✅ Found DJ "${djName}" in Wix CMS`);
      } else {
        console.log(`❌ DJ "${djName}" not found in Wix CMS`);
      }
      
      // Cache the result
      this.cacheDJInfo(djName, djData);
      
      return djData;
    } catch (error) {
      console.error(`❌ Error getting Wix DJ info for ${djName}:`, error);
      return null;
    }
  }

  /**
   * Query Wix Data API for DJ information
   */
  private async queryWixAPI(djName: string): Promise<WixDJData | null> {
    if (!this.apiKey || !this.siteId) {
      console.warn('⚠️ Wix API credentials not configured, falling back to JSON data');
      return null;
    }

    console.log(`🌐 Making Wix API request for DJ: ${djName}`);
    console.log(`   API Key: ${this.apiKey ? '✅ Set' : '❌ Not set'}`);
    console.log(`   Site ID: ${this.siteId ? '✅ Set' : '❌ Not set'}`);

    try {
      const requestBody = {
        collectionId: 'Musical Facilitators',
        query: {
          filter: {
            name: {
              $eq: djName
            }
          },
          paging: {
            limit: 1
          }
        }
      };

      console.log(`📤 Request body:`, JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.baseUrl}/items/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey,
          'wix-site-id': this.siteId
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Wix API error: ${response.status} ${response.statusText}`);
        console.error(`   Error details: ${errorText}`);
        throw new Error(`Wix API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json() as WixQueryResponse;
      console.log(`📊 Response data:`, JSON.stringify(result, null, 2));
      
      if (result.data && result.data.length > 0) {
        console.log(`✅ Found Wix data for DJ: ${djName}`);
        return result.data[0] || null;
      } else {
        console.log(`❌ No Wix data found for DJ: ${djName}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Wix API query failed:', error);
      return null;
    }
  }

  /**
   * Get DJ info with fallback to existing JSON data
   */
  async getDJInfoWithFallback(djName: string): Promise<{
    name: string;
    photo?: string | undefined;
    shortDescription?: string | undefined;
    soundcloudUrl?: string | undefined;
    instagramUrl?: string | undefined;
    website?: string | undefined;
  } | null> {
    // Try Wix data first
    const wixData = await this.getEnhancedDJInfo(djName);
    
    if (wixData) {
      return {
        name: wixData.name,
        photo: wixData.photo || undefined,
        shortDescription: wixData.shortDescription || undefined,
        soundcloudUrl: wixData.soundcloudUrl || undefined,
        instagramUrl: wixData.instagramUrl || undefined,
        website: wixData.website || undefined
      };
    }

    // Fallback to existing JSON data
    const fallbackData = this.fallbackLoader.getDJInfo(djName);
    if (fallbackData) {
      return {
        name: djName,
        soundcloudUrl: fallbackData.link || undefined
      };
    }

    return null;
  }

  /**
   * Get cached DJ information
   */
  private getCachedDJInfo(djName: string): WixDJData | null {
    const cached = this.cache.get(djName);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheDuration) {
      this.cache.delete(djName);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache DJ information
   */
  private cacheDJInfo(djName: string, data: WixDJData | null): void {
    this.cache.set(djName, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Test Wix API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey || !this.siteId) {
        console.warn('Wix API credentials not configured');
        return false;
      }

      const response = await fetch(`${this.baseUrl}/collections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey,
          'wix-site-id': this.siteId
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Wix API connection test failed:', error);
      return false;
    }
  }
} 