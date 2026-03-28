"use client"
import { useState } from 'react';
import axios from 'axios';

export default function SetupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/register-initial', { username, password });
      alert('Administrador inicial criado com sucesso!');
      window.location.href = '/login';
    } catch (e) {
      alert('Falha ao configurar. O sistema já pode estar inicializado.');
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      
      <div className="w-full max-w-md bg-[#111111]/80 backdrop-blur-2xl p-12 rounded-[48px] border border-white/5 space-y-12 shadow-3xl relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        
        <div className="flex flex-col items-center gap-4 mb-4">
           <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center -rotate-6 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <span className="text-black font-black text-3xl tracking-tighter italic">A</span>
           </div>
           <div className="text-center">
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Apex Initialization</h1>
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mt-1">Configuração de Primeiro Acesso</p>
           </div>
        </div>

        <form onSubmit={handleSetup} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">USUÁRIO RAIZ (ROOT)</label>
              <input 
                type="text"
                placeholder="Ex: admin_root"
                className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl p-5 outline-none focus:border-white/10 transition-all text-sm font-medium text-white shadow-inner"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">SENHA MESTRE</label>
              <input 
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#1c1c1c] border border-white/5 rounded-2xl p-5 outline-none focus:border-white/10 transition-all text-sm font-medium text-white shadow-inner"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
           </div>

           <button 
             type="submit"
             disabled={loading}
             className="w-full bg-teal-600 text-white font-black py-5 rounded-2xl hover:bg-teal-500 transition-all shadow-xl text-xs uppercase tracking-[0.2em] active:scale-95 disabled:opacity-50"
           >
             {loading ? 'Inicializando...' : 'Concluir Configuração'}
           </button>
        </form>
      </div>
    </div>
  );
}
