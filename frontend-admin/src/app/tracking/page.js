"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MousePointer2, Copy, BarChart3, Plus, ExternalLink, Globe, Zap, Search, Globe2 } from 'lucide-react';

export default function TrackingPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await axios.get('/api/tracking');
      setSources(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const copyLink = (utm) => {
    const link = `https://t.me/seu_bot?start=${utm}`;
    navigator.clipboard.writeText(link);
    alert('Link de rastreamento copiado!');
  };

  if (loading) return <div className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Lendo Canais de Tráfego...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 ml-2">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight">Trackeamento Cloud</h1>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gestão de UTMs e atribuição de conversão</p>
        </div>
        <button className="bg-white text-black px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3">
           <Plus size={16} /> NOVO RASTREADOR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-darkCard/20 p-8 rounded-[40px] border border-darkBorder flex items-center gap-6 group hover:border-blue-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <MousePointer2 size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">CLIQUES TOTAIS</p>
               <p className="text-2xl font-black text-white">{sources.reduce((acc, s) => acc + s.clicks, 0)}</p>
            </div>
         </div>
         <div className="bg-darkCard/20 p-8 rounded-[40px] border border-darkBorder flex items-center gap-6 group hover:border-teal-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
               <Zap size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">LEADS GERADOS</p>
               <p className="text-2xl font-black text-white">{sources.reduce((acc, s) => acc + s.leads, 0)}</p>
            </div>
         </div>
         <div className="bg-darkCard/20 p-8 rounded-[40px] border border-darkBorder flex items-center gap-6 group hover:border-slate-500/20 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
               <BarChart3 size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">CONVERSÃO MÉDIA</p>
               <p className="text-2xl font-black text-white">
                  {(sources.reduce((acc, s) => acc + (s.leads > 0 ? (s.conversions/s.leads)*100 : 0), 0) / (sources.length || 1)).toFixed(1)}%
               </p>
            </div>
         </div>
      </div>

      <div className="bg-darkCard/20 rounded-[48px] border border-darkBorder overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-darkBorder flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Globe2 size={20} />
               </div>
               <h2 className="text-lg font-bold text-white tracking-tight">Atribuição de Canais</h2>
            </div>
         </div>
         
         <table className="w-full text-left">
            <thead>
               <tr className="bg-white/5 border-b border-darkBorder">
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">FONTE AFILIADA</th>
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">IDENTIFICADOR UTM</th>
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">CLIQUES</th>
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">LEADS</th>
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">CONVERSÃO</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder/40">
               {sources.map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.01] transition-colors group">
                     <td className="p-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-darkInput border border-darkBorder flex items-center justify-center font-black text-slate-700 group-hover:text-blue-500 transition-colors uppercase">
                              {s.name[0]}
                           </div>
                           <span className="font-black text-sm text-slate-300 uppercase italic tracking-tight">{s.name}</span>
                        </div>
                     </td>
                     <td className="p-8">
                        <div className="flex items-center gap-3 font-mono text-[10px] bg-darkInput/50 w-fit px-3 py-1.5 rounded-xl border border-darkBorder">
                           <span className="text-slate-500">{s.utm}</span>
                           <button onClick={() => copyLink(s.utm)} className="text-slate-700 hover:text-white transition">
                              <Copy size={12} />
                           </button>
                        </div>
                     </td>
                     <td className="p-8 text-center text-sm font-black text-slate-400">
                        {s.clicks}
                     </td>
                     <td className="p-8 text-center text-sm font-black text-slate-400">
                        {s.leads}
                     </td>
                     <td className="p-8 text-right">
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-sm font-black text-white text-green-500">
                              {s.leads > 0 ? ((s.conversions/s.leads)*100).toFixed(1) : '0.0'}%
                           </span>
                           <div className="w-20 h-1 bg-darkBg rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600/50" style={{ width: `${s.leads > 0 ? (s.conversions/s.leads)*100 : 0}%` }}></div>
                           </div>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}

