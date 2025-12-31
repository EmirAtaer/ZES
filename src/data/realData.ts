import { ProvinceData } from './types';
import { REAL_EV_DATA } from './evData';

// Gerçek 2024 TÜİK nüfus verileri
const REAL_POPULATIONS: Record<string, number> = {
  "İstanbul": 15907951,
  "Ankara": 5803482,
  "İzmir": 4462056,
  "Bursa": 3194720,
  "Antalya": 2688004,
  "Adana": 2274106,
  "Konya": 2277017,
  "Gaziantep": 2154051,
  "Şanlıurfa": 2155805,
  "Mersin": 1938389,
  "Diyarbakır": 1804880,
  "Kocaeli": 2079072,
  "Hatay": 1686043,
  "Manisa": 1468279,
  "Kayseri": 1441523,
  "Samsun": 1368488,
  "Balıkesir": 1257590,
  "Kahramanmaraş": 1177436,
  "Van": 1136757,
  "Aydın": 1148241,
  "Denizli": 1061142,
  "Sakarya": 1114045,
  "Tekirdağ": 1143432,
  "Muğla": 1054394,
  "Mardin": 880116,
  "Trabzon": 818023,
  "Erzurum": 749754,
  "Elazığ": 597696,
  "Malatya": 812580,
  "Batman": 634491,
  "Ağrı": 510626,
  "Sivas": 638956,
  "Ordu": 773086,
  "Çorum": 521970,
  "Afyonkarahisar": 747555,
  "Kütahya": 579966,
  "Tokat": 593990,
  "Edirne": 413903,
  "Çanakkale": 564157,
  "Kırklareli": 368869,
  "Uşak": 375454,
  "Düzce": 405929,
  "Osmaniye": 560946,
  "Kırıkkale": 286602,
  "Aksaray": 433735,
  "Yalova": 296525,
  "Giresun": 453912,
  "Rize": 348608,
  "Kırşehir": 250543,
  "Niğde": 364707,
  "Nevşehir": 309327,
  "Isparta": 444914,
  "Burdur": 273799,
  "Sinop": 220799,
  "Amasya": 338267,
  "Kastamonu": 383373,
  "Zonguldak": 588510,
  "Bartın": 200708,
  "Karabük": 248014,
  "Bolu": 320824,
  "Yozgat": 418650,
  "Çankırı": 195766,
  "Karaman": 265409,
  "Kilis": 147541,
  "Adıyaman": 632459,
  "Siirt": 353542,
  "Şırnak": 542743,
  "Bitlis": 353988,
  "Muş": 408728,
  "Hakkari": 287625,
  "Iğdır": 204536,
  "Erzincan": 234747,
  "Artvin": 170875,
  "Ardahan": 94603,
  "Gümüşhane": 164521,
  "Bayburt": 84843,
  "Bingöl": 282556,
  "Tunceli": 88198,
  "Eskişehir": 906877,
  "Kars": 282464
};

// Gerçek koordinatlar
const REAL_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "İstanbul": { lat: 41.0082, lng: 28.9784 },
  "Ankara": { lat: 39.9334, lng: 32.8597 },
  "İzmir": { lat: 38.4237, lng: 27.1428 },
  "Bursa": { lat: 40.1826, lng: 29.0665 },
  "Antalya": { lat: 36.8969, lng: 30.7133 },
  "Adana": { lat: 37.0000, lng: 35.3213 },
  "Konya": { lat: 37.8667, lng: 32.4833 },
  "Gaziantep": { lat: 37.0662, lng: 37.3833 },
  "Şanlıurfa": { lat: 37.1591, lng: 38.7969 },
  "Mersin": { lat: 36.8121, lng: 34.6415 },
  "Diyarbakır": { lat: 37.9144, lng: 40.2306 },
  "Kocaeli": { lat: 40.8533, lng: 29.8815 },
  "Hatay": { lat: 36.4018, lng: 36.3498 },
  "Manisa": { lat: 38.6191, lng: 27.4289 },
  "Kayseri": { lat: 38.7312, lng: 35.4787 },
  "Samsun": { lat: 41.2867, lng: 36.3300 },
  "Balıkesir": { lat: 39.6484, lng: 27.8826 },
  "Kahramanmaraş": { lat: 37.5858, lng: 36.9371 },
  "Van": { lat: 38.4942, lng: 43.4008 },
  "Aydın": { lat: 37.8444, lng: 27.8458 },
  "Denizli": { lat: 37.7765, lng: 29.0864 },
  "Sakarya": { lat: 40.7569, lng: 30.3783 },
  "Tekirdağ": { lat: 40.9833, lng: 27.5167 },
  "Muğla": { lat: 37.2153, lng: 28.3636 },
  "Mardin": { lat: 37.3212, lng: 40.7245 },
  "Trabzon": { lat: 41.0015, lng: 39.7178 },
  "Erzurum": { lat: 39.9000, lng: 41.2700 },
  "Elazığ": { lat: 38.6810, lng: 39.2264 },
  "Malatya": { lat: 38.3552, lng: 38.3095 },
  "Batman": { lat: 37.8812, lng: 41.1351 },
  "Ağrı": { lat: 39.7191, lng: 43.0503 },
  "Sivas": { lat: 39.7477, lng: 37.0179 },
  "Ordu": { lat: 40.9839, lng: 37.8764 },
  "Çorum": { lat: 40.5506, lng: 34.9556 },
  "Afyonkarahisar": { lat: 38.7507, lng: 30.5567 },
  "Kütahya": { lat: 39.4167, lng: 29.9833 },
  "Tokat": { lat: 40.3167, lng: 36.5500 },
  "Edirne": { lat: 41.6771, lng: 26.5557 },
  "Çanakkale": { lat: 40.1553, lng: 26.4142 },
  "Kırklareli": { lat: 41.7333, lng: 27.2167 },
  "Uşak": { lat: 38.6823, lng: 29.4061 },
  "Düzce": { lat: 40.8438, lng: 31.1565 },
  "Osmaniye": { lat: 37.0742, lng: 36.2469 },
  "Kırıkkale": { lat: 39.8468, lng: 33.5153 },
  "Aksaray": { lat: 38.3687, lng: 34.0370 },
  "Yalova": { lat: 40.6500, lng: 29.2667 },
  "Giresun": { lat: 40.9128, lng: 38.3895 },
  "Rize": { lat: 41.0201, lng: 40.5234 },
  "Kırşehir": { lat: 39.1425, lng: 34.1709 },
  "Niğde": { lat: 37.9667, lng: 34.6833 },
  "Nevşehir": { lat: 38.6939, lng: 34.6857 },
  "Isparta": { lat: 37.7648, lng: 30.5566 },
  "Burdur": { lat: 37.7167, lng: 30.2833 },
  "Sinop": { lat: 42.0231, lng: 35.1531 },
  "Amasya": { lat: 40.6499, lng: 35.8353 },
  "Kastamonu": { lat: 41.3887, lng: 33.7827 },
  "Zonguldak": { lat: 41.4564, lng: 31.7987 },
  "Bartın": { lat: 41.5811, lng: 32.4610 },
  "Karabük": { lat: 41.2061, lng: 32.6204 },
  "Bolu": { lat: 40.7339, lng: 31.6061 },
  "Yozgat": { lat: 39.8181, lng: 34.8147 },
  "Çankırı": { lat: 40.6013, lng: 33.6134 },
  "Karaman": { lat: 37.1759, lng: 33.2287 },
  "Kilis": { lat: 36.7184, lng: 37.1212 },
  "Adıyaman": { lat: 37.7648, lng: 38.2786 },
  "Siirt": { lat: 37.9333, lng: 41.9500 },
  "Şırnak": { lat: 37.4187, lng: 42.4918 },
  "Bitlis": { lat: 38.4008, lng: 42.1232 },
  "Muş": { lat: 38.7432, lng: 41.5064 },
  "Hakkari": { lat: 37.5833, lng: 43.7333 },
  "Iğdır": { lat: 39.8880, lng: 44.0048 },
  "Erzincan": { lat: 39.7500, lng: 39.5000 },
  "Artvin": { lat: 41.1828, lng: 41.8183 },
  "Ardahan": { lat: 41.1105, lng: 42.7022 },
  "Gümüşhane": { lat: 40.4386, lng: 39.5086 },
  "Bayburt": { lat: 40.2552, lng: 40.2249 },
  "Bingöl": { lat: 38.8854, lng: 40.4983 },
  "Tunceli": { lat: 39.3074, lng: 39.4388 },
  "Eskişehir": { lat: 39.7767, lng: 30.5206 },
  "Kars": { lat: 40.6167, lng: 43.1000 }
};

const REGIONS: Record<string, string[]> = {
  "Marmara": ["İstanbul", "Bursa", "Kocaeli", "Tekirdağ", "Balıkesir", "Çanakkale", "Sakarya", "Bilecik", "Yalova", "Edirne", "Kırklareli"],
  "Ege": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla", "Afyonkarahisar", "Kütahya", "Uşak"],
  "Akdeniz": ["Antalya", "Adana", "Mersin", "Hatay", "Kahramanmaraş", "Osmaniye", "Isparta", "Burdur"],
  "İç Anadolu": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas", "Kırıkkale", "Aksaray", "Karaman", "Kırşehir", "Niğde", "Nevşehir", "Yozgat", "Çankırı"],
  "Karadeniz": ["Samsun", "Trabzon", "Ordu", "Giresun", "Rize", "Artvin", "Gümüşhane", "Bayburt", "Tokat", "Amasya", "Çorum", "Sinop", "Kastamonu", "Bartın", "Zonguldak", "Karabük", "Düzce", "Bolu"],
  "Doğu Anadolu": ["Erzurum", "Malatya", "Elazığ", "Van", "Erzincan", "Kars", "Ağrı", "Iğdır", "Ardahan", "Muş", "Bitlis", "Hakkari", "Bingöl", "Tunceli"],
  "Güneydoğu Anadolu": ["Gaziantep", "Şanlıurfa", "Diyarbakır", "Mardin", "Batman", "Adıyaman", "Siirt", "Şırnak", "Kilis"]
};

// Gerçek ZES istasyon sayıları (Şehir bazlı değişken pazar payı)
// Son güncelleme: 22 Aralık 2025
// Toplam ZES: 4.893 istasyon | Türkiye Geneli: 13.981 istasyon | Ortalama ZES Payı: %35.0
// Pazar Payı Dağılımı: Güçlü pazarlar %37-40, Orta %33-37, Zayıf %25-30
const ZES_STATIONS: Record<string, number> = {
  "Adana": 56,
  "Adıyaman": 8,
  "Afyonkarahisar": 51,
  "Ağrı": 5,
  "Aksaray": 18,
  "Amasya": 16,
  "Ankara": 630,
  "Antalya": 309,
  "Ardahan": 3,
  "Artvin": 7,
  "Aydın": 62,
  "Balıkesir": 84,
  "Bartın": 5,
  "Batman": 20,
  "Bayburt": 4,
  "Bilecik": 11,
  "Bingöl": 5,
  "Bitlis": 8,
  "Bolu": 35,
  "Burdur": 12,
  "Bursa": 239,
  "Çanakkale": 58,
  "Çankırı": 10,
  "Çorum": 20,
  "Denizli": 75,
  "Diyarbakır": 43,
  "Düzce": 18,
  "Edirne": 24,
  "Elazığ": 20,
  "Erzincan": 7,
  "Erzurum": 20,
  "Eskişehir": 52,
  "Gaziantep": 32,
  "Giresun": 16,
  "Gümüşhane": 8,
  "Hakkari": 4,
  "Hatay": 16,
  "Iğdır": 3,
  "Isparta": 24,
  "İstanbul": 1412,
  "İzmir": 232,
  "Kahramanmaraş": 16,
  "Karabük": 9,
  "Karaman": 9,
  "Kars": 5,
  "Kastamonu": 15,
  "Kayseri": 81,
  "Kilis": 2,
  "Kırıkkale": 13,
  "Kırklareli": 15,
  "Kırşehir": 6,
  "Kocaeli": 100,
  "Konya": 91,
  "Kütahya": 30,
  "Malatya": 18,
  "Manisa": 46,
  "Mardin": 20,
  "Mersin": 92,
  "Muğla": 128,
  "Muş": 7,
  "Nevşehir": 40,
  "Niğde": 13,
  "Ordu": 26,
  "Osmaniye": 11,
  "Rize": 19,
  "Sakarya": 73,
  "Samsun": 53,
  "Şanlıurfa": 17,
  "Siirt": 4,
  "Sinop": 8,
  "Sivas": 26,
  "Şırnak": 7,
  "Tekirdağ": 56,
  "Tokat": 16,
  "Trabzon": 56,
  "Tunceli": 4,
  "Uşak": 12,
  "Van": 16,
  "Yalova": 22,
  "Yozgat": 11,
  "Zonguldak": 18
};

// Toplam ZES istasyon sayısını hesapla
export const getTotalZESStations = (): number => {
  return Object.values(ZES_STATIONS).reduce((sum, count) => sum + count, 0);
};

// Belirli bir şehir için ZES istasyon sayısını al
export const getZESStationsForCity = (cityName: string): number => {
  return ZES_STATIONS[cityName] || 0;
};

// Şehir adına göre tutarlı rastgele sayı üret (seed-based)
const seededRandom = (seed: string, index: number = 0): number => {
  let hash = 0;
  const str = seed + index;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 1000) / 1000;
};

const generateHistory = (name: string, population: number, isSeasonal: boolean) => {
  const history = [];
  
  // Gerçek EV verileri kullan
  const evData = REAL_EV_DATA[name];
  const finalEV = evData ? evData.evCount : Math.round((population / 10000) * (3 + seededRandom(name, 1) * 2));
  const finalTotalStations = evData ? evData.totalStations : Math.round((population / 50000) * (8 + seededRandom(name, 2) * 4));
  
  // Pazar geneli soket sayıları (AC:DC oranı yaklaşık 60:40)
  const finalAC = Math.round(finalTotalStations * 0.6);
  const finalDC = Math.round(finalTotalStations * 0.4);
  
  let currentEV = Math.round(finalEV / 3); // 2020'de bugünün 1/3'ü
  let currentAC = Math.round(finalAC / 3);
  let currentDC = Math.round(finalDC / 3);
  
  // 2025 için gerçek ZES istasyon sayısı (ZES_STATIONS tablosundan)
  const finalZES = ZES_STATIONS[name] || Math.round((population / 100000) * (2 + seededRandom(name, 4) * 3));
  let currentZES = Math.round(finalZES / 3); // 2020'de bugünün 1/3'ü

  for (let year = 2020; year <= 2025; year++) {
    const consumptionMultiplier = isSeasonal ? (200 + seededRandom(name, year) * 120) : (130 + seededRandom(name, year) * 70);
    
    // 2025 yılında gerçek ZES değerini kullan
    const yearZES = (year === 2025) ? finalZES : Math.round(currentZES);
    
    history.push({
      year,
      evCount: Math.round(currentEV),
      acSockets: Math.round(currentAC),
      dcSockets: Math.round(currentDC),
      zesSockets: yearZES,
      avgConsumptionKWh: Math.round(currentEV * consumptionMultiplier)
    });
    
    // 2025'e doğru gerçek değerlere ulaş
    if (year < 2025) {
      currentEV *= (1.50 + seededRandom(name, year + 10) * 0.25);
      currentAC *= (1.30 + seededRandom(name, year + 20) * 0.15);
      currentDC *= (1.40 + seededRandom(name, year + 30) * 0.20);
      currentZES *= (1.35 + seededRandom(name, year + 40) * 0.10);
    } else {
      // 2025'te gerçek değerler
      currentEV = finalEV;
      currentAC = finalAC;
      currentDC = finalDC;
      // ZES zaten finalZES olarak atandı
    }
  }
  return history;
};

export const MOCK_DATA: ProvinceData[] = Object.entries(REGIONS).flatMap(([region, provinces]) => {
  return provinces.map((name, index) => {
    const population = REAL_POPULATIONS[name] || 200000;
    const coordinates = REAL_COORDINATES[name] || { lat: 39, lng: 35 };
    const isCoastal = ["Antalya", "Muğla", "İzmir", "Aydın", "Çanakkale", "Mersin", "Trabzon", "Rize", "Ordu", "Giresun"].includes(name);
    const seasonalityFactor = isCoastal ? 2.8 + seededRandom(name, 100) * 1.2 : 1.0 + seededRandom(name, 100) * 0.3;

    return {
      id: index + 1,
      name,
      region,
      population,
      density: Math.round(population / 5000),
      seasonalityFactor,
      history: generateHistory(name, population, isCoastal),
      coordinates
    };
  });
});
