import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Fingerprint, Activity, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    
    // Kurumsal giriş simülasyonu
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        onLogin();
      } else {
        setError('Hatalı kimlik bilgileri. Lütfen yetkili personelle iletişime geçin.');
        setIsConnecting(false);
      }
    }, 1200);
  };

  return (
    <div className="h-screen w-full bg-[#0b0f1a] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Arka Plan Dekoratif Elementler */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#FF8C00]/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/5 blur-[100px] rounded-full"></div>
      
      <div className="w-full max-w-[440px] z-10 px-6">
        {/* Logo ve Başlık */}
        <div className="text-center mb-12 transform transition-all">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FF8C00] to-orange-700 rounded-[2.5rem] flex items-center justify-center font-black text-white italic text-5xl shadow-[0_20px_50px_rgba(255,140,0,0.3)] mx-auto mb-8 border border-white/10 relative z-10">
              Z
            </div>
            <div className="absolute inset-0 bg-[#FF8C00] blur-2xl opacity-20 animate-ping rounded-full"></div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            ZES <span className="text-[#FF8C00]">VİZYON</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-slate-800"></div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">Network Strategy Engine</p>
            <div className="h-[1px] w-8 bg-slate-800"></div>
          </div>
        </div>

        {/* Giriş Formu (Glassmorphism) */}
        <div className="bg-[#161b2a]/60 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF8C00]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Kurumsal Kullanıcı ID</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-[#FF8C00] transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="ID Giriniz" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-[#FF8C00]/50 transition-all placeholder:text-slate-700" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Güvenlik Şifresi</label>
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-[#FF8C00] transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-[#FF8C00]/50 transition-all placeholder:text-slate-700" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-red-500 text-[10px] font-bold leading-tight">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isConnecting}
              className="w-full bg-[#FF8C00] hover:bg-orange-600 active:scale-95 text-white font-black py-5 rounded-[1.5rem] uppercase tracking-[0.25em] text-xs shadow-[0_10px_30px_rgba(255,140,0,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  BAĞLANILIYOR...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  SİSTEME GİRİŞ YAP
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
             <button className="text-[9px] font-black text-slate-600 hover:text-[#FF8C00] transition-colors uppercase tracking-widest">Şifremi Unuttum</button>
             <div className="flex items-center gap-4 opacity-20">
               <div className="w-12 h-[1px] bg-slate-500"></div>
               <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Secured by Zorlu Energy</div>
               <div className="w-12 h-[1px] bg-slate-500"></div>
             </div>
          </div>
        </div>

        {/* Sistem Durumu */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Mainframe Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">ODMD API Linked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
