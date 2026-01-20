// Core data types for Kept - Latvian Political Promise Tracker

export type PromiseStatus = 'kept' | 'partially-kept' | 'in-progress' | 'broken' | 'cancelled';

export type Category =
  | 'economy'
  | 'healthcare'
  | 'education'
  | 'security'
  | 'foreign-affairs'
  | 'social-welfare'
  | 'environment'
  | 'infrastructure'
  | 'justice'
  | 'culture'
  | 'agriculture'
  | 'digital'
  | 'regional'
  | 'youth';

export interface Politician {
  id: string;
  name: string;
  role: string;
  partyId: string;
  photoUrl: string;
  isInOffice: boolean;
  roleStartDate?: string;
  roleEndDate?: string;
  bio?: string;
}

export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl?: string;
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
  importance?: string;
  description?: string;
  deadline?: string;
  tags: string[];
  sources: Source[];
  viewCount: number;
  featured: boolean;
}

export interface CategoryInfo {
  id: Category;
  name: string;
  icon: string;
  description: string;
}

// Status display utilities
export const STATUS_CONFIG: Record<PromiseStatus, { label: string; className: string; icon: string }> = {
  'kept': {
    label: 'Izpildīts',
    className: 'status-kept',
    icon: 'CheckCircle2'
  },
  'partially-kept': {
    label: 'Daļēji izpildīts',
    className: 'status-partially',
    icon: 'Contrast'
  },
  'in-progress': {
    label: 'Procesā',
    className: 'status-progress',
    icon: 'Clock'
  },
  'broken': {
    label: 'Lauzts',
    className: 'status-broken',
    icon: 'XCircle'
  },
  'cancelled': {
    label: 'Atcelts',
    className: 'status-unrated',
    icon: 'Ban'
  }
};

export const CATEGORIES: CategoryInfo[] = [
  { id: 'economy', name: 'Ekonomika un finanses', icon: 'TrendingUp', description: 'Nodokļi, budžets, inflācija, ekonomikas politika' },
  { id: 'healthcare', name: 'Veselības aprūpe', icon: 'Heart', description: 'Slimnīcas, zāles, sabiedrības veselība' },
  { id: 'education', name: 'Izglītība un zinātne', icon: 'GraduationCap', description: 'Skolas, augstskolas, pētniecība' },
  { id: 'security', name: 'Aizsardzība un drošība', icon: 'Shield', description: 'Armija, NATO, civilā aizsardzība' },
  { id: 'foreign-affairs', name: 'Ārlietas', icon: 'Globe', description: 'ES, starptautiskās attiecības, diplomātija' },
  { id: 'social-welfare', name: 'Sociālā labklājība', icon: 'Users', description: 'Pensijas, pabalsti, nabadzības mazināšana' },
  { id: 'environment', name: 'Vide un enerģētika', icon: 'Leaf', description: 'Zaļā enerģija, klimats, ilgtspēja' },
  { id: 'infrastructure', name: 'Satiksme un infrastruktūra', icon: 'Train', description: 'Ceļu satiksme, sabiedriskais transports, infrastruktūras projekti' },
  { id: 'justice', name: 'Tieslietas un korupcijas apkarošana', icon: 'Scale', description: 'Tiesu sistēma, korupcijas novēršana, tiesiskums' },
  { id: 'culture', name: 'Kultūra un mantojums', icon: 'Landmark', description: 'Māksla, nacionālā identitāte, mediji' },
  { id: 'agriculture', name: 'Lauksaimniecība', icon: 'Wheat', description: 'Lauksaimniecība, mežsaimniecība, lauku attīstība' },
  { id: 'digital', name: 'Tehnoloģijas un inovācijas', icon: 'Cpu', description: 'Digitālie pakalpojumi, jaunuzņēmumi, tehnoloģiju attīstība' },
  { id: 'regional', name: 'Reģionāla attīstība', icon: 'Map', description: 'Pašvaldību atbalsts, reģionālā politika, mājokļu pieejamība' },
  { id: 'youth', name: 'Jaunatne un sports', icon: 'Trophy', description: 'Jaunatnes politika, sports' },
];
