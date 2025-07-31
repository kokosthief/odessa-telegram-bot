export interface DJ {
  name: string;
  link?: string;
}

export interface DJDatabase {
  [key: string]: {
    link?: string;
  };
} 