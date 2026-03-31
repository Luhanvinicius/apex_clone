"use client"
import { useState } from 'react';
import axios from 'axios';

export default function CreateBotPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateBot = async (e) => {
    if (e) e.preventDefault();
    if (!token) return alert('Por favor, insira o Token do Bot.');
    
    setLoading(true);
    try {
      const res = await axios.post('/api/config', { 
        botToken: token
      });
      
      const newBotId = res.data.id;
      // Force immediate local storage update
      localStorage.setItem('selected_bot_id', newBotId);
      
      // Notify components about the new bot
      window.dispatchEvent(new CustomEvent('botChanged', { detail: newBotId }));
      
      alert('✅ Bot instanciado com sucesso!');
      window.location.href = `/settings?botId=${newBotId}`;
    } catch (e) {
      const errorMessage = e?.response?.data?.error || 'Erro ao criar bot. Verifique o token informado.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-10 pt-1 animate-in fade-in duration-500">
      <div className="w-full rounded-[18px] border border-white/10 bg-[#1f2023] shadow-[0_8px_35px_rgba(0,0,0,0.35)] px-5 md:px-6 py-6">
        <h1 className="text-[2.2rem] md:text-[2.45rem] leading-none font-bold text-white">Criar Bot no Telegram</h1>

        <form onSubmit={handleCreateBot} className="mt-5 space-y-5">
          <div className="space-y-2">
            <label className="text-[0.95rem] font-semibold text-white">Token do Bot:</label>
            <input
              className="w-full h-[52px] rounded-[12px] border border-[#a3a834] bg-[#17191d] px-4 text-[1rem] font-medium text-white outline-none focus:border-[#b7be44]"
              placeholder=""
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="h-[40px] px-5 bg-transparent border border-white/20 rounded-[10px] text-[0.92rem] font-semibold text-white hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[40px] px-5 bg-transparent border border-white/20 rounded-[10px] text-[0.92rem] font-semibold text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
              {loading ? 'Sincronizando...' : 'Criar Bot'}
            </button>
          </div>
        </form>

        <div className="mt-4 space-y-3">
          <p className="text-[0.95rem] text-white/60 font-semibold leading-relaxed">
            Os bots que apresentarem inatividade, foram deletados do Telegram ou tiveram o token alterado serão excluídos automaticamente.
            Se tiver algum problema, não hesite em chamar nosso suporte!{' '}
            <span className="text-white hover:underline cursor-pointer">@ApexVips_Suporte</span> 🤝
          </p>
          <a
            href="https://t.me/BotFather"
            target="_blank"
            rel="noreferrer"
            className="inline-block text-[0.95rem] font-semibold text-white underline decoration-white/40 hover:decoration-white transition-all"
          >
            Clique aqui para acessar o tutorial de como criar um bot no Telegram.
          </a>
        </div>
      </div>
    </div>
  );
}
