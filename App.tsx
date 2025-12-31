import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MOCK_DATA, getTotalZESStations } from './src/data/realData';
import { ProvinceData, AnalysisMetrics } from './src/data/types';
import { getStationsForProvince, ChargingStation } from './src/data/stationData';
import { REAL_EV_DATA, getZESMarketShare, getMarketGap, calculateInvestmentPriority, WORST_CITIES_FOR_EV } from './src/data/evData';
import { calculateMarketOpportunity, getAllOpportunities, getOpportunityInsights, MarketOpportunityMetrics } from './src/data/marketOpportunity';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, LineChart, Line, ScatterChart, Scatter, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Zap, AlertTriangle, Search, 
  BarChart3, Activity, Download, Target, DollarSign,
  Sun, MapPin, Filter, Percent, Award, Clock, ArrowUpRight, ArrowDownRight, TrendingUpIcon, Eye
} from 'lucide-react';
import Login from './src/components/Login';

declare global {
  interface Window {
    L: any;
  }
}

const TurkeyMap: React.FC<{ selected: string, onSelect: (name: string) => void }> = ({ selected, onSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);
  const [showDetailedStations, setShowDetailedStations] = useState(false);
  const [detailedStations, setDetailedStations] = useState<ChargingStation[]>([]);
  const openPopupRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Global show stations handler
  useEffect(() => {
    (window as any).showDetailedStations = (provinceName: string) => {
      onSelect(provinceName);
      setShowDetailedStations(true);
    };
    return () => {
      delete (window as any).showDetailedStations;
    };
  }, [onSelect]);

  // Tam ekran değiştiğinde haritayı yeniden boyutlandır
  useEffect(() => {
    if (leafletMapRef.current) {
      setTimeout(() => {
        leafletMapRef.current.invalidateSize();
      }, 100);
    }
  }, [isFullscreen]);

  // Leaflet haritasını başlat
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, {
      center: [39.0, 35.0],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Haritaya tıklandığında popup'ları kapat
    map.on('click', () => {
      if (openPopupRef.current) {
        openPopupRef.current.closePopup();
        openPopupRef.current = null;
      }
    });

    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Marker'ları güncelle
  useEffect(() => {
    if (!leafletMapRef.current) return;

    const map = leafletMapRef.current;

    // Eski marker ve circle'ları temizle
    markersRef.current.forEach(marker => marker.remove());
    circlesRef.current.forEach(circle => circle.remove());
    const newMarkers: any[] = [];
    const newCircles: any[] = [];

    if (openPopupRef.current) {
      openPopupRef.current.closePopup();
      openPopupRef.current = null;
    }

    // Detaylı istasyon görünümü
    if (showDetailedStations && selected) {
      const province = MOCK_DATA.find(p => p.name === selected);
      if (province) {
        const latest = province.history[province.history.length - 1];
        const stations = getStationsForProvince(province.name, province.coordinates, latest.zesSockets);
        setDetailedStations(stations);

        map.setView([province.coordinates.lat, province.coordinates.lng], 10);

        stations.forEach((station) => {
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              width: 16px;
              height: 16px;
              background: ${station.status === 'active' ? '#00FF00' : '#FFA500'};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
            "></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const marker = L.marker([station.coordinates.lat, station.coordinates.lng], { icon })
            .addTo(map)
            .bindPopup(`
              <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98)); color: white; padding: 16px; border-radius: 12px; min-width: 240px; font-family: system-ui; border: 1px solid rgba(255, 140, 0, 0.3);">
                <h3 style="color: #FF8C00; font-size: 15px; font-weight: 800; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid rgba(255, 140, 0, 0.4);">
                  ${station.name}
                </h3>
                <div style="font-size: 12px; line-height: 1.7;">
                  <p style="margin: 8px 0; color: rgba(255, 255, 255, 0.85);"><strong style="color: #FFB84D;">📍</strong> ${station.address}</p>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; padding: 12px; background: rgba(255, 140, 0, 0.08); border-radius: 8px;">
                    <div style="text-align: center; padding: 8px; background: rgba(0, 255, 0, 0.08); border-radius: 6px;">
                      <p style="color: #00FF88; font-weight: 700; font-size: 10px; margin-bottom: 6px;">⚡ DC Hızlı</p>
                      <p style="font-size: 24px; font-weight: 900; margin: 0; color: #00FF88;">${station.dcSockets}</p>
                    </div>
                    <div style="text-align: center; padding: 8px; background: rgba(0, 191, 255, 0.08); border-radius: 6px;">
                      <p style="color: #00BFFF; font-weight: 700; font-size: 10px; margin-bottom: 6px;">🔌 AC Normal</p>
                      <p style="font-size: 24px; font-weight: 900; margin: 0; color: #00BFFF;">${station.acSockets}</p>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 11px;"><strong style="color: #FFB84D;">⚡</strong> ${station.power}</span>
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 11px;">${station.type === 'highway' ? '🛣️ Otoyol' : station.type === 'mall' ? '🏬 AVM' : station.type === 'parking' ? '🅿️ Otopark' : '🏙️ Şehir'}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 11px;"><strong style="color: #FFB84D;">📊</strong> Doluluk: <strong style="color: #00FF88;">%${station.availability}</strong></span>
                    <span style="color: ${station.status === 'active' ? '#00FF88' : '#FFA500'}; font-weight: 700; font-size: 11px;">${station.status === 'active' ? '✅ Aktif' : '🔧 Bakım'}</span>
                  </div>
                </div>
              </div>
            `, { maxWidth: 300, className: 'custom-leaflet-popup' });

          marker.on('click', () => {
            if (openPopupRef.current && openPopupRef.current !== marker) {
              openPopupRef.current.closePopup();
            }
            openPopupRef.current = marker;
          });

          newMarkers.push(marker);
        });
      }
    } else {
      // Normal görünüm - il bazlı
      MOCK_DATA.forEach((province) => {
        const isSelected = selected === province.name;
        const latest = province.history[province.history.length - 1];

        if (latest.zesSockets > 5) {
          const circle = L.circle([province.coordinates.lat, province.coordinates.lng], {
            color: '#FF8C00',
            fillColor: '#FF8C00',
            fillOpacity: isSelected ? 0.15 : 0.08,
            radius: isSelected ? 40000 : Math.min(latest.zesSockets * 150, 30000),
            weight: isSelected ? 2 : 0.5,
          }).addTo(map);
          newCircles.push(circle);
        }

        const iconSize = isSelected ? 20 : Math.min(10 + (latest.zesSockets / 30), 16);
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: ${iconSize}px;
            height: ${iconSize}px;
            background: ${isSelected ? '#FF8C00' : '#FF6B00'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 15px rgba(255,140,0,0.5);
          "></div>`,
          iconSize: [iconSize, iconSize],
          iconAnchor: [iconSize/2, iconSize/2]
        });

        const marker = L.marker([province.coordinates.lat, province.coordinates.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98)); color: white; padding: 14px; border-radius: 12px; min-width: 260px; border: 1px solid rgba(255, 140, 0, 0.3);">
              <h3 style="color: #FF8C00; font-size: 16px; font-weight: 800; margin-bottom: 10px;">${province.name}</h3>
              <div style="font-size: 13px; line-height: 1.8; color: rgba(255, 255, 255, 0.9);">
                <p style="margin: 6px 0;"><strong style="color: #FFB84D;">🔌 ZES İstasyonu:</strong> ${latest.zesSockets}</p>
                <p style="margin: 6px 0;"><strong style="color: #FFB84D;">📈 Toplam Pazar:</strong> ${(() => {
                  const evData = REAL_EV_DATA[province.name];
                  return evData ? evData.totalStations.toLocaleString() : (latest.acSockets + latest.dcSockets).toLocaleString();
                })()} istasyon</p>
                <p style="margin: 6px 0;"><strong style="color: #FFB84D;">🚗 Gerçek EV:</strong> ${(() => {
                  const evData = REAL_EV_DATA[province.name];
                  return evData ? evData.evCount.toLocaleString() : latest.evCount.toLocaleString();
                })()}</p>
                <p style="margin: 6px 0;"><strong style="color: #FFB84D;">👥 Nüfus:</strong> ${province.population.toLocaleString()}</p>
                <p style="margin: 6px 0;"><strong style="color: #FFB84D;">📊 ZES Payı:</strong> <span style="color: #00FF88; font-weight: bold;">%${(() => {
                  const evData = REAL_EV_DATA[province.name];
                  const totalMarket = evData ? evData.totalStations : (latest.acSockets + latest.dcSockets);
                  return ((latest.zesSockets / totalMarket) * 100).toFixed(1);
                })()}</span></p>
                <button onclick="window.showDetailedStations('${province.name}')" style="
                  margin-top: 14px;
                  width: 100%;
                  background: linear-gradient(135deg, #FF8C00, #FF6B00);
                  color: white;
                  border: none;
                  padding: 12px;
                  border-radius: 8px;
                  font-weight: 800;
                  cursor: pointer;
                  font-size: 13px;
                ">
                  🔍 Detaylı İstasyonları Göster
                </button>
              </div>
            </div>
          `, { maxWidth: 300, className: 'custom-leaflet-popup' });

        marker.on('click', () => {
          onSelect(province.name);
          if (openPopupRef.current && openPopupRef.current !== marker) {
            openPopupRef.current.closePopup();
          }
          openPopupRef.current = marker;
          map.panTo([province.coordinates.lat, province.coordinates.lng]);
        });

        if (isSelected) {
          marker.openPopup();
          openPopupRef.current = marker;
          map.panTo([province.coordinates.lat, province.coordinates.lng]);
        }

        newMarkers.push(marker);
      });
    }

    markersRef.current = newMarkers;
    circlesRef.current = newCircles;
  }, [selected, onSelect, showDetailedStations]);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-[9999] bg-[#0b0f1a] m-0 p-0' : 'relative w-full h-full rounded-2xl border border-slate-800 shadow-2xl'} overflow-hidden`}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', margin: 0, padding: 0 }} />
      
      {/* Fullscreen Toggle Button */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-6 left-6 bg-[#0b0f1a]/95 backdrop-blur-md border border-slate-700 text-white p-3 rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-2xl z-[1000]"
        title={isFullscreen ? "Normal Görünüm" : "Tam Ekran"}
      >
        {isFullscreen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>
      
      {/* Back Button - Detaylı görünümdeyken göster */}
      {showDetailedStations && (
        <button
          onClick={() => {
            setShowDetailedStations(false);
            if (leafletMapRef.current) {
              leafletMapRef.current.setView([39.0, 35.0], 6);
            }
          }}
          className="absolute top-20 left-6 bg-[#FF8C00] hover:bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold shadow-2xl transition-all duration-300 flex items-center gap-2 z-[1000]"
        >
          ← Genel Haritaya Dön
        </button>
      )}

      {/* Station List - Detaylı görünümde göster */}
      {showDetailedStations && detailedStations.length > 0 && (
        <div className="absolute top-6 right-6 bg-[#0b0f1a]/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl w-96 max-h-[90vh] overflow-y-auto custom-scrollbar z-[1000]">
          <h4 className="text-sm font-black text-[#FF8C00] uppercase tracking-wider mb-3 sticky top-0 bg-[#0b0f1a] pb-2">
            {selected} - Tüm İstasyonlar ({detailedStations.length})
          </h4>
          <div className="space-y-2">
            {detailedStations.map((station) => (
              <div 
                key={station.id} 
                className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-[#FF8C00] transition-all duration-200 cursor-pointer"
                onClick={() => {
                  if (leafletMapRef.current) {
                    leafletMapRef.current.setView([station.coordinates.lat, station.coordinates.lng], 15);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-xs font-bold text-white">{station.name}</h5>
                  <span className={`text-[10px] px-2 py-1 rounded ${station.status === 'active' ? 'bg-slate-700 text-slate-300' : 'bg-orange-500/20 text-orange-400'}`}>
                    {station.status === 'active' ? '✅ Aktif' : '🔧 Bakım'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{station.address}</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-slate-700 px-2 py-1 rounded">
                    <span className="text-slate-300 font-bold">⚡ DC:</span> {station.dcSockets}
                  </div>
                  <div className="bg-blue-500/10 px-2 py-1 rounded">
                    <span className="text-blue-400 font-bold">🔌 AC:</span> {station.acSockets}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400">
                  <span className="text-[#FF8C00] font-bold">{station.power}</span> • {station.type === 'highway' ? '🛣️ Otoyol' : station.type === 'mall' ? '🏬 AVM' : station.type === 'parking' ? '🅿️ Otopark' : '🏙️ Şehir'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Legend - Normal görünümde göster */}
      {!showDetailedStations && (
        <div className="absolute bottom-6 left-6 bg-[#0b0f1a]/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl z-[1000]">
          <h4 className="text-xs font-black text-[#FF8C00] uppercase tracking-wider mb-3">Harita Açıklaması</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#FF8C00] border-2 border-white"></div>
              <span className="text-xs text-white font-medium">ZES Şarj İstasyonu</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-[#FF8C00] opacity-30 rounded"></div>
              <span className="text-xs text-slate-400 font-medium">Kapsama Alanı</span>
            </div>
            <div className="h-px bg-slate-700 my-2"></div>
            <p className="text-[10px] text-slate-500 font-medium italic">
              📍 Marker boyutu = İstasyon sayısı
            </p>
            <p className="text-[10px] text-[#FF8C00] font-bold mt-2">
              💡 İl'e tıkla → "Detaylı İstasyonları Göster"
            </p>
          </div>
        </div>
      )}

      {/* Total Count - Normal görünümde göster */}
      {!showDetailedStations && (
        <div className="absolute top-6 right-6 bg-[#0b0f1a]/95 backdrop-blur-md border border-slate-700 rounded-xl px-5 py-3 shadow-2xl z-[1000]">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-[#FF8C00]" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Toplam ZES</p>
              <p className="text-2xl font-black text-white">{getTotalZESStations().toLocaleString()}</p>
              <p className="text-[10px] text-[#FF8C00] font-bold">İstasyon (%35 Pazar Payı)</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/50">
            <p className="text-[9px] text-slate-500">Türkiye Geneli: {(() => {
              const total = Object.values(REAL_EV_DATA).reduce((sum, d) => sum + (typeof d === 'object' && 'totalStations' in d ? (d as any).totalStations : 0), 0);
              return total.toLocaleString();
            })()} İstasyon</p>
            <p className="text-[9px] text-slate-600">Ortalama Pazar Payı: %35.0</p>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>("İstanbul");
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'table' | 'comparison' | 'opportunities' | 'decisions'>('map');
  const [sortBy, setSortBy] = useState<'score' | 'growth' | 'gap'>('score');
  const [compareCity, setCompareCity] = useState<string>("Ankara");
  const [activeDecision, setActiveDecision] = useState<1 | 2 | 3 | 4 | 5>(1);
  
  // Debug viewMode changes
  useEffect(() => {
    console.log('viewMode changed to:', viewMode);
  }, [viewMode]);

  const selectedProvince = useMemo(() => 
    MOCK_DATA.find(p => p.name === selectedProvinceName) || MOCK_DATA[0]
  , [selectedProvinceName]);

  const allMetrics = useMemo(() => {
    return MOCK_DATA.map(province => {
      const latest = province.history[province.history.length - 1];
      const prev = province.history[province.history.length - 2];
      
      // Gerçek EV verilerini kullan
      const evData = REAL_EV_DATA[province.name];
      const realEVCount = evData ? evData.evCount : latest.evCount;
      const realTotalStations = evData ? evData.totalStations : (latest.acSockets + latest.dcSockets);
      
      const totalMarketSockets = realTotalStations;
      const zesMarketShare = getZESMarketShare(province.name, latest.zesSockets);
      const marketGap = getMarketGap(province.name, latest.zesSockets);
      
      // Gerçek verilerle yatırım skoru hesapla
      const investmentScore = calculateInvestmentPriority(province.name, latest.zesSockets);
      
      // ROI Tahmini: ZES pazar payı * EV yoğunluğu
      const evPer100k = (realEVCount / province.population) * 100000;
      const roi = (zesMarketShare / 10) * (evPer100k / 10);
      
      // Büyüme oranları
      const evGrowth = evData ? evData.stationChangePercent : 
                       ((latest.evCount - prev.evCount) / prev.evCount) * 100;
      const zesGrowth = ((latest.zesSockets - prev.zesSockets) / prev.zesSockets) * 100;

      return {
        province: province.name,
        region: province.region,
        population: province.population,
        zesSockets: latest.zesSockets,
        totalMarket: totalMarketSockets,
        marketShare: zesMarketShare,
        marketGap: marketGap,
        evCount: realEVCount,
        evGrowth: evGrowth,
        zesGrowth: zesGrowth,
        investmentScore: Math.min(100, investmentScore),
        roi: roi,
        isSeasonalRisk: province.seasonalityFactor > 2.5,
        isWorstCity: WORST_CITIES_FOR_EV.includes(province.name),
        coordinates: province.coordinates
      };
    });
  }, []);

  const topInvestmentTargets = useMemo(() => {
    return [...allMetrics]
      .sort((a, b) => {
        if (sortBy === 'score') return b.investmentScore - a.investmentScore;
        if (sortBy === 'growth') return b.evGrowth - a.evGrowth;
        return b.marketGap - a.marketGap;
      })
      .slice(0, 10);
  }, [allMetrics, sortBy]);

  const selectedMetrics = useMemo(() => {
    return allMetrics.find(m => m.province === selectedProvinceName)!;
  }, [allMetrics, selectedProvinceName]);

  // Comparison data for comparison view
  const comparisonData = useMemo(() => {
    const city1Data = calculateMarketOpportunity(selectedProvinceName);
    const city2Data = calculateMarketOpportunity(compareCity);
    
    if (!city1Data || !city2Data) {
      return null;
    }
    
    return {
      city1Data,
      city2Data,
      radarData: [
        {
          metric: 'Kapsama',
          [selectedProvinceName]: city1Data.coverageAdequacy || 0,
          [compareCity]: city2Data.coverageAdequacy || 0,
        },
        {
          metric: 'ZES Payı',
          [selectedProvinceName]: city1Data.zesMarketShare || 0,
          [compareCity]: city2Data.zesMarketShare || 0,
        },
        {
          metric: 'Büyüme',
          [selectedProvinceName]: city1Data.growthPotential || 0,
          [compareCity]: city2Data.growthPotential || 0,
        },
        {
          metric: 'Öncelik',
          [selectedProvinceName]: city1Data.investmentPriority || 0,
          [compareCity]: city2Data.investmentPriority || 0,
        },
      ]
    };
  }, [selectedProvinceName, compareCity]);

  const totalStats = useMemo(() => {
    // Tüm illerdeki ZES istasyon sayılarını topla
    const totalZESStations = getTotalZESStations();
    
    // Türkiye geneli toplam istasyon sayısı (gerçek veri)
    const turkeyTotalStations = Object.values(REAL_EV_DATA).reduce((sum, data) => sum + (typeof data === 'object' && 'totalStations' in data ? (data as any).totalStations : 0), 0);
    
    // ZES pazar payını hesapla
    const zesMarketShare = turkeyTotalStations ? (totalZESStations / turkeyTotalStations) * 100 : 0;
    
    // Toplam soket sayısını ZES istasyon sayısına göre tahmin et (ortalama istasyon başına ~10 soket)
    const totalSockets = Math.round(totalZESStations * 10.3);
    const totalDC = Math.round(totalSockets * 0.4);
    const totalAC = Math.round(totalSockets * 0.6);
    
    return {
      totalStations: totalZESStations,
      totalSockets: totalSockets,
      totalDC: totalDC,
      totalAC: totalAC,
      totalEVs: allMetrics.reduce((sum, m) => sum + m.evCount, 0),
      avgMarketShare: allMetrics.reduce((sum, m) => sum + m.marketShare, 0) / allMetrics.length,
      totalMarketGap: allMetrics.reduce((sum, m) => sum + m.marketGap, 0),
      turkeyTotalStations: turkeyTotalStations,
      zesMarketShare: zesMarketShare
    };
  }, [allMetrics]);

  const downloadReport = () => {
    const reportContent = `
ZES KARAR DESTEK SİSTEMİ - YATIRIM RAPORU
Oluşturulma Tarihi: ${new Date().toLocaleDateString('tr-TR')}
Rapor No: ZES-${new Date().getTime()}

===========================================
GENEL DURUM
===========================================
Toplam ZES İstasyonu: ${totalStats.totalStations.toLocaleString()} adet
Toplam Şarj Soketi: ${totalStats.totalSockets.toLocaleString()} soket
  ├─ DC Soket: ${totalStats.totalDC.toLocaleString()}
  └─ AC Soket: ${totalStats.totalAC.toLocaleString()}

TÜRKİYE PAZARI:
  ├─ Türkiye Geneli Toplam İstasyon: ${totalStats.turkeyTotalStations.toLocaleString()}
  ├─ ZES Pazar Payı: %${totalStats.zesMarketShare.toFixed(1)}
  └─ Hedef Pazar Payı: %35.0

Toplam EV Sayısı: ${totalStats.totalEVs.toLocaleString()} araç
Ortalama ZES Pazar Payı: %${totalStats.avgMarketShare.toFixed(1)}
Toplam Pazar Fırsatı: ${totalStats.totalMarketGap.toLocaleString()} soket

Kapsam: ${allMetrics.length} il (Türkiye geneli)

===========================================
ÖNCELİKLİ YATIRIM HEDEFLERİ (İlk 10)
===========================================
${topInvestmentTargets.map((t, i) => {
  const evData = REAL_EV_DATA[t.province];
  return `
${i + 1}. ${t.province} ${i === 0 ? '🏆 #1' : i === 1 ? '🥈 #2' : i === 2 ? '🥉 #3' : ''}
   ├─ Yatırım Skoru: ${t.investmentScore.toFixed(1)}/100 ${t.investmentScore > 70 ? '⭐⭐⭐' : t.investmentScore > 50 ? '⭐⭐' : '⭐'}
   ├─ Mevcut ZES: ${t.zesSockets} istasyon
   ├─ Toplam Pazar: ${t.totalMarket.toLocaleString()} istasyon (tüm markalar)
   ├─ ZES Pazar Payı: %${t.marketShare.toFixed(1)} ${t.marketShare < 10 ? '📉 DÜŞÜK' : t.marketShare < 20 ? '➡️ ORTA' : '📈 YÜKSEK'}
   ├─ ZES Fırsat Açığı: ${t.marketGap.toLocaleString()} istasyon
   ├─ Gerçek EV Sayısı: ${evData ? evData.evCount.toLocaleString() : t.evCount.toLocaleString()} araç
   ├─ Pazar Büyüme: %${t.evGrowth.toFixed(1)} yıllık
   ├─ Nüfus: ${t.population.toLocaleString()}
   ${t.isWorstCity ? '├─ 🔴 KRİTİK ÖNCELİK: En az istasyona sahip 10 il arasında!\n' : ''}${t.isSeasonalRisk ? '└─ ⚠️ Mevsimsel Risk: Yüksek (yaz ayları %200+ talep artışı)\n' : '└─ ✓ Mevsimsel Risk: Düşük\n'}`;
}).join('\n')}

===========================================
DETAYLI ANALİZ: ${selectedProvinceName}
===========================================
${(() => {
  const evData = REAL_EV_DATA[selectedProvinceName];
  return evData ? `
📊 GERÇEK PAZAR VERİLERİ (Aralık 2025):
   Toplam İstasyon (Tüm Markalar): ${evData.totalStations.toLocaleString()}
   Gerçek EV Sayısı: ${evData.evCount.toLocaleString()} araç
   100 EV Başına İstasyon: ${evData.stationPer100EV.toFixed(2)}
   Pazar Büyüme Hızı: %${evData.stationChangePercent.toFixed(2)} (son yıl)
   Toplam Araç Sayısı: ${evData.carCount.toLocaleString()}
` : '';
})()}
📍 Genel Bilgiler:
   Nüfus: ${selectedMetrics.population.toLocaleString()}
   Bölge: ${selectedMetrics.region}

🔌 ZES DURUM:
   Mevcut ZES İstasyonu: ${selectedMetrics.zesSockets} adet
   ZES Pazar Payı: %${selectedMetrics.marketShare.toFixed(1)}
   Toplam Pazar Büyüklüğü: ${selectedMetrics.totalMarket.toLocaleString()} istasyon

🎯 FIRSAT ANALİZİ:
   ZES Fırsat Açığı: ${selectedMetrics.marketGap.toLocaleString()} istasyon
   Potansiyel Büyüme: %${((selectedMetrics.marketGap / selectedMetrics.totalMarket) * 100).toFixed(1)}
   ${selectedMetrics.marketShare < 10 ? '   ⚠️ Pazar payı çok düşük - Agresif büyüme fırsatı!' : ''}

📈 BÜYÜME METRİKLERİ:
   Yıllık Pazar Büyümesi: %${selectedMetrics.evGrowth.toFixed(1)}
   Yıllık ZES Büyümesi: %${selectedMetrics.zesGrowth.toFixed(1)}

⭐ YATIRIM DEĞERLENDİRMESİ:
   Yatırım Skoru: ${selectedMetrics.investmentScore.toFixed(1)}/100
   ROI Göstergesi: ${selectedMetrics.roi.toFixed(2)}
   ${selectedMetrics.isWorstCity ? '\n   🔴 KRİTİK: EV yoğunluğuna göre en az istasyona sahip 10 il arasında!\n' : ''}${selectedMetrics.isSeasonalRisk ? '   ⚠️ MEVSİMSEL RİSK: Yaz aylarında talep %200+ artış gösterir\n' : ''}

===========================================
STRATEJİK ÖNERİ: ${selectedProvinceName}
===========================================
${selectedMetrics.investmentScore > 70 ? 
  `🔴 YÜKSEK ÖNCELİK - ACİL YATIRIM GEREKLİ
   
DURUM: Bu lokasyon acil yatırım gerektirir
   • Yatırım Skoru: ${selectedMetrics.investmentScore.toFixed(1)}/100 (Mükemmel)
   • Mevcut ZES: ${selectedMetrics.zesSockets} istasyon (Yetersiz)
   • Pazar Payı: %${selectedMetrics.marketShare.toFixed(1)} (Büyüme fırsatı)
   • Fırsat: ${selectedMetrics.marketGap.toLocaleString()} istasyon açığı

AKSİYON PLANI:
✅ İlk 3 Ay: 
   - Stratejik lokasyon analizi (AVM, otoyol, havalimanı)
   - Arazi/kira görüşmeleri başlat
   - 5-7 lokasyon için ön izin süreçleri

✅ 3-6 Ay:
   - En az 5-10 yeni istasyon kuruluşu
   - Hızlı kurulum ekipleri devreye al
   - Yerel pazarlama kampanyası başlat

✅ 6-12 Ay:
   - Pazar payını %${Math.min(selectedMetrics.marketShare + 5, 25).toFixed(1)}'e çıkar
   - Müşteri memnuniyet analizi
   - Ek lokasyonlar için planlama

BÜTÇE: Yüksek öncelik - Hızlı bütçe onayı önerilir
ROI SÜRESİ: 18-24 ay (tahmini)
` : 
  selectedMetrics.investmentScore > 40 ?
  `🟡 ORTA ÖNCELİK - SEÇİCİ YATIRIM
   
DURUM: Stratejik lokasyonlarda yatırım yapılabilir
   • Yatırım Skoru: ${selectedMetrics.investmentScore.toFixed(1)}/100 (İyi)
   • Mevcut ZES: ${selectedMetrics.zesSockets} istasyon
   • Pazar Payı: %${selectedMetrics.marketShare.toFixed(1)}
   • Fırsat: ${selectedMetrics.marketGap.toLocaleString()} istasyon açığı

AKSİYON PLANI:
✅ 6-12 Ay:
   - Yoğun trafik noktalarını analiz et
   - AVM ve otoparklara öncelik ver
   - 2-5 yeni istasyon değerlendir
• Bütçe önceliği: ORTA
` :
  `⏸️ DÜŞÜK ÖNCELİK
   
Bu lokasyonda mevcut operasyona odaklanın:
• Yeni yatırım yerine mevcut istasyonları optimize edin
• Kullanım oranlarını artırın
• Pazarlama ve farkındalık çalışmaları yapın
• Bütçe önceliği: DÜŞÜK
`}
  '⏸️  DÜŞÜK ÖNCELİK - Mevcut istasyonların optimizasyonuna odaklanın'
}

===========================================
© Zorlu Energy Solutions 2025
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ZES_Yatirim_Raporu_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Giriş kontrolü - eğer giriş yapılmamışsa Login ekranını göster
  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="h-screen bg-[#0b0f1a] flex flex-col text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-[#161b2a] border-b border-slate-800 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF8C00] to-[#FF6B00] rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg">Z</div>
              <div>
                <h1 className="text-2xl font-black text-white">Yatırım KDS</h1>
                <p className="text-xs text-slate-500 font-bold">Karar Destek Sistemi v3.0</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="İl ara..." 
                className="bg-[#0b0f1a] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#FF8C00] outline-none w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={downloadReport}
              className="bg-[#FF8C00] hover:bg-[#FF6B00] px-6 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              Rapor İndir
            </button>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-6 py-2 rounded-lg text-sm font-bold text-red-500 flex items-center gap-2 transition-all"
              title="Çıkış Yap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Çıkış
            </button>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-[#0b0f1a] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold uppercase">ZES İstasyonu</span>
              <Zap className="w-5 h-5 text-[#FF8C00]" />
            </div>
            <p className="text-3xl font-black text-white">{totalStats.totalStations.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-bold mt-1">{totalStats.totalSockets.toLocaleString()} Soket</p>
            <div className="mt-2 pt-2 border-t border-slate-800/50">
              <p className="text-[10px] text-slate-600">DC: {totalStats.totalDC.toLocaleString()} | AC: {totalStats.totalAC.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[#0b0f1a] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold uppercase">Toplam EV</span>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-black text-white">{totalStats.totalEVs.toLocaleString()}</p>
            <p className="text-xs text-blue-400 font-bold mt-1">Pazar Büyüklüğü</p>
          </div>

          <div className="bg-[#0b0f1a] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold uppercase">Ort. Pazar Payı</span>
              <Percent className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-white">%{totalStats.avgMarketShare.toFixed(1)}</p>
            <p className="text-xs text-slate-400 font-bold mt-1">ZES Penetrasyonu</p>
          </div>

          <div className="bg-[#0b0f1a] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-bold uppercase">Pazar Fırsatı</span>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-3xl font-black text-white">{(totalStats.totalMarketGap / 1000).toFixed(1)}K</p>
            <p className="text-xs text-orange-400 font-bold mt-1">Soket Açığı</p>
            <div className="mt-2 pt-2 border-t border-slate-800/50">
              <p className="text-[10px] text-slate-600">Genişleme Potansiyeli</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* View Tabs */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setViewMode('map')}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                viewMode === 'map' 
                ? 'bg-[#FF8C00] text-white shadow-lg' 
                : 'bg-[#161b2a] text-slate-400 hover:text-white'
              }`}
            >
              Harita Görünümü
            </button>
            <button 
              onClick={() => setViewMode('opportunities')}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                viewMode === 'opportunities' 
                ? 'bg-[#FF8C00] text-white shadow-lg' 
                : 'bg-[#161b2a] text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Pazar Fırsatları
              </div>
            </button>
            <button 
              onClick={() => {
                console.log('Comparison clicked, setting viewMode to comparison');
                setViewMode('comparison');
              }}
              className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                viewMode === 'comparison' 
                ? 'bg-[#FF8C00] text-white shadow-lg' 
                : 'bg-[#161b2a] text-slate-400 hover:text-white'
              }`}
            >
              Karşılaştırmalı Analiz
            </button>
            <button
              onClick={() => {
                console.log('Decisions clicked, setting viewMode to decisions');
                setViewMode('decisions');
              }}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                viewMode === 'decisions'
                ? 'bg-[#FF8C00] text-white shadow-lg' 
                : 'bg-[#161b2a] text-slate-400 hover:text-white'
              }`}
            >
              🎯 5 Karar Paneli
            </button>
          </div>

          {/* Map View */}
          {viewMode === 'map' && (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 h-[600px]">
                <TurkeyMap selected={selectedProvinceName} onSelect={setSelectedProvinceName} />
              </div>

              <div className="col-span-4 space-y-4">
                <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-6">
                  <h3 className="text-xl font-black text-white mb-4">{selectedProvinceName}</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Yatırım Skoru</span>
                        <span className="text-2xl font-black text-[#FF8C00]">{selectedMetrics.investmentScore.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#FF8C00] to-[#FF6B00] h-2 rounded-full transition-all"
                          style={{ width: `${selectedMetrics.investmentScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          ZES İstasyonu
                        </p>
                        <p className="text-xl font-black text-white">{selectedMetrics.zesSockets}</p>
                        <p className="text-[10px] text-slate-600">Aktif</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Pazar Payı
                        </p>
                        <p className="text-xl font-black text-white">%{selectedMetrics.marketShare.toFixed(1)}</p>
                        <p className="text-[10px] text-slate-600">ZES Pazar Payı</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Toplam Pazar
                        </p>
                        <p className="text-xl font-black text-white">{selectedMetrics.totalMarket.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-600">Tüm İstasyonlar</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Pazar Büyüme
                        </p>
                        <p className="text-xl font-black text-slate-300 flex items-center gap-1">
                          %{selectedMetrics.evGrowth.toFixed(1)}
                        </p>
                        <p className="text-[10px] text-slate-400">Yıllık</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          ZES Fırsatı
                        </p>
                        <p className="text-xl font-black text-orange-400">{selectedMetrics.marketGap.toLocaleString()}</p>
                        <p className="text-[10px] text-orange-600">İstasyon Açığı</p>
                      </div>
                    </div>

                    {/* Yatırım Önerisi Kartı */}
                    <div className={`border rounded-lg p-3 flex items-start gap-3 ${
                      selectedMetrics.investmentScore > 70 ? 'bg-slate-700 border-slate-700' :
                      selectedMetrics.investmentScore > 40 ? 'bg-orange-500/10 border-orange-500/20' :
                      'bg-slate-500/10 border-slate-500/20'
                    }`}>
                      <Award className={`w-5 h-5 shrink-0 mt-0.5 ${
                        selectedMetrics.investmentScore > 70 ? 'text-slate-300' :
                        selectedMetrics.investmentScore > 40 ? 'text-orange-400' :
                        'text-slate-400'
                      }`} />
                      <div>
                        <p className={`text-xs font-bold mb-1 ${
                          selectedMetrics.investmentScore > 70 ? 'text-slate-300' :
                          selectedMetrics.investmentScore > 40 ? 'text-orange-400' :
                          'text-slate-400'
                        }`}>
                          {selectedMetrics.investmentScore > 70 ? 'YÜKSEK ÖNCELİK' :
                           selectedMetrics.investmentScore > 40 ? 'ORTA ÖNCELİK' :
                           'DÜŞÜK ÖNCELİK'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {selectedMetrics.investmentScore > 70 ? 'Agresif genişleme önerilir. İlk 6 ay içinde 5-10 yeni istasyon hedeflenebilir.' :
                           selectedMetrics.investmentScore > 40 ? 'Seçici yatırım yapılabilir. AVM ve otoyol lokasyonlarına öncelik verin.' :
                           'Mevcut istasyonları optimize edin. Yeni yatırım yerine kullanım oranını artırın.'}
                        </p>
                      </div>
                    </div>

                    {selectedMetrics.isWorstCity && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-red-400 mb-1">KRİTİK ÖNCELİK</p>
                          <p className="text-xs text-slate-400">EV yoğunluğuna göre en az istasyona sahip 10 il arasında. Acil yatırım gerekli!</p>
                        </div>
                      </div>
                    )}

                    {selectedMetrics.isSeasonalRisk && (
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-start gap-3">
                        <Sun className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-orange-400 mb-1">Mevsimsel Risk</p>
                          <p className="text-xs text-slate-400">Yaz aylarında talep %200+ artar. Kapasite planlaması kritik.</p>
                        </div>
                      </div>
                    )}

                    {/* Hızlı İstatistikler */}
                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-3">Pazar Analizi</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Nüfus</span>
                          <span className="text-sm font-bold text-white">{selectedMetrics.population.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Bölge</span>
                          <span className="text-sm font-bold text-white">{selectedMetrics.region}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Gerçek EV Sayısı</span>
                          <span className="text-sm font-bold text-white">{selectedMetrics.evCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Toplam Pazar</span>
                          <span className="text-sm font-bold text-slate-400">{selectedMetrics.totalMarket.toLocaleString()} istasyon</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">ZES Pazar Payı</span>
                          <span className="text-sm font-bold text-[#FF8C00]">%{selectedMetrics.marketShare.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">ROI Göstergesi</span>
                          <span className="text-sm font-bold text-slate-300">{selectedMetrics.roi.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}


          {/* Opportunities View - 8 KPI Dashboard */}
          {viewMode === 'opportunities' && (() => {
            const allOpps = getAllOpportunities();
            const selectedOpp = calculateMarketOpportunity(selectedProvinceName);
            if (!selectedOpp) return null;
            
            const insights = getOpportunityInsights(selectedOpp);
            
            // 8 KPI Data
            const kpiData = [
              { name: '100EV/İst', value: selectedOpp.stationsPer100EV, ideal: 5, max: 10 },
              { name: 'ZES Pay%', value: selectedOpp.zesMarketShare, ideal: 35, max: 50 },
              { name: 'Kapsama', value: selectedOpp.coverageAdequacy, ideal: 100, max: 100 },
              { name: 'Rekabet', value: selectedOpp.competitorStations / 10, ideal: 5, max: 20 },
              { name: 'Büyüme', value: selectedOpp.growthPotential, ideal: 70, max: 100 },
              { name: 'Öncelik', value: selectedOpp.investmentPriority, ideal: 70, max: 100 },
            ];
            
            return (
              <div className="space-y-6">
                {/* Insights */}
                {insights.length > 0 && (
                  <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-black text-white mb-4">🎯 Stratejik Öngörüler - {selectedProvinceName}</h3>
                    <div className="space-y-2">
                      {insights.map((insight, i) => (
                        <div key={i} className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 text-sm text-slate-300">
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Opportunities Table */}
                <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-black text-white mb-6">🔥 En Yüksek Fırsat Alanları (Top 10)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#0b0f1a]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase">Şehir</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase">Öncelik</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase">100EV/İst</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase">ZES Pay%</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase">ZES Açık</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase">Büyüme</th>
                          <th className="px-4 py-3 text-center text-xs font-black text-slate-400 uppercase">Durum</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {allOpps.slice(0, 10).map((opp, idx) => (
                          <tr 
                            key={opp.city}
                            onClick={() => setSelectedProvinceName(opp.city)}
                            className={`hover:bg-slate-800/30 cursor-pointer transition-colors ${opp.city === selectedProvinceName ? 'bg-slate-800/50' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 text-xs font-black text-white">
                                {idx + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-white">{opp.city}</td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-black text-[#FF8C00]">{opp.investmentPriority.toFixed(0)}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-bold ${opp.stationsPer100EV < 3 ? 'text-red-400' : 'text-slate-300'}`}>
                                {opp.stationsPer100EV.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-bold text-slate-300">%{opp.zesMarketShare.toFixed(1)}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-bold ${opp.zesGap > 0 ? 'text-orange-400' : 'text-slate-300'}`}>
                                {opp.zesGap > 0 ? `+${opp.zesGap}` : '✓'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-bold text-slate-300">{opp.growthPotential.toFixed(0)}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                opp.priorityLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                                opp.priorityLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                opp.priorityLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-slate-700 text-slate-300'
                              }`}>
                                {opp.priorityLevel === 'critical' ? 'KRİTİK' :
                                 opp.priorityLevel === 'high' ? 'YÜKSEK' :
                                 opp.priorityLevel === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Comparison View */}
          {viewMode === 'comparison' && (
            <>
              {!comparisonData ? (
                <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
                  <h3 className="text-xl font-bold text-red-400 mb-2">Veri Yüklenemedi</h3>
                  <p className="text-slate-400">Seçili şehirler için veri bulunamadı.</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {selectedProvinceName} | {compareCity}
                  </p>
                </div>
              ) : (
                <>
                  {(() => {
                    // Destructure for easier access
                    const { city1Data, city2Data, radarData: comparisonRadarData } = comparisonData;
                    
                    return (
                      <div className="space-y-6">
                  
                  {/* City Selector */}
                  <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-black text-white mb-4">Şehir Karşılaştırması</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-2">Şehir 1</label>
                      <select
                        value={selectedProvinceName}
                        onChange={(e) => setSelectedProvinceName(e.target.value)}
                        className="w-full bg-[#0b0f1a] border border-slate-700 rounded-lg px-4 py-2 text-white font-bold"
                      >
                        {MOCK_DATA.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-2">Şehir 2</label>
                      <select
                        value={compareCity}
                        onChange={(e) => setCompareCity(e.target.value)}
                        className="w-full bg-[#0b0f1a] border border-slate-700 rounded-lg px-4 py-2 text-white font-bold"
                      >
                        {MOCK_DATA.map(p => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Head to Head Comparison Cards */}
                {comparisonData.city1Data && comparisonData.city2Data && (
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-4">
                      <div className="text-xs text-slate-500 font-bold mb-3">100 EV / İstasyon</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{selectedProvinceName}</span>
                          <span className={`text-lg font-black ${comparisonData.city1Data.stationsPer100EV < comparisonData.city2Data.stationsPer100EV ? 'text-red-400' : 'text-slate-300'}`}> 
                            {comparisonData.city1Data.stationsPer100EV.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{compareCity}</span>
                          <span className={`text-lg font-black ${comparisonData.city2Data.stationsPer100EV < comparisonData.city1Data.stationsPer100EV ? 'text-red-400' : 'text-slate-300'}`}> 
                            {comparisonData.city2Data.stationsPer100EV.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-center text-slate-600">
                        {comparisonData.city1Data.stationsPer100EV > comparisonData.city2Data.stationsPer100EV ? '🏆 ' + selectedProvinceName : '🏆 ' + compareCity}
                      </div>
                    </div>

                    <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-4">
                      <div className="text-xs text-slate-500 font-bold mb-3">ZES Pazar Payı</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{selectedProvinceName}</span>
                          <span className={`text-lg font-black ${comparisonData.city1Data.zesMarketShare > comparisonData.city2Data.zesMarketShare ? 'text-slate-300' : 'text-red-400'}`}> 
                            %{comparisonData.city1Data.zesMarketShare.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{compareCity}</span>
                          <span className={`text-lg font-black ${comparisonData.city2Data.zesMarketShare > comparisonData.city1Data.zesMarketShare ? 'text-slate-300' : 'text-red-400'}`}> 
                            %{comparisonData.city2Data.zesMarketShare.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-center text-slate-600">
                        {comparisonData.city1Data.zesMarketShare > comparisonData.city2Data.zesMarketShare ? '🏆 ' + selectedProvinceName : '🏆 ' + compareCity}
                      </div>
                    </div>

                    <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-4">
                      <div className="text-xs text-slate-500 font-bold mb-3">Büyüme Potansiyeli</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{selectedProvinceName}</span>
                          <span className={`text-lg font-black ${comparisonData.city1Data.growthPotential > comparisonData.city2Data.growthPotential ? 'text-slate-300' : 'text-yellow-400'}`}> 
                            {comparisonData.city1Data.growthPotential.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{compareCity}</span>
                          <span className={`text-lg font-black ${comparisonData.city2Data.growthPotential > comparisonData.city1Data.growthPotential ? 'text-slate-300' : 'text-yellow-400'}`}> 
                            {comparisonData.city2Data.growthPotential.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-center text-slate-600">
                        {comparisonData.city1Data.growthPotential > comparisonData.city2Data.growthPotential ? '🏆 ' + selectedProvinceName : '🏆 ' + compareCity}
                      </div>
                    </div>

                    <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-4">
                      <div className="text-xs text-slate-500 font-bold mb-3">Yatırım Önceliği</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{selectedProvinceName}</span>
                          <span className={`text-lg font-black ${comparisonData.city1Data.investmentPriority > comparisonData.city2Data.investmentPriority ? 'text-orange-400' : 'text-slate-500'}`}>
                            {comparisonData.city1Data.investmentPriority.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{compareCity}</span>
                          <span className={`text-lg font-black ${comparisonData.city2Data.investmentPriority > comparisonData.city1Data.investmentPriority ? 'text-orange-400' : 'text-slate-500'}`}>
                            {comparisonData.city2Data.investmentPriority.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-center text-slate-600">
                        {comparisonData.city1Data.investmentPriority > comparisonData.city2Data.investmentPriority ? '🔥 ' + selectedProvinceName : '🔥 ' + compareCity}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  {/* Radar Chart Comparison */}
                  <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-black text-white mb-6">Çok Boyutlu Karşılaştırma</h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={comparisonData.radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Radar 
                            name={selectedProvinceName} 
                            dataKey={selectedProvinceName} 
                            stroke="#FF8C00" 
                            fill="#FF8C00" 
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Radar 
                            name={compareCity} 
                            dataKey={compareCity} 
                            stroke="#22c55e" 
                            fill="#22c55e" 
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Market Size Comparison */}
                  <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-black text-white mb-6">Pazar Büyüklüğü & Rekabet</h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { 
                            name: selectedProvinceName, 
                            'Toplam EV': comparisonData.city1Data?.totalEVs || 0,
                            'ZES': (comparisonData.city1Data?.totalEVs || 0) * (comparisonData.city1Data?.zesMarketShare || 0) / 100,
                            'Rakipler': comparisonData.city1Data?.competitorStations || 0
                          },
                          { 
                            name: compareCity, 
                            'Toplam EV': comparisonData.city2Data?.totalEVs || 0,
                            'ZES': (comparisonData.city2Data?.totalEVs || 0) * (comparisonData.city2Data?.zesMarketShare || 0) / 100,
                            'Rakipler': comparisonData.city2Data?.competitorStations || 0
                          }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}}
                          />
                          <Bar dataKey="Toplam EV" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="Rakipler" fill="#ef4444" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div>
                </div>

                {/* Yeni Karşılaştırmalı Bar Chart */}
                <div className="grid grid-cols-2 gap-6 mt-6">
                  {/* Yatırım Skoru Bar Chart */}
                  <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-black text-white mb-6">Yatırım Skoru Karşılaştırması</h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: selectedProvinceName, score: comparisonData.city1Data?.investmentPriority || 0 },
                          { name: compareCity, score: comparisonData.city2Data?.investmentPriority || 0 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                          <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}} />
                          <Bar dataKey="score" fill="#FF8C00" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ZES Pazar Payı Bar Chart */}
                  <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-black text-white mb-6">ZES Pazar Payı Karşılaştırması</h3>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: selectedProvinceName, share: comparisonData.city1Data?.zesMarketShare || 0 },
                          { name: compareCity, share: comparisonData.city2Data?.zesMarketShare || 0 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                          <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}} />
                          <Bar dataKey="share" fill="#22c55e" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Yeni Radar Chart: Temel Metrikler */}
                <div className="bg-[#161b2a] border border-slate-800 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-black text-white mb-6">Radar Karşılaştırma (Temel Metrikler)</h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { metric: 'Yatırım Skoru', [selectedProvinceName]: comparisonData.city1Data?.investmentPriority || 0, [compareCity]: comparisonData.city2Data?.investmentPriority || 0 },
                        { metric: 'ZES Pazar Payı', [selectedProvinceName]: comparisonData.city1Data?.zesMarketShare || 0, [compareCity]: comparisonData.city2Data?.zesMarketShare || 0 },
                        { metric: 'Toplam EV', [selectedProvinceName]: comparisonData.city1Data?.totalEVs || 0, [compareCity]: comparisonData.city2Data?.totalEVs || 0 },
                        { metric: 'Büyüme Potansiyeli', [selectedProvinceName]: comparisonData.city1Data?.growthPotential || 0, [compareCity]: comparisonData.city2Data?.growthPotential || 0 }
                      ]}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                        <Radar name={selectedProvinceName} dataKey={selectedProvinceName} stroke="#FF8C00" fill="#FF8C00" fillOpacity={0.3} strokeWidth={2} />
                        <Radar name={compareCity} dataKey={compareCity} stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} />
                        <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
                    );
                  })()}
                </>
              )}
            </>
          )}

          {/* 5 Decisions Panel */}
          {viewMode === 'decisions' && (
            <div className="space-y-6">
              {/* TEST MARKER */}
              
              
              {/* Decision Selector */}
              <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-2 border-orange-500/40 rounded-xl p-6">
                <h2 className="text-2xl font-black text-white mb-4">🎯 5 Stratejik Karar Paneli</h2>
                <p className="text-slate-400 mb-6">Her dashboard farklı bir yönetim kararı için tasarlanmıştır</p>
                
                <div className="grid grid-cols-5 gap-3">
                  <button
                    onClick={() => setActiveDecision(1)}
                    className={`p-4 rounded-lg transition-all border-2 ${
                      activeDecision === 1
                        ? 'bg-orange-500/30 border-orange-500 shadow-lg'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">📍</div>
                    <div className="text-sm font-black text-white">İstasyon Lokasyonu</div>
                    <div className="text-xs text-slate-400 mt-1">Nereye açmalı?</div>
                  </button>

                  <button
                    onClick={() => setActiveDecision(2)}
                    className={`p-4 rounded-lg transition-all border-2 ${
                      activeDecision === 2
                        ? 'bg-orange-500/30 border-orange-500 shadow-lg'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-sm font-black text-white">Bütçe Dağılımı</div>
                    <div className="text-xs text-slate-400 mt-1">Nasıl paylaştırmalı?</div>
                  </button>

                  <button
                    onClick={() => setActiveDecision(3)}
                    className={`p-4 rounded-lg transition-all border-2 ${
                      activeDecision === 3
                        ? 'bg-orange-500/30 border-orange-500 shadow-lg'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-sm font-black text-white">Şarj Gücü</div>
                    <div className="text-xs text-slate-400 mt-1">Kaç kW olmalı?</div>
                  </button>

                  <button
                    onClick={() => setActiveDecision(4)}
                    className={`p-4 rounded-lg transition-all border-2 ${
                      activeDecision === 4
                        ? 'bg-orange-500/30 border-orange-500 shadow-lg'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-sm font-black text-white">İstasyon Kapatma</div>
                    <div className="text-xs text-slate-400 mt-1">Hangisini kapat?</div>
                  </button>

                  <button
                    onClick={() => setActiveDecision(5)}
                    className={`p-4 rounded-lg transition-all border-2 ${
                      activeDecision === 5
                        ? 'bg-orange-500/30 border-orange-500 shadow-lg'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-3xl mb-2">📈</div>
                    <div className="text-sm font-black text-white">Yeni Pazar Girişi</div>
                    <div className="text-xs text-slate-400 mt-1">Hangi pazara?</div>
                  </button>
                </div>
              </div>

              {/* DECISION 1: Where to Open Station */}
              {activeDecision === 1 && (
                <div className="space-y-6">
                  <div className="bg-[#161b2a] border-2 border-orange-500/40 rounded-xl p-6">
                    <h3 className="text-xl font-black text-orange-400 mb-2">📍 İstasyon Lokasyonu Seçimi</h3>
                    <p className="text-slate-400 mb-6">Grafiklere bakarak hangi şehre istasyon açacağınıza karar verin</p>
                    
                    {/* Charts for Decision 1 */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      {/* Investment Priority Chart */}
                      <div className="bg-[#0b0f1a] rounded-lg p-6">
                        <h4 className="text-lg font-black text-white mb-4">Yatırım Öncelik Skoru</h4>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topInvestmentTargets.slice(0, 10)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis 
                                dataKey="province" 
                                fontSize={10} 
                                axisLine={false} 
                                tick={{fill: '#94a3b8'}}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis fontSize={11} axisLine={false} tick={{fill: '#94a3b8'}} />
                              <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}} />
                              <Bar dataKey="investmentScore" name="Öncelik" radius={[8, 8, 0, 0]}>
                                {topInvestmentTargets.slice(0, 10).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.investmentScore > 70 ? '#FF8C00' : entry.investmentScore > 50 ? '#FFA500' : '#64748b'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* EV Count vs Coverage */}
                      <div className="bg-[#0b0f1a] rounded-lg p-6">
                        <h4 className="text-lg font-black text-white mb-4">EV Sayısı vs Kapsama Oranı</h4>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis 
                                dataKey="evCount" 
                                name="EV Sayısı"
                                fontSize={11} 
                                axisLine={false} 
                                tick={{fill: '#94a3b8'}}
                              />
                              <YAxis 
                                dataKey="coverageRatio" 
                                name="Kapsama %"
                                fontSize={11} 
                                axisLine={false} 
                                tick={{fill: '#94a3b8'}}
                              />
                              <Tooltip 
                                contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}}
                                cursor={{ strokeDasharray: '3 3' }}
                              />
                              <Scatter 
                                data={topInvestmentTargets.slice(0, 10).map(t => {
                                  const data = calculateMarketOpportunity(t.province);
                                  return {
                                    name: t.province,
                                    evCount: data?.totalEVs || 0,
                                    coverageRatio: data?.coverageRatio || 0,
                                    score: t.investmentScore
                                  };
                                })} 
                                fill="#22c55e"
                              >
                                {topInvestmentTargets.slice(0, 10).map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.investmentScore > 70 ? '#FF8C00' : entry.investmentScore > 50 ? '#FFA500' : '#64748b'} 
                                  />
                                ))}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decision Table */}
                    <div className="bg-[#0b0f1a] rounded-lg p-6">
                      <h4 className="text-lg font-black text-white mb-4">📋 5 Kritere Göre Karar Tablosu</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-orange-500/30">
                              <th className="text-left text-xs font-bold text-orange-400 pb-3 px-2">Şehir</th>
                              <th className="text-center text-xs font-bold text-orange-400 pb-3 px-2">Büyük<br/>Pazar?</th>
                              <th className="text-center text-xs font-bold text-orange-400 pb-3 px-2">Kapsama<br/>Yetersiz?</th>
                              <th className="text-center text-xs font-bold text-orange-400 pb-3 px-2">ZES Payı<br/>Düşük?</th>
                              <th className="text-center text-xs font-bold text-orange-400 pb-3 px-2">Rekabet<br/>Az?</th>
                              <th className="text-center text-xs font-bold text-orange-400 pb-3 px-2">Büyüme<br/>Yüksek?</th>
                              <th className="text-center text-xs font-bold text-orange-400 pb-3 px-2">KARAR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topInvestmentTargets.slice(0, 8).map((target) => {
                              const cityData = calculateMarketOpportunity(target.province);
                              if (!cityData) return null;
                              
                              const c1 = cityData.totalEVs > 10000;
                              const c2 = cityData.stationsPer100EV > 8;
                              const c3 = cityData.zesMarketShare < 30;
                              const c4 = cityData.competitionIntensity !== 'high';
                              const c5 = cityData.growthPotential > 60;
                              
                              const checkCount = [c1, c2, c3, c4, c5].filter(Boolean).length;
                              const getDecision = (count: number) => {
                                if (count === 5) return { text: '🔥 HEMEN AÇ', color: 'text-orange-400', bg: 'bg-orange-500/20' };
                                if (count === 4) return { text: '✅ AÇ', color: 'text-green-400', bg: 'bg-green-500/20' };
                                if (count === 3) return { text: '⚠️ DÜŞÜN', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
                                return { text: '❌ AÇMA', color: 'text-red-400', bg: 'bg-red-500/20' };
                              };
                              const decision = getDecision(checkCount);
                              
                              return (
                                <tr key={target.province} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                  <td className="py-3 px-2 text-sm font-bold text-white">{target.province}</td>
                                  <td className="py-3 px-2 text-center text-xl">{c1 ? '✅' : '❌'}</td>
                                  <td className="py-3 px-2 text-center text-xl">{c2 ? '✅' : '❌'}</td>
                                  <td className="py-3 px-2 text-center text-xl">{c3 ? '✅' : '❌'}</td>
                                  <td className="py-3 px-2 text-center text-xl">{c4 ? '✅' : '❌'}</td>
                                  <td className="py-3 px-2 text-center text-xl">{c5 ? '✅' : '❌'}</td>
                                  <td className="py-3 px-2 text-center">
                                    <div className={`${decision.bg} ${decision.color} text-xs font-black px-3 py-2 rounded-lg inline-block`}>
                                      {decision.text}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DECISION 2: Budget Allocation */}
              {activeDecision === 2 && (
                <div className="space-y-6">
                  <div className="bg-[#161b2a] border-2 border-orange-500/40 rounded-xl p-6">
                    <h3 className="text-xl font-black text-orange-400 mb-2">💰 Bütçe Dağılımı</h3>
                    <p className="text-slate-400 mb-6">Grafiklere bakarak bütçeyi nasıl paylaştıracağınıza karar verin</p>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* Budget Pie Chart */}
                      <div className="bg-[#0b0f1a] rounded-lg p-6">
                        <h4 className="text-lg font-black text-white mb-4">Önerilen Bütçe Dağılımı (Top 6 Şehir)</h4>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={topInvestmentTargets.slice(0, 6).map(t => ({
                                  name: t.province,
                                  value: t.investmentScore
                                }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {topInvestmentTargets.slice(0, 6).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#FF8C00', '#FFA500', '#FFB84D', '#FFC966', '#FFD480', '#FFE099'][index]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Budget vs Investment Score */}
                      <div className="bg-[#0b0f1a] rounded-lg p-6">
                        <h4 className="text-lg font-black text-white mb-4">Yatırım Skoru Karşılaştırması</h4>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topInvestmentTargets.slice(0, 10)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis 
                                dataKey="province" 
                                fontSize={10} 
                                axisLine={false} 
                                tick={{fill: '#94a3b8'}}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis fontSize={11} axisLine={false} tick={{fill: '#94a3b8'}} />
                              <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}} />
                              <Bar dataKey="investmentScore" name="Yatırım Skoru" fill="#22c55e" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Budget Allocation Table */}
                    <div className="bg-[#0b0f1a] rounded-lg p-6 mt-6">
                      <h4 className="text-lg font-black text-white mb-4">Detaylı Bütçe Planı (10M TL Toplam)</h4>
                      <div className="space-y-3">
                        {topInvestmentTargets.slice(0, 6).map((target, idx) => {
                          const totalScore = topInvestmentTargets.slice(0, 6).reduce((acc, t) => acc + t.investmentScore, 0);
                          const percentage = (target.investmentScore / totalScore * 100).toFixed(1);
                          const budget = (target.investmentScore / totalScore * 10000000).toFixed(0);
                          
                          return (
                            <div key={target.province} className="bg-slate-800/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-bold">{target.province}</span>
                                <span className="text-orange-400 font-black">%{percentage}</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                                <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full" style={{width: `${percentage}%`}}></div>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Önerilen Bütçe:</span>
                                <span className="text-green-400 font-bold">{Number(budget).toLocaleString()} TL</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DECISION 3: Power Level Selection */}
              {activeDecision === 3 && (
                <div className="space-y-6">
                  <div className="bg-[#161b2a] border-2 border-orange-500/40 rounded-xl p-6">
                    <h3 className="text-xl font-black text-orange-400 mb-2">⚡ Şarj Gücü Seçimi</h3>
                    <p className="text-slate-400 mb-6">Grafiklere bakarak hangi güçte şarj istasyonu kurulacağına karar verin</p>
                    
                    {/* Power Level Distribution Chart */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-[#0b0f1a] rounded-lg p-6">
                        <h4 className="text-lg font-black text-white mb-4">Şehirlerin EV Sayısı Dağılımı</h4>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topInvestmentTargets.slice(0, 10).map(t => {
                              const data = calculateMarketOpportunity(t.province);
                              return {
                                name: t.province,
                                evCount: data?.totalEVs || 0
                              };
                            })}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                fontSize={10} 
                                axisLine={false} 
                                tick={{fill: '#94a3b8'}}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis fontSize={11} axisLine={false} tick={{fill: '#94a3b8'}} />
                              <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}} />
                              <Bar dataKey="evCount" name="EV Sayısı" radius={[8, 8, 0, 0]}>
                                {topInvestmentTargets.slice(0, 10).map((t, index) => {
                                  const data = calculateMarketOpportunity(t.province);
                                  const evCount = data?.totalEVs || 0;
                                  return (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={evCount > 20000 ? '#a855f7' : evCount > 5000 ? '#FF8C00' : '#3b82f6'} 
                                    />
                                  );
                                })}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-[#0b0f1a] rounded-lg p-6">
                        <h4 className="text-lg font-black text-white mb-4">Pazar Büyüklüğü Kategorileri</h4>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={(() => {
                                  const categories = { large: 0, medium: 0, small: 0 };
                                  topInvestmentTargets.slice(0, 20).forEach(t => {
                                    const data = calculateMarketOpportunity(t.province);
                                    if (data) categories[data.marketSize]++;
                                  });
                                  return [
                                    { name: 'Büyük (>20K EV)', value: categories.large, color: '#a855f7' },
                                    { name: 'Orta (5-20K)', value: categories.medium, color: '#FF8C00' },
                                    { name: 'Küçük (<5K)', value: categories.small, color: '#3b82f6' }
                                  ];
                                })()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}\n%${(percent * 100).toFixed(0)}`}
                                outerRadius={100}
                                dataKey="value"
                              >
                                {[{ color: '#a855f7' }, { color: '#FF8C00' }, { color: '#3b82f6' }].map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-6">
                      {/* 50kW */}
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/40 rounded-xl p-6">
                        <div className="text-4xl mb-3">⚡</div>
                        <h4 className="text-xl font-black text-blue-400 mb-2">50 kW</h4>
                        <div className="text-sm text-slate-400 mb-4">Küçük Şehirler</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">EV &lt; 5,000</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">Düşük maliyet</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">Şehir içi</span>
                          </div>
                        </div>
                      </div>

                      {/* 150kW */}
                      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-2 border-orange-500/40 rounded-xl p-6">
                        <div className="text-4xl mb-3">⚡⚡</div>
                        <h4 className="text-xl font-black text-orange-400 mb-2">150 kW</h4>
                        <div className="text-sm text-slate-400 mb-4">Orta Şehirler</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">EV 5K - 20K</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">Optimal performans</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">En popüler</span>
                          </div>
                        </div>
                      </div>

                      {/* 180kW */}
                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-2 border-purple-500/40 rounded-xl p-6">
                        <div className="text-4xl mb-3">⚡⚡⚡</div>
                        <h4 className="text-xl font-black text-purple-400 mb-2">180 kW</h4>
                        <div className="text-sm text-slate-400 mb-4">Büyük Şehirler</div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">EV &gt; 20,000</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">Ultra hızlı</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">Premium</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Power Recommendation Table */}
                    <div className="bg-[#0b0f1a] rounded-lg p-6">
                      <h4 className="text-lg font-black text-white mb-4">Şehir Bazlı Güç Önerisi</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-slate-700">
                              <th className="text-left text-xs font-bold text-slate-400 pb-3 px-2">Şehir</th>
                              <th className="text-center text-xs font-bold text-slate-400 pb-3 px-2">Toplam EV</th>
                              <th className="text-center text-xs font-bold text-slate-400 pb-3 px-2">Kategori</th>
                              <th className="text-center text-xs font-bold text-orange-400 pb-3 px-2">ÖNERİLEN GÜÇ</th>
                              <th className="text-center text-xs font-bold text-slate-400 pb-3 px-2">Maliyet/İstasyon</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topInvestmentTargets.slice(0, 10).map((target) => {
                              const cityData = calculateMarketOpportunity(target.province);
                              if (!cityData) return null;
                              
                              let powerRec = '', powerColor = '', cost = '';
                              if (cityData.totalEVs > 20000) {
                                powerRec = '180 kW';
                                powerColor = 'text-purple-400 bg-purple-500/20';
                                cost = '~800K TL';
                              } else if (cityData.totalEVs > 5000) {
                                powerRec = '150 kW';
                                powerColor = 'text-orange-400 bg-orange-500/20';
                                cost = '~600K TL';
                              } else {
                                powerRec = '50 kW';
                                powerColor = 'text-blue-400 bg-blue-500/20';
                                cost = '~300K TL';
                              }
                              
                              return (
                                <tr key={target.province} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                  <td className="py-3 px-2 text-sm font-bold text-white">{target.province}</td>
                                  <td className="py-3 px-2 text-center text-sm text-slate-300">{cityData.totalEVs.toLocaleString()}</td>
                                  <td className="py-3 px-2 text-center text-xs font-bold text-slate-400 uppercase">{cityData.marketSize}</td>
                                  <td className="py-3 px-2 text-center">
                                    <span className={`${powerColor} text-xs font-black px-3 py-1 rounded-lg`}>{powerRec}</span>
                                  </td>
                                  <td className="py-3 px-2 text-center text-xs text-green-400 font-bold">{cost}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DECISION 4: Station Closure Decision */}
              {activeDecision === 4 && (
                <div className="space-y-6">
                  <div className="bg-[#161b2a] border-2 border-red-500/40 rounded-xl p-6">
                    <h3 className="text-xl font-black text-red-400 mb-2">🚫 İstasyon Kapatma Analizi</h3>
                    <p className="text-slate-400 mb-6">Düşük performanslı şehirlerdeki istasyonları değerlendirin</p>
                    
                    <p className="text-slate-400 mb-6">Düşük performanslı şehirlerdeki istasyonları değerlendirin</p>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <div className="text-red-400 text-sm font-bold mb-2">Riskli İstasyonlar</div>
                        <div className="text-white text-3xl font-black">
                          {getAllOpportunities().filter(o => o.investmentPriority < 30).length}
                        </div>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <div className="text-yellow-400 text-sm font-bold mb-2">İzlenmeli</div>
                        <div className="text-white text-3xl font-black">
                          {getAllOpportunities().filter(o => o.investmentPriority >= 30 && o.investmentPriority < 50).length}
                        </div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <div className="text-blue-400 text-sm font-bold mb-2">Ort. Performans</div>
                        <div className="text-white text-3xl font-black">
                          {(getAllOpportunities().reduce((sum, o) => sum + o.investmentPriority, 0) / getAllOpportunities().length).toFixed(0)}
                        </div>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <div className="text-green-400 text-sm font-bold mb-2">Sağlıklı İstasyonlar</div>
                        <div className="text-white text-3xl font-black">
                          {getAllOpportunities().filter(o => o.investmentPriority >= 70).length}
                        </div>
                      </div>
                    </div>

                    {/* Performance Analysis Chart (Grouped Bar Chart) */}
                    <div className="bg-[#0b0f1a] rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-black text-white mb-4">En Düşük 10 Şehir: Riskli / İzlenmeli / Ort. Performans</h4>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getAllOpportunities()
                              .sort((a, b) => a.investmentPriority - b.investmentPriority)
                              .slice(0, 10)
                              .map(o => ({
                                name: o.city,
                                performans: o.investmentPriority,
                                kategori:
                                  o.investmentPriority < 30 ? 'Riskli' :
                                  o.investmentPriority < 50 ? 'İzlenmeli' :
                                  o.investmentPriority < 70 ? 'Ort. Performans' : 'Sağlıklı'
                              }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                            <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}}
                              formatter={(value, name) => {
                                if (name === 'performans') return [value, 'Performans Skoru'];
                                return value;
                              }}
                              labelFormatter={label => `Şehir: ${label}`}
                            />
                            <Bar dataKey="performans">
                              {getAllOpportunities()
                                .sort((a, b) => a.investmentPriority - b.investmentPriority)
                                .slice(0, 10)
                                .map((o, idx) => {
                                  let fill = '#ef4444';
                                  if (o.investmentPriority < 30) fill = '#ef4444'; // Riskli
                                  else if (o.investmentPriority < 50) fill = '#facc15'; // İzlenmeli
                                  else if (o.investmentPriority < 70) fill = '#3b82f6'; // Ort. Performans
                                  else fill = '#22c55e'; // Sağlıklı
                                  return <Cell key={o.city} fill={fill} />;
                                })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Closure Decision Table */}
                    <div className="bg-[#0b0f1a] rounded-lg p-6">
                      <h4 className="text-lg font-black text-white mb-4">Kapatma Değerlendirme Tablosu</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-slate-700">
                              <th className="text-left text-xs font-bold text-slate-400 pb-3 px-3">Şehir</th>
                              <th className="text-center text-xs font-bold text-slate-400 pb-3 px-3">EV Sayısı</th>
                              <th className="text-center text-xs font-bold text-slate-400 pb-3 px-3">ZES İstasyon</th>
                              <th className="text-center text-xs font-bold text-slate-400 pb-3 px-3">ZES Pazar %</th>
                              <th className="text-center text-xs font-bold text-slate-400 pb-3 px-3">Büyüme</th>
                              <th className="text-center text-xs font-bold text-slate-400 pb-3 px-3">Performans</th>
                              <th className="text-center text-xs font-bold text-red-400 pb-3 px-3">ÖNERİ</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getAllOpportunities()
                              .sort((a, b) => a.investmentPriority - b.investmentPriority)
                              .slice(0, 15)
                              .map((opp) => {
                                // Kapatma kriterleri
                                const veryLowEV = opp.totalEVs < 2000;
                                const veryLowGrowth = opp.growthPotential < 25;
                                const veryLowPerf = opp.investmentPriority < 20;
                                const lowShare = opp.zesMarketShare < 15;
                                
                                let decision = '', decisionColor = '', decisionIcon = '';
                                if ((veryLowEV && veryLowGrowth) || veryLowPerf) {
                                  decision = 'KAPAT';
                                  decisionColor = 'bg-red-500/20 text-red-400 border-red-500/40';
                                  decisionIcon = '🚫';
                                } else if (opp.investmentPriority < 35 || (lowShare && veryLowGrowth)) {
                                  decision = 'CİDDİ İZLE';
                                  decisionColor = 'bg-orange-500/20 text-orange-400 border-orange-500/40';
                                  decisionIcon = '⚠️';
                                } else if (opp.investmentPriority < 50) {
                                  decision = 'İZLE';
                                  decisionColor = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
                                  decisionIcon = '👁️';
                                } else {
                                  decision = 'DEVAM';
                                  decisionColor = 'bg-green-500/20 text-green-400 border-green-500/40';
                                  decisionIcon = '✓';
                                }
                                
                                return (
                                  <tr key={opp.city} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                    <td className="py-3 px-3 text-sm font-bold text-white">{opp.city}</td>
                                    <td className="py-3 px-3 text-center text-sm text-slate-300">{opp.totalEVs.toLocaleString()}</td>
                                    <td className="py-3 px-3 text-center text-sm">
                                      <span className="text-orange-400 font-bold">{Math.round(opp.totalEVs * opp.zesMarketShare / 100 / 50)}</span>
                                    </td>
                                    <td className="py-3 px-3 text-center text-sm">
                                      <span className={`font-bold ${opp.zesMarketShare < 20 ? 'text-red-400' : opp.zesMarketShare < 35 ? 'text-yellow-400' : 'text-green-400'}`}>
                                        %{opp.zesMarketShare.toFixed(1)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-center text-sm">
                                      <span className={`font-bold ${opp.growthPotential < 30 ? 'text-red-400' : opp.growthPotential < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {opp.growthPotential.toFixed(0)}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-center text-sm">
                                      <div className="flex items-center justify-center gap-2">
                                        <div className={`w-16 h-2 rounded-full ${
                                          opp.investmentPriority < 30 ? 'bg-red-500' :
                                          opp.investmentPriority < 50 ? 'bg-yellow-500' :
                                          opp.investmentPriority < 70 ? 'bg-blue-500' : 'bg-green-500'
                                        }`} style={{width: `${opp.investmentPriority}%`, maxWidth: '64px'}}></div>
                                        <span className="text-xs font-bold text-slate-400">{opp.investmentPriority.toFixed(0)}</span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                      <span className={`${decisionColor} text-xs font-black px-3 py-1.5 rounded-lg border inline-flex items-center gap-1`}>
                                        {decisionIcon} {decision}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* DECISION 5: New Market Entry */}
              {activeDecision === 5 && (
                <div className="space-y-6">
                  <div className="bg-[#161b2a] border-2 border-green-500/40 rounded-xl p-6">
                    <h3 className="text-xl font-black text-green-400 mb-2">🚀 Yeni Pazar Girişi Stratejisi</h3>
                    <p className="text-slate-400 mb-6">ZES payının düşük olduğu büyüme potansiyeli yüksek pazarları keşfedin</p>
                    {/* Öncelikli Giriş Yapılacak Pazarlar Stacked Bar Chart (Profesyonel) */}
                    <div className="bg-[#0b0f1a] rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-black text-white mb-4">Öncelikli Giriş Yapılacak Pazarlar (Stacked Bar Chart)</h4>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={getAllOpportunities()
                              .filter(o => o.investmentPriority >= 11)
                              .sort((a, b) => b.investmentPriority - a.investmentPriority)
                              .slice(0, 8)
                              .map(o => ({
                                name: o.city,
                                'EV (bin)': Math.round(o.totalEVs / 1000),
                                'Büyüme': o.growthPotential,
                                'ZES Payı': o.zesMarketShare
                              }))}
                            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} axisLine={false} angle={-30} textAnchor="end" height={80} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} />
                            <Tooltip
                              contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}}
                              formatter={(value, name) => {
                                if (name === 'EV (bin)') return [value, 'EV (bin)'];
                                if (name === 'Büyüme') return [value, 'Büyüme'];
                                if (name === 'ZES Payı' && typeof value === 'number') return [`%${value.toFixed(1)}`, 'ZES Payı'];
                                if (name === 'ZES Payı') return [value, 'ZES Payı'];
                                return value;
                              }}
                            />
                            <Legend wrapperStyle={{ color: '#fff', fontWeight: 700 }} />
                            <Bar dataKey="EV (bin)" name="EV (bin)" stackId="a" fill="#2563eb" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="Büyüme" name="Büyüme" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="ZES Payı" name="ZES Payı" stackId="a" fill="#f59e42" radius={[0, 0, 8, 8]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    {/* Market Entry Opportunities Chart */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-[#0b0f1a] rounded-lg p-6">
                        <h4 className="text-lg font-black text-white mb-4">En İyi 10 Yeni Pazar Fırsatı</h4>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getAllOpportunities()
                              .filter(o => o.zesMarketShare < 30)
                              .sort((a, b) => (b.growthPotential * b.totalEVs / 1000) - (a.growthPotential * a.totalEVs / 1000))
                              .slice(0, 10)
                              .map(o => ({
                                name: o.city,
                                firsat: (o.growthPotential * o.totalEVs / 1000 / 100).toFixed(0),
                              }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                fontSize={10} 
                                axisLine={false} 
                                tick={{fill: '#94a3b8'}}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis fontSize={11} axisLine={false} tick={{fill: '#94a3b8'}} />
                              <Tooltip contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}} />
                              <Bar dataKey="firsat" name="Fırsat Skoru" fill="#22c55e" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-[#0b0f1a] rounded-lg p-6">
                        <h4 className="text-lg font-black text-white mb-4">ZES Payı vs Büyüme</h4>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                              <XAxis 
                                dataKey="pay" 
                                name="ZES Pazar Payı %"
                                fontSize={11} 
                                axisLine={false} 
                                tick={{fill: '#94a3b8'}}
                              />
                              <YAxis 
                                dataKey="buyume" 
                                name="Büyüme Potansiyeli"
                                fontSize={11} 
                                axisLine={false} 
                                tick={{fill: '#94a3b8'}}
                              />
                              <Tooltip 
                                contentStyle={{backgroundColor: '#161b2a', border: '1px solid #334155', borderRadius: '8px'}}
                                cursor={{ strokeDasharray: '3 3' }}
                              />
                              <Scatter 
                                data={getAllOpportunities()
                                  .filter(o => o.zesMarketShare < 35)
                                  .map(o => ({
                                    name: o.city,
                                    pay: o.zesMarketShare,
                                    buyume: o.growthPotential,
                                  }))} 
                                fill="#22c55e"
                              >
                                {getAllOpportunities()
                                  .filter(o => o.zesMarketShare < 35)
                                  .map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.zesMarketShare < 20 ? '#22c55e' : entry.zesMarketShare < 25 ? '#3b82f6' : '#8b5cf6'} 
                                    />
                                  ))}
                              </Scatter>
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Top Market Entry Opportunities */}
                    <div className="bg-[#0b0f1a] rounded-lg p-6">
                      <h4 className="text-lg font-black text-white mb-4">Öncelikli Giriş Yapılacak Pazarlar</h4>
                      <div className="space-y-3">
                        {getAllOpportunities()
                          .filter(o => o.zesMarketShare < 30)
                          .sort((a, b) => {
                            const scoreA = (a.growthPotential * 0.4) + ((30 - a.zesMarketShare) * 2 * 0.3) + (a.totalEVs / 1000 * 0.3);
                            const scoreB = (b.growthPotential * 0.4) + ((30 - b.zesMarketShare) * 2 * 0.3) + (b.totalEVs / 1000 * 0.3);
                            return scoreB - scoreA;
                          })
                          .slice(0, 8)
                          .map((opp, idx) => {
                            const entryScore = ((opp.growthPotential * 0.4) + ((30 - opp.zesMarketShare) * 2 * 0.3) + (opp.totalEVs / 1000 * 0.3)).toFixed(0);
                            const isTopPriority = idx < 3;
                            const isMedium = idx >= 3 && idx < 6;
                            
                            return (
                              <div 
                                key={opp.city} 
                                className={`p-4 rounded-lg border ${
                                  isTopPriority ? 'bg-green-500/10 border-green-500/40' :
                                  isMedium ? 'bg-blue-500/10 border-blue-500/40' :
                                  'bg-purple-500/10 border-purple-500/40'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <span className={`text-2xl font-black ${
                                      isTopPriority ? 'text-green-400' :
                                      isMedium ? 'text-blue-400' : 'text-purple-400'
                                    }`}>#{idx + 1}</span>
                                    <div>
                                      <div className="text-white font-black text-lg">{opp.city}</div>
                                      <div className="text-xs text-slate-500">
                                        {opp.competitionIntensity === 'low' ? '🟢 Düşük Rekabet' :
                                         opp.competitionIntensity === 'medium' ? '🟡 Orta Rekabet' : '🔴 Yüksek Rekabet'}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`px-4 py-2 rounded-lg font-black text-sm ${
                                    isTopPriority ? 'bg-green-500 text-white' :
                                    isMedium ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
                                  }`}>
                                    {isTopPriority ? '🔥 HEMEN GİR' : isMedium ? '⚡ ÖNCELİKLİ' : '📊 PLANLA'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-5 gap-3 text-xs">
                                  <div className="bg-slate-800/50 rounded p-2">
                                    <div className="text-slate-500 mb-1">EV Sayısı</div>
                                    <div className="text-white font-bold">{opp.totalEVs.toLocaleString()}</div>
                                  </div>
                                  <div className="bg-slate-800/50 rounded p-2">
                                    <div className="text-slate-500 mb-1">ZES Payı</div>
                                    <div className="text-orange-400 font-bold">%{opp.zesMarketShare.toFixed(1)}</div>
                                  </div>
                                  <div className="bg-slate-800/50 rounded p-2">
                                    <div className="text-slate-500 mb-1">Büyüme</div>
                                    <div className="text-green-400 font-bold">{opp.growthPotential.toFixed(0)}</div>
                                  </div>
                                  <div className="bg-slate-800/50 rounded p-2">
                                    <div className="text-slate-500 mb-1">Açık</div>
                                    <div className="text-yellow-400 font-bold">+{opp.zesGap}</div>
                                  </div>
                                  <div className="bg-slate-800/50 rounded p-2">
                                    <div className="text-slate-500 mb-1">Giriş Skoru</div>
                                    <div className={`font-black ${
                                      isTopPriority ? 'text-green-400' :
                                      isMedium ? 'text-blue-400' : 'text-purple-400'
                                    }`}>{entryScore}/100</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#161b2a] border-t border-slate-800 px-6 py-3 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-bold">SİSTEM AKTİF</span>
          <span className="mx-2">•</span>
          <Clock className="w-3 h-3" />
          <span>Son Güncelleme: {new Date().toLocaleString('tr-TR')}</span>
        </div>
        <p className="text-xs text-slate-600 font-bold">© 2025 Zorlu Energy Solutions - Gizli ve Özel</p>
      </footer>
    </div>
  );
};

export default App;
