"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Activity, TrendingUp, PieChart, Users, Zap, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatisticCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-darkCard/20 p-8 rounded-[40px] border border-darkBorder hover:bg-darkCard/40 transition-all group relative overflow-hidden">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:${color} transition-colors`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
         {trend > 0 ? <TrendingUp size={12}/> : <ArrowDownRight size={12}/>}
         {Math.abs(trend)}%
      </div>
    </div>
    <div>
      <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{title}</h3>
      <p className="text-3xl font-black text-white group-hover:scale-105 transition-transform origin-left">{value}</p>
    </div>
  </div>
);

const CustomBar = ({ label, percentage, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
      <span>{label}</span>
      <span>{percentage}%</span>
    </div>
    <div className="w-full h-2 bg-darkInput rounded-full overflow-hidden border border-darkBorder">
       <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_-4px_current]`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Computando Intelligence...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 ml-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Intelligence Stats</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">SLA e Desempenho Operacional da rede</p>
        </div>
        <div className="flex items-center gap-3 bg-darkInput border border-darkBorder px-6 py-2.5 rounded-2xl text-[10px] font-black text-slate-400">
           <Calendar size={14} className="text-slate-600" />
           ÚLTIMOS 30 DIAS
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <StatisticCard title="Conversão Global" value={`${stats.funnel.conversion}%`} icon={<Zap size={24}/>} color="text-blue-500" trend={12.5} />
         <StatisticCard title="Faturamento Total" value={`R$ ${stats.totalRevenue.toLocaleString()}`} icon={<Activity size={24}/>} color="text-teal-500" trend={-4.2} />
         <StatisticCard title="Novos VIPs" value={`+${stats.funnel.approved}`} icon={<Users size={24}/>} color="text-blue-400" trend={24.1} />
         <StatisticCard title="Tickets Gerados" value={stats.funnel.checkouts} icon={<TrendingUp size={24}/>} color="text-green-500" trend={8.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-darkCard/20 border border-darkBorder rounded-[48px] p-10 space-y-10 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500">
                   <BarChart size={20} />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Funil de Conversão</h2>
             </div>
             <ArrowUpRight size={18} className="text-slate-700" />
          </div>

          <div className="space-y-8 mt-10">
             <CustomBar label="Checkouts Iniciados" percentage={100} color="bg-blue-600" />
             <CustomBar label="Conversão p/ Aprovado" percentage={parseFloat(stats.funnel.conversion)} color="bg-blue-500" />
             <CustomBar label="Retenção (Média)" percentage={15} color="bg-blue-400" />
          </div>
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-black to-black pointer-events-none"></div>
        </div>

        <div className="bg-darkCard/20 border border-darkBorder rounded-[48px] p-10 space-y-10 flex flex-col items-center text-center justify-between group h-full">
           <div className="w-full">
              <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-teal-500 mx-auto mb-6">
                <PieChart size={32} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">Público Alvo</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Distribuição Geográfica</p>
           </div>
           
           <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 pb-2 border-b border-darkBorder/40">
                 <span>Região</span>
                 <span>Percentual</span>
              </div>
              {[
                { r: 'Sudeste', p: 48, c: 'text-blue-500' },
                { r: 'Sul', p: 24, c: 'text-teal-500' },
                { r: 'Nordeste', p: 15, c: 'text-slate-400' },
                { r: 'Outros', p: 13, c: 'text-slate-600' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center px-2 hover:bg-white/[0.02] py-2 rounded-xl transition-colors">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.c.replace('text-', 'bg-')}`}></div>
                      <span className="text-[10px] font-black text-slate-300 tracking-tight">{item.r}</span>
                   </div>
                   <span className="text-[10px] font-black text-white">{item.p}%</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

