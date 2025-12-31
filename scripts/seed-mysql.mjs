import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT_DIR, 'real_zes_stations.json');

// Gerçek nüfus ve EV verileri (haritada gösterilenle aynı)
const REAL_POPULATIONS = {
  "İstanbul": 15907951, "Ankara": 5803482, "İzmir": 4462056, "Bursa": 3194720, "Antalya": 2688004,
  "Adana": 2274106, "Konya": 2277017, "Gaziantep": 2154051, "Şanlıurfa": 2155805, "Mersin": 1938389,
  "Diyarbakır": 1804880, "Kocaeli": 2079072, "Hatay": 1686043, "Manisa": 1468279, "Kayseri": 1441523,
  "Samsun": 1368488, "Balıkesir": 1257590, "Kahramanmaraş": 1177436, "Van": 1136757, "Aydın": 1148241,
  "Denizli": 1061142, "Sakarya": 1114045, "Tekirdağ": 1143432, "Muğla": 1054394, "Mardin": 880116,
  "Trabzon": 818023, "Erzurum": 749754, "Elazığ": 597696, "Malatya": 812580, "Batman": 634491,
  "Ağrı": 510626, "Sivas": 638956, "Ordu": 773086, "Çorum": 521970, "Afyonkarahisar": 747555,
  "Kütahya": 579966, "Tokat": 593990, "Edirne": 413903, "Çanakkale": 564157, "Kırklareli": 368869,
  "Uşak": 375454, "Düzce": 405929, "Osmaniye": 560946, "Kırıkkale": 286602, "Aksaray": 433735,
  "Yalova": 296525, "Giresun": 453912, "Rize": 348608, "Kırşehir": 250543, "Niğde": 364707,
  "Nevşehir": 309327, "Isparta": 444914, "Burdur": 273799, "Sinop": 220799, "Amasya": 338267,
  "Kastamonu": 383373, "Zonguldak": 588510, "Bartın": 200708, "Karabük": 248014, "Bolu": 320824,
  "Yozgat": 418650, "Çankırı": 195766, "Karaman": 265409, "Kilis": 147541, "Adıyaman": 632459,
  "Siirt": 353542, "Şırnak": 542743, "Bitlis": 353988, "Muş": 408728, "Hakkari": 287625,
  "Iğdır": 204536, "Erzincan": 234747, "Artvin": 170875, "Ardahan": 94603, "Gümüşhane": 164521,
  "Bayburt": 84843, "Bingöl": 282556, "Tunceli": 88198, "Eskişehir": 906877, "Kars": 282464
};

const REAL_EV_DATA = {
  "Adana": { evCount: 8487, totalStations: 199, stationChangePercent: 4.74 },
  "Adıyaman": { evCount: 1317, totalStations: 28, stationChangePercent: 0.0 },
  "Afyonkarahisar": { evCount: 2199, totalStations: 159, stationChangePercent: 0.0 },
  "Ağrı": { evCount: 211, totalStations: 15, stationChangePercent: 0.0 },
  "Aksaray": { evCount: 1645, totalStations: 52, stationChangePercent: 0.0 },
  "Amasya": { evCount: 1434, totalStations: 46, stationChangePercent: 0.0 },
  "Ankara": { evCount: 40504, totalStations: 1627, stationChangePercent: 3.17 },
  "Antalya": { evCount: 14142, totalStations: 872, stationChangePercent: 0.69 },
  "Ardahan": { evCount: 93, totalStations: 8, stationChangePercent: 0.0 },
  "Artvin": { evCount: 402, totalStations: 24, stationChangePercent: 0.0 },
  "Aydın": { evCount: 4493, totalStations: 196, stationChangePercent: 1.55 },
  "Balıkesir": { evCount: 5208, totalStations: 283, stationChangePercent: 0.35 },
  "Bartın": { evCount: 665, totalStations: 18, stationChangePercent: -5.26 },
  "Batman": { evCount: 451, totalStations: 65, stationChangePercent: 0.0 },
  "Bayburt": { evCount: 168, totalStations: 12, stationChangePercent: 0.0 },
  "Bilecik": { evCount: 806, totalStations: 34, stationChangePercent: 0.0 },
  "Bingöl": { evCount: 254, totalStations: 17, stationChangePercent: 0.0 },
  "Bitlis": { evCount: 220, totalStations: 23, stationChangePercent: 0.0 },
  "Bolu": { evCount: 1365, totalStations: 98, stationChangePercent: -1.01 },
  "Burdur": { evCount: 1291, totalStations: 40, stationChangePercent: 2.56 },
  "Bursa": { evCount: 13486, totalStations: 646, stationChangePercent: 1.25 },
  "Çanakkale": { evCount: 2412, totalStations: 166, stationChangePercent: 0.61 },
  "Çankırı": { evCount: 505, totalStations: 31, stationChangePercent: 0.0 },
  "Çorum": { evCount: 1892, totalStations: 65, stationChangePercent: 3.17 },
  "Denizli": { evCount: 4882, totalStations: 204, stationChangePercent: 5.15 },
  "Diyarbakır": { evCount: 1649, totalStations: 160, stationChangePercent: 8.84 },
  "Düzce": { evCount: 1387, totalStations: 59, stationChangePercent: 3.51 },
  "Edirne": { evCount: 1631, totalStations: 77, stationChangePercent: 2.67 },
  "Elazığ": { evCount: 1917, totalStations: 57, stationChangePercent: 1.79 },
  "Erzincan": { evCount: 694, totalStations: 19, stationChangePercent: 5.56 },
  "Erzurum": { evCount: 1465, totalStations: 56, stationChangePercent: 1.82 },
  "Eskişehir": { evCount: 4084, totalStations: 144, stationChangePercent: 0.7 },
  "Gaziantep": { evCount: 6071, totalStations: 115, stationChangePercent: 1.77 },
  "Giresun": { evCount: 1074, totalStations: 43, stationChangePercent: 2.38 },
  "Gümüşhane": { evCount: 269, totalStations: 23, stationChangePercent: 4.55 },
  "Hakkari": { evCount: 62, totalStations: 13, stationChangePercent: 0.0 },
  "Hatay": { evCount: 5266, totalStations: 56, stationChangePercent: 1.82 },
  "Iğdır": { evCount: 154, totalStations: 10, stationChangePercent: 0.0 },
  "Isparta": { evCount: 1978, totalStations: 67, stationChangePercent: 3.08 },
  "İstanbul": { evCount: 76063, totalStations: 3687, stationChangePercent: 3.1 },
  "İzmir": { evCount: 20334, totalStations: 631, stationChangePercent: 2.27 },
  "Kahramanmaraş": { evCount: 3641, totalStations: 65, stationChangePercent: 10.17 },
  "Karabük": { evCount: 906, totalStations: 29, stationChangePercent: 0.0 },
  "Karaman": { evCount: 866, totalStations: 29, stationChangePercent: 0.0 },
  "Kars": { evCount: 297, totalStations: 15, stationChangePercent: 7.14 },
  "Kastamonu": { evCount: 1462, totalStations: 49, stationChangePercent: 0.0 },
  "Kayseri": { evCount: 5895, totalStations: 287, stationChangePercent: 0.7 },
  "Kilis": { evCount: 261, totalStations: 6, stationChangePercent: 20.0 },
  "Kırıkkale": { evCount: 888, totalStations: 39, stationChangePercent: 2.63 },
  "Kırklareli": { evCount: 1437, totalStations: 45, stationChangePercent: 4.65 },
  "Kırşehir": { evCount: 900, totalStations: 19, stationChangePercent: 5.56 },
  "Kocaeli": { evCount: 6666, totalStations: 341, stationChangePercent: 2.71 },
  "Konya": { evCount: 8785, totalStations: 311, stationChangePercent: 1.3 },
  "Kütahya": { evCount: 2427, totalStations: 83, stationChangePercent: 2.47 },
  "Malatya": { evCount: 2484, totalStations: 52, stationChangePercent: 10.64 },
  "Manisa": { evCount: 5175, totalStations: 133, stationChangePercent: 2.31 },
  "Mardin": { evCount: 684, totalStations: 63, stationChangePercent: 1.61 },
  "Mersin": { evCount: 7234, totalStations: 256, stationChangePercent: 0.79 },
  "Muğla": { evCount: 5302, totalStations: 424, stationChangePercent: 0.95 },
  "Muş": { evCount: 251, totalStations: 22, stationChangePercent: 0.0 },
  "Nevşehir": { evCount: 1356, totalStations: 108, stationChangePercent: 3.85 },
  "Niğde": { evCount: 1204, totalStations: 37, stationChangePercent: 0.0 },
  "Ordu": { evCount: 2051, totalStations: 76, stationChangePercent: 1.33 },
  "Osmaniye": { evCount: 2103, totalStations: 31, stationChangePercent: 3.33 },
  "Rize": { evCount: 890, totalStations: 52, stationChangePercent: 0.0 },
  "Sakarya": { evCount: 3903, totalStations: 201, stationChangePercent: 3.08 },
  "Samsun": { evCount: 4832, totalStations: 201, stationChangePercent: 1.01 },
  "Şanlıurfa": { evCount: 2190, totalStations: 69, stationChangePercent: 2.99 },
  "Siirt": { evCount: 186, totalStations: 13, stationChangePercent: 0.0 },
  "Sinop": { evCount: 738, totalStations: 26, stationChangePercent: 4.0 },
  "Sivas": { evCount: 2110, totalStations: 84, stationChangePercent: 3.7 },
  "Şırnak": { evCount: 170, totalStations: 19, stationChangePercent: 0.0 },
  "Tekirdağ": { evCount: 3592, totalStations: 154, stationChangePercent: 1.32 },
  "Tokat": { evCount: 2083, totalStations: 49, stationChangePercent: 0.0 },
  "Trabzon": { evCount: 3042, totalStations: 199, stationChangePercent: 5.85 },
  "Tunceli": { evCount: 104, totalStations: 11, stationChangePercent: 0.0 },
  "Uşak": { evCount: 1598, totalStations: 32, stationChangePercent: 0.0 },
  "Van": { evCount: 699, totalStations: 48, stationChangePercent: 0.0 },
  "Yalova": { evCount: 920, totalStations: 69, stationChangePercent: 1.47 },
  "Yozgat": { evCount: 1107, totalStations: 35, stationChangePercent: 2.94 },
  "Zonguldak": { evCount: 2169, totalStations: 54, stationChangePercent: 1.89 }
};

const ZES_STATIONS = {
  "Adana": 56, "Adıyaman": 8, "Afyonkarahisar": 51, "Ağrı": 5, "Aksaray": 18, "Amasya": 16,
  "Ankara": 630, "Antalya": 309, "Ardahan": 3, "Artvin": 7, "Aydın": 62, "Balıkesir": 84,
  "Bartın": 5, "Batman": 20, "Bayburt": 4, "Bilecik": 11, "Bingöl": 5, "Bitlis": 8,
  "Bolu": 35, "Burdur": 12, "Bursa": 239, "Çanakkale": 58, "Çankırı": 10, "Çorum": 20,
  "Denizli": 75, "Diyarbakır": 43, "Düzce": 18, "Edirne": 24, "Elazığ": 20, "Erzincan": 7,
  "Erzurum": 20, "Eskişehir": 52, "Gaziantep": 32, "Giresun": 16, "Gümüşhane": 8, "Hakkari": 4,
  "Hatay": 16, "Iğdır": 3, "Isparta": 24, "İstanbul": 1412, "İzmir": 232, "Kahramanmaraş": 16,
  "Karabük": 9, "Karaman": 9, "Kars": 5, "Kastamonu": 15, "Kayseri": 81, "Kilis": 2,
  "Kırıkkale": 13, "Kırklareli": 15, "Kırşehir": 6, "Kocaeli": 100, "Konya": 91, "Kütahya": 30,
  "Malatya": 18, "Manisa": 46, "Mardin": 20, "Mersin": 92, "Muğla": 128, "Muş": 7,
  "Nevşehir": 40, "Niğde": 13, "Ordu": 26, "Osmaniye": 11, "Rize": 19, "Sakarya": 73,
  "Samsun": 53, "Şanlıurfa": 17, "Siirt": 4, "Sinop": 8, "Sivas": 26, "Şırnak": 7,
  "Tekirdağ": 56, "Tokat": 16, "Trabzon": 56, "Tunceli": 4, "Uşak": 12, "Van": 16,
  "Yalova": 22, "Yozgat": 11, "Zonguldak": 18
};

const {
  MYSQL_HOST = '127.0.0.1',
  MYSQL_PORT = '3306',
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = process.env;

if (!MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
  console.error('Eksik MySQL env değişkenleri. Lütfen .env içine MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE ekleyin.');
  process.exit(1);
}

const bolgeSehirleri = {
  'Marmara': ['İstanbul', 'Bursa', 'Kocaeli', 'Tekirdağ', 'Balıkesir', 'Çanakkale', 'Sakarya', 'Bilecik', 'Yalova', 'Edirne', 'Kırklareli'],
  'Ege': ['İzmir', 'Manisa', 'Aydın', 'Denizli', 'Muğla', 'Afyonkarahisar', 'Kütahya', 'Uşak'],
  'Akdeniz': ['Antalya', 'Adana', 'Mersin', 'Hatay', 'Kahramanmaraş', 'Osmaniye', 'Isparta', 'Burdur'],
  'İç Anadolu': ['Ankara', 'Konya', 'Kayseri', 'Eskişehir', 'Sivas', 'Kırıkkale', 'Aksaray', 'Karaman', 'Kırşehir', 'Niğde', 'Nevşehir', 'Yozgat', 'Çankırı'],
  'Karadeniz': ['Samsun', 'Trabzon', 'Ordu', 'Giresun', 'Rize', 'Artvin', 'Gümüşhane', 'Bayburt', 'Tokat', 'Amasya', 'Çorum', 'Sinop', 'Kastamonu', 'Bartın', 'Zonguldak', 'Karabük', 'Düzce', 'Bolu'],
  'Doğu Anadolu': ['Erzurum', 'Malatya', 'Elazığ', 'Van', 'Erzincan', 'Kars', 'Ağrı', 'Iğdır', 'Ardahan', 'Muş', 'Bitlis', 'Hakkari', 'Bingöl', 'Tunceli'],
  'Güneydoğu Anadolu': ['Gaziantep', 'Şanlıurfa', 'Diyarbakır', 'Mardin', 'Batman', 'Adıyaman', 'Siirt', 'Şırnak', 'Kilis']
};

const tumSehirler = Object.entries(bolgeSehirleri).flatMap(([bolge, sehirler]) =>
  sehirler.map((ad) => ({ ad, bolge }))
);

const bolgeMap = Object.fromEntries(tumSehirler.map(({ ad, bolge }) => [ad, bolge]));

const evTahminleri = {
  'İstanbul': 76063, 'Ankara': 40504, 'İzmir': 20334, 'Bursa': 13486,
  'Antalya': 14142, 'Adana': 8487, 'Konya': 8785, 'Gaziantep': 6071,
  'Mersin': 7234, 'Kayseri': 5895, 'Eskişehir': 4250, 'Diyarbakır': 3100,
  'Samsun': 4500, 'Denizli': 3200, 'Şanlıurfa': 2900, 'Adapazarı': 5200,
  'Malatya': 2800, 'Kahramanmaraş': 3641, 'Erzurum': 2200, 'Van': 1800,
  'Kocaeli': 9500, 'Manisa': 4100, 'Balıkesir': 3800, 'Aydın': 3500,
  'Tekirdağ': 4200, 'Hatay': 5266, 'Trabzon': 3300, 'Muğla': 5800
};

function sehirAdi(stationName) {
  return String(stationName).split(' - ')[0];
}

async function main() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  const stations = JSON.parse(raw);

  const adminConn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    charset: 'utf8mb4_general_ci',
  });

  await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
  await adminConn.end();

  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    charset: 'utf8mb4_general_ci',
  });

  await conn.execute(`SET NAMES utf8mb4`);

  await conn.execute(`SET FOREIGN_KEY_CHECKS=0`);
  await conn.execute(`DROP TABLE IF EXISTS sehir_metrikleri`);
  await conn.execute(`DROP TABLE IF EXISTS istasyon_soketleri`);
  await conn.execute(`DROP TABLE IF EXISTS istasyonlar`);
  await conn.execute(`DROP TABLE IF EXISTS sehirler`);
  await conn.execute(`DROP TABLE IF EXISTS bolgeler`);
  await conn.execute(`SET FOREIGN_KEY_CHECKS=1`);

  await conn.execute(`
    CREATE TABLE bolgeler (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad VARCHAR(64) UNIQUE NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.execute(`
    CREATE TABLE sehirler (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad VARCHAR(128) UNIQUE NOT NULL,
      bolge_id INT NOT NULL,
      nufus INT DEFAULT 0,
      INDEX idx_bolge (bolge_id),
      CONSTRAINT fk_sehir_bolge FOREIGN KEY (bolge_id) REFERENCES bolgeler(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.execute(`
    CREATE TABLE istasyonlar (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ad VARCHAR(255) NOT NULL,
      sehir_id INT NOT NULL,
      INDEX idx_sehir (sehir_id),
      CONSTRAINT fk_istasyon_sehir FOREIGN KEY (sehir_id) REFERENCES sehirler(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.execute(`
    CREATE TABLE istasyon_soketleri (
      id INT AUTO_INCREMENT PRIMARY KEY,
      istasyon_id INT NOT NULL,
      tur ENUM('AC','DC') NOT NULL,
      adet INT NOT NULL DEFAULT 0,
      CONSTRAINT fk_soket_istasyon FOREIGN KEY (istasyon_id) REFERENCES istasyonlar(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await conn.execute(`
    CREATE TABLE sehir_metrikleri (
      sehir_id INT PRIMARY KEY,
      ev_sayisi INT,
      ev_buyume_orani INT,
      sarj_talebi INT,
      ag_kapsami INT,
      zes_pazar_pay INT,
      mevsimsellik_katsayi DECIMAL(3,1),
      ac_soket INT,
      dc_soket INT,
      toplam_soket INT,
      zes_istasyon INT,
      CONSTRAINT fk_metric_sehir FOREIGN KEY (sehir_id) REFERENCES sehirler(id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const regionsToInsert = Array.from(new Set(Object.keys(bolgeSehirleri)));
  for (const bolge of regionsToInsert) {
    await conn.execute(`INSERT INTO bolgeler (ad) VALUES (?)`, [bolge]);
  }

  async function bolgeIdGetir(ad) {
    const [[row]] = await conn.query(`SELECT id FROM bolgeler WHERE ad = ?`, [ad]);
    return row?.id;
  }

  const sehirCache = new Map();

  // 81 ili baştan ekle (istasyon olmasa bile 0 metrikle)
  for (const { ad, bolge } of tumSehirler) {
    const bolgeId = await bolgeIdGetir(bolge);
    const nufus = REAL_POPULATIONS[ad] || 100000;
    await conn.execute(`INSERT INTO sehirler (ad, bolge_id, nufus) VALUES (?, ?, ?)`, [ad, bolgeId, nufus]);
    const [[created]] = await conn.query(`SELECT id FROM sehirler WHERE ad = ?`, [ad]);
    sehirCache.set(ad, { id: created.id, ad, bolgeId, zes: 0, ac: 0, dc: 0 });
  }

  for (const s of stations) {
    const sehir = sehirAdi(s.name);
    const ac = Number(s.acSockets || 0);
    const dc = Number(s.dcSockets || 0);

    // Eğer haritada olmayan bir şehir çıkar ise atla
    if (!sehirCache.has(sehir)) continue;

    const info = sehirCache.get(sehir);

    const [istRes] = await conn.execute(`INSERT INTO istasyonlar (ad, sehir_id) VALUES (?, ?)`, [s.name, info.id]);
    const istasyonId = istRes.insertId;

    await conn.execute(`INSERT INTO istasyon_soketleri (istasyon_id, tur, adet) VALUES (?, 'AC', ?), (?, 'DC', ?)`, [istasyonId, ac, istasyonId, dc]);

    info.zes += 1;
    info.ac += ac;
    info.dc += dc;
    sehirCache.set(sehir, info);
  }

  // Haritadaki gerçek pazar verileriyle soket ve ZES istasyon sayılarını eşitle
  for (const [ad, info] of sehirCache.entries()) {
    const evData = REAL_EV_DATA[ad];
    if (evData) {
      const totalSockets = evData.totalStations;
      const ac = Math.round(totalSockets * 0.6);
      const dc = totalSockets - ac;
      const zes = ZES_STATIONS[ad] ?? info.zes;
      sehirCache.set(ad, { ...info, ac, dc, zes });
    }
  }

  for (const sehir of sehirCache.values()) {
    const evData = REAL_EV_DATA[sehir.ad];
    const evSayisi = evData?.evCount || 0;
    const talep = evData?.totalStations || Math.max(10, sehir.ac + sehir.dc);
    const buyume = Math.min(100, Math.max(20, Math.round((evData?.stationChangePercent || 3) * 10)));
    const kapsama = Math.min(95, Math.round((sehir.ac + sehir.dc) / Math.max(evSayisi, 1) * 100));
    const pazarPay = evData ? Math.min(100, Math.round((sehir.zes / evData.totalStations) * 100)) : 35;
    const mevsim = ['Antalya', 'Muğla', 'Aydın'].includes(sehir.ad) ? 1.2 : 1.0;

    await conn.execute(`INSERT INTO sehir_metrikleri (sehir_id, ev_sayisi, ev_buyume_orani, sarj_talebi, ag_kapsami, zes_pazar_pay, mevsimsellik_katsayi, ac_soket, dc_soket, toplam_soket, zes_istasyon)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      sehir.id,
      evSayisi,
      buyume,
      talep,
      kapsama,
      pazarPay,
      mevsim,
      sehir.ac,
      sehir.dc,
      sehir.ac + sehir.dc,
      sehir.zes,
    ]);
  }

  const [[sehirAdet]] = await conn.query('SELECT COUNT(*) AS c FROM sehirler');
  const [[istasyonAdet]] = await conn.query('SELECT COUNT(*) AS c FROM istasyonlar');

  console.log(`✅ MySQL seed tamam: ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`);
  console.log(`📊 Şehir: ${sehirAdet.c}, İstasyon: ${istasyonAdet.c}`);

  await conn.end();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
