"use client"

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AlertCircle, Check, ChevronDown, FolderOpen, PlusCircle, X } from 'lucide-react';

const MAILING_STORAGE_KEY = 'mailing_history_v1';
const MAX_MESSAGE_LENGTH = 4096;
const MAX_ORDER_BUMP_TEXT = 4096;
const MAX_ORDER_BUMP_DELIVERABLES = 2500;

const VARIABLE_TAGS = ['{profile_name}', '{country}', '{state}', '{city}'];
const ORDER_BUMP_VARIABLES = ['{selected_plan_name}', '{order_bump_name}', '{order_bump_value}', '{total_value}'];
const DURATION_OPTIONS = ['Diário', 'Semanal', 'Quinzenal', 'Mensal', 'Bimestral', 'Trimestral', 'Semestral', 'Anual', 'Vitalício', 'Personalizado'];
const RECURRENCE_UNITS = ['Horas', 'Dias'];

const AUDIENCE_OPTIONS = [
  { value: 'all_registered', label: 'Todos os cadastrados' },
  { value: 'vips', label: 'VIPs' },
  { value: 'new', label: 'Novos' },
  { value: 'expired', label: 'Expirados' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'downsellers', label: 'Downsellers' },
  { value: 'upsellers', label: 'Upsellers' },
  { value: 'mailing', label: 'Mailing' },
  { value: 'recurring', label: 'Recorrentes' },
  { value: 'packages', label: 'Pacotes' },
  { value: 'tg_premium', label: 'TG Premium' },
  { value: 'order_bump', label: 'Order Bump' }
];

function createItemId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function SectionAddButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-[56px] w-[56px] rounded-[12px] border border-white/15 bg-white/[0.06] flex items-center justify-center text-white/80 hover:bg-white/[0.09] transition"
    >
      <PlusCircle size={19} />
    </button>
  );
}

function Toggle({ enabled, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="inline-flex items-center gap-3"
      aria-label={label}
    >
      <span className="text-[1rem] font-semibold text-white/90">{label}</span>
      <span className={`w-[54px] h-[32px] rounded-full p-1 transition border ${enabled ? 'bg-black border-white/15' : 'bg-white/20 border-transparent'}`}>
        <span className={`block w-6 h-6 rounded-full bg-white transition ${enabled ? 'translate-x-[22px]' : 'translate-x-0'}`} />
      </span>
    </button>
  );
}

export default function NewMailingPage() {
  const router = useRouter();
  const mediaInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [botName, setBotName] = useState('Vipdamicabot');
  const [users, setUsers] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  const [mailingName, setMailingName] = useState('');
  const [message, setMessage] = useState('');
  const [audienceGroup, setAudienceGroup] = useState('all_registered');
  const [mediaFileName, setMediaFileName] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [packagePlans, setPackagePlans] = useState([]);
  const [customButtons, setCustomButtons] = useState([]);
  const [floatingAlert, setFloatingAlert] = useState(null);
  const [scheduleDate, setScheduleDate] = useState({ day: '', month: '', year: '', hour: '', minute: '' });
  const [recurrence, setRecurrence] = useState({ quantity: '', unit: 'Horas' });

  const defaultCustomUrl = useMemo(() => {
    const username = String(botName || '').replace(/^@/, '').trim();
    if (!username) return 'https://t.me/?start=mailing';
    return `https://t.me/${username}?start=mailing`;
  }, [botName]);

  useEffect(() => {
    fetchData();
    const handleBotChange = () => fetchData();
    window.addEventListener('botChanged', handleBotChange);
    return () => window.removeEventListener('botChanged', handleBotChange);
  }, []);

  useEffect(() => {
    if (!floatingAlert) return undefined;
    const timer = setTimeout(() => setFloatingAlert(null), 3600);
    return () => clearTimeout(timer);
  }, [floatingAlert]);

  async function fetchData() {
    setLoading(true);
    try {
      const selectedBotId = localStorage.getItem('selected_bot_id');
      const [usersResponse, configResponse] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/config')
      ]);

      const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      setUsers(usersData);

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
      setStatusMessage({ type: 'error', text: 'Falha ao carregar dados do mailing.' });
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (file, callback) => {
    if (!file) return;
    setStatusMessage({ type: 'info', text: 'Subindo arquivo... Por favor, aguarde.' });
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.filename) {
        callback(res.data.filename);
        setStatusMessage({ type: 'success', text: `Arquivo ${file.name} enviado com sucesso!` });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatusMessage({ type: 'error', text: 'Erro ao fazer upload do arquivo. Verifique o tamanho (máx 50MB).' });
    }
  };

  const audienceStats = useMemo(() => {
    const planIncludes = (user, keyword) => String(user?.plan?.name || '').toLowerCase().includes(keyword);
    const active = users.filter((user) => user.status === 'active').length;
    return {
      all_registered: users.length,
      vips: users.filter((user) => user.status === 'active' && (user.planId || user.plan)).length,
      new: users.filter((user) => user.status === 'pending').length,
      expired: users.filter((user) => user.status === 'expired').length,
      pending: users.filter((user) => user.status === 'pending').length,
      downsellers: 0,
      upsellers: 0,
      mailing: active,
      recurring: users.filter((user) => planIncludes(user, 'recorr')).length,
      packages: users.filter((user) => planIncludes(user, 'pacote')).length,
      tg_premium: users.filter((user) => planIncludes(user, 'premium')).length,
      order_bump: users.filter((user) => planIncludes(user, 'order')).length
    };
  }, [users]);

  function persistMailingHistory(record) {
    try {
      const existingRaw = localStorage.getItem(MAILING_STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const history = Array.isArray(existing) ? existing : [];
      history.unshift(record);
      localStorage.setItem(MAILING_STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
    } catch (error) {
      console.error(error);
    }
  }

  function mapAudienceForApi(group) {
    if (group === 'expired') return 'expired';
    if (group === 'all_registered') return 'all';
    return 'active';
  }

  function showFloatingAlert(text) {
    setFloatingAlert({
      id: Date.now(),
      text
    });
  }

  function validateSubscriptionPlan(item) {
    return Boolean(String(item?.name || '').trim()) &&
      Boolean(String(item?.price || '').trim()) &&
      Boolean(String(item?.duration || '').trim());
  }

  function validatePackagePlan(item) {
    return Boolean(String(item?.name || '').trim()) &&
      Boolean(String(item?.price || '').trim());
  }

  function validateCustomButton(item) {
    return Boolean(String(item?.text || '').trim()) &&
      Boolean(String(item?.url || '').trim());
  }

  function addSubscriptionPlan() {
    if (subscriptionPlans.some((item) => !validateSubscriptionPlan(item))) {
      showFloatingAlert('Preencha os campos obrigatórios antes de adicionar um novo item!');
      return;
    }
    setSubscriptionPlans((previous) => [
      ...previous,
      {
        id: createItemId('sub'),
        name: '',
        price: '',
        duration: '',
        orderBump: false,
        orderBumpText: '',
        orderBumpAcceptText: 'Aceitar',
        orderBumpRejectText: 'Recusar',
        orderBumpMediaFileName: '',
        orderBumpAudioFileName: '',
        orderBumpName: '',
        orderBumpValue: '',
        orderBumpDeliverables: '',
        collapsed: false
      }
    ]);
  }

  function addPackagePlan() {
    if (packagePlans.some((item) => !validatePackagePlan(item))) {
      showFloatingAlert('Preencha os campos obrigatórios antes de adicionar um novo item!');
      return;
    }
    setPackagePlans((previous) => [
      ...previous,
      {
        id: createItemId('pkg'),
        name: '',
        price: '',
        orderBump: false,
        orderBumpText: '',
        orderBumpAcceptText: 'Aceitar',
        orderBumpRejectText: 'Recusar',
        orderBumpMediaFileName: '',
        orderBumpAudioFileName: '',
        orderBumpName: '',
        orderBumpValue: '',
        orderBumpDeliverables: '',
        collapsed: false
      }
    ]);
  }

  function addCustomButton() {
    if (customButtons.some((item) => !validateCustomButton(item))) {
      showFloatingAlert('Preencha os campos obrigatórios antes de adicionar um novo item!');
      return;
    }
    setCustomButtons((previous) => [
      ...previous,
      {
        id: createItemId('btn'),
        text: '',
        url: defaultCustomUrl
      }
    ]);
  }

  function updateSubscriptionPlan(planId, field, value) {
    setSubscriptionPlans((previous) =>
      previous.map((item) => (item.id === planId ? { ...item, [field]: value } : item))
    );
  }

  function updatePackagePlan(planId, field, value) {
    setPackagePlans((previous) =>
      previous.map((item) => (item.id === planId ? { ...item, [field]: value } : item))
    );
  }

  function updateCustomButton(buttonId, field, value) {
    setCustomButtons((previous) =>
      previous.map((item) => (item.id === buttonId ? { ...item, [field]: value } : item))
    );
  }

  function removeSubscriptionPlan(planId) {
    setSubscriptionPlans((previous) => previous.filter((item) => item.id !== planId));
  }

  function removePackagePlan(planId) {
    setPackagePlans((previous) => previous.filter((item) => item.id !== planId));
  }

  function removeCustomButton(buttonId) {
    setCustomButtons((previous) => previous.filter((item) => item.id !== buttonId));
  }

  function toggleSubscriptionCollapse(planId) {
    setSubscriptionPlans((previous) =>
      previous.map((item) => (item.id === planId ? { ...item, collapsed: !item.collapsed } : item))
    );
  }

  function togglePackageCollapse(planId) {
    setPackagePlans((previous) =>
      previous.map((item) => (item.id === planId ? { ...item, collapsed: !item.collapsed } : item))
    );
  }

  async function handleSend() {
    if (!message.trim()) {
      setStatusMessage({ type: 'error', text: 'Preencha a Mensagem Inicial para enviar o mailing.' });
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    try {
      await axios.post('/api/broadcast', {
        message: message.trim(),
        audience: mapAudienceForApi(audienceGroup)
      });

      const audienceLabel = AUDIENCE_OPTIONS.find((item) => item.value === audienceGroup)?.label || 'Todos os cadastrados';
      const now = new Date();
      persistMailingHistory({
        id: `mailing-${Date.now()}`,
        title: mailingName.trim() || 'Mailing enviado',
        audience: audienceLabel,
        sentAt: now.toLocaleString('pt-BR', { hour12: false })
      });

      setStatusMessage({ type: 'success', text: 'Mailing enviado com sucesso.' });
      setTimeout(() => router.push('/mailing'), 700);
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Falha ao enviar mailing.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full pb-10 pt-1">
        <div className="rounded-[18px] border border-white/10 bg-[#1f2023] px-6 py-8 text-center text-white/60">
          Carregando novo mailing...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 pt-1 animate-in fade-in duration-500">
      {floatingAlert && (
        <div className="fixed top-5 right-6 z-[90] w-[430px] max-w-[calc(100vw-24px)] rounded-[14px] bg-[#f03535] text-white shadow-[0_12px_35px_rgba(0,0,0,0.35)] px-5 py-4 flex items-start justify-between gap-3">
          <p className="text-[1.08rem] font-semibold leading-[1.35]">{floatingAlert.text}</p>
          <button
            type="button"
            onClick={() => setFloatingAlert(null)}
            className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/25 transition inline-flex items-center justify-center shrink-0 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <section className="w-full rounded-[18px] border border-white/10 bg-[#1f2023] shadow-[0_8px_30px_rgba(0,0,0,0.32)] px-5 md:px-6 py-6">
        <h1 className="text-[2.1rem] md:text-[2.35rem] leading-none font-bold text-white tracking-tight">
          Criar Mailing — {botName}
        </h1>

        <div className="mt-5">
          <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Nome do Mailing:</label>
          <input
            value={mailingName}
            onChange={(event) => setMailingName(event.target.value)}
            placeholder="Ex: Promoção Exclusiva"
            className="w-full h-[54px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
          />
        </div>

        <div className="mt-3">
          <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Mensagem Inicial:</label>
          <textarea
            value={message}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Digite aqui a mensagem que será enviada..."
            className="w-full h-[220px] rounded-[10px] bg-white/10 border border-white/10 px-4 py-3 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25 resize-none"
          />
          <div className="mt-1 text-right text-[1.2rem] font-semibold text-white/90">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </div>
        </div>

        <div className="mt-2 space-y-1.5 text-white/80">
          <p className="text-[1rem]">
            Variáveis disponíveis:{' '}
            {VARIABLE_TAGS.map((tag) => (
              <span key={tag} className="inline-block text-[0.85rem] bg-white/15 border border-white/25 rounded-full px-2 py-0.5 mr-1">
                {tag}
              </span>
            ))}
          </p>
          <p className="text-[1rem]">
            <span className="inline-block text-[0.85rem] bg-white/15 border border-white/25 rounded-full px-2 py-0.5 mr-1">{'{profile_name}'}</span>
            → Funciona somente para a mensagem inicial.
          </p>
          <p className="text-[1rem]">
            <span className="inline-block text-[0.85rem] bg-white/15 border border-white/25 rounded-full px-2 py-0.5 mr-1">{'{country}'}</span>
            <span className="inline-block text-[0.85rem] bg-white/15 border border-white/25 rounded-full px-2 py-0.5 mr-1">{'{state}'}</span>
            <span className="inline-block text-[0.85rem] bg-white/15 border border-white/25 rounded-full px-2 py-0.5 mr-1">{'{city}'}</span>
            → Para funcionar corretamente, é necessário usar <span className="underline font-semibold">Redirecionadores</span> ou <span className="underline font-semibold">Captação de Leads</span>.
          </p>
        </div>

        <div className="mt-3">
          <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Grupo de destinatários:</label>
          <select
            value={audienceGroup}
            onChange={(event) => setAudienceGroup(event.target.value)}
            className="w-full h-[48px] rounded-[10px] bg-transparent border border-white/20 px-3 text-[1rem] text-white outline-none"
          >
            {AUDIENCE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value} className="bg-[#1f2023]">
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {AUDIENCE_OPTIONS.map((item) => (
            <div key={item.value} className="h-[88px] rounded-[12px] border border-white/10 bg-[#1f2126]/60 px-4 py-2 flex flex-col items-center justify-center">
              <p className="text-[0.95rem] text-white/75 font-semibold">{item.label.replace('Todos os cadastrados', 'Todos')}</p>
              <p className="text-[2rem] leading-none mt-1 font-bold text-white">{audienceStats[item.value] || 0}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[12px] border border-amber-500/50 bg-[#4a3518]/60 px-4 py-3 flex items-center gap-2.5">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <p className="text-[1rem] font-semibold text-amber-400 leading-[1.35]">
            Atenção: Os dados acima consideram apenas usuários ativos. Usuários que bloquearam o bot não são contabilizados.
            Caso desbloqueiem, são removidos automaticamente da lista de bloqueados.
          </p>
        </div>

        <div className="mt-5">
          <h3 className="text-[1.95rem] leading-none font-bold text-white/85">Planos Assinaturas</h3>
          {subscriptionPlans.length > 0 && (
            <div className="mt-3 space-y-3">
              {subscriptionPlans.map((plan, index) => (
                <div key={plan.id} className="rounded-[16px] border border-white/10 bg-white/[0.02] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[2rem] leading-none font-semibold text-white/85">Plano Assinatura {index + 1}</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSubscriptionCollapse(plan.id)}
                        className="text-white/90 hover:text-white transition"
                      >
                        <ChevronDown size={20} className={`transition-transform ${plan.collapsed ? '-rotate-90' : 'rotate-0'}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubscriptionPlan(plan.id)}
                        className="h-[34px] w-[52px] rounded-[10px] border border-red-500/60 text-red-300 hover:bg-red-500/10 transition inline-flex items-center justify-center"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {!plan.collapsed && (
                    <>
                      <div className="h-px bg-white/15 mt-4" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        <input
                          value={plan.name}
                          onChange={(event) => updateSubscriptionPlan(plan.id, 'name', event.target.value)}
                          placeholder="Nome do plano"
                          className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                        />
                        <input
                          value={plan.price}
                          onChange={(event) => updateSubscriptionPlan(plan.id, 'price', event.target.value)}
                          placeholder="Valor do plano"
                          className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                        />
                        <select
                          value={plan.duration}
                          onChange={(event) => updateSubscriptionPlan(plan.id, 'duration', event.target.value)}
                          className="w-full h-[52px] rounded-[10px] bg-transparent border border-white/20 px-3 text-[1rem] text-white outline-none focus:border-[#c4b53d]"
                        >
                          <option value="" className="bg-[#1f2023]">Selecione a duração</option>
                          {DURATION_OPTIONS.map((option) => (
                            <option key={option} value={option} className="bg-[#1f2023]">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mt-6">
                        <Toggle
                          enabled={plan.orderBump}
                          onChange={(value) => updateSubscriptionPlan(plan.id, 'orderBump', value)}
                          label="Ativar Order Bump:"
                        />
                      </div>

                      {plan.orderBump && (
                        <>
                          <div className="h-px bg-white/15 mt-4" />
                          <p className="mt-4 text-[0.98rem] font-black tracking-[0.08em] text-white/55 uppercase">
                            Order Bump — Plano {index + 1}
                          </p>
                          <div className="mt-3">
                            <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Texto explicativo do Order Bump:</label>
                            <textarea
                              value={plan.orderBumpText}
                              maxLength={MAX_ORDER_BUMP_TEXT}
                              onChange={(event) => updateSubscriptionPlan(plan.id, 'orderBumpText', event.target.value)}
                              placeholder="Digite o texto explicativo do Order Bump aqui..."
                              className="w-full h-[170px] rounded-[10px] bg-white/10 border border-white/10 px-4 py-3 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25 resize-none"
                            />
                            <div className="mt-1 text-right text-[1.2rem] font-semibold text-white/90">
                              {plan.orderBumpText.length}/{MAX_ORDER_BUMP_TEXT}
                            </div>
                          </div>
                          <p className="mt-3 text-[1rem] text-white/80">
                            Variáveis disponíveis:{' '}
                            {ORDER_BUMP_VARIABLES.map((tag) => (
                              <span key={tag} className="inline-block text-[0.85rem] bg-white/15 border border-white/25 rounded-full px-2 py-0.5 mr-1">
                                {tag}
                              </span>
                            ))}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Texto Botão Aceitar:</label>
                              <input
                                value={plan.orderBumpAcceptText}
                                onChange={(event) => updateSubscriptionPlan(plan.id, 'orderBumpAcceptText', event.target.value)}
                                placeholder="Aceitar"
                                className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                              />
                            </div>
                            <div>
                              <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Texto Botão Recusar:</label>
                              <input
                                value={plan.orderBumpRejectText}
                                onChange={(event) => updateSubscriptionPlan(plan.id, 'orderBumpRejectText', event.target.value)}
                                placeholder="Recusar"
                                className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                            <div>
                              <p className="text-[1rem] text-white/50 mb-2">Mídia Order Bump (PNG, JPEG, JPG, MP4):</p>
                              <input
                                id={`sub-order-bump-media-${plan.id}`}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,video/mp4"
                                className="hidden"
                                onChange={(event) => handleFileUpload(event.target.files?.[0], (fname) => updateSubscriptionPlan(plan.id, 'orderBumpMediaFileName', fname))}
                              />
                              <label
                                htmlFor={`sub-order-bump-media-${plan.id}`}
                                className="h-[44px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.95rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition"
                              >
                                <FolderOpen size={16} className="text-blue-400" />
                                Escolher Mídia
                              </label>
                              {plan.orderBumpMediaFileName && (
                                <p className="text-[0.88rem] text-white/70 mt-2 truncate">{plan.orderBumpMediaFileName}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-[1rem] text-white/50 mb-2">Áudio Order Bump (OGG):</p>
                              <input
                                id={`sub-order-bump-audio-${plan.id}`}
                                type="file"
                                accept="audio/ogg"
                                className="hidden"
                                onChange={(event) => handleFileUpload(event.target.files?.[0], (fname) => updateSubscriptionPlan(plan.id, 'orderBumpAudioFileName', fname))}
                              />
                              <label
                                htmlFor={`sub-order-bump-audio-${plan.id}`}
                                className="h-[44px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.95rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition"
                              >
                                <FolderOpen size={16} className="text-blue-400" />
                                Escolher Áudio
                              </label>
                              {plan.orderBumpAudioFileName && (
                                <p className="text-[0.88rem] text-white/70 mt-2 truncate">{plan.orderBumpAudioFileName}</p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <input
                              value={plan.orderBumpName}
                              onChange={(event) => updateSubscriptionPlan(plan.id, 'orderBumpName', event.target.value)}
                              placeholder="Nome do Order Bump"
                              className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                            />
                            <input
                              value={plan.orderBumpValue}
                              onChange={(event) => updateSubscriptionPlan(plan.id, 'orderBumpValue', event.target.value)}
                              placeholder="Valor (R$)"
                              className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                            />
                          </div>
                          <div className="mt-3">
                            <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Entregáveis:</label>
                            <textarea
                              value={plan.orderBumpDeliverables}
                              maxLength={MAX_ORDER_BUMP_DELIVERABLES}
                              onChange={(event) => updateSubscriptionPlan(plan.id, 'orderBumpDeliverables', event.target.value)}
                              placeholder="Entregáveis após pagamento..."
                              className="w-full h-[170px] rounded-[10px] bg-white/10 border border-white/10 px-4 py-3 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25 resize-none"
                            />
                            <div className="mt-1 text-right text-[1.2rem] font-semibold text-white/90">
                              {plan.orderBumpDeliverables.length}/{MAX_ORDER_BUMP_DELIVERABLES}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center mt-3">
            <SectionAddButton onClick={addSubscriptionPlan} />
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-[1.95rem] leading-none font-bold text-white/85">Planos Pacotes</h3>
          {packagePlans.length > 0 && (
            <div className="mt-3 space-y-3">
              {packagePlans.map((plan, index) => (
                <div key={plan.id} className="rounded-[16px] border border-white/10 bg-white/[0.02] px-5 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[2rem] leading-none font-semibold text-white/85">Pacote {index + 1}</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => togglePackageCollapse(plan.id)}
                        className="text-white/90 hover:text-white transition"
                      >
                        <ChevronDown size={20} className={`transition-transform ${plan.collapsed ? '-rotate-90' : 'rotate-0'}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePackagePlan(plan.id)}
                        className="h-[34px] w-[52px] rounded-[10px] border border-red-500/60 text-red-300 hover:bg-red-500/10 transition inline-flex items-center justify-center"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {!plan.collapsed && (
                    <>
                      <div className="h-px bg-white/15 mt-4" />
                      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-3 mt-4">
                        <div>
                          <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Nome do Pacote:</label>
                          <input
                            value={plan.name}
                            onChange={(event) => updatePackagePlan(plan.id, 'name', event.target.value)}
                            placeholder="Ex: Pacote Premium Completo"
                            className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                          />
                        </div>
                        <div>
                          <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Valor (R$):</label>
                          <input
                            value={plan.price}
                            onChange={(event) => updatePackagePlan(plan.id, 'price', event.target.value)}
                            placeholder="Ex: 19,90"
                            className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                          />
                        </div>
                      </div>
                      <div className="mt-6">
                        <Toggle
                          enabled={plan.orderBump}
                          onChange={(value) => updatePackagePlan(plan.id, 'orderBump', value)}
                          label="Ativar Order Bump:"
                        />
                      </div>

                      {plan.orderBump && (
                        <>
                          <div className="h-px bg-white/15 mt-4" />
                          <p className="mt-4 text-[0.98rem] font-black tracking-[0.08em] text-white/55 uppercase">
                            Order Bump — Pacote {index + 1}
                          </p>
                          <div className="mt-3">
                            <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Texto explicativo do Order Bump:</label>
                            <textarea
                              value={plan.orderBumpText}
                              maxLength={MAX_ORDER_BUMP_TEXT}
                              onChange={(event) => updatePackagePlan(plan.id, 'orderBumpText', event.target.value)}
                              placeholder="Digite o texto explicativo do Order Bump aqui..."
                              className="w-full h-[170px] rounded-[10px] bg-white/10 border border-white/10 px-4 py-3 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25 resize-none"
                            />
                            <div className="mt-1 text-right text-[1.2rem] font-semibold text-white/90">
                              {plan.orderBumpText.length}/{MAX_ORDER_BUMP_TEXT}
                            </div>
                          </div>
                          <p className="mt-3 text-[1rem] text-white/80">
                            Variáveis disponíveis:{' '}
                            {ORDER_BUMP_VARIABLES.map((tag) => (
                              <span key={tag} className="inline-block text-[0.85rem] bg-white/15 border border-white/25 rounded-full px-2 py-0.5 mr-1">
                                {tag}
                              </span>
                            ))}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Texto Botão Aceitar:</label>
                              <input
                                value={plan.orderBumpAcceptText}
                                onChange={(event) => updatePackagePlan(plan.id, 'orderBumpAcceptText', event.target.value)}
                                placeholder="Aceitar"
                                className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                              />
                            </div>
                            <div>
                              <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Texto Botão Recusar:</label>
                              <input
                                value={plan.orderBumpRejectText}
                                onChange={(event) => updatePackagePlan(plan.id, 'orderBumpRejectText', event.target.value)}
                                placeholder="Recusar"
                                className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                            <div>
                              <p className="text-[1rem] text-white/50 mb-2">Mídia Order Bump (PNG, JPEG, JPG, MP4):</p>
                              <input
                                id={`pkg-order-bump-media-${plan.id}`}
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,video/mp4"
                                className="hidden"
                                onChange={(event) => handleFileUpload(event.target.files?.[0], (fname) => updatePackagePlan(plan.id, 'orderBumpMediaFileName', fname))}
                              />
                              <label
                                htmlFor={`pkg-order-bump-media-${plan.id}`}
                                className="h-[44px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.95rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition"
                              >
                                <FolderOpen size={16} className="text-blue-400" />
                                Escolher Mídia
                              </label>
                              {plan.orderBumpMediaFileName && (
                                <p className="text-[0.88rem] text-white/70 mt-2 truncate">{plan.orderBumpMediaFileName}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-[1rem] text-white/50 mb-2">Áudio Order Bump (OGG):</p>
                              <input
                                id={`pkg-order-bump-audio-${plan.id}`}
                                type="file"
                                accept="audio/ogg"
                                className="hidden"
                                onChange={(event) => handleFileUpload(event.target.files?.[0], (fname) => updatePackagePlan(plan.id, 'orderBumpAudioFileName', fname))}
                              />
                              <label
                                htmlFor={`pkg-order-bump-audio-${plan.id}`}
                                className="h-[44px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.95rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition"
                              >
                                <FolderOpen size={16} className="text-blue-400" />
                                Escolher Áudio
                              </label>
                              {plan.orderBumpAudioFileName && (
                                <p className="text-[0.88rem] text-white/70 mt-2 truncate">{plan.orderBumpAudioFileName}</p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                            <input
                              value={plan.orderBumpName}
                              onChange={(event) => updatePackagePlan(plan.id, 'orderBumpName', event.target.value)}
                              placeholder="Nome do Order Bump"
                              className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                            />
                            <input
                              value={plan.orderBumpValue}
                              onChange={(event) => updatePackagePlan(plan.id, 'orderBumpValue', event.target.value)}
                              placeholder="Valor (R$)"
                              className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                            />
                          </div>
                          <div className="mt-3">
                            <label className="block text-[1rem] font-semibold text-white/90 mb-1.5">Entregáveis:</label>
                            <textarea
                              value={plan.orderBumpDeliverables}
                              maxLength={MAX_ORDER_BUMP_DELIVERABLES}
                              onChange={(event) => updatePackagePlan(plan.id, 'orderBumpDeliverables', event.target.value)}
                              placeholder="Entregáveis após pagamento..."
                              className="w-full h-[170px] rounded-[10px] bg-white/10 border border-white/10 px-4 py-3 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25 resize-none"
                            />
                            <div className="mt-1 text-right text-[1.2rem] font-semibold text-white/90">
                              {plan.orderBumpDeliverables.length}/{MAX_ORDER_BUMP_DELIVERABLES}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-center mt-3">
            <SectionAddButton onClick={addPackagePlan} />
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-[2.05rem] leading-none font-bold text-white/85">Botões Personalizados</h3>
          {customButtons.length > 0 && (
            <div className="mt-3">
              <div className="space-y-2">
                {customButtons.map((buttonItem) => (
                  <div key={buttonItem.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-2.5 items-center">
                    <input
                      value={buttonItem.text}
                      onChange={(event) => updateCustomButton(buttonItem.id, 'text', event.target.value)}
                      placeholder="Texto do Botão"
                      className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                    />
                    <input
                      value={buttonItem.url}
                      onChange={(event) => updateCustomButton(buttonItem.id, 'url', event.target.value)}
                      placeholder="https://"
                      className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/50 outline-none focus:border-white/25"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomButton(buttonItem.id)}
                      className="h-[44px] w-[32px] text-white/55 hover:text-red-300 transition inline-flex items-center justify-center"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="h-px bg-white/15 mt-4" />
            </div>
          )}
          <div className="flex justify-center mt-3">
            <SectionAddButton onClick={addCustomButton} />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[2.05rem] leading-none font-bold text-white/85">Mídia e Áudio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            <div>
              <p className="text-[1rem] text-white/50 mb-2">Mídia (PNG, JPEG, JPG, MP4) — Máximo 25MB:</p>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,video/mp4"
                className="hidden"
                onChange={(event) => handleFileUpload(event.target.files?.[0], (fname) => setMediaFileName(fname))}
              />
              <button
                type="button"
                onClick={() => mediaInputRef.current?.click()}
                className="h-[52px] px-5 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1.1rem] font-semibold inline-flex items-center gap-2.5 hover:bg-white/[0.1] transition"
              >
                <FolderOpen size={18} className="text-blue-400" />
                Escolher Mídia
              </button>
              {mediaFileName && <p className="text-[0.95rem] text-white/70 mt-2 truncate">{mediaFileName}</p>}
            </div>
            <div>
              <p className="text-[1rem] text-white/50 mb-2">Áudio (OGG) — Máximo 10MB:</p>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/ogg"
                className="hidden"
                onChange={(event) => handleFileUpload(event.target.files?.[0], (fname) => setAudioFileName(fname))}
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="h-[52px] px-5 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1.1rem] font-semibold inline-flex items-center gap-2.5 hover:bg-white/[0.1] transition"
              >
                <FolderOpen size={18} className="text-blue-400" />
                Escolher Áudio
              </button>
              {audioFileName && <p className="text-[0.95rem] text-white/70 mt-2 truncate">{audioFileName}</p>}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[1.95rem] leading-none font-bold text-white/85 mb-3">Agendamento</h3>
          <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-5 py-6">
            <Toggle enabled={scheduleEnabled} onChange={setScheduleEnabled} label="Agendar envio:" />
            {scheduleEnabled && (
              <div className="mt-4">
                <p className="text-[1rem] font-semibold text-white/90 mb-1.5">Data e hora:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={scheduleDate.day}
                    onChange={(event) => setScheduleDate((previous) => ({ ...previous, day: event.target.value.replace(/\D/g, '').slice(0, 2) }))}
                    placeholder="DD"
                    className="w-[86px] h-[48px] rounded-[10px] bg-white/10 border border-white/10 px-3 text-[1rem] text-white placeholder:text-white/35 text-center outline-none focus:border-white/25"
                  />
                  <span className="text-white/60 text-[1.05rem]">/</span>
                  <input
                    value={scheduleDate.month}
                    onChange={(event) => setScheduleDate((previous) => ({ ...previous, month: event.target.value.replace(/\D/g, '').slice(0, 2) }))}
                    placeholder="MM"
                    className="w-[86px] h-[48px] rounded-[10px] bg-white/10 border border-white/10 px-3 text-[1rem] text-white placeholder:text-white/35 text-center outline-none focus:border-white/25"
                  />
                  <span className="text-white/60 text-[1.05rem]">/</span>
                  <input
                    value={scheduleDate.year}
                    onChange={(event) => setScheduleDate((previous) => ({ ...previous, year: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="AAAA"
                    className="w-[104px] h-[48px] rounded-[10px] bg-white/10 border border-white/10 px-3 text-[1rem] text-white placeholder:text-white/35 text-center outline-none focus:border-white/25"
                  />
                  <span className="ml-2 text-white/60 text-[1.05rem]">|</span>
                  <input
                    value={scheduleDate.hour}
                    onChange={(event) => setScheduleDate((previous) => ({ ...previous, hour: event.target.value.replace(/\D/g, '').slice(0, 2) }))}
                    placeholder="HH"
                    className="w-[86px] h-[48px] rounded-[10px] bg-white/10 border border-white/10 px-3 text-[1rem] text-white placeholder:text-white/35 text-center outline-none focus:border-white/25"
                  />
                  <span className="text-white/60 text-[1.05rem]">:</span>
                  <input
                    value={scheduleDate.minute}
                    onChange={(event) => setScheduleDate((previous) => ({ ...previous, minute: event.target.value.replace(/\D/g, '').slice(0, 2) }))}
                    placeholder="MM"
                    className="w-[86px] h-[48px] rounded-[10px] bg-white/10 border border-white/10 px-3 text-[1rem] text-white placeholder:text-white/35 text-center outline-none focus:border-white/25"
                  />
                </div>
                <p className="mt-3 text-[1rem] text-white/60">Intervalo mínimo de 3h entre mailings. Agendamento máximo de 30 dias.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-[1.95rem] leading-none font-bold text-white/85 mb-3">Recorrência</h3>
          <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-5 py-6">
            <Toggle enabled={recurrenceEnabled} onChange={setRecurrenceEnabled} label="Ativar recorrência:" />
            {recurrenceEnabled && (
              <div className="mt-4">
                <p className="text-[1rem] font-semibold text-white/90 mb-1.5">Repetir a cada:</p>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-2.5">
                  <input
                    value={recurrence.quantity}
                    onChange={(event) => setRecurrence((previous) => ({ ...previous, quantity: event.target.value.replace(/\D/g, '').slice(0, 3) }))}
                    placeholder="Qtd"
                    className="w-full h-[48px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-[1rem] text-white placeholder:text-white/40 outline-none focus:border-white/25"
                  />
                  <select
                    value={recurrence.unit}
                    onChange={(event) => setRecurrence((previous) => ({ ...previous, unit: event.target.value }))}
                    className="w-full h-[48px] rounded-[10px] bg-transparent border border-white/20 px-3 text-[1rem] text-white outline-none"
                  >
                    {RECURRENCE_UNITS.map((option) => (
                      <option key={option} value={option} className="bg-[#1f2023]">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-3 text-[1rem] text-white/60">Mín 3h, máx 30 dias. Se agendado, a recorrência inicia a partir do horário agendado. Sem agendamento, inicia imediatamente.</p>
              </div>
            )}
          </div>
        </div>

        {statusMessage && (
          <div className={`mt-4 rounded-[10px] px-4 py-3 text-[0.95rem] font-semibold ${statusMessage.type === 'success' ? 'bg-green-600/20 border border-green-500/30 text-green-300' : 'bg-red-600/20 border border-red-500/30 text-red-300'}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="h-px bg-white/15 mt-5" />

        <div className="mt-4 flex justify-end gap-3">
          <Link
            href="/mailing"
            className="h-[50px] px-6 rounded-[10px] border border-white/20 bg-white/[0.06] text-white/70 text-[1.15rem] font-semibold inline-flex items-center gap-2 hover:bg-white/[0.09] transition"
          >
            <X size={18} />
            Voltar
          </Link>
          <button
            type="button"
            onClick={handleSend}
            disabled={submitting}
            className="h-[50px] px-6 rounded-[10px] bg-[#28a745] text-white text-[1.15rem] font-semibold inline-flex items-center gap-2 hover:bg-[#2ebb4d] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Check size={18} />
            {submitting ? 'Enviando...' : 'Enviar Mailing'}
          </button>
        </div>
      </section>
    </div>
  );
}
