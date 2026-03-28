"use client"
import { useState } from 'react';
import { User, Shield, Edit2, Info, CreditCard, Mail, UserCircle } from 'lucide-react';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('config');

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight ml-2">Minha Conta</h1>
        </div>
        <div className="w-16 h-16 rounded-full bg-darkCard border border-darkBorder flex items-center justify-center text-slate-500 overflow-hidden shadow-2xl">
           <UserCircle size={40} className="text-slate-700" />
        </div>
      </div>

      {/* Tabs Apex Style */}
      <div className="flex gap-6 border-b border-darkBorder/50 mb-10 pl-2">
        {[
          { id: 'config', label: 'Configurações' },
          { id: 'sessions', label: 'Sessões (1/5)' },
          { id: 'accounts', label: 'Contas (1/5)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 text-sm font-bold tracking-tight transition-all relative ${
              activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {/* Taxa por Transação Card */}
        <section className="bg-darkCard/30 border border-darkBorder rounded-[32px] p-10 space-y-10 shadow-sm">
          <div className="flex items-center gap-5">
             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <CreditCard size={22} />
             </div>
             <h2 className="text-xl font-bold text-white tracking-tight">Taxa por Transação</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">VALOR FIXO</label>
                <div className="relative group">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                      $
                   </div>
                   <input 
                     readOnly
                     className="w-full bg-darkInput border border-darkBorder rounded-2xl py-5 pl-12 pr-6 text-sm font-bold text-slate-300 outline-none" 
                     value="R$ 0,75" 
                   />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">APLICAÇÃO</label>
                <div className="bg-darkInput/50 border border-darkBorder/50 rounded-2xl p-5 flex items-center gap-4 text-slate-400">
                   <Info size={18} className="text-slate-500 flex-shrink-0" />
                   <span className="text-xs font-semibold leading-relaxed">Taxa aplicada em cada transação aprovada</span>
                </div>
             </div>
          </div>
        </section>

        {/* Informações Pessoais Card */}
        <section className="bg-darkCard/30 border border-darkBorder rounded-[32px] p-10 space-y-10 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <User size={22} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Informações Pessoais</h2>
            </div>
            <button className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
               <Edit2 size={14} /> Editar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NOME DE EXIBIÇÃO</label>
                <div className="bg-darkInput border border-darkBorder rounded-2xl p-5 flex items-center gap-4">
                   <UserCircle size={18} className="text-slate-600" />
                   <span className="text-sm font-bold text-slate-300">luhan</span>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NOME COMPLETO</label>
                <div className="bg-darkInput border border-darkBorder rounded-2xl p-5 flex items-center gap-4">
                   <Shield size={18} className="text-slate-600" />
                   <span className="text-sm font-bold text-slate-300">Luhan Gonçalves Silva Gonçalves</span>
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">EMAIL</label>
                <div className="bg-darkInput border border-darkBorder rounded-2xl p-5 flex items-center gap-4">
                   <Mail size={18} className="text-slate-600" />
                   <span className="text-sm font-bold text-slate-300 truncate font-mono">luhan.goncalves@exemplo.com</span>
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
