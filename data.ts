
import { ProvinceData } from './src/data/types';

const REGIONS: Record<string, string[]> = {
  "Marmara": ["İstanbul", "Bursa", "Kocaeli", "Tekirdağ", "Balıkesir", "Çanakkale", "Sakarya", "Bilecik", "Yalova", "Edirne", "Kırklareli"],
  "Ege": ["İzmir", "Manisa", "Aydın", "Denizli", "Muğla", "Afyonkarahisar", "Kütahya", "Uşak"],
  "Akdeniz": ["Antalya", "Adana", "Mersin", "Hatay", "Kahramanmaraş", "Osmaniye", "Isparta", "Burdur"],
  "İç Anadolu": ["Ankara", "Konya", "Kayseri", "Eskişehir", "Sivas", "Kırıkkale", "Aksaray", "Karaman", "Kırşehir", "Niğde", "Nevşehir", "Yozgat", "Çankırı"],
  "Karadeniz": ["Samsun", "Trabzon", "Ordu", "Giresun", "Rize", "Artvin", "Gümüşhane", "Bayburt", "Tokat", "Amasya", "Çorum", "Sinop", "Kastamonu", "Bartın", "Zonguldak", "Karabük", "Düzce", "Bolu"],
  "Doğu Anadolu": ["Erzurum", "Malatya", "Elazığ", "Van", "Erzincan", "Kars", "Ağrı", "Iğdır", "Ardahan", "Muş", "Bitlis", "Hakkari", "Bingöl", "Tunceli"],
  "Güneydoğu Anadolu": ["Gaziantep", "Şanlıurfa", "Diyarbakır", "Mardin", "Batman", "Adıyaman", "Siirt", "Şırnak", "Kilis"]
};

// Simulated ZES market penetration (Percentage of total market)
const ZES_PENETRATION: Record<string, number> = {
  "İstanbul": 0.42, "Ankara": 0.38, "İzmir": 0.45, "Antalya": 0.52, "Muğla": 0.58, "Bursa": 0.35, "Kocaeli": 0.40
};

const generateHistory = (name: string, baseEV: number, baseAC: number, baseDC: number, isSeasonal: boolean) => {
  const history = [];
  let currentEV = baseEV;
  let currentAC = baseAC;
  let currentDC = baseDC;
  
  const penetration = ZES_PENETRATION[name] || (0.2 + Math.random() * 0.15);
  let currentZES = (baseAC + baseDC) * penetration;

  for (let year = 2020; year <= 2025; year++) {
    const consumptionMultiplier = isSeasonal ? (200 + Math.random() * 120) : (130 + Math.random() * 70);
    history.push({
      year,
      evCount: Math.round(currentEV),
      acSockets: Math.round(currentAC),
      dcSockets: Math.round(currentDC),
      zesSockets: Math.round(currentZES),
      avgConsumptionKWh: Math.round(currentEV * consumptionMultiplier)
    });
    currentEV *= (1.45 + Math.random() * 0.3); 
    currentAC *= (1.25 + Math.random() * 0.15);
    currentDC *= (1.35 + Math.random() * 0.25);
    currentZES *= (1.42 + Math.random() * 0.15); // ZES grows faster than market average
  }
  return history;
}
export const MOCK_DATA: ProvinceData[] = Object.entries(REGIONS).flatMap(([region, provinces]) => {
  return provinces.map((name) => {
    const isMajor = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kocaeli", "Muğla", "Gaziantep"].includes(name);
    const isCoastal = ["Antalya", "Muğla", "İzmir", "Aydın", "Çanakkale", "Mersin"].includes(name);
    
    const baseEV = isMajor ? 800 + Math.random() * 1500 : 50 + Math.random() * 200;
    const baseAC = isMajor ? 150 + Math.random() * 300 : 10 + Math.random() * 50;
    const baseDC = isMajor ? 80 + Math.random() * 150 : 5 + Math.random() * 30;
    const pop = isMajor ? 1500000 + Math.random() * 14000000 : 150000 + Math.random() * 1200000;
    
    const seasonalityFactor = isCoastal ? 2.8 + Math.random() * 1.8 : 1.0 + Math.random() * 0.4;

    return {
      id: Math.floor(Math.random() * 1000000),
      name,
      region,
      population: Math.round(pop),
      density: Math.round(pop / (300 + Math.random() * 3000)),
      seasonalityFactor,
      history: generateHistory(name, baseEV, baseAC, baseDC, isCoastal),
      coordinates: { lat: 36 + Math.random() * 6, lng: 26 + Math.random() * 19 }
    };
  });
});
