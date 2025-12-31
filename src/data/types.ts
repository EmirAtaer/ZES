
export interface YearlyData {
  year: number;
  evCount: number;
  acSockets: number;
  dcSockets: number;
  zesSockets: number;
  avgConsumptionKWh: number;
}

export interface ProvinceData {
  id: number;
  name: string;
  region: string;
  population: number;
  density: number;
  seasonalityFactor: number; // 1.0 = Regular, 2.0+ = High seasonal surge (tourism)
  history: YearlyData[];
  coordinates: { lat: number; lng: number };
}

export interface AnalysisMetrics {
  totalEVs: number;
  totalMarketSockets: number;
  zesSockets: number;
  zesMarketShare: number;
  socketPerEV: number;
  investmentScore: number;
  projectedBottleneck2026: boolean;
  evGrowthRate: number;
  zesGrowthRate: number;
  isSeasonalRisk: boolean;
  isWorstCity?: boolean; // En kötü 10 il listesinde mi?
}
