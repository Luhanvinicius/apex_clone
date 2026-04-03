"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit3, Shield, Calendar, DollarSign, Save, X, Layers } from 'lucide-react';

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', durationDays: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
    const handleBotChange = () => fetchPlans();
    window.addEventListener('botChanged', handleBotChange);
    return () => window.removeEventListener('botChanged', handleBotChange);
  }, []);

  const fetchPlans = async () => {
    let botId = localStorage.getItem('selected_bot_id');
    try {
      const configResponse = await axios.get('/api/config');
      const configList = Array.isArray(configResponse.data) ? configResponse.data : (configResponse.data ? [configResponse.data] : []);

      if (botId) {
        const selectedConfig = configList.find((item) => String(item.id) === String(botId));
        if (!selectedConfig) {
          botId = configList[0] ? String(configList[0].id) : null;
          if (botId) {
            localStorage.setItem('selected_bot_id', botId);
            window.dispatchEvent(new CustomEvent('botChanged', { detail: botId }));
          } else {
            localStorage.removeItem('selected_bot_id');
          }
        }
      } else if (configList.length > 0) {
        botId = String(configList[0].id);
        localStorage.setItem('selected_bot_id', botId);
        window.dispatchEvent(new CustomEvent('botChanged', { detail: botId }));
      }

      if (!botId) {
        setPlans([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`/api/plans?botId=${botId}`);
      setPlans(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const savePlan = async (e) => {
    e.preventDefault();
    const botId = localStorage.getItem('selected_bot_id');
    if (!botId) return alert('Selecione um bot primeiro.');
    try {
      if (editingId) {
        await axios.put(`/api/plans/${editingId}`, form);
      } else {
        await axios.post(`/api/plans?botId=${botId}`, form);
      }
      setForm({ name: '', price: '', durationDays: '', description: '' });
      setEditingId(null);
      fetchPlans();
    } catch (e) { alert('Erro ao salvar plano'); }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, price: p.price, durationDays: p.durationDays, description: p.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deletePlan = async (id) => {
    if (confirm('Confirmar exclusão desta oferta?')) {
      await axios.delete(`/api/plans/${id}`);
      fetchPlans();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in zoom-in-95 duration-700 max-w-7xl mx-auto">
      <div className="lg:col-span-2 space-y-10">
        <div className="ml-2">
          <h1 className="text-3xl font-black text-white tracking-tight">Ofertas Cloud</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Configuração de planos e períodos VIP</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map(p => (
            <div key={p.id} className="bg-darkCard/30 p-10 rounded-[40px] border border-darkBorder hover:border-white/10 transition-all shadow-xl group flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                  <Shield size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                   <button onClick={() => startEdit(p)} className="w-10 h-10 bg-darkInput border border-darkBorder rounded-xl text-slate-500 hover:text-white transition flex items-center justify-center"><Edit3 size={16}/></button>
                   <button onClick={() => deletePlan(p.id)} className="w-10 h-10 bg-darkInput border border-darkBorder rounded-xl text-slate-500 hover:text-red-500 transition flex items-center justify-center"><Trash2 size={16}/></button>
                </div>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">{p.name}</h3>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">{p.description || 'CONTEÚDO EXCLUSIVO VIP'}</p>
              
              <div className="flex items-end justify-between border-t border-darkBorder/40 pt-10 mt-10">
                 <div>
                    <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] mb-1">CUSTO FINAL</p>
                    <p className="text-2xl font-black text-white">R$ {p.price.toFixed(2)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em] mb-1">CICLO</p>
                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest">
                       {p.durationDays > 0 ? `${p.durationDays} Dias` : 'Vitalício'}
                    </p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="sticky top-10 bg-darkCard/20 p-10 rounded-[48px] border border-darkBorder shadow-2xl space-y-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                {editingId ? <Edit3 size={20} className="text-yellow-500"/> : <Plus size={20} className="text-white" />}
             </div>
             <h2 className="text-xl font-bold text-white tracking-tight">
               {editingId ? 'Editar Plano' : 'Novo Plano'}
             </h2>
          </div>
          
          <form onSubmit={savePlan} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">IDENTIFICAÇÃO DO PLANO</label>
              <input 
                className="w-full p-5 bg-darkInput border border-darkBorder rounded-2xl outline-none focus:border-white/10 transition text-sm font-black uppercase text-white placeholder:text-slate-800" 
                placeholder="Ex: VIP ULTIMATE" 
                value={form.name} 
                onChange={e=>setForm({...form, name: e.target.value})} 
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">VALOR (R$)</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" />
                  <input 
                    className="w-full p-5 pl-10 bg-darkInput border border-darkBorder rounded-2xl outline-none focus:border-white/10 transition text-sm font-black text-white" 
                    type="number" step="0.01" 
                    value={form.price} 
                    onChange={e=>setForm({...form, price: e.target.value})} 
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">PERÍODO</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" />
                  <input 
                    className="w-full p-5 pl-10 bg-darkInput border border-darkBorder rounded-2xl outline-none focus:border-white/10 transition text-sm font-black text-white" 
                    type="number" 
                    placeholder="0 = ∞"
                    value={form.durationDays} 
                    onChange={e=>setForm({...form, durationDays: e.target.value})} 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">RESUMO DO CONTEÚDO</label>
              <textarea 
                className="w-full p-5 bg-darkInput border border-darkBorder rounded-2xl outline-none focus:border-white/10 transition text-xs font-bold h-24 resize-none leading-relaxed text-slate-400" 
                placeholder="Listagem de benefícios..." 
                value={form.description} 
                onChange={e=>setForm({...form, description: e.target.value})} 
              />
            </div>

            <div className="flex gap-3 pt-6">
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => {setEditingId(null); setForm({name:'', price:'', durationDays:'', description:''})}}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl transition text-[10px] uppercase tracking-widest"
                >
                  ABORTAR
                </button>
              )}
              <button 
                type="submit" 
                className="flex-[2] bg-white text-black font-black py-5 rounded-2xl hover:bg-slate-200 transition-all shadow-xl text-[10px] uppercase tracking-widest"
              >
                {editingId ? 'ATUALIZAR' : 'CONCLUIR CRIAÇÃO'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
