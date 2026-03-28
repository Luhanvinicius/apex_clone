"use client"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUp, Zap, MessageSquare, Info, ShieldCheck, Save, Sparkles } from 'lucide-react';

export default function UpsellPage() {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/config')
      .then(res => {
        setEnabled(res.data.upsellEnabled ?? true);
        setMessage(res.data.upsellMessage ?? '');
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/config', {
        upsellEnabled: enabled,
        upsellMessage: message
      });
      alert('Upsell Mestre atualizado!');
    } catch(err) { alert('Erro ao salvar'); }
    setSaving(false);
  };

  if (loading) return <div className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Sincronizando Funil...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-top-4 duration-700">
      <div className="flex justify-between items-end mb-12 ml-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Upsell 1-Click</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Otimização de LTV e faturamento por usuário</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={saving}
          className="bg-white text-black px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3"
        >
          {saving ? 'Gravando...' : <><Save size={16} /> Aplicar Estratégia</>}
        </button>
      </div>

      <div className="bg-darkCard/30 border border-darkBorder rounded-[48px] p-10 space-y-10 shadow-3xl">
        <div className="flex items-center justify-between border-b border-darkBorder/50 pb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-xl">
                 <ArrowUp size={28} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Configurar Oferta Mestre</h2>
           </div>
           
           <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
              <div className="w-14 h-7 bg-darkInput border border-darkBorder rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-slate-700 after:border-slate-800 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600/20 peer-checked:after:bg-blue-500 transition-colors"></div>
              <span className="ml-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ativo</span>
           </label>
        </div>

        <div className="space-y-6">
           <div className="flex flex-wrap gap-2 mb-4">
              {[
                { k: '{diff}', d: 'Diferença R$' },
                { k: '{plan_name}', d: 'Nome do Plano' },
                { k: '{plan_price}', d: 'Preço Final' }
              ].map(tag => (
                <div key={tag.k} className="flex items-center gap-2 bg-darkInput border border-darkBorder px-3 py-1.5 rounded-xl group cursor-help hover:border-blue-500/30 transition-all">
                   <code className="text-[10px] font-black text-blue-500">{tag.k}</code>
                   <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{tag.d}</span>
                </div>
              ))}
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Script Visual da Oferta</label>
              <textarea 
                className="w-full p-8 bg-darkInput border border-darkBorder rounded-[32px] outline-none focus:border-white/10 transition text-sm font-bold h-64 resize-none leading-relaxed text-slate-400 placeholder:text-slate-800" 
                placeholder="Ofereça uma vantagem irresistível..."
                value={message} 
                onChange={e=>setMessage(e.target.value)} 
              />
           </div>
        </div>
      </div>

      <div className="mt-10 bg-blue-600/5 border border-blue-500/10 rounded-[40px] p-8 flex items-start gap-6 group hover:border-blue-500/20 transition-all">
          <div className="w-14 h-14 rounded-full bg-darkCard border border-darkBorder flex items-center justify-center text-slate-700 group-hover:text-blue-500 transition-colors shadow-2xl flex-shrink-0">
            <Sparkles size={28} />
          </div>
          <div className="space-y-1">
             <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">INTELIGÊNCIA DE VENDAS</p>
             <p className="text-[11px] font-bold text-slate-600 leading-relaxed max-w-2xl italic">
                O Upsell de 1 clique é exibido imediatamente após o usuário clicar em um plano. Utilize o gatilho de {"'{diff}'"} para mostrar que, com apenas mais alguns reais, ele leva um pacote muito superior.
             </p>
          </div>
      </div>
    </div>
  );
}
