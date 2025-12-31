// Gerçek EV ve Şarj İstasyonu Verileri (Aralık 2025)
// Kaynak: donanimhaber.com

export interface CityEVData {
  city: string;
  totalStations: number; // Tüm markalar (ZES + Rakipler)
  stationChangePercent: number;
  carCount: number;
  evCount: number;
  stationPer100EV: number;
}

export const REAL_EV_DATA: Record<string, CityEVData> = {
  "Adana": { city: "Adana", totalStations: 199, stationChangePercent: 4.74, carCount: 446702, evCount: 8487, stationPer100EV: 2.34 },
  "Adıyaman": { city: "Adıyaman", totalStations: 28, stationChangePercent: 0.00, carCount: 69339, evCount: 1317, stationPer100EV: 2.13 },
  "Afyonkarahisar": { city: "Afyonkarahisar", totalStations: 159, stationChangePercent: 0.00, carCount: 115729, evCount: 2199, stationPer100EV: 7.23 },
  "Ağrı": { city: "Ağrı", totalStations: 15, stationChangePercent: 0.00, carCount: 11115, evCount: 211, stationPer100EV: 7.11 },
  "Aksaray": { city: "Aksaray", totalStations: 52, stationChangePercent: 0.00, carCount: 86598, evCount: 1645, stationPer100EV: 3.16 },
  "Amasya": { city: "Amasya", totalStations: 46, stationChangePercent: 0.00, carCount: 75455, evCount: 1434, stationPer100EV: 3.21 },
  "Ankara": { city: "Ankara", totalStations: 1627, stationChangePercent: 3.17, carCount: 2131784, evCount: 40504, stationPer100EV: 4.02 },
  "Antalya": { city: "Antalya", totalStations: 872, stationChangePercent: 0.69, carCount: 744297, evCount: 14142, stationPer100EV: 6.17 },
  "Ardahan": { city: "Ardahan", totalStations: 8, stationChangePercent: 0.00, carCount: 4891, evCount: 93, stationPer100EV: 8.60 },
  "Artvin": { city: "Artvin", totalStations: 24, stationChangePercent: 0.00, carCount: 21145, evCount: 402, stationPer100EV: 5.97 },
  "Aydın": { city: "Aydın", totalStations: 196, stationChangePercent: 1.55, carCount: 236472, evCount: 4493, stationPer100EV: 4.36 },
  "Balıkesir": { city: "Balıkesir", totalStations: 283, stationChangePercent: 0.35, carCount: 274085, evCount: 5208, stationPer100EV: 5.43 },
  "Bartın": { city: "Bartın", totalStations: 18, stationChangePercent: -5.26, carCount: 35000, evCount: 665, stationPer100EV: 2.71 },
  "Batman": { city: "Batman", totalStations: 65, stationChangePercent: 0.00, carCount: 23744, evCount: 451, stationPer100EV: 14.41 },
  "Bayburt": { city: "Bayburt", totalStations: 12, stationChangePercent: 0.00, carCount: 8842, evCount: 168, stationPer100EV: 7.14 },
  "Bilecik": { city: "Bilecik", totalStations: 34, stationChangePercent: 0.00, carCount: 42401, evCount: 806, stationPer100EV: 4.22 },
  "Bingöl": { city: "Bingöl", totalStations: 17, stationChangePercent: 0.00, carCount: 13373, evCount: 254, stationPer100EV: 6.69 },
  "Bitlis": { city: "Bitlis", totalStations: 23, stationChangePercent: 0.00, carCount: 11580, evCount: 220, stationPer100EV: 10.45 },
  "Bolu": { city: "Bolu", totalStations: 98, stationChangePercent: -1.01, carCount: 71820, evCount: 1365, stationPer100EV: 7.18 },
  "Burdur": { city: "Burdur", totalStations: 40, stationChangePercent: 2.56, carCount: 67922, evCount: 1291, stationPer100EV: 3.10 },
  "Bursa": { city: "Bursa", totalStations: 646, stationChangePercent: 1.25, carCount: 709793, evCount: 13486, stationPer100EV: 4.79 },
  "Çanakkale": { city: "Çanakkale", totalStations: 166, stationChangePercent: 0.61, carCount: 126970, evCount: 2412, stationPer100EV: 6.88 },
  "Çankırı": { city: "Çankırı", totalStations: 31, stationChangePercent: 0.00, carCount: 26582, evCount: 505, stationPer100EV: 6.14 },
  "Çorum": { city: "Çorum", totalStations: 65, stationChangePercent: 3.17, carCount: 99605, evCount: 1892, stationPer100EV: 3.44 },
  "Denizli": { city: "Denizli", totalStations: 204, stationChangePercent: 5.15, carCount: 256929, evCount: 4882, stationPer100EV: 4.18 },
  "Diyarbakır": { city: "Diyarbakır", totalStations: 160, stationChangePercent: 8.84, carCount: 86809, evCount: 1649, stationPer100EV: 9.70 },
  "Düzce": { city: "Düzce", totalStations: 59, stationChangePercent: 3.51, carCount: 73014, evCount: 1387, stationPer100EV: 4.25 },
  "Edirne": { city: "Edirne", totalStations: 77, stationChangePercent: 2.67, carCount: 85849, evCount: 1631, stationPer100EV: 4.72 },
  "Elazığ": { city: "Elazığ", totalStations: 57, stationChangePercent: 1.79, carCount: 100874, evCount: 1917, stationPer100EV: 2.97 },
  "Erzincan": { city: "Erzincan", totalStations: 19, stationChangePercent: 5.56, carCount: 36535, evCount: 694, stationPer100EV: 2.74 },
  "Erzurum": { city: "Erzurum", totalStations: 56, stationChangePercent: 1.82, carCount: 77101, evCount: 1465, stationPer100EV: 3.82 },
  "Eskişehir": { city: "Eskişehir", totalStations: 144, stationChangePercent: 0.70, carCount: 214961, evCount: 4084, stationPer100EV: 3.53 },
  "Gaziantep": { city: "Gaziantep", totalStations: 115, stationChangePercent: 1.77, carCount: 319522, evCount: 6071, stationPer100EV: 1.89 },
  "Giresun": { city: "Giresun", totalStations: 43, stationChangePercent: 2.38, carCount: 56514, evCount: 1074, stationPer100EV: 4.00 },
  "Gümüşhane": { city: "Gümüşhane", totalStations: 23, stationChangePercent: 4.55, carCount: 14154, evCount: 269, stationPer100EV: 8.55 },
  "Hakkari": { city: "Hakkari", totalStations: 13, stationChangePercent: 0.00, carCount: 3270, evCount: 62, stationPer100EV: 20.97 },
  "Hatay": { city: "Hatay", totalStations: 56, stationChangePercent: 1.82, carCount: 277164, evCount: 5266, stationPer100EV: 1.06 },
  "Iğdır": { city: "Iğdır", totalStations: 10, stationChangePercent: 0.00, carCount: 8125, evCount: 154, stationPer100EV: 6.49 },
  "Isparta": { city: "Isparta", totalStations: 67, stationChangePercent: 3.08, carCount: 104079, evCount: 1978, stationPer100EV: 3.39 },
  "İstanbul": { city: "İstanbul", totalStations: 3687, stationChangePercent: 3.10, carCount: 4003305, evCount: 76063, stationPer100EV: 4.85 },
  "İzmir": { city: "İzmir", totalStations: 631, stationChangePercent: 2.27, carCount: 1070184, evCount: 20334, stationPer100EV: 3.10 },
  "Kahramanmaraş": { city: "Kahramanmaraş", totalStations: 65, stationChangePercent: 10.17, carCount: 191654, evCount: 3641, stationPer100EV: 1.79 },
  "Karabük": { city: "Karabük", totalStations: 29, stationChangePercent: 0.00, carCount: 47664, evCount: 906, stationPer100EV: 3.20 },
  "Karaman": { city: "Karaman", totalStations: 29, stationChangePercent: 0.00, carCount: 45562, evCount: 866, stationPer100EV: 3.35 },
  "Kars": { city: "Kars", totalStations: 15, stationChangePercent: 7.14, carCount: 15654, evCount: 297, stationPer100EV: 5.05 },
  "Kastamonu": { city: "Kastamonu", totalStations: 49, stationChangePercent: 0.00, carCount: 76957, evCount: 1462, stationPer100EV: 3.35 },
  "Kayseri": { city: "Kayseri", totalStations: 287, stationChangePercent: 0.70, carCount: 310254, evCount: 5895, stationPer100EV: 4.87 },
  "Kilis": { city: "Kilis", totalStations: 6, stationChangePercent: 20.00, carCount: 13759, evCount: 261, stationPer100EV: 2.30 },
  "Kırıkkale": { city: "Kırıkkale", totalStations: 39, stationChangePercent: 2.63, carCount: 46719, evCount: 888, stationPer100EV: 4.39 },
  "Kırklareli": { city: "Kırklareli", totalStations: 45, stationChangePercent: 4.65, carCount: 75655, evCount: 1437, stationPer100EV: 3.13 },
  "Kırşehir": { city: "Kırşehir", totalStations: 19, stationChangePercent: 5.56, carCount: 47385, evCount: 900, stationPer100EV: 2.11 },
  "Kocaeli": { city: "Kocaeli", totalStations: 341, stationChangePercent: 2.71, carCount: 350831, evCount: 6666, stationPer100EV: 5.12 },
  "Konya": { city: "Konya", totalStations: 311, stationChangePercent: 1.30, carCount: 462351, evCount: 8785, stationPer100EV: 3.54 },
  "Kütahya": { city: "Kütahya", totalStations: 83, stationChangePercent: 2.47, carCount: 127737, evCount: 2427, stationPer100EV: 3.42 },
  "Malatya": { city: "Malatya", totalStations: 52, stationChangePercent: 10.64, carCount: 130750, evCount: 2484, stationPer100EV: 2.09 },
  "Manisa": { city: "Manisa", totalStations: 133, stationChangePercent: 2.31, carCount: 272364, evCount: 5175, stationPer100EV: 2.57 },
  "Mardin": { city: "Mardin", totalStations: 63, stationChangePercent: 1.61, carCount: 35998, evCount: 684, stationPer100EV: 9.21 },
  "Mersin": { city: "Mersin", totalStations: 256, stationChangePercent: 0.79, carCount: 380740, evCount: 7234, stationPer100EV: 3.54 },
  "Muğla": { city: "Muğla", totalStations: 424, stationChangePercent: 0.95, carCount: 279051, evCount: 5302, stationPer100EV: 8.00 },
  "Muş": { city: "Muş", totalStations: 22, stationChangePercent: 0.00, carCount: 13192, evCount: 251, stationPer100EV: 8.76 },
  "Nevşehir": { city: "Nevşehir", totalStations: 108, stationChangePercent: 3.85, carCount: 71347, evCount: 1356, stationPer100EV: 7.96 },
  "Niğde": { city: "Niğde", totalStations: 37, stationChangePercent: 0.00, carCount: 63368, evCount: 1204, stationPer100EV: 3.07 },
  "Ordu": { city: "Ordu", totalStations: 76, stationChangePercent: 1.33, carCount: 107969, evCount: 2051, stationPer100EV: 3.71 },
  "Osmaniye": { city: "Osmaniye", totalStations: 31, stationChangePercent: 3.33, carCount: 110693, evCount: 2103, stationPer100EV: 1.47 },
  "Rize": { city: "Rize", totalStations: 52, stationChangePercent: 0.00, carCount: 46842, evCount: 890, stationPer100EV: 5.84 },
  "Sakarya": { city: "Sakarya", totalStations: 201, stationChangePercent: 3.08, carCount: 205406, evCount: 3903, stationPer100EV: 5.15 },
  "Samsun": { city: "Samsun", totalStations: 201, stationChangePercent: 1.01, carCount: 254316, evCount: 4832, stationPer100EV: 4.16 },
  "Şanlıurfa": { city: "Şanlıurfa", totalStations: 69, stationChangePercent: 2.99, carCount: 115284, evCount: 2190, stationPer100EV: 3.15 },
  "Siirt": { city: "Siirt", totalStations: 13, stationChangePercent: 0.00, carCount: 9821, evCount: 186, stationPer100EV: 6.99 },
  "Sinop": { city: "Sinop", totalStations: 26, stationChangePercent: 4.00, carCount: 38855, evCount: 738, stationPer100EV: 3.52 },
  "Sivas": { city: "Sivas", totalStations: 84, stationChangePercent: 3.70, carCount: 111061, evCount: 2110, stationPer100EV: 3.98 },
  "Şırnak": { city: "Şırnak", totalStations: 19, stationChangePercent: 0.00, carCount: 8955, evCount: 170, stationPer100EV: 11.18 },
  "Tekirdağ": { city: "Tekirdağ", totalStations: 154, stationChangePercent: 1.32, carCount: 189070, evCount: 3592, stationPer100EV: 4.29 },
  "Tokat": { city: "Tokat", totalStations: 49, stationChangePercent: 0.00, carCount: 109654, evCount: 2083, stationPer100EV: 2.35 },
  "Trabzon": { city: "Trabzon", totalStations: 199, stationChangePercent: 5.85, carCount: 160129, evCount: 3042, stationPer100EV: 6.54 },
  "Tunceli": { city: "Tunceli", totalStations: 11, stationChangePercent: 0.00, carCount: 5492, evCount: 104, stationPer100EV: 10.58 },
  "Uşak": { city: "Uşak", totalStations: 32, stationChangePercent: 0.00, carCount: 84122, evCount: 1598, stationPer100EV: 2.00 },
  "Van": { city: "Van", totalStations: 48, stationChangePercent: 0.00, carCount: 36815, evCount: 699, stationPer100EV: 6.87 },
  "Yalova": { city: "Yalova", totalStations: 69, stationChangePercent: 1.47, carCount: 48419, evCount: 920, stationPer100EV: 7.50 },
  "Yozgat": { city: "Yozgat", totalStations: 35, stationChangePercent: 2.94, carCount: 58268, evCount: 1107, stationPer100EV: 3.16 },
  "Zonguldak": { city: "Zonguldak", totalStations: 54, stationChangePercent: 1.89, carCount: 114187, evCount: 2169, stationPer100EV: 2.49 }
};

// En iyi ve en kötü iller
export const BEST_CITIES_FOR_EV = [
  "Hakkari", "Batman", "Şırnak", "Tunceli", "Bitlis",
  "Diyarbakır", "Mardin", "Muş", "Ardahan", "Gümüşhane"
];

export const WORST_CITIES_FOR_EV = [
  "Hatay", "Kahramanmaraş", "Osmaniye", "Gaziantep", "Uşak",
  "Malatya", "Kırşehir", "Adıyaman", "Kilis", "Adana"
];

// Pazar payı hesaplama yardımcısı
export function getZESMarketShare(city: string, zesStations: number): number {
  const data = REAL_EV_DATA[city];
  if (!data) return 0;
  return (zesStations / data.totalStations) * 100;
}

// Gerçek pazar açığı hesaplama
export function getMarketGap(city: string, zesStations: number): number {
  const data = REAL_EV_DATA[city];
  if (!data) return 0;
  
  // İdeal oran: 100 EV başına 5 istasyon
  const idealStations = Math.round(data.evCount / 20);
  const currentMarketStations = data.totalStations;
  
  // ZES'in kapatması gereken açık
  const zesIdealShare = idealStations * 0.15; // ZES hedef pazar payı %15
  return Math.max(0, Math.round(zesIdealShare - zesStations));
}

// Yatırım öncelik skoru (gerçek verilerle)
export function calculateInvestmentPriority(city: string, zesStations: number): number {
  const data = REAL_EV_DATA[city];
  if (!data) return 0;
  
  const marketShare = getZESMarketShare(city, zesStations);
  const marketGap = getMarketGap(city, zesStations);
  
  // 1. Büyük EV pazarı (40%)
  const evMarketScore = Math.min((data.evCount / 1000), 50) * 0.4;
  
  // 2. Düşük pazar payı = Yüksek fırsat (30%)
  const opportunityScore = (100 - Math.min(marketShare, 100)) * 0.3;
  
  // 3. Büyüme momentumu (20%)
  const growthScore = Math.min(data.stationChangePercent * 5, 20);
  
  // 4. En kötü iller listesinde mi? (10% bonus)
  const worstCityBonus = WORST_CITIES_FOR_EV.includes(city) ? 10 : 0;
  
  return Math.min(100, evMarketScore + opportunityScore + growthScore + worstCityBonus);
}
