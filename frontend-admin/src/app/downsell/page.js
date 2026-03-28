"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDown, LifeBuoy, MessageSquare, Info, ShieldCheck, Save, Zap } from 'lucide-react';

export default function DownsellPage() {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/config')
      .then(res => {
        setEnabled(res.data.downsellEnabled ?? true);
        setMessage(res.data.downsellMessage ?? '');
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/config', {
        downsellEnabled: enabled,
        downsellMessage: message
      });
      alert('Downsell de Recuperação atualizado!');
    } catch(err) { alert('Erro ao salvar'); }
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Ativando Iscas...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-top-4 duration-700">
      <div className="flex justify-between items-end mb-12 ml-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight text-red-500">Recuperação / Downsell</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Garantia de conversão em churn de checkout</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="bg-white text-black px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3"
        >
          {saving ? 'Gravando...' : <><Save size={16} /> Aplicar Isca</>}
        </button>
      </div>

      <div className="bg-darkCard/30 border border-darkBorder rounded-[48px] p-10 space-y-10 shadow-3xl">
        <div className="flex items-center justify-between border-b border-darkBorder/50 pb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-xl">
                 <LifeBuoy size={28} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Configurar Oferta de Saída</h2>
           </div>
           
           <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
              <div className="w-14 h-7 bg-darkInput border border-darkBorder rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-slate-700 after:border-slate-800 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600/20 peer-checked:after:bg-red-500 transition-colors"></div>
              <span className="ml-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ativo</span>
           </label>
        </div>

        <div className="space-y-6">
           <div className="flex flex-wrap gap-2 mb-4">
              {[
                { k: '{plan_name}', d: 'Nome do Plano Alvo' },
                { k: '{plan_price}', d: 'Valor do Plano Alvo' }
              ].map(tag => (
                <div key={tag.k} className="flex items-center gap-2 bg-darkInput border border-darkBorder px-3 py-1.5 rounded-xl group cursor-help hover:border-red-500/30 transition-all">
                   <code className="text-[10px] font-black text-red-500">{tag.k}</code>
                   <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{tag.d}</span>
                </div>
              ))}
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Script de Downsell (Markdown)</label>
              <textarea 
                className="w-full p-8 bg-darkInput border border-darkBorder rounded-[32px] outline-none focus:border-red-500/20 transition text-sm font-bold h-64 resize-none leading-relaxed text-slate-400 placeholder:text-slate-800" 
                placeholder="Exiba uma última oferta barata se o cliente não quiser mais o VIP principal..."
                value={message} 
                onChange={e=>setMessage(e.target.value)} 
              />
           </div>
        </div>
      </div>

      <div className="mt-10 border border-darkBorder rounded-[40px] p-8 flex items-start gap-6 group hover:border-red-500/20 transition-all">
          <div className="w-14 h-14 rounded-full bg-darkCard border border-darkBorder flex items-center justify-center text-slate-700 group-hover:text-red-500 transition-colors shadow-2xl flex-shrink-0">
            <Zap size={28} />
          </div>
          <div className="space-y-1">
             <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">PSICOLOGIA DE VENDAS</p>
             <p className="text-[11px] font-bold text-slate-600 leading-relaxed max-w-2xl italic">
                O Downsell é o seu salva-vidas. Quando um usuário ignora o plano original ou o upsell, o bot oferece automaticamente um plano "VIP Teste" ou alternativo com valor menor para não perder o usuário.
             </p>
          </div>
      </div>
    </div>
  );
}
