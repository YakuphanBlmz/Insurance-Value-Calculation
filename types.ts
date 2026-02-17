export interface VehicleData {
  make: string;
  model: string;
  year: number;
  fuelType: string;
  chassisLast4?: string;
  estimatedValueMin: number;
  estimatedValueMax: number;
  confidenceScore: number;
  description: string;
  isOfficialData?: boolean; // True if data comes from the uploaded Excel
  officialVariant?: string; // The exact model name found in Excel
}

export interface AnalysisError {
  message: string;
  code: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface KaskoDbEntry {
  id?: number;
  markaKodu: string;
  tipKodu: string;
  markaAdi: string;
  tipAdi: string;
  year: number;
  price: number;
}