// Core data types for Kept - Latvian Political Promise Tracker

export type PromiseStatus = 'kept' | 'partially-kept' | 'in-progress' | 'broken' | 'not-rated';

export type Category =
  | 'economy-finance'
  | 'healthcare'
  | 'education-science'
  | 'defense-security'
  | 'foreign-affairs'
  | 'social-welfare'
  | 'environment-energy'
  | 'transport-infrastructure'
  | 'justice-law'
  | 'culture-heritage'
  | 'agriculture-rural'
  | 'digital-technology'
  | 'housing-regional'
  | 'human-rights'
  | 'youth-sports'
  | 'labor-employment';

export interface Politician {
  id: string;
  name: string;
  role: string;
  partyId: string;
  photoUrl: string;
  isInOffice: boolean;
  bio?: string;
}

export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl?: string;
  color: string;
  isInCoalition: boolean;
  mpCount: number;
}

export interface Source {
  title: string;
  url: string;
  publication: string;
  date: string;
}

export interface Promise {
  id: string;
  title: string;
  fullText: string;
  politicianId: string;
  partyId: string;
  datePromised: string;
  electionCycle?: string;
  status: PromiseStatus;
  statusJustification: string;
  statusUpdatedAt: string;
  statusUpdatedBy: string;
  category: Category;
  tags: string[];
  sources: Source[];
  viewCount: number;
  featured: boolean;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  nameLv: string;
  icon: string;
  description: string;
}

// Status display utilities
export const STATUS_CONFIG: Record<PromiseStatus, { label: string; labelLv: string; className: string; icon: string }> = {
  'kept': {
    label: 'Kept',
    labelLv: 'Izpildīts',
    className: 'status-kept',
    icon: 'CheckCircle2'
  },
  'partially-kept': {
    label: 'Partially Kept',
    labelLv: 'Daļēji izpildīts',
    className: 'status-partially',
    icon: 'CircleDot'
  },
  'in-progress': {
    label: 'In Progress',
    labelLv: 'Procesā',
    className: 'status-progress',
    icon: 'Clock'
  },
  'broken': {
    label: 'Broken',
    labelLv: 'Lauzts',
    className: 'status-broken',
    icon: 'XCircle'
  },
  'not-rated': {
    label: 'Not Rated',
    labelLv: 'Nav novērtēts',
    className: 'status-unrated',
    icon: 'HelpCircle'
  }
};

export const CATEGORIES: CategoryInfo[] = [
  { id: 'economy-finance', name: 'Economy & Finance', nameLv: 'Ekonomika un finanses', icon: 'TrendingUp', description: 'Taxes, budget, inflation, economic policy' },
  { id: 'healthcare', name: 'Healthcare', nameLv: 'Veselības aprūpe', icon: 'Heart', description: 'Hospitals, medicine, public health' },
  { id: 'education-science', name: 'Education & Science', nameLv: 'Izglītība un zinātne', icon: 'GraduationCap', description: 'Schools, universities, research' },
  { id: 'defense-security', name: 'Defense & Security', nameLv: 'Aizsardzība un drošība', icon: 'Shield', description: 'Military, NATO, civil defense' },
  { id: 'foreign-affairs', name: 'Foreign Affairs', nameLv: 'Ārlietas', icon: 'Globe', description: 'EU, international relations, diplomacy' },
  { id: 'social-welfare', name: 'Social Welfare', nameLv: 'Sociālā labklājība', icon: 'Users', description: 'Pensions, benefits, poverty reduction' },
  { id: 'environment-energy', name: 'Environment & Energy', nameLv: 'Vide un enerģētika', icon: 'Leaf', description: 'Green energy, climate, sustainability' },
  { id: 'transport-infrastructure', name: 'Transport & Infrastructure', nameLv: 'Transports un infrastruktūra', icon: 'Train', description: 'Roads, Rail Baltica, ports' },
  { id: 'justice-law', name: 'Justice & Law', nameLv: 'Tieslietas', icon: 'Scale', description: 'Courts, corruption, rule of law' },
  { id: 'culture-heritage', name: 'Culture & Heritage', nameLv: 'Kultūra un mantojums', icon: 'Landmark', description: 'Arts, Latvian identity, media' },
  { id: 'agriculture-rural', name: 'Agriculture & Rural', nameLv: 'Lauksaimniecība', icon: 'Wheat', description: 'Farming, forestry, rural development' },
  { id: 'digital-technology', name: 'Digital & Technology', nameLv: 'Digitalizācija', icon: 'Laptop', description: 'E-government, IT sector, innovation' },
  { id: 'housing-regional', name: 'Housing & Regional', nameLv: 'Mājokļi un reģioni', icon: 'Home', description: 'Housing policy, regional development' },
  { id: 'human-rights', name: 'Human Rights', nameLv: 'Cilvēktiesības', icon: 'HandHeart', description: 'Minority rights, equality, freedom' },
  { id: 'youth-sports', name: 'Youth & Sports', nameLv: 'Jaunatne un sports', icon: 'Trophy', description: 'Youth policy, athletics' },
  { id: 'labor-employment', name: 'Labor & Employment', nameLv: 'Darbs un nodarbinātība', icon: 'Briefcase', description: 'Jobs, wages, labor law' },
];
