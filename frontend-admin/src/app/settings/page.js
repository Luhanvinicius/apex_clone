"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Bot, Code2, Share2, Settings2, Download, Upload, ShieldCheck, 
  ChevronDown, Save, Globe, Info, Zap, Link as LinkIcon, 
  UserPlus, CheckCircle2, FileText, Edit2, Plus
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('editar');
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [config, setConfig] = useState({
    botToken: '',
    botUsername: 'Vipdamicabot',
    botExternalId: '59548',
    antiClone: false,
    startOnAnyText: false,
    welcomeMessage: '',
    supportUsername: '',
    upsellEnabled: true,
    upsellMessage: '',
    downsellEnabled: true,
    downsellMessage: ''
  });

  useEffect(() => {
    fetchData();
    const handleBotChange = () => fetchData();
    window.addEventListener('botChanged', handleBotChange);
    return () => window.removeEventListener('botChanged', handleBotChange);
  }, []);

  const fetchData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let botIdFromUrl = urlParams.get('botId');
    let botId;

    if (botIdFromUrl) {
      // Se veio via URL (redirecionamento de criação), limpamos a URL
      // para que a barra lateral possa assumir o controle da troca.
      window.history.replaceState({}, '', window.location.pathname);
      localStorage.setItem('selected_bot_id', botIdFromUrl);
      botId = botIdFromUrl;
      // Notifica o layout para atualizar o nome do bot selecionado no menu
      window.dispatchEvent(new CustomEvent('botChanged', { detail: botIdFromUrl }));
    } else {
      botId = localStorage.getItem('selected_bot_id');
    }
    
    if (!botId) return;
    
    setLoading(true);
    try {
      const [confRes, planRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/config?id=${botId}`),
        axios.get(`http://localhost:5000/api/plans?botId=${botId}`)
      ]);
      if (confRes.data) setConfig(confRes.data);
      setPlans(planRes.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const botId = localStorage.getItem('selected_bot_id');
    if (!botId) return alert('Selecione um bot primeiro.');
    try {
      await axios.post('http://localhost:5000/api/config', { ...config, id: botId });
      alert('✅ Configurações salvas e bot reiniciado com sucesso!');
      window.dispatchEvent(new CustomEvent('botChanged', { detail: botId }));
    } catch (e) { alert('❌ Erro ao salvar configurações.'); }
  };

  if (loading) return <div className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Lendo Configurações Core...</div>

  return (
    <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-700">
      <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl p-14 rounded-[48px] border border-white/5 space-y-12 shadow-3xl min-h-[800px] relative">
        
        {/* 1. Header Bot Info */}
        <div className="space-y-1">
          <h1 className="text-[32px] font-black text-white tracking-tight">{config.botUsername} ID: {config.botExternalId}</h1>
          <p className="text-slate-500 text-xs font-bold leading-none">Criado em: {new Date(config.createdAt || Date.now()).toLocaleDateString('pt-BR')} {new Date(config.createdAt || Date.now()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        {/* 2. Action Toolbar */}
        <div className="flex flex-wrap gap-4">
           {[
             { label: 'Perfil Bot', icon: <Bot size={16}/> },
             { label: '{ } Variáveis', icon: <Code2 size={16}/> },
             { label: 'Share Key', icon: <Share2 size={16}/> },
             { label: 'Config Key', icon: <Download size={16}/> }
           ].map((btn, idx) => (
             <button key={idx} className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-[18px] flex items-center gap-3 text-xs font-bold text-slate-400 border border-white/5 transition-all">
                {btn.icon}
                {btn.label}
             </button>
           ))}
        </div>

        {/* 3. Navigation Tabs */}
        <div className="flex flex-wrap gap-x-10 gap-y-4 border-b border-white/5 pb-4 ml-2">
           {[
             { id: 'editar', label: 'Editar Bot', icon: <Settings2 size={14}/> },
             { id: 'downsell', label: 'Downsell', icon: <Download size={14}/> },
             { id: 'upsell', label: 'Upsell', icon: <Upload size={14}/> },
             { id: 'venda', label: 'Codigo de Venda', icon: <FileText size={14}/> },
             { id: 'aprovacao', label: 'Aprovação Automática', icon: <Zap size={14}/> },
             { id: 'leads', label: 'Captação de Leads', icon: <UserPlus size={14}/> }
           ].map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
             >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && <div className="absolute -bottom-[18px] left-0 right-0 h-1 bg-white rounded-full"></div>}
             </button>
           ))}
        </div>

        <button className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] hover:text-slate-500 transition-colors ml-2">
           <Globe size={12} /> Webhook
        </button>

        {/* 4. Form Content */}
        <div className="space-y-12 max-w-6xl">
           
           {activeTab === 'editar' && (
             <div className="space-y-10 animate-in slide-in-from-left-2 duration-500">
                
                {/* Toggles */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between bg-[#111] p-6 rounded-2xl border border-white/5 group">
                      <span className="text-sm font-bold text-slate-100 italic transition-colors group-hover:text-white">Proteção Anti-Clonagem:</span>
                      <Toggle checked={config.antiClone} onChange={() => setConfig({...config, antiClone: !config.antiClone})} />
                   </div>
                   <div className="flex items-center justify-between bg-[#111] p-6 rounded-2xl border border-white/5 group">
                      <span className="text-sm font-bold text-slate-100 italic transition-colors group-hover:text-white">Iniciar em Qualquer Texto:</span>
                      <Toggle checked={config.startOnAnyText} onChange={() => setConfig({...config, startOnAnyText: !config.startOnAnyText})} />
                   </div>
                </div>

                {/* Main Inputs */}
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Username:</label>
                      <input 
                        className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm font-bold text-white shadow-inner outline-none focus:border-white/10"
                        value={config.botUsername}
                        onChange={e => setConfig({...config, botUsername: e.target.value})}
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Token:</label>
                      <div className="relative">
                        <input 
                          type="password"
                          className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm font-bold text-white shadow-inner outline-none pr-14"
                          value={config.botToken}
                          onChange={e => setConfig({...config, botToken: e.target.value})}
                        />
                        <Edit2 size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 cursor-pointer hover:text-white transition-colors" />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Suporte Bot:</label>
                      <input 
                        placeholder="Insira o username ou link do seu suporte."
                        className="w-full bg-[#111] border border-white/5 rounded-2xl p-5 text-sm font-bold text-slate-500 shadow-inner outline-none"
                        value={config.supportUsername}
                        onChange={e => setConfig({...config, supportUsername: e.target.value})}
                      />
                   </div>
                </div>

                {/* Plan Sections */}
                <div className="space-y-12 pt-6">
                   <div className="space-y-6">
                      <h3 className="text-2xl font-black text-white tracking-tight">Planos Assinaturas</h3>
                      <div className="bg-[#111] rounded-[32px] border border-white/5 overflow-hidden">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="border-b border-white/5">
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">NOME</th>
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">VALOR</th>
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">DURAÇÃO</th>
                               </tr>
                            </thead>
                            <tbody>
                               {plans.length === 0 ? (
                                 <tr>
                                    <td colSpan="3" className="px-10 py-12 text-center text-sm font-bold text-slate-700">Nenhum plano cadastrado.</td>
                                 </tr>
                               ) : plans.map(p => (
                                 <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-10 py-6 text-center text-xs font-black text-white uppercase">{p.name}</td>
                                    <td className="px-10 py-6 text-center text-xs font-black text-white">R$ {p.price.toFixed(2)}</td>
                                    <td className="px-10 py-6 text-center text-xs font-black text-white uppercase">{p.durationDays} Dias</td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                         <div className="p-6 flex justify-center border-t border-white/5">
                            <button type="button" onClick={()=>window.location.href='/plans'} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                               <Plus size={20} />
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-2xl font-black text-white tracking-tight">Planos Pacotes</h3>
                      <div className="bg-[#111] rounded-[32px] border border-white/5 overflow-hidden opacity-50">
                         <table className="w-full text-left border-collapse">
                            <thead>
                               <tr className="border-b border-white/5">
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">NOME</th>
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">VALOR</th>
                                  <th className="px-10 py-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center">ENTREGÁVEL</th>
                               </tr>
                            </thead>
                            <tbody>
                               <tr>
                                  <td colSpan="3" className="px-10 py-12 text-center text-sm font-bold text-slate-800 italic">Nenhum pacote cadastrado.</td>
                               </tr>
                            </tbody>
                         </table>
                         <div className="p-6 flex justify-center border-t border-white/5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-800">
                               <Plus size={20} />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Additional Info / Footer text */}
                <div className="space-y-6 pt-10">
                   <p className="text-sm font-bold text-slate-500 leading-relaxed">
                      Os bots que apresentarem inatividade, foram deletados do Telegram ou tiveram o token alterado serão excluídos automaticamente. Se tiver algum problema, não hesite em chamar nosso suporte <span className="text-white hover:underline cursor-pointer">@ApexVips_Suporte</span> 🤝
                   </p>
                </div>

             </div>
           )}

           {/* Keep current Downsell/Upsell components for those tabs but styled better if needed */}
           {(activeTab === 'downsell' || activeTab === 'upsell') && (
              <div className="space-y-8 animate-in fade-in duration-500">
                 <div className="bg-[#111] p-10 rounded-[40px] border border-white/5 space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-8">
                       <div className="flex items-center gap-4">
                          <Zap className={activeTab === 'upsell' ? 'text-teal-500' : 'text-blue-500'} />
                          <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{activeTab} Recovery Logic</h3>
                       </div>
                       <Toggle 
                          checked={activeTab === 'upsell' ? config.upsellEnabled : config.downsellEnabled} 
                          onChange={() => activeTab === 'upsell' 
                            ? setConfig({...config, upsellEnabled: !config.upsellEnabled}) 
                            : setConfig({...config, downsellEnabled: !config.downsellEnabled})
                          } 
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Mensagem de {activeTab}:</label>
                       <textarea 
                         className="w-full p-8 bg-black border border-white/5 rounded-[32px] outline-none focus:border-white/10 transition-all text-sm font-medium h-64 resize-none leading-relaxed text-slate-400" 
                         value={activeTab === 'upsell' ? config.upsellMessage : config.downsellMessage} 
                         onChange={e => activeTab === 'upsell' 
                           ? setConfig({...config, upsellMessage: e.target.value}) 
                           : setConfig({...config, downsellMessage: e.target.value})
                         } 
                       />
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* 5. Floating Save Button (Matching Screenshot Position) */}
        <div className="sticky bottom-0 left-0 right-0 flex justify-end pt-8 pr-10 pointer-events-none">
           <button 
             onClick={handleSave}
             className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-12 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_10px_40px_rgba(34,197,94,0.3)] pointer-events-auto"
           >
             Salvar Alterações
           </button>
        </div>

      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button 
      type="button" 
      onClick={onChange}
      className={`w-14 h-7 rounded-full transition-all relative px-1 flex items-center ${checked ? 'bg-white' : 'bg-slate-800'}`}
    >
       <div className={`w-5 h-5 rounded-full transition-all ${checked ? 'translate-x-[26px] bg-black' : 'translate-x-0 bg-slate-500'}`}></div>
    </button>
  );
}
