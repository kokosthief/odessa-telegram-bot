export interface DJ {
  name: string;
  link?: string;
}

export interface DJDatabase {
  [key: string]: {
    link?: string;
    photo?: string;
  };
}

export interface EnhancedDJ {
  name: string;
  photo?: string;
  shortDescription?: string;
  longDescription?: string;
  soundcloudUrl?: string;
  instagramUrl?: string;
  website?: string;
  email?: string;
  // Fallback to existing link field
  link?: string;
}

export interface EnhancedDJDatabase {
  [key: string]: EnhancedDJ;
} 