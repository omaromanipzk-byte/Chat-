export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  capital: string;
  areaKm2: number;
  population: number;
  lat: number;
  lng: number;
  wilayats: string[];
  description: string;
  badge: string;
  keyFeatures: string[];
  naturalPhenomena: string[];
  humanPhenomena: string[];
  svgPath: string; // SVG path representation for Oman interactive map
  labelPos: { x: number; y: number };
}

export interface Phenomenon {
  id: string;
  title: string;
  category: 'natural' | 'human';
  subCategory: string;
  summary: string;
  fullAnalysis: string;
  lat: number;
  lng: number;
  locationName: string;
  governorateId: string;
  officialSources: { name: string; url?: string; year?: string }[];
  keyFacts: { label: string; value: string }[];
  accentColor: string;
  historicalDates?: string;
  satelliteBandsRecommendation?: string;
}

export interface CustomField {
  id: string;
  title: string;
  category: 'natural' | 'human' | 'satellite' | 'general';
  fieldType: 'stats' | 'text' | 'alert' | 'link';
  value: string;
  source: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'مدير أعلى (سوبر أدمن)' | 'محلل جيومكاني' | 'باحث استشعار عن بعد' | 'مستخدم معتمد';
  status: 'نشط' | 'مجمد';
  joinedDate: string;
}

export interface MapExportConfig {
  title: string;
  showBoundaries: boolean;
  showCapitals: boolean;
  showCoordinates: boolean;
  showScaleBar: boolean;
  showNationalEmblem: boolean;
  showPhenomenaMarkers: boolean;
  mapType: 'administrative' | 'topographic' | 'satellite' | 'economic';
}
