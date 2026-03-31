"use client"

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  Check,
  CircleDot,
  Infinity as InfinityIcon,
  Link2,
  Music2,
  PlusCircle,
  Save,
  X
} from 'lucide-react';

const TRACKING_STORAGE_KEY = 'tracking_integrations_v1';

const PLATFORM_TABS = [
  { id: 'meta', label: 'Meta Ads', icon: InfinityIcon },
  { id: 'tiktok', label: 'TikTok Ads', icon: Music2 },
  { id: 'utmify', label: 'Utmify', icon: Link2 }
];

const PLATFORM_CONFIG = {
  meta: {
    warning:
      'Atenção: antes de começar a configurar os pixels, acesse o tutorial e leia atentamente. Seguir todas as instruções evita duplicação de eventos, conflitos de rastreamento e dados incorretos.',
    tutorialHref: 'https://apexvips.com/tutorial/',
    tutorialText: 'Clique aqui para acessar o tutorial completo do Pixel Meta.',
    secondaryTutorialHref: null,
    secondaryTutorialText: null,
    formTitle: 'Novo Pixel',
    activeLabel: 'Pixel Ativo',
    nameLabel: 'Nome do Pixel:',
    namePlaceholder: 'Ex: Pixel Principal',
    pixelIdLabel: 'Pixel ID:',
    pixelIdPlaceholder: 'Ex: 1172755487659076',
    accessTokenLabel: 'Access Token:',
    accessTokenPlaceholder: 'Cole aqui o access token do Meta',
    typeLabel: 'Tipo do Pixel:',
    eventsLabel: 'Eventos do Pixel:',
    requirePixelId: true,
    events: [
      { key: 'pageview', label: 'Pageview' },
      { key: 'purchase', label: 'Purchase' },
      { key: 'initiateCheckout', label: 'Initiate Checkout' }
    ]
  },
  tiktok: {
    warning:
      'Atenção: antes de começar a configurar os pixels, acesse o tutorial e leia atentamente. Seguir todas as instruções evita duplicação de eventos, conflitos de rastreamento e dados incorretos.',
    tutorialHref: 'https://apexvips.com/tutorial/',
    tutorialText: 'Clique aqui para acessar o tutorial completo do Pixel Meta.',
    secondaryTutorialHref: 'https://apexvips.com/tutorial/',
    secondaryTutorialText: 'Clique aqui pra enviar eventos de teste',
    formTitle: 'Novo Pixel',
    activeLabel: 'Pixel Ativo',
    nameLabel: 'Nome do Pixel:',
    namePlaceholder: 'Ex: Pixel Principal',
    pixelIdLabel: 'Pixel ID:',
    pixelIdPlaceholder: 'Ex: D6CK10JC77U5LKV8OJ3O',
    accessTokenLabel: 'Access Token:',
    accessTokenPlaceholder: 'Cole aqui o access token do TikTok',
    typeLabel: 'Tipo do Pixel:',
    eventsLabel: 'Eventos do Pixel:',
    requirePixelId: true,
    events: [
      { key: 'viewcontent', label: 'Viewcontent' },
      { key: 'purchase', label: 'Purchase' },
      { key: 'initiateCheckout', label: 'Initiate Checkout' }
    ]
  },
  utmify: {
    warning:
      'Atenção: antes de começar a configurar a Utmify, acesse o tutorial e leia atentamente. Seguir todas as instruções evita duplicação de eventos, conflitos de rastreamento e dados incorretos.',
    tutorialHref: 'https://apexvips.com/tutorial/',
    tutorialText: 'Clique aqui para acessar o tutorial completo da Utmify.',
    secondaryTutorialHref: null,
    secondaryTutorialText: null,
    formTitle: 'Nova Integração Utmify',
    activeLabel: 'Integração Ativa',
    nameLabel: 'Nome da Integração:',
    namePlaceholder: 'Ex: Integração Principal',
    pixelIdLabel: 'ID da Integração:',
    pixelIdPlaceholder: '',
    accessTokenLabel: 'Access Token:',
    accessTokenPlaceholder: 'Cole aqui o access token do Utmify',
    typeLabel: 'Tipo da Integração:',
    eventsLabel: 'Eventos:',
    requirePixelId: false,
    events: [
      { key: 'paymentCreated', label: 'Payment Created' },
      { key: 'paymentApproved', label: 'Payment Approved' }
    ]
  }
};

function buildEmptyDraft(platform = 'meta') {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.meta;
  const initialEvents = {};
  config.events.forEach((eventItem) => {
    initialEvents[eventItem.key] = true;
  });

  return {
    active: true,
    name: '',
    pixelId: '',
    accessToken: '',
    pixelType: 'Servidor',
    events: initialEvents
  };
}

function formatDateTime(value) {
  if (!value) return '--/--/---- --:--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--/--/---- --:--';
  const date = parsed.toLocaleDateString('pt-BR');
  const time = parsed.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

function normalizeUtm(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 32);
}

export default function TrackingPage() {
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('meta');
  const [botConfig, setBotConfig] = useState({
    botUsername: 'Vipdamicabot',
    botExternalId: '59548',
    createdAt: null
  });
  const [sources, setSources] = useState([]);
  const [integrations, setIntegrations] = useState({
    meta: [],
    tiktok: [],
    utmify: []
  });
  const [isAddingIntegration, setIsAddingIntegration] = useState(false);
  const [draftIntegration, setDraftIntegration] = useState(buildEmptyDraft('meta'));
  const [statusMessage, setStatusMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRACKING_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setIntegrations({
            meta: Array.isArray(parsed.meta) ? parsed.meta : [],
            tiktok: Array.isArray(parsed.tiktok) ? parsed.tiktok : [],
            utmify: Array.isArray(parsed.utmify) ? parsed.utmify : []
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const handleBotChange = () => fetchData();
    window.addEventListener('botChanged', handleBotChange);
    return () => window.removeEventListener('botChanged', handleBotChange);
  }, []);

  useEffect(() => {
    setIsAddingIntegration(false);
    setDraftIntegration(buildEmptyDraft(activePlatform));
    setStatusMessage(null);
  }, [activePlatform]);

  async function fetchData() {
    setLoading(true);
    try {
      const botId = localStorage.getItem('selected_bot_id');
      const trackingRequest = axios.get('/api/tracking');
      const configRequest = axios.get('/api/config');
      const [trackingResponse, configResponse] = await Promise.all([trackingRequest, configRequest]);

      setSources(Array.isArray(trackingResponse?.data) ? trackingResponse.data : []);
      const configList = Array.isArray(configResponse?.data)
        ? configResponse.data
        : (configResponse?.data ? [configResponse.data] : []);
      const selectedConfig = botId
        ? configList.find((item) => String(item.id) === String(botId))
        : null;
      const fallbackConfig = configList[0] || null;
      const targetConfig = selectedConfig || fallbackConfig;

      if (targetConfig) {
        setBotConfig({
          botUsername: targetConfig.botUsername || 'Vipdamicabot',
          botExternalId: targetConfig.botExternalId || '59548',
          createdAt: targetConfig.createdAt || null
        });
      }
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Não foi possível sincronizar os dados do tracking.' });
    } finally {
      setLoading(false);
    }
  }

  const backendMetaIntegrations = useMemo(
    () =>
      sources.map((source) => ({
        id: `backend-${source.id}`,
        active: true,
        name: source.name || 'Fonte sem nome',
        pixelId: source.utm || '-',
        accessToken: 'Sincronizado via backend',
        pixelType: 'Servidor',
        events: {
          pageview: true,
          purchase: Number(source.conversions || 0) > 0,
          initiateCheckout: Number(source.leads || 0) > 0
        },
        readOnly: true
      })),
    [sources]
  );

  const currentIntegrations = useMemo(() => {
    const localIntegrations = integrations[activePlatform] || [];
    if (activePlatform !== 'meta') return localIntegrations;
    return [...backendMetaIntegrations, ...localIntegrations];
  }, [activePlatform, integrations, backendMetaIntegrations]);
  const platformConfig = PLATFORM_CONFIG[activePlatform] || PLATFORM_CONFIG.meta;

  function updateDraft(field, value) {
    setDraftIntegration((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function toggleDraftEvent(eventName) {
    setDraftIntegration((previous) => ({
      ...previous,
      events: {
        ...previous.events,
        [eventName]: !previous.events[eventName]
      }
    }));
  }

  function startAddIntegration() {
    setStatusMessage(null);
    setDraftIntegration(buildEmptyDraft(activePlatform));
    setIsAddingIntegration(true);
  }

  function cancelAddIntegration() {
    setIsAddingIntegration(false);
    setDraftIntegration(buildEmptyDraft(activePlatform));
  }

  function confirmAddIntegration() {
    const currentPlatformConfig = PLATFORM_CONFIG[activePlatform] || PLATFORM_CONFIG.meta;
    const name = String(draftIntegration.name || '').trim();
    const pixelId = String(draftIntegration.pixelId || '').trim();
    const accessToken = String(draftIntegration.accessToken || '').trim();

    if (!name || !accessToken || (currentPlatformConfig.requirePixelId && !pixelId)) {
      setStatusMessage({
        type: 'error',
        text: currentPlatformConfig.requirePixelId
          ? 'Preencha Nome do Pixel, Pixel ID e Access Token.'
          : 'Preencha Nome da Integração e Access Token.'
      });
      return;
    }

    const newItem = {
      ...draftIntegration,
      id: `local-${Date.now()}`,
      pixelId: currentPlatformConfig.requirePixelId ? normalizeUtm(pixelId) : ''
    };

    setIntegrations((previous) => ({
      ...previous,
      [activePlatform]: [...(previous[activePlatform] || []), newItem]
    }));
    setStatusMessage({ type: 'success', text: 'Nova integração adicionada na tela.' });
    setIsAddingIntegration(false);
    setDraftIntegration(buildEmptyDraft(activePlatform));
  }

  async function saveChanges() {
    setSaving(true);
    setStatusMessage(null);
    try {
      localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(integrations));
      setStatusMessage({
        type: 'success',
        text: `Alterações salvas com sucesso. Fontes sincronizadas do backend: ${sources.length}.`
      });
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Falha ao salvar alterações localmente.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full pb-10 pt-1">
        <div className="rounded-[18px] border border-white/10 bg-[#1f2023] px-6 py-8 text-center text-white/60">
          Sincronizando tracking...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 pt-1 animate-in fade-in duration-500">
      <section className="w-full rounded-[18px] border border-white/10 bg-[#1f2023] shadow-[0_8px_35px_rgba(0,0,0,0.35)] px-5 md:px-6 py-6">
        <div>
          <h1 className="text-[2rem] md:text-[2.2rem] leading-none font-bold text-white">
            {botConfig.botUsername} ID: {botConfig.botExternalId}
          </h1>
          <p className="text-[1rem] text-white/60 font-semibold mt-2">
            Criado em: {formatDateTime(botConfig.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2 border-b border-white/12 mt-4">
          {PLATFORM_TABS.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePlatform(tab.id)}
                className={`h-[50px] px-4 rounded-t-[10px] text-[0.95rem] font-semibold transition flex items-center gap-2 ${
                  activePlatform === tab.id
                    ? 'bg-white/10 text-white border-b-2 border-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-[14px] border border-[#946915] bg-[#46351466] px-4 py-3 flex items-start gap-3">
          <AlertCircle size={18} className="text-[#ffcf58] mt-[2px] shrink-0" />
          <p className="text-[0.98rem] leading-[1.3] text-[#ffb323] font-semibold">
            {platformConfig.warning}
          </p>
        </div>

        <a
          href={platformConfig.tutorialHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-[1.02rem] underline text-white/90 hover:text-white font-semibold"
        >
          {platformConfig.tutorialText}
        </a>
        {platformConfig.secondaryTutorialHref && platformConfig.secondaryTutorialText && (
          <a
            href={platformConfig.secondaryTutorialHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[1.02rem] underline text-white/90 hover:text-white font-semibold"
          >
            {platformConfig.secondaryTutorialText}
          </a>
        )}

        {statusMessage && (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 text-[0.92rem] ${
              statusMessage.type === 'success'
                ? 'bg-green-500/10 border-green-500/35 text-green-300'
                : 'bg-red-500/10 border-red-500/35 text-red-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {currentIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="rounded-[16px] border border-white/10 bg-[#202225]/70 px-4 md:px-5 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <h3 className="text-[1.7rem] font-bold text-white leading-none">{integration.name}</h3>
                <div className="flex items-center gap-2">
                  {integration.readOnly && (
                    <span className="h-[34px] px-3 rounded-[9px] bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[0.82rem] font-bold flex items-center">
                      Backend
                    </span>
                  )}
                  <span
                    className={`h-[34px] px-3 rounded-[9px] text-[0.82rem] font-bold flex items-center ${
                      integration.active
                        ? 'bg-green-500/15 border border-green-500/30 text-green-300'
                        : 'bg-white/10 border border-white/20 text-white/70'
                    }`}
                  >
                    {integration.active ? 'Pixel Ativo' : 'Pixel Inativo'}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {(integration.pixelId || platformConfig.requirePixelId) && (
                  <div>
                    <p className="text-[0.92rem] text-white/70 mb-1">{platformConfig.pixelIdLabel}</p>
                    <div className="h-[46px] rounded-[10px] bg-[#1d1f23] border border-white/8 px-4 flex items-center text-white/90 font-semibold">
                      {integration.pixelId || '-'}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[0.92rem] text-white/70 mb-1">{platformConfig.typeLabel}</p>
                  <div className="h-[46px] rounded-[10px] bg-[#1d1f23] border border-white/8 px-4 flex items-center text-white/90 font-semibold">
                    {integration.pixelType}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isAddingIntegration ? (
            <div className="rounded-[16px] border border-white/10 bg-[#202225]/70 px-4 md:px-5 py-4">
              <h3 className="text-[1.9rem] font-bold text-white leading-none">{platformConfig.formTitle}</h3>
              <div className="h-px bg-white/10 mt-3 mb-4"></div>

              <div className="flex items-center gap-4 mb-3">
                <p className="text-[1.05rem] text-white font-semibold">{platformConfig.activeLabel}</p>
                <button
                  type="button"
                  onClick={() => updateDraft('active', !draftIntegration.active)}
                  className={`relative h-[30px] w-[50px] rounded-full border transition ${
                    draftIntegration.active
                      ? 'bg-black border-black'
                      : 'bg-white/15 border-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-all ${
                      draftIntegration.active ? 'left-[24px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[1.05rem] text-white font-semibold mb-1">{platformConfig.nameLabel}</label>
                  <input
                    value={draftIntegration.name}
                    onChange={(event) => updateDraft('name', event.target.value)}
                    placeholder={platformConfig.namePlaceholder}
                    className="w-full h-[48px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-white placeholder:text-white/45 outline-none focus:border-white/25"
                  />
                </div>

                {platformConfig.requirePixelId && (
                  <div>
                    <label className="block text-[1.05rem] text-white font-semibold mb-1">{platformConfig.pixelIdLabel}</label>
                    <input
                      value={draftIntegration.pixelId}
                      onChange={(event) => updateDraft('pixelId', event.target.value)}
                      placeholder={platformConfig.pixelIdPlaceholder}
                      className="w-full h-[48px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-white placeholder:text-white/45 outline-none focus:border-white/25"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[1.05rem] text-white font-semibold mb-1">{platformConfig.accessTokenLabel}</label>
                  <textarea
                    value={draftIntegration.accessToken}
                    onChange={(event) => updateDraft('accessToken', event.target.value)}
                    placeholder={platformConfig.accessTokenPlaceholder}
                    className="w-full min-h-[96px] rounded-[10px] bg-white/10 border border-white/10 px-4 py-3 text-white placeholder:text-white/45 outline-none focus:border-white/25 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[1.05rem] text-white font-semibold mb-1">{platformConfig.typeLabel}</label>
                  <select
                    value={draftIntegration.pixelType}
                    onChange={(event) => updateDraft('pixelType', event.target.value)}
                    className="w-full h-[46px] rounded-[10px] bg-transparent border border-white/25 px-3 text-white outline-none"
                  >
                    <option value="Servidor" className="bg-[#1f2023]">Servidor</option>
                    <option value="Navegador" className="bg-[#1f2023]">Navegador</option>
                    <option value="Híbrido" className="bg-[#1f2023]">Híbrido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[1.05rem] text-white font-semibold mb-2">{platformConfig.eventsLabel}</label>
                  <div className="rounded-[10px] border border-white/10 bg-[#1d1f23] px-4 py-3 flex flex-wrap gap-5">
                    {platformConfig.events.map((eventItem) => (
                      <button
                        key={eventItem.key}
                        type="button"
                        onClick={() => toggleDraftEvent(eventItem.key)}
                        className="flex items-center gap-2 text-white text-[1rem] font-semibold"
                      >
                        <CircleDot
                          size={14}
                          className={draftIntegration.events[eventItem.key] ? 'text-white' : 'text-white/40'}
                        />
                        {eventItem.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/10 mt-4"></div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelAddIntegration}
                  className="w-[54px] h-[42px] rounded-[10px] border border-white/20 bg-white/10 text-white/90 hover:bg-white/15 transition flex items-center justify-center"
                >
                  <X size={17} />
                </button>
                <button
                  type="button"
                  onClick={confirmAddIntegration}
                  className="w-[54px] h-[42px] rounded-[10px] border border-green-600/40 bg-[#30b34c] text-white hover:bg-[#27a843] transition flex items-center justify-center"
                >
                  <Check size={17} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 flex justify-center">
              <button
                type="button"
                onClick={startAddIntegration}
                className="h-[46px] px-6 rounded-[12px] border border-white/15 bg-white/10 text-white/80 font-semibold text-[1rem] hover:bg-white/15 hover:text-white transition flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Adicionar Nova Integração
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-white/12 flex justify-end">
          <button
            type="button"
            onClick={saveChanges}
            disabled={saving}
            className="h-[48px] px-6 rounded-[10px] border border-green-700/35 bg-[#30b34c] text-white text-[1rem] font-semibold hover:bg-[#27a843] transition disabled:opacity-60 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </section>
    </div>
  );
}
