"use client"
import { Headphones, MessageCircle, HelpCircle, FileText, ExternalLink, Send, ArrowUpRight, Zap, Info } from 'lucide-react';

export default function SupportPage() {
  const faqs = [
    { q: "Como configurar meu PIX Wiinpay?", a: "Acesse as configurações do bot e insira sua API Key de Produção." },
    { q: "Como alterar a mensagem de boas-vindas?", a: "Vá em 'Configurar Bot' > 'Comunicação' e edite o campo 'Mensagem de Boas-Vindas'." },
    { q: "Onde vejo os pagamentos pendentes?", a: "Na aba 'Pagamentos', todos os registros com status 'Aguardando' são cobranças geradas." },
    { q: "Como remover um usuário do VIP?", a: "Acesse 'Usuários', busque pelo nome e clique no ícone de exclusão." },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 ml-2">
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight">Painel de Assistência</h1>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Central de ajuda e suporte técnico especializado</p>
        </div>
        <div className="flex bg-blue-600/10 border border-blue-500/20 px-6 py-2.5 rounded-2xl text-[10px] font-black text-blue-500 flex items-center gap-3">
           <Zap size={14} className="animate-pulse" />
           SLA DE ATENDIMENTO: 1H
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         <div className="bg-darkCard/20 p-8 rounded-[40px] border border-darkBorder hover:bg-darkCard/40 transition-all group relative overflow-hidden flex flex-col items-center text-center justify-between">
            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 mx-auto mb-6 group-hover:scale-110 transition-transform">
               <MessageCircle size={32} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white tracking-tight italic uppercase mb-2">Canal Direto</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Fale agora com um analista via Telegram</p>
            </div>
            <button className="w-full mt-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3">
               ABRIR CHAT <Send size={14} />
            </button>
            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
         </div>

         <div className="bg-darkCard/20 p-8 rounded-[40px] border border-darkBorder hover:bg-darkCard/40 transition-all group relative overflow-hidden flex flex-col items-center text-center justify-between">
            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-teal-500 mx-auto mb-6 group-hover:scale-110 transition-transform">
               <FileText size={32} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white tracking-tight italic uppercase mb-2">Wiki & Docs</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Documentação completa da infraestrutura Cloud</p>
            </div>
            <button className="w-full mt-8 py-4 bg-darkInput border border-darkBorder text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-white/10 transition-all flex items-center justify-center gap-3">
               DOCUMENTAÇÃO <ExternalLink size={14} />
            </button>
         </div>

         <div className="bg-darkCard/20 p-8 rounded-[40px] border border-darkBorder hover:bg-darkCard/40 transition-all group relative overflow-hidden flex flex-col items-center text-center justify-between">
            <div className="w-16 h-16 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
               <HelpCircle size={32} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white tracking-tight italic uppercase mb-2">Tutoriais</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Vídeo-aulas sobre configuração e escala</p>
            </div>
            <button className="w-full mt-8 py-4 bg-darkInput border border-darkBorder text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-white/10 transition-all flex items-center justify-center gap-3">
               ASSISTIR <ArrowUpRight size={14} />
            </button>
         </div>
      </div>

      <div className="bg-darkCard/20 rounded-[48px] border border-darkBorder p-12 space-y-10 relative overflow-hidden">
         <div className="flex items-center gap-4 border-b border-darkBorder pb-8 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
               <HelpCircle size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Perguntas Frequentes (FAQ)</h2>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {faqs.map((faq, i) => (
               <div key={i} className="space-y-3 group cursor-pointer">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest border-l-2 border-blue-600 pl-4 group-hover:border-blue-400 transition-colors">{faq.q}</h3>
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed pl-5 tracking-tight group-hover:text-slate-400 transition-colors">{faq.a}</p>
               </div>
            ))}
         </div>
         
         <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none rotate-12">
            <Headphones size={200} />
         </div>
      </div>
      
      <div className="bg-darkInput/50 border border-darkBorder rounded-[40px] p-8 flex items-center gap-6 group hover:border-blue-500/10 transition-all">
          <div className="w-14 h-14 rounded-full bg-darkCard border border-darkBorder flex items-center justify-center text-slate-700 group-hover:text-blue-500 transition-colors shadow-2xl flex-shrink-0">
            <Info size={28} />
          </div>
          <p className="text-[11px] font-bold text-slate-600 leading-relaxed max-w-2xl italic">
            "Sua rede está operando com alta fidelidade. O suporte técnico está disponível 24/7 para clientes do plano Evolution. Se encontrar algum bug, reporte imediatamente para nossa central de engenharia."
          </p>
      </div>
    </div>
  );
}
