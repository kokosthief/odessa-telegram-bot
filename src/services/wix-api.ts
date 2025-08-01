import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface WixDJ {
  id: string;
  name: string;
  description?: string;
  image?: string;
  soundcloudUrl?: string;
  mixcloudUrl?: string;
  instagramUrl?: string;
  bio?: string;
}

export interface WixAPIResponse {
  data: WixDJ[];
  totalCount: number;
}

export class WixAPIService {
  private baseUrl: string;
  private apiKey: string;
  private siteId: string;

  constructor() {
    this.baseUrl = 'https://www.wixapis.com/v1';
    this.apiKey = process.env['WIX_API_KEY'] || '';
    this.siteId = process.env['WIX_SITE_ID'] || '68c3f609-e405-4e64-b712-40239449936b';
  }

  /**
   * Fetch DJ data from Wix CMS
   */
  async getDJs(): Promise<WixDJ[]> {
    try {
      console.log('Fetching DJ data from Wix CMS...');
      
      // Try the Content Manager API instead
      const response = await axios.get(`${this.baseUrl}/content-manager/items`, {
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        params: {
          collectionId: 'Team', // Your CMS collection name
          siteId: this.siteId
        }
      });

      if (!response.data || !response.data.items) {
        console.error('Invalid response from Wix API');
        return [];
      }

      const djs: WixDJ[] = response.data.items.map((dj: any) => ({
        id: dj._id,
        name: dj.name || '',
        description: dj.description || '',
        image: dj.image?.url || '',
        soundcloudUrl: dj.soundcloudUrl || '',
        mixcloudUrl: dj.mixcloudUrl || '',
        instagramUrl: dj.instagramUrl || '',
        bio: dj.bio || ''
      }));

      console.log(`Successfully fetched ${djs.length} DJs from Wix CMS`);
      return djs;

    } catch (error) {
      console.error('Error fetching DJ data from Wix:', error);
      return [];
    }
  }

  /**
   * Get DJ by name (case-insensitive)
   */
  async getDJByName(name: string): Promise<WixDJ | null> {
    try {
      const djs = await this.getDJs();
      const normalizedName = name.toLowerCase().trim();
      
      return djs.find(dj => 
        dj.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(dj.name.toLowerCase())
      ) || null;

    } catch (error) {
      console.error('Error getting DJ by name:', error);
      return null;
    }
  }

  /**
   * Check if Wix API is configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.siteId);
  }
} 