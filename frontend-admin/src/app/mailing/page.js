"use client"

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

const MAILING_STORAGE_KEY = 'mailing_history_v1';

export default function MailingPage() {
  const [loading, setLoading] = useState(true);
  const [botName, setBotName] = useState('Vipdamicabot');
  const [mailings, setMailings] = useState([]);

  useEffect(() => {
    fetchData();
    const handleBotChange = () => fetchData();
    window.addEventListener('botChanged', handleBotChange);
    return () => window.removeEventListener('botChanged', handleBotChange);
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const selectedBotId = localStorage.getItem('selected_bot_id');

      const configResponse = await axios.get('/api/config');
      const configList = Array.isArray(configResponse.data)
        ? configResponse.data
        : (configResponse.data ? [configResponse.data] : []);
      const selectedConfig = selectedBotId
        ? configList.find((item) => String(item.id) === String(selectedBotId))
        : null;
      const targetConfig = selectedConfig || configList[0];
      if (targetConfig?.botUsername) {
        setBotName(targetConfig.botUsername);
      }
    } catch (error) {
      console.error(error);
    }

    try {
      const raw = localStorage.getItem(MAILING_STORAGE_KEY);
      if (!raw) {
        setMailings([]);
        return;
      }
      const parsed = JSON.parse(raw);
      setMailings(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
      console.error(error);
      setMailings([]);
    } finally {
      setLoading(false);
    }
  }

  const totalLabel = useMemo(() => `${mailings.length} no total`, [mailings.length]);

  if (loading) {
    return (
      <div className="w-full pb-10 pt-1">
        <div className="rounded-[18px] border border-white/10 bg-[#1f2023] px-6 py-8 text-center text-white/60">
          Carregando mailing...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 pt-1 animate-in fade-in duration-500">
      <section className="w-full rounded-[18px] border border-white/10 bg-[#1f2023] shadow-[0_8px_30px_rgba(0,0,0,0.32)] px-5 md:px-6 py-5">
        <h1 className="text-[1.95rem] md:text-[2.2rem] leading-none font-bold text-white tracking-tight">
          Mailing Bot: {botName}
        </h1>

        <div className="mt-4 rounded-[12px] border border-amber-500/50 bg-[#4a3518]/60 px-4 py-3 flex items-center gap-2.5">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <p className="text-[0.86rem] md:text-[0.9rem] font-semibold text-amber-400 leading-[1.35]">
            Atenção: cada envio de mailing é único e pode ser realizado novamente a cada 3 horas para garantir qualidade e eficiência.
          </p>
        </div>

        <h2 className="mt-4 text-[1.7rem] md:text-[1.9rem] leading-none font-bold text-white/80">
          Mailings Enviados ({totalLabel})
        </h2>

        {mailings.length === 0 ? (
          <p className="mt-4 text-[1.12rem] md:text-[1.25rem] leading-none text-white/85">
            Não há mailings enviados ainda.
          </p>
        ) : (
          <div className="mt-5 space-y-2">
            {mailings.map((item, index) => (
              <div
                key={item.id || index}
                className="rounded-[10px] border border-white/10 bg-white/[0.02] px-4 py-3 text-[0.95rem]"
              >
                <p className="text-white font-semibold">{item.title || 'Mailing enviado'}</p>
                <p className="text-white/60 mt-1">
                  Público: {item.audience || 'Todos'} • {item.sentAt || '--/--/---- --:--'}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="h-px bg-white/15 mt-4" />

        <div className="mt-4 flex justify-end">
          <Link
            href="/mailing/new"
            className="h-[46px] px-6 rounded-[10px] border border-white/25 text-white text-[0.95rem] font-semibold hover:bg-white/5 transition inline-flex items-center"
          >
            Criar novo mailing
          </Link>
        </div>
      </section>
    </div>
  );
}
