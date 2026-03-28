"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, CheckCircle2, Clock, XCircle, Copy, Wallet } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/api/payments');
      setPayments(res.data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyRef = (text) => {
    navigator.clipboard.writeText(text);
    alert('ID Transação Copiado!');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 ml-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Fluxo Financeiro</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Monitoramento de transações Pix Wiinpay</p>
        </div>
        <button onClick={fetchPayments} className="bg-white text-black px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl">
          <Clock size={14} /> SINCRONIZAR DADOS
        </button>
      </div>

      <div className="bg-darkCard/20 rounded-[40px] border border-darkBorder overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-darkBorder">
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">SESSÃO</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">IDENTIFICADOR</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ORIGEM</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">VALOR</th>
              <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-darkBorder/40">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="p-8">
                   <p className="text-xs font-black text-white uppercase tracking-tight">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</p>
                   <p className="text-[10px] text-slate-600 font-bold uppercase">{new Date(p.createdAt).toLocaleTimeString('pt-BR')}</p>
                </td>
                <td className="p-8">
                   <div className="flex items-center gap-3 font-mono text-[10px] bg-darkInput/50 w-fit px-3 py-1.5 rounded-xl border border-darkBorder group-hover:border-slate-700 transition-colors">
                      <span className="text-slate-500">{p.externalReference}</span>
                      <button onClick={() => copyRef(p.externalReference)} className="text-slate-700 hover:text-white transition">
                        <Copy size={12} />
                      </button>
                   </div>
                </td>
                <td className="p-8">
                   <div className="flex items-center gap-3 text-sm font-black text-slate-400">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Wallet size={14} className="text-slate-600" />
                      </div>
                      {p.user ? p.user.firstName : 'BOT SYSTEM'}
                   </div>
                </td>
                <td className="p-8 text-center">
                   <span className="text-sm font-black text-white">R$ {p.amount.toFixed(2)}</span>
                </td>
                <td className="p-8 text-right">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-tighter rounded-full ${p.status === 'approved' ? 'bg-green-500/10 text-green-400' : p.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {p.status === 'approved' ? <CheckCircle2 size={12}/> : p.status === 'rejected' ? <XCircle size={12}/> : <Clock size={12}/>}
                    {p.status === 'approved' ? 'Confirmado' : p.status === 'rejected' ? 'Recusado' : 'Aguardando'}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="p-32 text-center text-slate-700 font-black uppercase tracking-[0.3em] italic text-xs">Sem movimentações financeiras.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


