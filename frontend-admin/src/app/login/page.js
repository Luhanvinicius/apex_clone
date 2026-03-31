"use client"
import { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/login', { username, password });
      localStorage.setItem('apex_token', res.data.token);
      window.location.href = '/';
    } catch (e) {
      alert('Acesso negado. Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/3"></div>

      <div className="w-full max-w-md bg-darkCard/90 backdrop-blur-2xl p-12 rounded-[48px] border border-white/5 space-y-12 shadow-3xl relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-4">
           <img
             src="/apexlogo.webp"
             alt="Apex VIPs"
             className="h-[74px] w-auto object-contain drop-shadow-[0_0_28px_rgba(255,255,255,0.16)]"
           />
           <div className="text-center">
              <h1 className="text-[22px] font-bold text-[#dddddd] tracking-tight">Apex Cloud</h1>
              <p className="text-support font-semibold tracking-[0.2em] uppercase mt-1">Portal de Acesso Restrito</p>
           </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-[0.18em] ml-1">USUÁRIO</label>
              <input 
                type="text"
                placeholder="Ex: admin_root"
                className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl p-5 outline-none focus:border-white/10 transition-all text-sm font-medium text-white shadow-inner"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
           </div>

           <div className="space-y-2">
              <label className="text-[12px] font-semibold text-[#aaaaaa] uppercase tracking-[0.18em] ml-1">SENHA MESTRE</label>
              <input 
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl p-5 outline-none focus:border-white/10 transition-all text-sm font-medium text-white shadow-inner"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-slate-200 transition-all shadow-xl text-xs uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50"
           >
             {loading ? 'Validando Acesso...' : 'Entrar no Painel'}
           </button>
        </form>

        <div className="text-center pt-6 space-y-4">
           <p className="text-support text-[#7a7a7a] font-semibold uppercase tracking-widest leading-relaxed">
              Sistema de alta fidelidade para gestão de redes neurais e tráfego orgânico.
           </p>
           <div className="flex justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-600/40"></div>
              <div className="w-1 h-1 rounded-full bg-blue-600/40"></div>
              <div className="w-1 h-1 rounded-full bg-blue-600/40"></div>
           </div>
        </div>
      </div>
    </div>
  );
}
