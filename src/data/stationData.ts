// Detaylı ZES Şarj İstasyonu Verileri
// ZES resmi web sitesinden alınan GERÇEK istasyon konumları

import realStationsJSON from './real_zes_stations.json';

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  dcSockets: number;
  acSockets: number;
  power: string; // kW
  status: 'active' | 'maintenance' | 'planned';
  type: 'highway' | 'city' | 'mall' | 'parking';
  availability?: number; // 0-100%
}

// ✅ GERÇEK ZES İSTASYONLARI - ZES.NET'TEN ALINAN VERİLER
const REAL_STATIONS = (realStationsJSON as any[]).map(station => ({
  ...station,
  availability: station.availability || 85
})) as ChargingStation[];

// İstasyon isminden il çıkarma
function getProvinceFromCoordinates(lat: number, lng: number, name: string): string {
  // İsimden il çıkar (format: "İl - İstasyon Adı")
  const nameParts = name.split(' - ');
  if (nameParts.length > 1) {
    const provinceName = nameParts[0].trim();
    // Bazı özel durumlar
    if (provinceName === 'Istanbul') return 'İstanbul';
    if (provinceName === 'Izmir') return 'İzmir';
    return provinceName;
  }
  
  // İsim formatı farklıysa koordinattan tahmin et
  if (lat > 40.8 && lat < 41.3 && lng > 28.5 && lng < 29.5) return 'İstanbul';
  if (lat > 39.7 && lat < 40.2 && lng > 32.6 && lng < 33.2) return 'Ankara';
  if (lat > 38.2 && lat < 38.6 && lng > 26.9 && lng < 27.3) return 'İzmir';
  if (lat > 40.0 && lat < 40.4 && lng > 28.7 && lng < 29.3) return 'Bursa';
  if (lat > 36.7 && lat < 37.1 && lng > 30.5 && lng < 31.0) return 'Antalya';
  
  return 'Diğer';
}

// Gerçek istasyonları illere göre grupla
const REAL_STATIONS_BY_PROVINCE: Record<string, ChargingStation[]> = {};
REAL_STATIONS.forEach(station => {
  const province = getProvinceFromCoordinates(
    station.coordinates.lat,
    station.coordinates.lng,
    station.name
  );
  
  if (!REAL_STATIONS_BY_PROVINCE[province]) {
    REAL_STATIONS_BY_PROVINCE[province] = [];
  }
  REAL_STATIONS_BY_PROVINCE[province].push(station);
});

console.log(`✅ ${REAL_STATIONS.length} gerçek ZES istasyonu yüklendi`);
console.log('İl dağılımı:', Object.keys(REAL_STATIONS_BY_PROVINCE).map(k => `${k}: ${REAL_STATIONS_BY_PROVINCE[k].length}`));

// Mock istasyonlar (gerçek veriler tam olmadığı için hala tutuyoruz)
export const STATIONS_BY_PROVINCE: Record<string, ChargingStation[]> = {
  'İstanbul': [
    {
      id: 'IST001',
      name: 'ZES Atatürk Havalimanı',
      address: 'Yeşilköy Mahallesi, Atatürk Havalimanı Otopark, Bakırköy, İstanbul',
      coordinates: { lat: 40.9769, lng: 28.8146 },
      dcSockets: 8,
      acSockets: 12,
      power: '150 kW',
      status: 'active',
      type: 'parking',
      availability: 75
    },
    {
      id: 'IST002',
      name: 'ZES Taksim',
      address: 'Gümüşsuyu Mahallesi, Taksim Meydanı No:5, Beyoğlu, İstanbul',
      coordinates: { lat: 41.0370, lng: 28.9857 },
      dcSockets: 4,
      acSockets: 8,
      power: '120 kW',
      status: 'active',
      type: 'city',
      availability: 60
    },
    {
      id: 'IST003',
      name: 'ZES İstinye Park AVM',
      address: 'İstinye Mahallesi, İstinye Park AVM Otopark, Sarıyer, İstanbul',
      coordinates: { lat: 41.1089, lng: 29.0550 },
      dcSockets: 6,
      acSockets: 10,
      power: '150 kW',
      status: 'active',
      type: 'mall',
      availability: 85
    },
    {
      id: 'IST004',
      name: 'ZES Kadıköy İskele',
      address: 'Caferağa Mahallesi, İskele Meydanı, Kadıköy, İstanbul',
      coordinates: { lat: 40.9920, lng: 29.0270 },
      dcSockets: 3,
      acSockets: 6,
      power: '100 kW',
      status: 'active',
      type: 'city',
      availability: 70
    },
    {
      id: 'IST005',
      name: 'ZES TEM Otoyolu Avcılar',
      address: 'Üniversite Mahallesi, TEM Otoyolu Yan Yol, Avcılar, İstanbul',
      coordinates: { lat: 40.9868, lng: 28.7197 },
      dcSockets: 10,
      acSockets: 4,
      power: '180 kW',
      status: 'active',
      type: 'highway',
      availability: 90
    },
    {
      id: 'IST006',
      name: 'ZES Zorlu Center',
      address: 'Levazım Mahallesi, Zorlu Center AVM, Beşiktaş, İstanbul',
      coordinates: { lat: 41.0687, lng: 29.0104 },
      dcSockets: 5,
      acSockets: 8,
      power: '150 kW',
      status: 'active',
      type: 'mall',
      availability: 55
    },
    {
      id: 'IST007',
      name: 'ZES Başakşehir',
      address: 'Başak Mahallesi, Başakşehir Bulvarı No:12, Başakşehir, İstanbul',
      coordinates: { lat: 41.0767, lng: 28.8056 },
      dcSockets: 4,
      acSockets: 7,
      power: '120 kW',
      status: 'active',
      type: 'city',
      availability: 80
    },
    {
      id: 'IST008',
      name: 'ZES Pendik Marina',
      address: 'Yenişehir Mahallesi, Pendik Marina, Pendik, İstanbul',
      coordinates: { lat: 40.8718, lng: 29.2361 },
      dcSockets: 3,
      acSockets: 5,
      power: '100 kW',
      status: 'active',
      type: 'parking',
      availability: 65
    }
  ],
  'Ankara': [
    {
      id: 'ANK001',
      name: 'ZES Esenboğa Havalimanı',
      address: 'Balıkhisar Mahallesi, Esenboğa Havalimanı Otopark, Pursaklar, Ankara',
      coordinates: { lat: 40.1281, lng: 32.9951 },
      dcSockets: 6,
      acSockets: 10,
      power: '150 kW',
      status: 'active',
      type: 'parking',
      availability: 80
    },
    {
      id: 'ANK002',
      name: 'ZES Kızılay',
      address: 'Meşrutiyet Mahallesi, Atatürk Bulvarı No:15, Çankaya, Ankara',
      coordinates: { lat: 39.9194, lng: 32.8540 },
      dcSockets: 4,
      acSockets: 8,
      power: '120 kW',
      status: 'active',
      type: 'city',
      availability: 70
    },
    {
      id: 'ANK003',
      name: 'ZES Ankamall AVM',
      address: 'Akköprü Mahallesi, Ankamall AVM Otopark, Etimesgut, Ankara',
      coordinates: { lat: 39.9635, lng: 32.7289 },
      dcSockets: 5,
      acSockets: 9,
      power: '150 kW',
      status: 'active',
      type: 'mall',
      availability: 85
    },
    {
      id: 'ANK004',
      name: 'ZES Ulus',
      address: 'Hacıbayram Mahallesi, Anafartalar Caddesi, Altındağ, Ankara',
      coordinates: { lat: 39.9407, lng: 32.8541 },
      dcSockets: 3,
      acSockets: 6,
      power: '100 kW',
      status: 'active',
      type: 'city',
      availability: 60
    },
    {
      id: 'ANK005',
      name: 'ZES Sincan OSB',
      address: '1. Organize Sanayi Bölgesi, Sincan, Ankara',
      coordinates: { lat: 39.9699, lng: 32.5805 },
      dcSockets: 8,
      acSockets: 6,
      power: '180 kW',
      status: 'active',
      type: 'highway',
      availability: 90
    }
  ],
  'İzmir': [
    {
      id: 'IZM001',
      name: 'ZES Adnan Menderes Havalimanı',
      address: 'Dokuz Eylül Mahallesi, Adnan Menderes Havalimanı, Gaziemir, İzmir',
      coordinates: { lat: 38.2924, lng: 27.1570 },
      dcSockets: 7,
      acSockets: 10,
      power: '150 kW',
      status: 'active',
      type: 'parking',
      availability: 75
    },
    {
      id: 'IZM002',
      name: 'ZES Alsancak',
      address: 'Kültür Mahallesi, Atatürk Caddesi No:188, Konak, İzmir',
      coordinates: { lat: 38.4381, lng: 27.1441 },
      dcSockets: 4,
      acSockets: 7,
      power: '120 kW',
      status: 'active',
      type: 'city',
      availability: 65
    },
    {
      id: 'IZM003',
      name: 'ZES Forum Bornova',
      address: 'Kazım Dirik Mahallesi, Forum Bornova AVM, Bornova, İzmir',
      coordinates: { lat: 38.4633, lng: 27.2092 },
      dcSockets: 5,
      acSockets: 8,
      power: '150 kW',
      status: 'active',
      type: 'mall',
      availability: 80
    },
    {
      id: 'IZM004',
      name: 'ZES Karşıyaka İskele',
      address: 'Alaybey Mahallesi, İskele Meydanı, Karşıyaka, İzmir',
      coordinates: { lat: 38.4602, lng: 27.1119 },
      dcSockets: 3,
      acSockets: 6,
      power: '100 kW',
      status: 'active',
      type: 'city',
      availability: 70
    },
    {
      id: 'IZM005',
      name: 'ZES Çeşme Otogar',
      address: 'Çeşme Merkez, Otogar Caddesi No:2, Çeşme, İzmir',
      coordinates: { lat: 38.3230, lng: 26.3038 },
      dcSockets: 6,
      acSockets: 4,
      power: '150 kW',
      status: 'active',
      type: 'highway',
      availability: 85
    }
  ],
  'Antalya': [
    {
      id: 'ANT001',
      name: 'ZES Antalya Havalimanı',
      address: 'Sinan Mahallesi, Antalya Havalimanı D-400 Karayolu Üzeri, Muratpaşa, Antalya',
      coordinates: { lat: 36.8987, lng: 30.8005 },
      dcSockets: 8,
      acSockets: 12,
      power: '150 kW',
      status: 'active',
      type: 'parking',
      availability: 80
    },
    {
      id: 'ANT002',
      name: 'ZES Kaleiçi',
      address: 'Barbaros Mahallesi, Kaleiçi Yat Limanı, Muratpaşa, Antalya',
      coordinates: { lat: 36.8841, lng: 30.7056 },
      dcSockets: 3,
      acSockets: 6,
      power: '100 kW',
      status: 'active',
      type: 'city',
      availability: 60
    },
    {
      id: 'ANT003',
      name: 'ZES Lara Beach',
      address: 'Lara Mahallesi, Lara Sahil Caddesi No:45, Muratpaşa, Antalya',
      coordinates: { lat: 36.8530, lng: 30.7622 },
      dcSockets: 5,
      acSockets: 8,
      power: '120 kW',
      status: 'active',
      type: 'parking',
      availability: 75
    },
    {
      id: 'ANT004',
      name: 'ZES Konyaaltı',
      address: 'Konyaaltı Sahili, Atatürk Bulvarı, Konyaaltı, Antalya',
      coordinates: { lat: 36.8607, lng: 30.6344 },
      dcSockets: 4,
      acSockets: 7,
      power: '120 kW',
      status: 'active',
      type: 'city',
      availability: 70
    }
  ],
  'Bursa': [
    {
      id: 'BUR001',
      name: 'ZES Yenişehir Havalimanı',
      address: 'Kirazlıyayla Mahallesi, Yenişehir Havalimanı, Yenişehir, Bursa',
      coordinates: { lat: 40.2551, lng: 29.5626 },
      dcSockets: 5,
      acSockets: 8,
      power: '150 kW',
      status: 'active',
      type: 'parking',
      availability: 85
    },
    {
      id: 'BUR002',
      name: 'ZES Heykel',
      address: 'Heykel Meydanı, Atatürk Caddesi, Osmangazi, Bursa',
      coordinates: { lat: 40.1885, lng: 29.0610 },
      dcSockets: 4,
      acSockets: 7,
      power: '120 kW',
      status: 'active',
      type: 'city',
      availability: 70
    },
    {
      id: 'BUR003',
      name: 'ZES Nilüfer',
      address: 'Özlüce Mahallesi, Nilüfer Bulvarı No:8, Nilüfer, Bursa',
      coordinates: { lat: 40.1804, lng: 28.9920 },
      dcSockets: 3,
      acSockets: 6,
      power: '100 kW',
      status: 'active',
      type: 'city',
      availability: 75
    },
    {
      id: 'BUR004',
      name: 'ZES Organize Sanayi',
      address: 'Organize Sanayi Bölgesi, 4. Cadde, Nilüfer, Bursa',
      coordinates: { lat: 40.2259, lng: 28.9445 },
      dcSockets: 6,
      acSockets: 4,
      power: '150 kW',
      status: 'active',
      type: 'highway',
      availability: 90
    }
  ]
};

// Diğer iller için varsayılan istasyon üreteci
export function generateDefaultStations(provinceName: string, lat: number, lng: number, count: number): ChargingStation[] {
  const stations: ChargingStation[] = [];
  const types: ('city' | 'highway' | 'mall' | 'parking')[] = ['city', 'highway', 'mall', 'parking'];
  
  const locations = [
    'Merkez Mahallesi',
    'Cumhuriyet Mahallesi',
    'Yeni Mahalle',
    'Fatih Mahallesi',
    'Atatürk Bulvarı',
    'İstasyon Caddesi',
    'Organize Sanayi Bölgesi',
    'AVM Otoparkı',
    'Devlet Hastanesi Yanı',
    'Belediye Meydanı'
  ];
  
  for (let i = 0; i < count; i++) {
    // Şehir merkezi etrafında rastgele konumlar oluştur (±0.1 derece)
    const offsetLat = (Math.random() - 0.5) * 0.2;
    const offsetLng = (Math.random() - 0.5) * 0.2;
    
    const type = types[Math.floor(Math.random() * types.length)];
    const dcSockets = type === 'highway' ? Math.floor(Math.random() * 6) + 4 : Math.floor(Math.random() * 4) + 2;
    const acSockets = Math.floor(Math.random() * 6) + 4;
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    stations.push({
      id: `${provinceName.substring(0, 3).toUpperCase()}${String(i + 1).padStart(3, '0')}`,
      name: `ZES ${provinceName} ${type === 'highway' ? 'Otoyol' : type === 'mall' ? 'AVM' : type === 'parking' ? 'Otopark' : 'Merkez'} ${i + 1}`,
      address: `${location}, ${provinceName}`,
      coordinates: {
        lat: lat + offsetLat,
        lng: lng + offsetLng
      },
      dcSockets,
      acSockets,
      power: type === 'highway' ? '180 kW' : dcSockets > 4 ? '150 kW' : '120 kW',
      status: Math.random() > 0.95 ? 'maintenance' : 'active',
      type,
      availability: Math.floor(Math.random() * 40) + 60
    });
  }
  
  return stations;
}

export function getStationsForProvince(provinceName: string, coordinates: { lat: number; lng: number }, stationCount: number): ChargingStation[] {
  // 1. ÖNCELİK: Gerçek ZES verileri
  if (REAL_STATIONS_BY_PROVINCE[provinceName] && REAL_STATIONS_BY_PROVINCE[provinceName].length > 0) {
    console.log(`✅ ${provinceName} için ${REAL_STATIONS_BY_PROVINCE[provinceName].length} GERÇEK istasyon gösteriliyor`);
    return REAL_STATIONS_BY_PROVINCE[provinceName];
  }
  
  // 2. Mock veriler (detaylı tanımlananlar)
  if (STATIONS_BY_PROVINCE[provinceName]) {
    return STATIONS_BY_PROVINCE[provinceName];
  }
  
  // 3. Otomatik üretim (son çare)
  return generateDefaultStations(provinceName, coordinates.lat, coordinates.lng, Math.min(stationCount, 15));
}

