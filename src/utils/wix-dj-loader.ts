import { DJLoader } from './dj-loader';

export interface WixDJData {
  _id: string;
  title: string;
  photo?: string;
  shortDescription?: string;
  longDescription?: string;
  website?: string; // SoundCloud
  website1?: string; // Website
  website2?: string; // Instagram
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
    this.baseUrl = 'https://www.wixapis.com/wix-data/v1';
    console.log(`🔧 WixDJLoader initialized with:`);
    console.log(`   Base URL: ${this.baseUrl}`);
    console.log(`   API Key: ${this.apiKey ? '✅ Set' : '❌ Not set'}`);
    console.log(`   Site ID: ${this.siteId ? '✅ Set' : '❌ Not set'}`);
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
      // First, let's test if we can access the collection
      console.log('🔍 Testing collection access...');
      const collectionResponse = await fetch(`${this.baseUrl}/collections/Team`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'wix-site-id': this.siteId
        }
      });

      console.log(`📥 Collection access response: ${collectionResponse.status} ${collectionResponse.statusText}`);
      
      if (!collectionResponse.ok) {
        const errorText = await collectionResponse.text();
        console.error(`❌ Cannot access collection: ${errorText}`);
        return null;
      }

      const collectionData = await collectionResponse.json();
      console.log('✅ Collection structure:', JSON.stringify(collectionData, null, 2));

      const requestBody = {
        collectionId: 'Team',
        query: {
          paging: {
            limit: 5
          }
        }
      };

      console.log(`📤 Request body:`, JSON.stringify(requestBody, null, 2));
      console.log(`🌐 Making request to: ${this.baseUrl}/items/query`);
      console.log(`🔍 Querying for DJ: "${djName}"`);

      const response = await fetch(`${this.baseUrl}/items/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'wix-site-id': this.siteId
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Wix API error: ${response.status} ${response.statusText}`);
        console.error(`   Error details: ${errorText}`);
        console.error(`   Request URL: ${this.baseUrl}/items/query`);
        console.error(`   Request body:`, JSON.stringify(requestBody, null, 2));
        console.error(`   Headers:`, {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey ? 'Bearer [HIDDEN]' : 'NOT SET',
          'wix-site-id': this.siteId || 'NOT SET'
        });
        console.error(`   Full error response:`, errorText);
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
      console.error('   Error type:', typeof error);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
      }
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
        name: wixData.title,
        photo: wixData.photo || undefined,
        shortDescription: wixData.shortDescription || undefined,
        soundcloudUrl: wixData.website || undefined, // SoundCloud URL
        instagramUrl: wixData.website2 || undefined, // Instagram URL
        website: wixData.website1 || undefined // Website URL
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
      console.log('🧪 Testing Wix API connection...');
      console.log(`   API Key: ${this.apiKey ? '✅ Set' : '❌ Not set'}`);
      console.log(`   Site ID: ${this.siteId ? '✅ Set' : '❌ Not set'}`);
      
      // Try to get collection details first
      const response = await fetch(`${this.baseUrl}/collections/Team`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'wix-site-id': this.siteId
        }
      });

      console.log(`📥 Collection test response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const collectionData = await response.json();
        console.log('✅ Collection details:', JSON.stringify(collectionData, null, 2));
        return true;
      } else {
        const errorText = await response.text();
        console.error(`❌ Collection test failed: ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
} 