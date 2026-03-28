"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpRight, Copy, Link as LinkIcon, Plus, Trash2, Globe, Search, ArrowRight, Zap } from 'lucide-react';

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      const res = await axios.get('/api/redirects');
      setRedirects(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const copyLink = (slug) => {
    const link = `${window.location.origin.replace('3000', '5000')}/r/${slug}`;
    navigator.clipboard.writeText(link);
    alert('Link de redirecionamento copiado!');
  };

  if (loading) return <div className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Sincronizando Nodes...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 ml-2">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight">Redirecionadores</h1>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Gestão de links curtos e redirecionamento dinâmico</p>
        </div>
        <button className="bg-white text-black px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3">
           <LinkIcon size={16} /> NOVO REDIRECIONADOR
        </button>
      </div>

      <div className="bg-darkCard/20 rounded-[48px] border border-darkBorder overflow-hidden shadow-2xl">
         <div className="p-8 border-b border-darkBorder flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Globe size={20} />
               </div>
               <h2 className="text-lg font-bold text-white tracking-tight">Links Ativos</h2>
            </div>
         </div>
         
         <table className="w-full text-left">
            <thead>
               <tr className="bg-white/5 border-b border-darkBorder">
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">IDENTIFICAÇÃO</th>
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">CAMINHO CURTO (SLUG)</th>
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">DESTINO</th>
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">CLIQUES</th>
                  <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">AÇÕES</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-darkBorder/40">
               {redirects.map(r => (
                  <tr key={r.id} className="hover:bg-white/[0.01] transition-colors group">
                     <td className="p-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-darkInput border border-darkBorder flex items-center justify-center font-black text-slate-700 group-hover:text-white transition-colors uppercase">
                              {r.name[0]}
                           </div>
                           <span className="font-black text-sm text-slate-300 uppercase italic tracking-tight">{r.name}</span>
                        </div>
                     </td>
                     <td className="p-8">
                        <div className="flex items-center gap-3 font-mono text-[10px] bg-darkInput/50 w-fit px-3 py-1.5 rounded-xl border border-darkBorder group-hover:bg-blue-600/10 group-hover:border-blue-600 transition-all cursor-pointer" onClick={() => copyLink(r.slug)}>
                           <span className="text-slate-500 group-hover:text-blue-500 transition-colors">/{r.slug}</span>
                           <Copy size={12} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                        </div>
                     </td>
                     <td className="p-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 truncate max-w-[200px]">
                            <ArrowRight size={12} className="flex-shrink-0" />
                            {r.target}
                        </div>
                     </td>
                     <td className="p-8 text-center">
                        <div className="flex flex-col items-center gap-1">
                           <span className="text-sm font-black text-white">{r.clicks}</span>
                           <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest leading-none">Acessos</span>
                        </div>
                     </td>
                     <td className="p-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => window.open(`${window.location.origin.replace('3000', '5000')}/r/${r.slug}`)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition">
                              <ArrowUpRight size={16} />
                           </button>
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
