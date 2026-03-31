"use client"
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Bell,
  Bot,
  Calendar,
  CreditCard,
  Edit2,
  EyeOff,
  Info,
  KeyRound,
  Mail,
  MapPin,
  Monitor,
  Phone,
  PlusCircle,
  Send,
  Shield,
  Trophy,
  User,
  UserCircle,
  UserCircle2
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';
const STORAGE_KEY = 'apex_clone_account_state_v2';
const sectionClass = 'rounded-[18px] border border-white/[0.08] bg-gradient-to-r from-[#1f2024] via-[#25262a] to-[#1f2024] p-6 md:p-7';
const fieldClass = 'h-14 rounded-[12px] border border-white/[0.05] bg-[#181a1f] px-4 flex items-center gap-3 text-white/90';

const defaultState = {
  profile: {
    displayName: 'Baiano Escoliotico01',
    fullName: 'Marcelo Tavares Da Silva',
    email: '[email protected]',
    phone: 'Não informado',
    memberSince: '27/03/2026',
    activeBots: '1',
    botLimit: '30'
  },
  preferences: {
    hideRankingName: false,
    emailNotifications: true,
    telegramNotifications: false,
    deviceNotifications: false
  },
  sessions: [
    {
      id: 'session-1',
      device: 'Mac',
      osBrowser: 'Mac OS X 10.15.7 • Safari 26.3.1',
      location: 'Maceió, Alagoas, Brazil',
      type: 'Desktop',
      ip: '2804:2bf0:608e:4900:4855:302b:ab1:6c87',
      connectedAt: '28/03/2026 19:39',
      current: true
    },
    {
      id: 'session-2',
      device: 'Windows',
      osBrowser: 'Windows 10 • Edge 146.0.0',
      location: 'Fortaleza, Ceará, Brazil',
      type: 'Desktop',
      ip: '2804:248:fbb1:a100:a552:4875:bcf1:442e',
      connectedAt: '27/03/2026 17:00',
      current: false
    },
    {
      id: 'session-3',
      device: 'Mac',
      osBrowser: 'Mac OS X 10.15.7 • Chrome 146.0.0',
      location: 'Araucária, Paraná, Brazil',
      type: 'Desktop',
      ip: '200.66.118.188',
      connectedAt: '27/03/2026 16:10',
      current: false
    }
  ],
  accounts: [
    {
      id: 'account-1',
      email: '[email protected]',
      memberSince: '27/03/2026',
      current: true
    }
  ]
};

function mergeState(savedState) {
  if (!savedState || typeof savedState !== 'object') return defaultState;
  return {
    profile: { ...defaultState.profile, ...(savedState.profile || {}) },
    preferences: { ...defaultState.preferences, ...(savedState.preferences || {}) },
    sessions: Array.isArray(savedState.sessions) ? savedState.sessions : defaultState.sessions,
    accounts: Array.isArray(savedState.accounts) ? savedState.accounts : defaultState.accounts
  };
}

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('apex_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('config');
  const [accountState, setAccountState] = useState(defaultState);
  const [profileDraft, setProfileDraft] = useState(defaultState.profile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/account`, {
          headers: getAuthHeaders()
        });
        const merged = mergeState(response.data);
        setAccountState(merged);
        setProfileDraft(merged.profile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          try {
            const merged = mergeState(JSON.parse(cached));
            setAccountState(merged);
            setProfileDraft(merged.profile);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, []);

  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = setTimeout(() => setFeedbackMessage(''), 2500);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  const tabs = useMemo(
    () => [
      { id: 'config', label: 'Configurações' },
      { id: 'sessions', label: `Sessões (${accountState.sessions.length}/5)` },
      { id: 'accounts', label: `Contas (${accountState.accounts.length}/5)` }
    ],
    [accountState.sessions.length, accountState.accounts.length]
  );

  const persistToBackend = async (nextState, successMessage = '') => {
    setIsSaving(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/account`, nextState, {
        headers: getAuthHeaders()
      });
      const merged = mergeState(response.data);
      setAccountState(merged);
      setProfileDraft(merged.profile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      if (successMessage) setFeedbackMessage(successMessage);
      return true;
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      if (successMessage) setFeedbackMessage(`${successMessage} (sincronização pendente)`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const commitState = async (updater, successMessage = '') => {
    let nextState = null;
    setAccountState((previous) => {
      nextState = typeof updater === 'function' ? updater(previous) : updater;
      return nextState;
    });
    if (nextState) {
      await persistToBackend(nextState, successMessage);
    }
  };

  const handleTogglePreference = async (field) => {
    await commitState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        [field]: !previous.preferences[field]
      }
    }));
  };

  const handleEditProfile = () => {
    if (isEditingProfile) {
      setProfileDraft(accountState.profile);
      setIsEditingProfile(false);
      return;
    }
    setIsEditingProfile(true);
  };

  const handleSaveAll = async () => {
    const normalizedProfile = {
      ...profileDraft,
      phone: profileDraft.phone?.trim() ? profileDraft.phone : 'Não informado'
    };

    await commitState(
      (previous) => ({
        ...previous,
        profile: normalizedProfile
      }),
      'Alterações salvas com sucesso'
    );
    setIsEditingProfile(false);
  };

  const handleLogoutSession = async (sessionId) => {
    await commitState(
      (previous) => ({
        ...previous,
        sessions: previous.sessions.filter((session) => session.current || session.id !== sessionId)
      }),
      'Sessão deslogada'
    );
  };

  const handleLogoutAllSessions = async () => {
    await commitState(
      (previous) => ({
        ...previous,
        sessions: previous.sessions.filter((session) => session.current)
      }),
      'Sessões encerradas'
    );
  };

  const handleAddAccount = async () => {
    if (accountState.accounts.length >= 5) {
      setFeedbackMessage('Limite de contas atingido');
      return;
    }

    const accountEmail = window.prompt('Digite o e-mail da nova conta:');
    if (!accountEmail) return;

    const normalizedEmail = accountEmail.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!isValidEmail) {
      setFeedbackMessage('E-mail inválido');
      return;
    }

    const alreadyExists = accountState.accounts.some((account) => account.email.toLowerCase() === normalizedEmail);
    if (alreadyExists) {
      setFeedbackMessage('Esta conta já está vinculada');
      return;
    }

    const today = new Date();
    const memberSince = today.toLocaleDateString('pt-BR');

    await commitState(
      (previous) => ({
        ...previous,
        accounts: [
          ...previous.accounts,
          {
            id: `account-${Date.now()}`,
            email: normalizedEmail,
            memberSince,
            current: false
          }
        ]
      }),
      'Conta adicionada'
    );
  };

  const handleSignOut = () => {
    localStorage.removeItem('apex_token');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="w-full pb-10 pt-1 flex items-center justify-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 animate-pulse">Carregando conta...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 pt-1 animate-in fade-in duration-700">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <h1 className="text-[clamp(2.2rem,3vw,3.4rem)] font-black text-white tracking-tight leading-none">Minha Conta</h1>
          <div className="h-20 w-20 rounded-full border border-white/[0.06] bg-[#2c2d31] flex items-center justify-center text-white/70 shadow-[0_14px_26px_rgba(0,0,0,0.35)]">
            <UserCircle2 size={44} />
          </div>
        </div>

        <div className="flex items-center gap-5 md:gap-8 border-b border-white/[0.08] pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 text-sm md:text-xl font-black tracking-tight transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-full bg-white" />}
            </button>
          ))}
        </div>

        {feedbackMessage && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
            {feedbackMessage}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="space-y-6">
            <section className={sectionClass}>
              <SectionHeader icon={CreditCard} title="Taxa por Transação" />
              <div className="mt-5 border-t border-white/[0.08] pt-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">Valor Fixo</p>
                    <div className={fieldClass}>
                      <span className="text-slate-500 font-bold">$</span>
                      <span className="text-2xl font-black tracking-tight">R$ 0,75</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">Aplicação</p>
                    <div className={fieldClass}>
                      <Info size={17} className="text-slate-500" />
                      <span className="text-[15px] font-semibold text-slate-200">Taxa aplicada em cada transação aprovada</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex items-center justify-between gap-4">
                <SectionHeader icon={User} title="Informações Pessoais" />
                <button
                  onClick={handleEditProfile}
                  className="h-11 rounded-[14px] border border-white/[0.12] bg-white/[0.03] px-7 text-sm font-black uppercase tracking-[0.06em] text-slate-200 hover:bg-white/[0.08] transition-colors flex items-center gap-2"
                >
                  <Edit2 size={15} />
                  {isEditingProfile ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              <div className="mt-5 border-t border-white/[0.08] pt-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <ProfileField
                    label="Nome de Exibição"
                    icon={UserCircle}
                    value={profileDraft.displayName}
                    editable={isEditingProfile}
                    onChange={(value) => setProfileDraft((prev) => ({ ...prev, displayName: value }))}
                  />
                  <ProfileField
                    label="Nome Completo"
                    icon={Shield}
                    value={profileDraft.fullName}
                    editable={isEditingProfile}
                    onChange={(value) => setProfileDraft((prev) => ({ ...prev, fullName: value }))}
                  />
                  <ProfileField
                    label="Email"
                    icon={Mail}
                    value={profileDraft.email}
                    editable={isEditingProfile}
                    onChange={(value) => setProfileDraft((prev) => ({ ...prev, email: value }))}
                  />
                  <ProfileField
                    label="Telefone"
                    icon={Phone}
                    value={profileDraft.phone}
                    editable={isEditingProfile}
                    onChange={(value) => setProfileDraft((prev) => ({ ...prev, phone: value }))}
                  />
                  <ProfileField label="Membro Desde" icon={Calendar} value={accountState.profile.memberSince} />
                  <ProfileField label="Total de Bots Ativos" icon={Bot} value={accountState.profile.activeBots} />
                  <ProfileField label="Limite de Bots" icon={Shield} value={accountState.profile.botLimit} />
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeader icon={Shield} title="Segurança" />
              <div className="mt-5 border-t border-white/[0.08] pt-5">
                <div className="rounded-[14px] border border-white/[0.05] bg-[#23242a] p-4 md:p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#3b1f22] flex items-center justify-center text-[#ff4d4f]">
                      <KeyRound size={19} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white leading-none">Senha</p>
                      <p className="text-[14px] text-slate-400 font-medium mt-1">Altere sua senha de acesso</p>
                    </div>
                  </div>
                  <button className="h-12 px-8 rounded-xl bg-[#ef3b38] text-white text-[15px] font-black hover:bg-[#ff4a47] transition-colors">
                    Alterar Senha
                  </button>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeader icon={Trophy} title="Ranking" />
              <div className="mt-5 border-t border-white/[0.08] pt-5">
                <ToggleCard
                  icon={EyeOff}
                  title="Ocultar nome no Ranking"
                  description="Seu nome será ocultado, mas sua posição continuará visível"
                  enabled={accountState.preferences.hideRankingName}
                  onToggle={() => handleTogglePreference('hideRankingName')}
                />
              </div>
            </section>

            <section className={sectionClass}>
              <SectionHeader icon={Bell} title="Notificações" />
              <div className="mt-5 border-t border-white/[0.08] pt-5 space-y-3">
                <ToggleCard
                  icon={Mail}
                  title="Notificações por E-mail"
                  description="Receba atualizações no seu e-mail"
                  enabled={accountState.preferences.emailNotifications}
                  onToggle={() => handleTogglePreference('emailNotifications')}
                />
                <ToggleCard
                  icon={Send}
                  title="Notificações por Registro (Telegram)"
                  description="Receba notificações via bot Telegram"
                  enabled={accountState.preferences.telegramNotifications}
                  onToggle={() => handleTogglePreference('telegramNotifications')}
                />
                <ToggleCard
                  icon={Bell}
                  title="Notificações neste dispositivo"
                  description="Receba notificações push no navegador"
                  enabled={accountState.preferences.deviceNotifications}
                  onToggle={() => handleTogglePreference('deviceNotifications')}
                />
              </div>
            </section>

            <div className="rounded-[14px] border border-[#9b681f] bg-[#3a2c16] px-4 py-3 text-[14px] font-semibold text-[#f0aa37] leading-relaxed">
              Para que as notificações por registro funcionem, é necessário ter outro bot ativo vinculado à sua conta com um
              canal de registro configurado; atenção: sessões/contas são deslogadas automaticamente após 7 dias sem atividade,
              e ao serem deslogadas as notificações push neste dispositivo deixam de funcionar.
            </div>

            <div className="flex items-center justify-end gap-4 pb-2">
              <button
                onClick={handleSignOut}
                className="h-12 px-8 rounded-2xl bg-[#ef3b38] text-white font-black text-lg md:text-xl hover:bg-[#ff4a47] transition-colors"
              >
                Sair da Conta
              </button>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="h-12 px-8 rounded-2xl bg-[#49a84e] text-white font-black text-lg md:text-xl hover:bg-[#57bd5d] transition-colors disabled:opacity-70"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {accountState.sessions.map((session) => (
              <SessionCard key={session.id} session={session} onLogout={() => handleLogoutSession(session.id)} />
            ))}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleLogoutAllSessions}
                className="h-12 px-8 rounded-2xl bg-[#ef3b38] text-white font-black text-base hover:bg-[#ff4a47] transition-colors"
              >
                Deslogar Todas as Sessões
              </button>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <section className={sectionClass}>
              <div className="space-y-4">
                {accountState.accounts.map((account) => (
                  <div key={account.id} className="rounded-[14px] border border-white/[0.05] bg-[#23242a] px-4 py-4 md:px-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-12 w-12 rounded-xl border border-white/[0.16] bg-white/[0.04] flex items-center justify-center text-slate-300">
                        <UserCircle size={22} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[22px] font-black tracking-tight text-white truncate underline">{account.email}</p>
                        <p className="text-[14px] font-medium text-slate-400">Membro desde {account.memberSince}</p>
                      </div>
                    </div>
                    {account.current && (
                      <span className="h-9 px-5 rounded-xl bg-[#4caf50] text-white text-sm font-black uppercase tracking-[0.08em] flex items-center">
                        Atual
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="flex justify-end">
              <button
                onClick={handleAddAccount}
                className="h-12 px-8 rounded-2xl bg-[#49a84e] text-white font-black text-xl hover:bg-[#57bd5d] transition-colors inline-flex items-center gap-2"
              >
                <PlusCircle size={18} />
                Adicionar Nova Conta
              </button>
            </div>

            <div className="rounded-[14px] border border-[#9b681f] bg-[#3a2c16] px-4 py-3 text-[14px] font-semibold text-[#f0aa37] leading-relaxed">
              Remoção Automática: contas vinculadas que ficarem inativas por mais de 7 dias são removidas automaticamente da
              lista. Faça login em cada conta regularmente para mantê-las vinculadas.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-[14px] border border-white/[0.14] bg-white/[0.04] flex items-center justify-center text-slate-300">
        <Icon size={21} />
      </div>
      <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">{title}</h2>
    </div>
  );
}

function ProfileField({ label, icon: Icon, value, editable = false, onChange }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <div className={fieldClass}>
        <Icon size={17} className="text-slate-500" />
        {editable ? (
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full bg-transparent text-[15px] font-semibold text-slate-200 outline-none"
          />
        ) : (
          <span className="truncate text-[15px] font-semibold text-slate-200">{value}</span>
        )}
      </div>
    </div>
  );
}

function ToggleCard({ icon: Icon, title, description, enabled, onToggle }) {
  return (
    <div className="rounded-[14px] border border-white/[0.05] bg-[#23242a] px-4 py-4 md:px-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-12 w-12 rounded-xl bg-[#3a2345] flex items-center justify-center text-[#ba41d8] shrink-0">
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <p className="text-[18px] font-black tracking-tight text-white truncate">{title}</p>
          <p className="text-[14px] font-medium text-slate-400 truncate">{description}</p>
        </div>
      </div>
      <ToggleSwitch enabled={enabled} onClick={onToggle} />
    </div>
  );
}

function ToggleSwitch({ enabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-8 w-14 rounded-full p-1 transition-colors ${enabled ? 'bg-black' : 'bg-[#5a5d66]'}`}
      aria-pressed={enabled}
    >
      <span
        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function SessionCard({ session, onLogout }) {
  return (
    <section className={sectionClass}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-[14px] border border-white/[0.14] bg-white/[0.04] flex items-center justify-center text-slate-300">
            <Monitor size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-[36px] font-black tracking-tight text-white leading-none">{session.device}</h3>
            <p className="text-[18px] text-slate-300 font-semibold">{session.osBrowser}</p>
            <div className="mt-2 inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.03] px-3">
              <MapPin size={14} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-300">{session.location}</span>
            </div>
          </div>
        </div>

        {session.current ? (
          <span className="h-9 px-5 rounded-xl bg-[#4caf50] text-white text-sm font-black uppercase tracking-[0.08em] flex items-center">
            Atual
          </span>
        ) : (
          <button onClick={onLogout} className="h-9 px-5 rounded-xl bg-[#ef3b38] text-white text-sm font-black uppercase tracking-[0.08em] hover:bg-[#ff4a47] transition-colors">
            Deslogar
          </button>
        )}
      </div>

      <div className="mt-5 border-t border-white/[0.08] pt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <SessionInfo label="Tipo" value={session.type} />
        <SessionInfo label="Endereço IP" value={session.ip} />
        <SessionInfo label="Conectado em" value={session.connectedAt} />
      </div>
    </section>
  );
}

function SessionInfo({ label, value }) {
  return (
    <div className="h-14 rounded-[12px] border border-white/[0.05] bg-[#24262c] px-4 py-2">
      <p className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold text-slate-200 truncate">{value}</p>
    </div>
  );
}
