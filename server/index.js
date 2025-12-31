import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT_DIR, 'real_zes_stations.json');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let stations = [];
let pool = null;
const {
  MYSQL_HOST,
  MYSQL_PORT,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
} = process.env;
const USE_MYSQL = Boolean(MYSQL_HOST && MYSQL_USER && MYSQL_PASSWORD && MYSQL_DATABASE);

async function loadStations() {
  if (USE_MYSQL) {
    try {
      pool = await mysql.createPool({
        host: MYSQL_HOST,
        port: Number(MYSQL_PORT || 3306),
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
        charset: 'utf8mb4_general_ci',
        waitForConnections: true,
        connectionLimit: 5,
      });
      console.log(`Connected to MySQL ${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}`);
    } catch (err) {
      console.error('MySQL connection failed, falling back to JSON:', err);
    }
  }

  if (!pool) {
    try {
      const raw = await fs.readFile(DATA_PATH, 'utf-8');
      stations = JSON.parse(raw);
      console.log(`Loaded ${stations.length} stations from real_zes_stations.json`);
    } catch (err) {
      console.error('Failed to load stations:', err);
      stations = [];
    }
  }
}

function getCityFromName(name) {
  if (!name) return '';
  const parts = String(name).split(' - ');
  return parts[0];
}

async function aggregateByCity() {
  if (pool) {
    const [rows] = await pool.query(
      `SELECT s.ad AS city, b.ad AS region, m.zes_istasyon AS zesStations,
              m.ac_soket AS acSockets, m.dc_soket AS dcSockets, m.toplam_soket AS totalSockets
       FROM sehirler s
       JOIN bolgeler b ON b.id = s.bolge_id
       JOIN sehir_metrikleri m ON m.sehir_id = s.id
       ORDER BY m.zes_istasyon DESC`
    );
    return rows;
  }
  const cityMap = new Map();
  for (const s of stations) {
    const city = getCityFromName(s.name);
    if (!city) continue;
    const entry = cityMap.get(city) || { city, zesStations: 0, ac: 0, dc: 0 };
    entry.zesStations += 1;
    entry.ac += Number(s.acSockets || 0);
    entry.dc += Number(s.dcSockets || 0);
    cityMap.set(city, entry);
  }
  return Array.from(cityMap.values()).map(e => ({
    city: e.city,
    zesStations: e.zesStations,
    acSockets: e.ac,
    dcSockets: e.dc,
    totalSockets: e.ac + e.dc,
  })).sort((a, b) => b.zesStations - a.zesStations);
}

async function getSummary() {
  if (pool) {
    const [cities] = await pool.query(
      `SELECT s.ad AS city, m.zes_istasyon AS zesStations, m.ac_soket AS acSockets, m.dc_soket AS dcSockets, m.toplam_soket AS totalSockets
       FROM sehirler s
       JOIN sehir_metrikleri m ON m.sehir_id = s.id
       ORDER BY m.zes_istasyon DESC`
    );
    const [stationCountRows] = await pool.query('SELECT COUNT(*) AS c FROM istasyonlar');
    const totalStations = Number(stationCountRows[0]?.c || 0);
    const totals = cities.reduce((acc, c) => {
      acc.ac += Number(c.acSockets || 0);
      acc.dc += Number(c.dcSockets || 0);
      return acc;
    }, { ac: 0, dc: 0 });
    return {
      totalStations,
      totalACSockets: totals.ac,
      totalDCSockets: totals.dc,
      totalSockets: totals.ac + totals.dc,
      cityCount: cities.length,
      topCities: cities.slice(0, 10),
      lastUpdated: new Date().toISOString(),
    };
  }
  const cities = await aggregateByCity();
  const totalStations = stations.length;
  const totals = cities.reduce((acc, c) => {
    acc.ac += c.acSockets;
    acc.dc += c.dcSockets;
    return acc;
  }, { ac: 0, dc: 0 });
  return {
    totalStations,
    totalACSockets: totals.ac,
    totalDCSockets: totals.dc,
    totalSockets: totals.ac + totals.dc,
    cityCount: cities.length,
    topCities: cities.slice(0, 10),
    lastUpdated: new Date().toISOString(),
  };
}

app.get('/api/health', async (req, res) => {
  if (pool) {
    const [rows] = await pool.query('SELECT COUNT(*) AS c FROM istasyonlar');
    return res.json({ ok: true, stationCount: Number(rows[0]?.c || 0), source: 'mysql' });
  }
  res.json({ ok: true, stationCount: stations.length, source: 'json' });
});

app.get('/api/stations', async (req, res) => {
  if (pool) {
    const [rows] = await pool.query(
      `SELECT i.id, i.ad AS name, s.ad AS city,
              SUM(CASE WHEN ss.tur='AC' THEN ss.adet ELSE 0 END) AS acSockets,
              SUM(CASE WHEN ss.tur='DC' THEN ss.adet ELSE 0 END) AS dcSockets,
              SUM(ss.adet) AS totalSockets
       FROM istasyonlar i
       JOIN sehirler s ON s.id = i.sehir_id
       LEFT JOIN istasyon_soketleri ss ON ss.istasyon_id = i.id
       GROUP BY i.id, i.ad, s.ad
       ORDER BY s.ad, i.ad`
    );
    return res.json(rows);
  }
  res.json(stations);
});

app.get('/api/cities', async (req, res) => {
  const cities = await aggregateByCity();
  res.json(cities);
});

app.get('/api/cities/:name', async (req, res) => {
  const name = req.params.name;
  if (pool) {
    const [cityRows] = await pool.query(
      `SELECT s.ad AS city, b.ad AS region, m.zes_istasyon AS zesStations,
              m.ac_soket AS acSockets, m.dc_soket AS dcSockets, m.toplam_soket AS totalSockets
       FROM sehirler s
       JOIN bolgeler b ON b.id = s.bolge_id
       JOIN sehir_metrikleri m ON m.sehir_id = s.id
       WHERE s.ad = ?`, [name]
    );
    const [stationRows] = await pool.query(
      `SELECT i.id, i.ad AS name, s.ad AS city,
              SUM(CASE WHEN ss.tur='AC' THEN ss.adet ELSE 0 END) AS acSockets,
              SUM(CASE WHEN ss.tur='DC' THEN ss.adet ELSE 0 END) AS dcSockets,
              SUM(ss.adet) AS totalSockets
       FROM istasyonlar i
       JOIN sehirler s ON s.id = i.sehir_id
       LEFT JOIN istasyon_soketleri ss ON ss.istasyon_id = i.id
       WHERE s.ad = ?
       GROUP BY i.id, i.ad, s.ad
       ORDER BY i.ad`, [name]
    );
    return res.json({ summary: cityRows[0] || null, stations: stationRows });
  }
  const cities = await aggregateByCity();
  const city = cities.find(c => c.city.toLowerCase() === name.toLowerCase());
  const cityStations = stations.filter(s => getCityFromName(s.name).toLowerCase() === name.toLowerCase());
  res.json({ summary: city || null, stations: cityStations });
});

app.get('/api/summary', async (req, res) => {
  const summary = await getSummary();
  res.json(summary);
});

loadStations().then(() => {
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
});
