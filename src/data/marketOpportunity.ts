// Pazar Fırsatı Analiz Modülü
import { REAL_EV_DATA } from './evData';
import { getZESStationsForCity } from './realData';

export interface MarketOpportunityMetrics {
  city: string;
  // KPI 1: 100 EV başına istasyon (ideal: 5.0)
  stationsPer100EV: number;
  coverageRatio: number; // Mevcut / İdeal (%)
  
  // KPI 2: ZES Pazar Penetrasyonu
  zesMarketShare: number;
  
  // KPI 3: ZES Açığı
  zesGap: number; // Kaç istasyon eksik
  
  // KPI 4: Pazar Büyüklüğü
  totalEVs: number;
  marketSize: 'large' | 'medium' | 'small';
  
  // KPI 5: Kapsama Yeterliliği
  coverageAdequacy: number; // 0-100 arası skor
  
  // KPI 6: Rekabet Yoğunluğu
  competitorStations: number;
  competitionIntensity: 'high' | 'medium' | 'low';
  
  // KPI 7: Büyüme Potansiyeli
  growthPotential: number; // 0-100 skor
  
  // KPI 8: Yatırım Öncelik Skoru
  investmentPriority: number; // 0-100 skor
  priorityLevel: 'critical' | 'high' | 'medium' | 'low';
}

export function calculateMarketOpportunity(cityName: string): MarketOpportunityMetrics | null {
  const evData = REAL_EV_DATA[cityName];
  if (!evData) return null;
  
  const zesStations = getZESStationsForCity(cityName);
  const totalStations = evData.totalStations;
  const totalEVs = evData.evCount;
  
  // KPI 1: 100 EV başına istasyon (ideal: 5.0)
  const stationsPer100EV = (totalStations / totalEVs) * 100;
  const idealRatio = 5.0;
  const coverageRatio = (stationsPer100EV / idealRatio) * 100;
  
  // KPI 2: ZES Pazar Payı
  const zesMarketShare = (zesStations / totalStations) * 100;
  
  // KPI 3: ZES Açığı (ideal %35 - mevcut)
  const idealZES = totalStations * 0.35;
  const zesGap = Math.round(idealZES - zesStations);
  
  // KPI 4: Pazar Büyüklüğü
  let marketSize: 'large' | 'medium' | 'small' = 'small';
  if (totalEVs > 10000) marketSize = 'large';
  else if (totalEVs > 3000) marketSize = 'medium';
  
  // KPI 5: Kapsama Yeterliliği (0-100)
  // Düşük kapsama = düşük skor = yüksek fırsat
  const coverageAdequacy = Math.min(100, coverageRatio);
  
  // KPI 6: Rekabet Yoğunluğu
  const competitorStations = totalStations - zesStations;
  let competitionIntensity: 'high' | 'medium' | 'low' = 'low';
  if (competitorStations > 100) competitionIntensity = 'high';
  else if (competitorStations > 30) competitionIntensity = 'medium';
  
  // KPI 7: Büyüme Potansiyeli
  // Düşük kapsama + büyük pazar + pazar büyümesi
  const coverageGapScore = Math.max(0, 100 - coverageRatio);
  const marketSizeScore = totalEVs / 1000; // Her 1000 EV için 1 puan
  const growthScore = evData.stationChangePercent * 5; // %10 büyüme = 50 puan
  const growthPotential = Math.min(100, 
    (coverageGapScore * 0.4) + 
    (Math.min(marketSizeScore, 40) * 0.4) + 
    (Math.min(growthScore, 20) * 0.2)
  );
  
  // KPI 8: Yatırım Öncelik Skoru
  // Düşük ZES payı + büyük pazar + düşük kapsama
  const zesGapScore = zesGap > 0 ? Math.min(50, zesGap * 2) : 0;
  const marketSizeWeight = marketSize === 'large' ? 30 : marketSize === 'medium' ? 20 : 10;
  const urgencyScore = coverageRatio < 50 ? 20 : coverageRatio < 70 ? 10 : 0;
  const investmentPriority = Math.min(100, zesGapScore + marketSizeWeight + urgencyScore);
  
  let priorityLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
  if (investmentPriority > 70) priorityLevel = 'critical';
  else if (investmentPriority > 50) priorityLevel = 'high';
  else if (investmentPriority > 30) priorityLevel = 'medium';
  
  return {
    city: cityName,
    stationsPer100EV,
    coverageRatio,
    zesMarketShare,
    zesGap,
    totalEVs,
    marketSize,
    coverageAdequacy,
    competitorStations,
    competitionIntensity,
    growthPotential,
    investmentPriority,
    priorityLevel
  };
}

export function getAllOpportunities(): MarketOpportunityMetrics[] {
  const opportunities: MarketOpportunityMetrics[] = [];
  
  for (const cityName in REAL_EV_DATA) {
    const opp = calculateMarketOpportunity(cityName);
    if (opp) opportunities.push(opp);
  }
  
  return opportunities.sort((a, b) => b.investmentPriority - a.investmentPriority);
}

export function getOpportunityInsights(metrics: MarketOpportunityMetrics): string[] {
  const insights: string[] = [];
  
  if (metrics.coverageRatio < 50) {
    insights.push(`⚠️ Kritik: 100 EV'ye sadece ${metrics.stationsPer100EV.toFixed(1)} istasyon düşüyor (ideal: 5.0)`);
  }
  
  if (metrics.zesMarketShare < 25) {
    insights.push(`🎯 ZES pazar payı düşük (%${metrics.zesMarketShare.toFixed(1)}) - Agresif büyüme şansı`);
  }
  
  if (metrics.marketSize === 'large' && metrics.zesMarketShare < 35) {
    insights.push(`💎 Büyük pazar + düşük ZES payı = Stratejik fırsat`);
  }
  
  if (metrics.growthPotential > 60) {
    insights.push(`🚀 Yüksek büyüme potansiyeli (${metrics.growthPotential.toFixed(0)}/100)`);
  }
  
  if (metrics.competitionIntensity === 'low' && metrics.marketSize !== 'small') {
    insights.push(`✅ Düşük rekabet ortamı - Pazar liderliği fırsatı`);
  }
  
  return insights;
}
