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
      const res = await axios.post('http://localhost:5000/api/config', { 
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
      alert('❌ Erro ao criar bot. Verifique o Token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pt-10 animate-in fade-in duration-700">
      <div className="bg-[#2a2a2a] p-12 rounded-[20px] space-y-8">
        
        <h1 className="text-[44px] font-black text-white leading-tight">Criar Bot no Telegram</h1>

        <form onSubmit={handleCreateBot} className="space-y-8">
           <div className="space-y-4">
              <label className="text-sm font-bold text-white ml-1">Token do Bot:</label>
              <input 
                className="w-full bg-[#1c1c1c] border-none rounded-2xl p-6 text-sm font-medium text-white outline-none"
                placeholder=""
                value={token}
                onChange={e => setToken(e.target.value)}
              />
           </div>

           <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => window.history.back()}
                className="px-8 py-4 bg-transparent border border-[#3a3a3a] rounded-xl text-xs font-black text-white hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-transparent border border-[#3a3a3a] rounded-xl text-xs font-black text-white hover:bg-white/5 transition-all disabled:opacity-50"
              >
                {loading ? 'Sincronizando...' : 'Criar Bot'}
              </button>
           </div>
        </form>

        <div className="space-y-4 pt-4">
           <p className="text-sm text-[#888] font-bold leading-relaxed italic">
              Os bots que apresentarem inatividade, foram deletados do Telegram ou tiveram o token alterado serão excluídos automaticamente. Se tiver algum problema, não hesite em chamar nosso suporte! <span className="text-white hover:underline cursor-pointer">@ApexVips_Suporte</span> 🤝
           </p>
           <a 
              href="https://t.me/BotFather" 
              target="_blank" 
              className="inline-block text-sm font-bold text-white underline decoration-[#444] hover:decoration-white transition-all"
           >
              Clique aqui para acessar o tutorial de como criar um bot no Telegram.
           </a>
        </div>

      </div>
    </div>
  );
}
