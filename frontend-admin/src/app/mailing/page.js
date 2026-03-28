"use client"
import { useState } from 'react';
import axios from 'axios';
import { Send, Users, MessageSquare, AlertCircle, CheckCircle2, Zap, Info } from 'lucide-react';

export default function MailingPage() {
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const sendBroadcast = async (e) => {
    if (e) e.preventDefault();
    if (!message) return alert('Digite uma mensagem');
    if (!confirm('Deseja realmente enviar esta mensagem para o público selecionado?')) return;

    setLoading(true);
    setStatus('sending');
    try {
      const res = await axios.post('/api/broadcast', { message, audience });
      setStatus('success');
      setMessage('');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl">
           <Zap size={32} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">Broadcast Center</h1>
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Comunicação em massa de alta performance</p>
      </div>

      <div className="bg-darkCard/30 border border-darkBorder rounded-[48px] p-10 space-y-10 shadow-3xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-darkBorder/50 pb-8">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                 <MessageSquare size={20} />
              </div>
              <div>
                 <h2 className="text-lg font-bold text-white tracking-tight">Compor Mensagem</h2>
                 <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Markdown habilitado p/ Telegram</p>
              </div>
           </div>
           
           <select 
             className="bg-darkInput px-4 py-2.5 rounded-xl border border-darkBorder text-[10px] font-black text-slate-300 uppercase tracking-widest outline-none focus:border-white/10 transition-all cursor-pointer shadow-xl"
             value={audience}
             onChange={e => setAudience(e.target.value)}
           >
             <option value="all">Público: Todos</option>
             <option value="active">Público: Ativos</option>
             <option value="expired">Público: Expirados</option>
           </select>
        </div>

        <div className="space-y-4">
           <textarea 
             className="w-full bg-darkInput border border-darkBorder rounded-[32px] p-8 text-sm font-semibold text-slate-300 outline-none focus:border-blue-500/30 transition-all h-64 resize-none leading-relaxed placeholder:text-slate-800"
             placeholder="Olá pessoal! Temos novidades no VIP... Use *negrito* ou _itálico_."
             value={message}
             onChange={e => setMessage(e.target.value)}
           />
           
           <div className="flex justify-between items-center px-4">
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                 {message.length} caracteres digitados
              </p>
              <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-600/20"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-600/40"></div>
                 <div className="w-2 h-2 rounded-full bg-blue-600/60 transition-all scale-110"></div>
              </div>
           </div>
        </div>

        <button 
          onClick={sendBroadcast}
          disabled={loading}
          className={`w-full py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-4 shadow-2xl ${
            loading 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
            : 'bg-white text-black hover:bg-slate-200 hover:scale-[1.02] active:scale-95'
          }`}
        >
          {loading ? (
            <>Sincronizando Cluster... <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div></>
          ) : (
            <><Send size={18} /> Disparar Agora</>
          )}
        </button>

        {status === 'success' && (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-top-2">
            <CheckCircle2 className="text-green-500" />
            <p className="text-sm font-black text-green-400 uppercase tracking-tight">Transmissão concluída com sucesso!</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-top-2">
            <AlertCircle className="text-red-500" />
            <p className="text-sm font-black text-red-500 uppercase tracking-tight">Falha crítica na fila de disparo.</p>
          </div>
        )}
      </div>
      
      <div className="mt-10 p-10 border border-darkBorder rounded-[48px] flex items-start gap-6 group hover:border-blue-500/20 transition-all">
          <div className="w-14 h-14 rounded-full bg-darkCard border border-darkBorder flex items-center justify-center text-slate-700 group-hover:text-blue-500 transition-colors flex-shrink-0 shadow-xl">
            <Info size={28} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-white uppercase tracking-tight">Regras de Segmentação</p>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed italic">
              "O broadcast enviará mensagens privadas diretamente pelo Bot. 
              Segmentar para 'Expirados' é ideal para campanhas de renovação e downsell agressivo. 
              Utilizar 'Ativos' para comunicados internos e atualizações da comunidade."
            </p>
          </div>
      </div>
    </div>
  );
}
