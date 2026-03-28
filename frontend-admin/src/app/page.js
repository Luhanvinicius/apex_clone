"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, TrendingUp, Wallet, Clock, Percent, Activity, 
  ChevronRight, Calendar, Info
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentBot, setCurrentBot] = useState(null);

  useEffect(() => {
    fetchStats();
    
    const handleBotChange = () => fetchStats();
    window.addEventListener('botChanged', handleBotChange);
    return () => window.removeEventListener('botChanged', handleBotChange);
  }, []);

  const fetchStats = async () => {
    const botId = localStorage.getItem('selected_bot_id');
    if (!botId) return;
    try {
      const [statsRes, botRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/stats?botId=${botId}`),
        axios.get(`http://localhost:5000/api/config?id=${botId}`)
      ]);
      setStats(statsRes.data);
      setCurrentBot(botRes.data);
      setLoading(false);
    } catch (e) { console.error(e); }
  };

  if (loading || !stats) return <div className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Sincronizando Métricas Apex...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-10">
      
      {/* 1. Ranking High Banner */}
      <div className="relative bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 overflow-hidden">
         <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
            <div className="space-y-2 text-center md:text-left">
               <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                 NO ÁPICE DO RANKING,<br/> OS MELHORES GANHAM
               </h1>
               <p className="text-slate-500 text-sm font-bold">Disputa em tempo real pelo topo do faturamento.</p>
            </div>
            
            <div className="flex items-end gap-6 h-32">
               {/* Podium visualization */}
               <div className="flex flex-col items-center group">
                  <p className="text-[10px] font-black text-slate-400 mb-1">R$ 7.500</p>
                  <div className="w-16 h-12 bg-slate-800/50 rounded-t-xl flex items-center justify-center border-t border-x border-white/10 group-hover:bg-slate-700/50 transition-all">
                     <span className="text-xs font-black text-white italic">2º</span>
                  </div>
               </div>
               <div className="flex flex-col items-center group">
                  <p className="text-[10px] font-black text-white mb-1">R$ 15.000</p>
                  <div className="w-20 h-20 bg-gradient-to-t from-blue-900/40 to-blue-600/40 rounded-t-xl flex items-center justify-center border-t border-x border-blue-500/20 group-hover:scale-105 transition-all">
                     <span className="text-lg font-black text-white italic">1º</span>
                  </div>
               </div>
               <div className="flex flex-col items-center group">
                  <p className="text-[10px] font-black text-slate-500 mb-1">R$ 3.000</p>
                  <div className="w-16 h-8 bg-slate-900/50 rounded-t-xl flex items-center justify-center border-t border-x border-white/5 group-hover:bg-slate-800/50 transition-all">
                     <span className="text-xs font-black text-slate-400 italic">3º</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none"></div>
      </div>

      {/* 2. Bot Selector Sub Header */}
      <div className="flex items-center gap-6 px-4">
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Visualizar todos os bots</span>
            <div className="w-12 h-6 bg-[#1a1c24] rounded-full p-1 cursor-pointer">
               <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
            </div>
         </div>
         <div className="bg-[#111] px-6 py-2.5 rounded-2xl border border-white/5 text-[10px] font-bold text-slate-400">
            Visualizando métricas de: <span className="text-white italic ml-1">{currentBot?.botUsername || 'Carregando...'}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
         {/* Main Stats Column (left 3/4) */}
         <div className="xl:col-span-3 space-y-8">
            
            {/* Top Stats: Hoje & Mês */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-[#111111] p-10 rounded-[40px] border border-white/5 space-y-1 relative group overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 text-slate-400">
                     <Calendar size={20} />
                     <span className="text-xl font-bold text-white tracking-tight">Hoje</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vendas: {stats.sales.today}</p>
                  <p className="text-5xl font-black text-white tracking-tighter">R$ {parseFloat(stats.sales.revenueToday).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
               </div>
               <div className="bg-[#111111] p-10 rounded-[40px] border border-white/5 space-y-1 relative group overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 text-slate-400">
                     <Activity size={20} />
                     <span className="text-xl font-bold text-white tracking-tight">Mês</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vendas: {stats.sales.month}</p>
                  <p className="text-5xl font-black text-white tracking-tighter">R$ {parseFloat(stats.sales.revenueMonth).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
               </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-[#111111] p-10 rounded-[40px] border border-white/5">
                <div className="flex justify-between items-center mb-10">
                   <h2 className="text-xl font-black text-white tracking-tight">Histórico de Vendas</h2>
                   <div className="flex gap-2">
                      <button className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase">7D</button>
                      <button className="bg-white/5 text-slate-500 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10 transition-colors">30D</button>
                   </div>
                </div>
                
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.history}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom 4 Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <PerformanceCard icon={<Users size={16}/>} title="Usuários" label="CONVERSÃO DE USUÁRIO" stats={stats.conversion.user} />
               <PerformanceCard icon={<Percent size={16}/>} title="Pagamentos" label="CONVERSÃO DE PAGAMENTO" stats={stats.conversion.payment} isPercent />
               <PerformanceCard icon={<Clock size={16}/>} title="Tempo" label="TEMPO MÉDIO" stats={stats.conversion.avgTime} isTime />
               <PerformanceCard icon={<Wallet size={16}/>} title="Ticket" label="TICKET MÉDIO" stats={stats.conversion.ticket} isPrice />
            </div>

         </div>

         {/* Right Column (Sidebar) */}
         <div className="space-y-8">
            {/* Usuários Card */}
            <div className="bg-[#111111] p-10 rounded-[40px] border border-white/5 space-y-8">
               <div className="flex items-center gap-3">
                  <Users size={20} className="text-slate-500" />
                  <h3 className="text-lg font-bold text-white tracking-tight">Usuários</h3>
               </div>
               <div className="space-y-5">
                  <UserStatLine label="Hoje" value={stats.users.today} />
                  <UserStatLine label="Mês" value={stats.users.month} />
                  <UserStatLine label="Ativos" value={stats.users.active} active />
                  <UserStatLine label="Totais" value={stats.users.total} />
                  <UserStatLine label="Bloqueados" value={stats.users.blocked} />
                  <UserStatLine label="Assinaturas" value={stats.users.subscriptions} />
               </div>
            </div>

            {/* Log de Atividade Card */}
            <div className="bg-[#111111] p-10 rounded-[40px] border border-white/5 flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
                   <Activity size={32} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white tracking-tight">Log de Atividade</h3>
                   <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">Nenhuma atividade ainda</p>
                </div>
            </div>
         </div>

      </div>
    </div>
  );
}

function UserStatLine({ label, value, active }) {
  return (
    <div className="flex justify-between items-center group">
       <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-slate-800'}`}></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">{label}</span>
       </div>
       <span className="text-sm font-black text-white group-hover:scale-110 transition-transform origin-right">{value}</span>
    </div>
  );
}

function PerformanceCard({ icon, title, label, stats, isPercent, isTime, isPrice }) {
  const formatVal = (v) => {
    if (isPrice) return `R$ ${parseFloat(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (isTime) return `${v}s`;
    return `${v}%`;
  };

  return (
    <div className="bg-[#111111] p-8 rounded-[32px] border border-white/5 space-y-6">
       <div className="flex items-center gap-3 border-b border-white/5 pb-4 text-slate-400">
          {icon}
          <h4 className="text-xs font-bold text-white tracking-tight truncate">{title}</h4>
       </div>
       <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">{label}</p>
       
       <div className="space-y-4">
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hoje</span>
             <span className="text-xs font-black text-white">{formatVal(stats.today)}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mês</span>
             <span className="text-xs font-black text-white">{formatVal(stats.month)}</span>
          </div>
          <div className="flex justify-between items-center">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</span>
             <span className="text-xs font-black text-white">{formatVal(stats.total)}</span>
          </div>
       </div>
    </div>
  );
}
