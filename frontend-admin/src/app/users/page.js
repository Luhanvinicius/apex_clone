"use client"

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const FILTER_OPTIONS = [
  { value: 'total', label: 'Total' },
  { value: 'active', label: 'Ativos' },
  { value: 'subscribers', label: 'Assinantes' },
  { value: 'expired', label: 'Expirados' },
  { value: 'blocked_bot', label: 'Bloquearam o bot' },
  { value: 'blocked_by_you', label: 'Bloqueados por você' }
];

function getUserFlags(user) {
  const status = String(user?.status || '').toLowerCase();
  const hasSubscription = Boolean(user?.planId || user?.plan);
  const blockedByBot = Boolean(
    user?.blockedBot ||
    user?.botBlocked ||
    user?.blocked_by_bot ||
    status === 'blocked_bot' ||
    status === 'blocked'
  );
  const blockedByYou = Boolean(
    user?.blockedByYou ||
    user?.userBlocked ||
    user?.blocked_by_you ||
    status === 'blocked_by_you'
  );

  return {
    active: status === 'active',
    expired: status === 'expired',
    subscribers: hasSubscription,
    blockedByBot,
    blockedByYou
  };
}

function matchStatusFilter(user, filter) {
  if (filter === 'total') return true;
  const flags = getUserFlags(user);
  if (filter === 'active') return flags.active;
  if (filter === 'subscribers') return flags.subscribers;
  if (filter === 'expired') return flags.expired;
  if (filter === 'blocked_bot') return flags.blockedByBot;
  if (filter === 'blocked_by_you') return flags.blockedByYou;
  return true;
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [botName, setBotName] = useState('Vipdamicabot');
  const [searchInput, setSearchInput] = useState('');
  const [statusInput, setStatusInput] = useState('total');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('total');

  useEffect(() => {
    fetchData();
    const handleBotChange = () => fetchData();
    window.addEventListener('botChanged', handleBotChange);
    return () => window.removeEventListener('botChanged', handleBotChange);
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const botId = localStorage.getItem('selected_bot_id');
      const [usersResponse, configResponse] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/config')
      ]);

      const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      setUsers(usersData);

      const configList = Array.isArray(configResponse.data)
        ? configResponse.data
        : (configResponse.data ? [configResponse.data] : []);
      const selectedConfig = botId
        ? configList.find((item) => String(item.id) === String(botId))
        : null;
      const targetConfig = selectedConfig || configList[0];
      if (targetConfig?.botUsername) setBotName(targetConfig.botUsername);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    setSearchTerm(searchInput.trim().toLowerCase());
    setStatusFilter(statusInput);
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const searchBase = `${fullName} ${user.username || ''} ${user.telegramId || ''}`.toLowerCase();
      const searchMatch = !searchTerm || searchBase.includes(searchTerm);
      const statusMatch = matchStatusFilter(user, statusFilter);
      return searchMatch && statusMatch;
    });
  }, [users, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const summary = users.reduce(
      (accumulator, user) => {
        const flags = getUserFlags(user);
        accumulator.total += 1;
        if (flags.active) accumulator.ativos += 1;
        if (flags.subscribers) accumulator.assinantes += 1;
        if (flags.expired) accumulator.expirados += 1;
        if (flags.blockedByBot) accumulator.bloquearamBot += 1;
        if (flags.blockedByYou) accumulator.bloqueadosVoce += 1;
        return accumulator;
      },
      {
        total: 0,
        ativos: 0,
        assinantes: 0,
        expirados: 0,
        bloquearamBot: 0,
        bloqueadosVoce: 0
      }
    );

    return {
      total: summary.total,
      ativos: summary.ativos,
      assinantes: summary.assinantes,
      expirados: summary.expirados,
      bloquearamBot: summary.bloquearamBot,
      bloqueadosVoce: summary.bloqueadosVoce
    };
  }, [users]);

  if (loading) {
    return (
      <div className="w-full pb-10 pt-1">
        <div className="rounded-[18px] border border-white/10 bg-[#1f2023] px-6 py-8 text-center text-white/60">
          Carregando usuários...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 pt-1 animate-in fade-in duration-500">
      <section className="w-full rounded-[18px] border border-white/10 bg-[#1f2023] shadow-[0_8px_35px_rgba(0,0,0,0.35)] px-5 md:px-6 py-6">
        <h1 className="text-[2.2rem] md:text-[2.5rem] leading-none font-bold text-white">
          Usuários Bot: {botName}
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mt-5">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Ativos', value: stats.ativos },
            { label: 'Assinantes', value: stats.assinantes },
            { label: 'Expirados', value: stats.expirados },
            { label: 'Bloquearam o bot', value: stats.bloquearamBot },
            { label: 'Bloqueados por você', value: stats.bloqueadosVoce }
          ].map((item) => (
            <div key={item.label} className="h-[108px] rounded-[14px] border border-white/12 bg-[#202225]/60 px-4 py-3 flex flex-col items-center justify-center">
              <p className="text-[1rem] font-semibold text-white/80 text-center leading-none">{item.label}</p>
              <p className="text-[2rem] font-bold text-white mt-2 leading-none">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1fr_1fr_auto] gap-3">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nome, username ou chat_id..."
            className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/55 outline-none focus:border-white/25"
          />
          <select
            value={statusInput}
            onChange={(event) => setStatusInput(event.target.value)}
            className="w-full h-[52px] rounded-[10px] bg-transparent border border-[#c4b53d] px-3 text-[1rem] text-white outline-none"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#1f2023]">
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={applyFilters}
            className="h-[52px] px-6 rounded-[10px] border border-white/25 text-white text-[1rem] font-semibold hover:bg-white/5 transition"
          >
            Filtrar
          </button>
        </div>

        <p className="mt-4 text-[1rem] font-semibold text-white/70">{filteredUsers.length} usuários</p>

        {filteredUsers.length === 0 ? (
          <div className="mt-2 min-h-[86px] flex items-center justify-center text-center text-[1.75rem] text-white/75">
            Nenhum usuário cadastrado ainda.
          </div>
        ) : (
          <div className="mt-3 rounded-[12px] border border-white/10 overflow-hidden">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] bg-white/[0.03] border-b border-white/10 px-4 py-3 text-[0.95rem] font-semibold text-white/65">
              <span>Usuário</span>
              <span>Status</span>
              <span>Plano</span>
              <span>Vencimento</span>
            </div>
            <div className="divide-y divide-white/10">
              {filteredUsers.map((user) => {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sem nome';
                const flags = getUserFlags(user);
                const statusLabel = flags.blockedByYou
                  ? 'Bloqueado por você'
                  : flags.blockedByBot
                  ? 'Bloqueou o bot'
                  : flags.active
                  ? 'Ativo'
                  : flags.expired
                  ? 'Expirado'
                  : 'Pendente';
                const expiration = user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString('pt-BR') : '--';
                const planName = user.plan?.name || 'Sem plano';
                return (
                  <div key={user.id} className="grid grid-cols-[1.6fr_1fr_1fr_1fr] px-4 py-3 text-[0.96rem]">
                    <div>
                      <p className="text-white font-semibold leading-none">{fullName}</p>
                      <p className="text-white/55 text-[0.86rem] mt-1">@{user.username || 'sem_username'}</p>
                    </div>
                    <span className="text-white/80 self-center">{statusLabel}</span>
                    <span className="text-white/80 self-center">{planName}</span>
                    <span className="text-white/80 self-center">{expiration}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="h-px bg-white/15 mt-4"></div>
      </section>
    </div>
  );
}
