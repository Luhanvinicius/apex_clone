"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Shield, Trash2, ExternalLink, Filter, UserCircle } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const removeUser = async (id) => {
    if(confirm('Confirmar exclusão permanente?')) {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    }
  }

  const filteredUsers = users.filter(u => {
    const name = `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || u.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 ml-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gestão de Clientes</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Auditando base VIP em tempo real</p>
        </div>
        
        <div className="flex bg-darkCard/50 border border-darkBorder rounded-2xl overflow-hidden p-1.5 shadow-xl">
           {['all', 'active', 'expired'].map((f) => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl ${filter === f ? 'bg-white text-black' : 'hover:bg-white/5 text-slate-500'}`}
             >
               {f === 'all' ? 'Ver Todos' : f === 'active' ? 'Ativos' : 'Expirados'}
             </button>
           ))}
        </div>
      </div>

      <div className="relative group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors" size={20} />
         <input 
           type="text" 
           placeholder="Pesquisar por nome, @username ou ID único..."
           className="w-full bg-darkInput border border-darkBorder rounded-[28px] py-6 pl-16 pr-6 outline-none focus:border-white/20 transition-all text-sm font-bold placeholder:text-slate-700 shadow-inner"
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="bg-darkCard/20 rounded-[40px] border border-darkBorder overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-darkBorder">
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">IDENTIDADE</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">SITUAÇÃO</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">CONTRATO</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">VENCIMENTO</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-darkBorder/40">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-darkInput border border-darkBorder flex items-center justify-center font-black text-slate-600 group-hover:text-white transition-colors">
                        {u.firstName[0]}
                      </div>
                      <div>
                        <p className="font-black text-white text-sm tracking-tight">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">@{u.username || 'S/ USER'}</p>
                      </div>
                   </div>
                </td>
                <td className="p-8">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter rounded-full ${u.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-green-400' : 'bg-red-500'}`}></div>
                    {u.status === 'active' ? 'Liberado' : 'Bloqueado'}
                  </span>
                </td>
                <td className="p-8 text-sm font-black text-slate-400">
                  {u.plan ? (
                     <div className="flex items-center gap-2">
                        <Shield size={14} className="text-blue-500" />
                        {u.plan.name}
                     </div>
                  ) : <span className="text-slate-700 italic">SEM PLANO</span>}
                </td>
                <td className="p-8 text-xs font-black text-slate-500 uppercase tracking-tighter">
                  {u.subscriptionEnd ? new Date(u.subscriptionEnd).toLocaleDateString('pt-BR') : u.status === 'active' ? 'VITALÍCIO' : '---'}
                </td>
                <td className="p-8 text-right">
                   <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition" title="Ver Detalhes">
                        <ExternalLink size={18} />
                      </button>
                      <button onClick={() => removeUser(u.id)} className="w-10 h-10 flex items-center justify-center bg-red-500/5 hover:bg-red-500 text-slate-500 hover:text-white rounded-xl transition" title="Excluir">
                        <Trash2 size={18} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="p-32 text-center text-slate-700 font-black uppercase tracking-[0.3em] italic text-xs">Sem registros correspondentes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


