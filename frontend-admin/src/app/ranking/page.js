"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Star, ThumbsUp, ArrowUpRight, UserCircle } from 'lucide-react';

const TopThree = ({ user, rank, color }) => {
  const name = user?.user ? `${user.user.firstName} ${user.user.lastName || ''}` : 'Membro VIP';
  const revenue = parseFloat(user?.totalRevenue || 0);

  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="relative animate-bounce duration-[2000ms]">
        <div className={`w-28 h-28 rounded-full bg-darkCard border-4 ${color} flex items-center justify-center overflow-hidden shadow-[0_0_50px_-12px] ${color.replace('border-', 'shadow-')}`}>
          <img src={`https://ui-avatars.com/api/?name=${name}&background=111&color=fff&size=128`} alt={name} />
        </div>
        <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full ${color.replace('border-', 'bg-')} border-4 border-black flex items-center justify-center font-black text-black text-sm`}>
          {rank}
        </div>
      </div>
      <div className="text-center">
        <p className="font-black text-white text-lg tracking-tight uppercase italic truncate max-w-[150px]">{name}</p>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-1 text-green-500">R$ {revenue.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default function RankingPage() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/ranking')
      .then(res => {
        setTopUsers(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) return <div className="p-20 text-center text-slate-700 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Lendo Ledger Global...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000">
      <div className="flex flex-col items-center text-center space-y-4">
         <div className="w-16 h-16 rounded-[24px] bg-yellow-600/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-2xl animate-pulse">
            <Trophy size={32} />
         </div>
         <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Champions Ranking</h1>
         <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Elite dos maiores faturamentos da rede</p>
      </div>

      <div className="flex justify-center items-end gap-12 py-10">
         <div className="order-2 scale-110 -translate-y-8">
            <TopThree user={topUsers[0]} rank={1} color="border-yellow-500" />
         </div>
         <div className="order-1">
            <TopThree user={topUsers[1]} rank={2} color="border-slate-400" />
         </div>
         <div className="order-3">
            <TopThree user={topUsers[2]} rank={3} color="border-orange-700" />
         </div>
      </div>

      <div className="bg-darkCard/20 rounded-[48px] border border-darkBorder overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
           <Trophy size={200} />
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-darkBorder">
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">POSIÇÃO</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">MEMBRO</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">VENDAS</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">FATURAMENTO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-darkBorder/40">
            {topUsers.slice(3).map((u, i) => (
              <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                <td className="p-8">
                   <div className="w-10 h-10 rounded-xl bg-darkInput border border-darkBorder flex items-center justify-center font-black text-slate-500 group-hover:text-white group-hover:bg-white/5 transition-all">
                      #{i + 4}
                   </div>
                </td>
                <td className="p-8">
                   <div className="flex items-center gap-4">
                      <UserCircle size={20} className="text-slate-600" />
                      <span className="font-black text-sm text-slate-300 uppercase italic tracking-tight">
                         {u.user.firstName} {u.user.lastName || ''}
                      </span>
                   </div>
                </td>
                <td className="p-8 text-center">
                   <span className="text-sm font-black text-slate-500">{u.totalSales}</span>
                </td>
                <td className="p-8 text-right">
                   <div className="flex items-center justify-end gap-3">
                      <span className="text-sm font-black text-white text-green-500">R$ {parseFloat(u.totalRevenue).toFixed(2)}</span>
                      <ArrowUpRight size={14} className="text-slate-700" />
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

