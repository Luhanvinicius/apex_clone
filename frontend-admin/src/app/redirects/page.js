"use client"

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, Copy, ExternalLink, Trash2, X } from 'lucide-react';

const TABS = [
  { id: 'redirectors', label: 'Redirecionadores' },
  { id: 'utm', label: 'Gerador de Links UTM' },
  { id: 'domains', label: 'Domínios Próprios' }
];

const UTM_MODELS = [
  { id: 'personalizado', label: 'Personalizado' },
  { id: 'meta', label: 'Padrão UTMify Meta Ads' },
  { id: 'tiktok', label: 'Padrão UTMify Tiktok Ads' },
  { id: 'kwai', label: 'Padrão UTMify Kwai Ads' }
];

const UTM_PRESETS = {
  meta: {
    source: 'meta',
    campaign: 'campanha',
    medium: 'cpc',
    content: 'conteudo',
    term: 'termo',
    id: 'id'
  },
  tiktok: {
    source: 'tiktok',
    campaign: 'campanha',
    medium: 'cpc',
    content: 'conteudo',
    term: 'termo',
    id: 'id'
  },
  kwai: {
    source: 'kwai',
    campaign: 'campanha',
    medium: 'cpc',
    content: 'conteudo',
    term: 'termo',
    id: 'id'
  }
};

const UTM_FIELDS = [
  { key: 'source', label: 'UTM Source *', placeholder: 'Ex: fonte' },
  { key: 'campaign', label: 'UTM Campaign *', placeholder: 'Ex: campanha' },
  { key: 'medium', label: 'UTM Medium *', placeholder: 'Ex: meio' },
  { key: 'content', label: 'UTM Content *', placeholder: 'Ex: conteudo' },
  { key: 'term', label: 'UTM Term *', placeholder: 'Ex: termo' },
  { key: 'id', label: 'UTM ID *', placeholder: 'Ex: id' }
];

const SYSTEM_DOMAIN = {
  id: 'system-apextry',
  host: 'apextry.com',
  verified: true,
  system: true
};

const DOMAIN_STORAGE_KEY = 'redirect_custom_domains_v1';

function buildTelegramLink(username) {
  if (!username) return null;
  const clean = String(username).replace(/^@/, '').trim();
  return clean ? `https://t.me/${clean}` : null;
}

function normalizeSlug(slug) {
  return String(slug || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

function generateApxValue(slug) {
  const normalized = normalizeSlug(slug);
  if (!normalized) return '';
  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) % 1000000007;
  }
  const base = Math.abs(hash).toString(36).padStart(5, '0').slice(0, 5);
  return `ohx${base}`;
}

function normalizeDomain(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .replace(/^www\./, '');
}

export default function RedirectsPage() {
  const [activeTab, setActiveTab] = useState('redirectors');
  const [redirects, setRedirects] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState('');
  const [selectedBots, setSelectedBots] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [form, setForm] = useState({
    slug: '',
    mode: 'aleatorio',
    redirectActive: true,
    cloakerActive: false
  });
  const [utmForm, setUtmForm] = useState({
    slug: '',
    model: 'personalizado',
    source: '',
    campaign: '',
    medium: '',
    content: '',
    term: '',
    id: '',
    code: '',
    apx: ''
  });
  const [domainInput, setDomainInput] = useState('');
  const [domains, setDomains] = useState([SYSTEM_DOMAIN]);
  const [domainFeedback, setDomainFeedback] = useState(null);

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(DOMAIN_STORAGE_KEY);
      if (!cached) return;
      const parsed = JSON.parse(cached);
      if (!Array.isArray(parsed)) return;
      const normalized = parsed
        .map((item) => ({
          id: item.id || `${Date.now()}-${Math.random()}`,
          host: normalizeDomain(item.host),
          verified: Boolean(item.verified),
          system: false
        }))
        .filter((item) => item.host);
      setDomains([SYSTEM_DOMAIN, ...normalized]);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const customDomains = domains.filter((item) => !item.system);
    localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(customDomains));
  }, [domains]);

  const availableBots = useMemo(
    () => bots.filter((bot) => !selectedBots.find((selected) => selected.id === bot.id)),
    [bots, selectedBots]
  );

  async function bootstrap() {
    setLoading(true);
    try {
      const [redirectsRes, botsRes] = await Promise.all([
        axios.get('/api/redirects'),
        axios.get('/api/config')
      ]);
      setRedirects(Array.isArray(redirectsRes.data) ? redirectsRes.data : []);
      setBots(Array.isArray(botsRes.data) ? botsRes.data : []);
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', text: 'Falha ao carregar redirecionadores.' });
    } finally {
      setLoading(false);
    }
  }

  function pickBot(botId) {
    if (!botId) return;
    const found = bots.find((bot) => String(bot.id) === String(botId));
    if (!found) return;
    setSelectedBots((prev) => {
      if (prev.find((item) => item.id === found.id)) return prev;
      return [...prev, found];
    });
    setSelectedBotId('');
  }

  function removeSelectedBot(botId) {
    setSelectedBots((prev) => prev.filter((bot) => bot.id !== botId));
  }

  function clearForm() {
    setForm({
      slug: '',
      mode: 'aleatorio',
      redirectActive: true,
      cloakerActive: false
    });
    setSelectedBotId('');
    setSelectedBots([]);
    setFeedback(null);
  }

  function clearUtmForm() {
    setUtmForm({
      slug: '',
      model: 'personalizado',
      source: '',
      campaign: '',
      medium: '',
      content: '',
      term: '',
      id: '',
      code: '',
      apx: ''
    });
  }

  function handleUtmModelChange(modelId) {
    setUtmForm((prev) => {
      if (modelId === 'personalizado') {
        return { ...prev, model: modelId };
      }
      const preset = UTM_PRESETS[modelId];
      if (!preset) return { ...prev, model: modelId };
      return {
        ...prev,
        model: modelId,
        source: preset.source,
        campaign: preset.campaign,
        medium: preset.medium,
        content: preset.content,
        term: preset.term,
        id: preset.id
      };
    });
  }

  function handleUtmSlugChange(slugValue) {
    setUtmForm((prev) => ({
      ...prev,
      slug: slugValue,
      apx: generateApxValue(slugValue)
    }));
  }

  function updateUtmField(field, value) {
    setUtmForm((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  function addDomain() {
    const normalized = normalizeDomain(domainInput);
    const validDomainPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

    if (!normalized || !validDomainPattern.test(normalized)) {
      setDomainFeedback({ type: 'error', text: 'Informe um domínio válido (ex: meudominio.com).' });
      return;
    }

    const exists = domains.some((item) => item.host === normalized);
    if (exists) {
      setDomainFeedback({ type: 'error', text: 'Este domínio já foi adicionado.' });
      return;
    }

    setDomains((prev) => [
      ...prev,
      {
        id: `domain-${Date.now()}`,
        host: normalized,
        verified: false,
        system: false
      }
    ]);
    setDomainInput('');
    setDomainFeedback({ type: 'success', text: 'Domínio adicionado. Configure o CNAME e clique em Verificar.' });
  }

  function verifyDomain(domainId) {
    setDomains((prev) =>
      prev.map((item) => (item.id === domainId ? { ...item, verified: true } : item))
    );
    setDomainFeedback({ type: 'success', text: 'Domínio marcado como verificado.' });
  }

  function removeDomain(domainId) {
    setDomains((prev) => prev.filter((item) => item.id !== domainId));
  }

  function buildTarget() {
    const primary = selectedBots[0];
    if (!primary) return 'https://apexvips.com';
    return (
      buildTelegramLink(primary.supportUsername) ||
      buildTelegramLink(primary.botUsername) ||
      'https://apexvips.com'
    );
  }

  async function createRedirect() {
    const slug = normalizeSlug(form.slug);
    if (!slug) {
      setFeedback({ type: 'error', text: 'Informe um slug válido.' });
      return;
    }

    setCreating(true);
    setFeedback(null);
    try {
      await axios.post('/api/redirects', {
        name: slug,
        slug,
        target: buildTarget()
      });
      await bootstrap();
      clearForm();
      setFeedback({ type: 'success', text: 'Redirecionador criado com sucesso.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', text: 'Não foi possível criar o redirecionador.' });
    } finally {
      setCreating(false);
    }
  }

  async function removeRedirect(id) {
    try {
      await axios.delete(`/api/redirects/${id}`);
      await bootstrap();
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', text: 'Falha ao remover redirecionador.' });
    }
  }

  function copyRedirect(slug) {
    const link = `${window.location.origin.replace('3000', '5001')}/r/${slug}`;
    navigator.clipboard.writeText(link);
    setFeedback({ type: 'success', text: 'Link copiado para a área de transferência.' });
  }

  if (loading) {
    return (
      <div className="w-full pb-10 pt-1">
        <div className="rounded-[18px] border border-white/10 bg-[#1f2023] px-6 py-8 text-center text-white/60">
          Carregando redirecionadores...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 pt-1 animate-in fade-in duration-500">
      <section className="w-full rounded-[18px] border border-white/10 bg-[#1f2023] shadow-[0_8px_35px_rgba(0,0,0,0.35)] px-5 md:px-6 py-6">
        <h1 className="text-[2.15rem] md:text-[2.5rem] leading-none font-bold text-white">Configurar Redirecionadores</h1>

        <div className="flex flex-wrap items-end gap-2 border-b border-white/12 mt-5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-[50px] px-4 rounded-t-[10px] text-[0.95rem] font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border-b-2 border-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'redirectors' ? (
          <>
            <div className="mt-4 space-y-2">
              <p className="text-[1rem] font-semibold">
                <span className="text-[#ffb323]">Atenção:</span>{' '}
                <span className="text-white">
                  Pode demorar entre 2-5 minutos para as atualizações serem feitas e aplicadas!
                </span>
              </p>
              <a
                href="https://apexvips.com/tutorial/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.95rem] underline text-white/90 hover:text-white"
              >
                Clique aqui para acessar o tutorial de como usar os redirecionadores.
              </a>
            </div>

            {feedback && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-[0.9rem] ${
                  feedback.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {feedback.text}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-4">
              <div className="rounded-[20px] border border-white/10 bg-[#202225]/70 px-5 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
                <h2 className="text-[2rem] leading-none font-bold text-white mb-5">Criar Novo Redirecionador</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.95rem] text-white/70 mb-2">Slug</label>
                    <input
                      value={form.slug}
                      onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                      placeholder="Digite o slug..."
                      className="w-full h-[46px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-white placeholder:text-white/40 outline-none focus:border-white/25"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.95rem] text-white/70 mb-2">Modo de Redirecionamento</label>
                    <select
                      value={form.mode}
                      onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value }))}
                      className="w-full h-[46px] rounded-[10px] bg-transparent border border-white/25 px-3 text-white outline-none"
                    >
                      <option value="aleatorio" className="bg-[#1f2023]">Aleatório</option>
                      <option value="sequencial" className="bg-[#1f2023]">Sequencial</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 mt-5">
                  <label className="flex items-center gap-3 text-[0.95rem] text-white/70">
                    <input
                      type="checkbox"
                      checked={form.redirectActive}
                      onChange={(event) => setForm((prev) => ({ ...prev, redirectActive: event.target.checked }))}
                      className="w-5 h-5 rounded bg-transparent border border-white/35 accent-white"
                    />
                    Redirecionador Ativo
                  </label>
                  <label className="flex items-center gap-3 text-[0.95rem] text-white/70">
                    <input
                      type="checkbox"
                      checked={form.cloakerActive}
                      onChange={(event) => setForm((prev) => ({ ...prev, cloakerActive: event.target.checked }))}
                      className="w-5 h-5 rounded bg-transparent border border-white/35 accent-white"
                    />
                    Cloaker + AntiClone Ativo
                  </label>
                </div>

                <div className="mt-5">
                  <p className="text-[0.95rem] text-white/70 mb-2">Bots Selecionados</p>
                  <div className="rounded-[14px] border border-white/10 bg-[#1d1f23] min-h-[190px] p-4">
                    {selectedBots.length === 0 ? (
                      <div className="h-full min-h-[130px] flex items-center justify-center text-center text-[0.95rem] text-white/70">
                        Nenhum bot selecionado
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedBots.map((bot) => (
                          <span
                            key={bot.id}
                            className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-[0.82rem] text-white"
                          >
                            {bot.botUsername || `Bot #${bot.id}`}
                            <button onClick={() => removeSelectedBot(bot.id)} className="text-white/70 hover:text-white">
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <select
                    value={selectedBotId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelectedBotId(value);
                      pickBot(value);
                    }}
                    className="w-full h-[42px] rounded-[10px] bg-transparent border border-white/25 px-3 text-white outline-none"
                  >
                    <option value="" className="bg-[#1f2023]">Adicionar bot...</option>
                    {availableBots.map((bot) => (
                      <option key={bot.id} value={bot.id} className="bg-[#1f2023]">
                        {bot.botUsername || `Bot #${bot.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={createRedirect}
                    disabled={creating}
                    className="h-[50px] rounded-[10px] border border-white/25 text-white text-[1rem] font-semibold hover:bg-white/5 transition disabled:opacity-50"
                  >
                    {creating ? 'Criando...' : 'Criar Redirecionador'}
                  </button>
                  <button
                    onClick={clearForm}
                    className="h-[50px] rounded-[10px] border border-white/25 text-white text-[1rem] font-semibold hover:bg-white/5 transition"
                  >
                    Limpar Formulário
                  </button>
                </div>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-[#202225]/70 px-5 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
                <h2 className="text-[2rem] leading-none font-bold text-white mb-5">Redirecionadores Existentes</h2>
                {redirects.length === 0 ? (
                  <div className="min-h-[365px] flex flex-col">
                    <div className="flex-1 flex items-center justify-center text-center text-[2rem] text-white/90 font-semibold">
                      Nenhum redirecionador criado ainda
                    </div>
                    <div className="h-px bg-white/15"></div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[470px] overflow-auto pr-1">
                    {redirects.map((item) => (
                      <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-white font-semibold text-[1rem]">{item.name}</p>
                            <p className="text-white/65 text-[0.88rem] mt-1">/{item.slug}</p>
                            <p className="text-white/55 text-[0.82rem] mt-1 truncate max-w-[420px]">{item.target}</p>
                            <p className="text-white/55 text-[0.8rem] mt-1">Cliques: {item.clicks}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyRedirect(item.slug)}
                              className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              onClick={() => window.open(`${window.location.origin.replace('3000', '5001')}/r/${item.slug}`, '_blank')}
                              className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition"
                            >
                              <ExternalLink size={14} />
                            </button>
                            <button
                              onClick={() => removeRedirect(item.id)}
                              className="w-9 h-9 rounded-lg border border-red-500/40 flex items-center justify-center text-red-300 hover:text-red-100 hover:bg-red-500/20 transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
              <div className="rounded-[20px] border border-white/10 bg-[#202225]/70 px-5 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
                <h3 className="text-[2rem] leading-none font-bold text-white mb-4">Como aplicar o código de venda</h3>
                <p className="text-[0.95rem] text-white leading-[1.32]">
                  Para aplicar o <strong>código de venda</strong> no link de redirecionamento, basta adicionar o parâmetro{' '}
                  <code className="px-1 py-0.5 rounded bg-[#2a2a2a] text-[#e7b75f]">code=seu_código_de_venda</code>{' '}
                  ao final da URL.
                  <span className="inline-flex items-center justify-center ml-1 w-4 h-4 rounded bg-white/10 text-[0.68rem] font-bold text-[#e7b75f]">
                    ?
                  </span>
                </p>
                <p className="text-[0.95rem] font-semibold text-white mt-4 mb-2">Exemplo do link original:</p>
                <div className="rounded-[10px] bg-[#1a1c21] px-4 py-3 text-white/90 font-semibold text-[1.05rem] font-mono">
                  apextry.com/go/teste
                </div>
                <p className="text-[0.95rem] text-white mt-4 mb-2">
                  Com código de venda{' '}
                  <code className="px-1 py-0.5 rounded bg-[#2a2a2a] text-[#e7b75f]">12345</code>
                  , divulgue assim:
                </p>
                <div className="rounded-[10px] bg-[#1a1c21] px-4 py-3 text-white/90 font-semibold text-[1.05rem] font-mono">
                  apextry.com/go/teste?code=12345
                </div>
                <p className="text-[0.95rem] text-white mt-4">
                  Isso ajuda a rastrear corretamente as vendas feitas via esse código.
                </p>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-[#202225]/70 px-5 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
                <h3 className="text-[2rem] leading-none font-bold text-white mb-4">Como funciona o Cloaker + AntiClone</h3>
                <p className="text-[0.95rem] text-white leading-[1.32]">
                  <strong>O Cloaker + AntiClone</strong> é uma ferramenta exclusiva para <strong>campanhas de anúncios</strong>. Ele protege
                  seu funil mostrando uma página diferente para o Meta Ads, evitando bloqueios e mantendo suas campanhas
                  100% seguras.
                </p>

                <p className="text-[0.95rem] text-white leading-[1.32] mt-4">
                  Ao ativar o Cloaker + AntiClone na ApexVips, cada link de redirecionamento recebe um parâmetro único{' '}
                  <code className="px-1 py-0.5 rounded bg-[#2a2a2a] text-[#e7b75f]">apx</code>. Esse parâmetro deve ser
                  configurado diretamente nos <strong>Parâmetros de URL</strong> da sua campanha no Meta Ads. Por exemplo:
                </p>
                <p className="text-[0.95rem] font-semibold text-white mt-4 mb-2">URL do site:</p>
                <div className="rounded-[10px] bg-[#1a1c21] px-4 py-3 text-white/90 font-semibold text-[1.05rem] font-mono">
                  apextry.com/go/teste
                </div>
                <p className="text-[0.95rem] font-semibold text-white mt-4 mb-2">Parâmetros de URL:</p>
                <div className="rounded-[10px] bg-[#1a1c21] px-4 py-3 text-white/90 font-semibold text-[1.05rem] font-mono">
                  apx=ohx9lury
                </div>
                <p className="text-[0.95rem] text-white leading-[1.32] mt-4">
                  <strong>Importante:</strong> O valor{' '}
                  <code className="px-1 py-0.5 rounded bg-[#2a2a2a] text-[#e7b75f]">ohx9lury</code> é apenas um exemplo. Cada
                  link gerado pela ApexVips terá seu próprio{' '}
                  <code className="px-1 py-0.5 rounded bg-[#2a2a2a] text-[#e7b75f]">apx</code> único, criado automaticamente.
                  Este parâmetro é obrigatório para o funcionamento do Cloaker + AntiClone, pois garante que apenas
                  cliques vindos diretamente dos anúncios do Meta Ads sejam rastreados, bloqueando acessos diretos
                  (como pela Biblioteca de Anúncios ou links copiados). Isso protege seu funil contra clonadores, bots e
                  acessos não autorizados.
                </p>
                <p className="text-[0.95rem] text-white leading-[1.32] mt-4">
                  <strong>Como usar?</strong> No gerenciador de anúncios, coloque o link puro em <strong>URL do site</strong> e
                  insira o <code className="px-1 py-0.5 rounded bg-[#2a2a2a] text-[#e7b75f]">apx</code> único no campo
                  <strong> Parâmetros de URL</strong>. Nunca altere ou remova o{' '}
                  <code className="px-1 py-0.5 rounded bg-[#2a2a2a] text-[#e7b75f]">apx</code>, pois ele é essencial para o
                  rastreamento correto e a segurança do seu funil.
                </p>
                <p className="text-[0.95rem] text-white mt-4 mb-2">
                  Se quiser adicionar um código de venda, como{' '}
                  <code className="px-1 py-0.5 rounded bg-[#2a2a2a] text-[#e7b75f]">12345</code>, os parâmetros ficam assim:
                </p>
                <div className="rounded-[10px] bg-[#1a1c21] px-4 py-3 text-white/90 font-semibold text-[1.05rem] font-mono">
                  apx=ohx9lury&code=12345
                </div>
                <p className="text-[0.95rem] leading-[1.35] mt-4">
                  <span className="text-[#ffb323] font-bold">Atenção:</span>{' '}
                  <span className="text-white">
                    Use o Cloaker + AntiClone apenas para tráfego de anúncios. Acessos diretos ao link (sem ser via Ads)
                    mostrarão uma página de erro, protegendo seu conteúdo.
                  </span>
                </p>
                <p className="text-[0.95rem] text-white mt-4 leading-[1.32]">
                  Quer configurar o Pixel do Meta Ads e o Cloaker + AntiClone?{' '}
                  <a
                    href="https://apexvips.com/tutorial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold hover:text-white/85"
                  >
                    Clique aqui
                  </a>{' '}
                  para o passo a passo completo!
                </p>
              </div>
            </div>
          </>
        ) : activeTab === 'utm' ? (
          <div className="mt-4 max-w-[940px] w-full">
            <div className="rounded-[20px] border border-white/10 bg-[#202225]/70 px-5 md:px-6 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
              <h2 className="text-[2.05rem] md:text-[2.2rem] leading-none font-bold text-white">Gerador de Links UTM</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-[0.95rem] text-white/70 mb-2">Slug do Redirecionador</label>
                  <select
                    value={utmForm.slug}
                    onChange={(event) => handleUtmSlugChange(event.target.value)}
                    className="w-full h-[42px] rounded-[9px] bg-transparent border border-white/30 px-3 text-[0.95rem] text-white outline-none focus:border-white/45"
                  >
                    <option value="" className="bg-[#1f2023]">Selecione um slug...</option>
                    {redirects.filter((item) => item.slug).map((item) => (
                      <option key={item.id} value={item.slug} className="bg-[#1f2023]">
                        {item.slug}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.95rem] text-white/70 mb-2">Modelo UTM</label>
                  <select
                    value={utmForm.model}
                    onChange={(event) => handleUtmModelChange(event.target.value)}
                    className="w-full h-[42px] rounded-[9px] bg-transparent border border-[#b7ad4a] px-3 text-[0.95rem] text-white outline-none focus:border-[#d7cb58]"
                  >
                    {UTM_MODELS.map((model) => (
                      <option key={model.id} value={model.id} className="bg-[#1f2023]">
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 mt-3">
                {UTM_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="block text-[0.95rem] text-white/70 mb-2">{field.label}</label>
                    <input
                      value={utmForm[field.key]}
                      onChange={(event) => updateUtmField(field.key, event.target.value)}
                      placeholder={field.placeholder}
                      className="w-full h-[44px] rounded-[10px] bg-[#1d1f23] border border-white/5 px-4 text-white placeholder:text-white/45 outline-none focus:border-white/20"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-[0.95rem] text-white/70 mb-2">Código de Venda (Opcional)</label>
                  <input
                    value={utmForm.code}
                    onChange={(event) => updateUtmField('code', event.target.value)}
                    placeholder="Ex: 123"
                    className="w-full h-[44px] rounded-[10px] bg-white/10 border border-white/8 px-4 text-white placeholder:text-white/45 outline-none focus:border-white/20"
                  />
                </div>

                <div>
                  <label className="block text-[0.95rem] text-white/70 mb-2">APX (uso obrigatório para cloaker + anticlone)</label>
                  <input
                    value={utmForm.apx}
                    readOnly
                    placeholder="Gerado ao selecionar a slug"
                    className="w-full h-[44px] rounded-[10px] bg-white/10 border border-white/8 px-4 text-white/70 placeholder:text-white/45 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-0.5">
                <p className="text-[0.95rem] leading-tight text-[#ff4f4f]">
                  * Preencha todos os campos obrigatórios para gerar o link.
                </p>
                <p className="text-[0.95rem] leading-tight text-[#ff4f4f]">
                  * No modo personalizado, todos os parâmetros UTM devem ter valores diferentes.
                </p>
              </div>

              <button
                onClick={clearUtmForm}
                className="mt-6 h-[52px] px-5 rounded-[10px] border border-white/25 text-white text-[1rem] font-semibold hover:bg-white/5 transition"
              >
                Limpar Campos
              </button>
            </div>
          </div>
        ) : activeTab === 'domains' ? (
          <div className="mt-4">
            <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-6">
              <div className="rounded-[20px] border border-white/10 bg-[#202225]/70 px-5 md:px-6 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
                <h2 className="text-[2.05rem] md:text-[2.2rem] leading-none font-bold text-white">Adicionar Domínio Próprio</h2>
                <p className="mt-3 text-[1rem] text-white/75">
                  Use seu próprio domínio para links de redirecionamento
                </p>

                <div className="mt-4">
                  <label className="block text-[0.95rem] text-white/70 mb-2">Domínio</label>
                  <input
                    value={domainInput}
                    onChange={(event) => setDomainInput(event.target.value)}
                    placeholder="Ex: meudominio.com"
                    className="w-full h-[52px] rounded-[10px] bg-white/10 border border-white/10 px-4 text-white placeholder:text-white/45 outline-none focus:border-white/25"
                  />
                </div>

                <button
                  onClick={addDomain}
                  className="mt-6 h-[52px] px-7 rounded-[10px] border border-white/25 text-white text-[1rem] font-semibold hover:bg-white/5 transition"
                >
                  Adicionar
                </button>

                {domainFeedback && (
                  <p
                    className={`mt-3 text-[0.92rem] ${
                      domainFeedback.type === 'success' ? 'text-green-300' : 'text-red-300'
                    }`}
                  >
                    {domainFeedback.text}
                  </p>
                )}

                <p className="mt-4 text-[1rem] text-white/75 leading-[1.34]">
                  <span className="font-semibold">Como funciona:</span> Após adicionar o domínio, configure um registro
                  CNAME no DNS apontando para{' '}
                  <span className="text-[#e7b75f] font-semibold">apextry.com</span> e clique em Verificar.
                </p>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-[#202225]/70 px-5 md:px-6 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
                <h3 className="text-[2.05rem] md:text-[2.2rem] leading-none font-bold text-white">Meus Domínios</h3>

                <div className="mt-4 rounded-[14px] border border-[#946915] bg-[#46351466] px-4 py-3 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-[#ffcf58] mt-[2px] shrink-0" />
                  <p className="text-[1rem] leading-[1.3] text-white font-semibold">
                    Domínios não verificados são removidos automaticamente após 1 hora. Certifique-se de configurar o
                    DNS e clicar em Verificar.
                  </p>
                </div>

                <div className="mt-4 rounded-[14px] border border-white/10 bg-[#1d1f23] p-4 space-y-3">
                  {domains.map((item) => (
                    <div key={item.id} className="rounded-[12px] border border-white/8 bg-white/[0.02] px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center px-3 h-[40px] rounded-[10px] bg-white/10 border border-white/10 text-white font-semibold text-[0.96rem] leading-none">
                          {item.host}
                        </span>

                        {item.verified ? (
                          <span className="inline-flex items-center px-3 h-[40px] rounded-[10px] bg-green-500/15 border border-green-500/30 text-green-400 font-bold text-[0.95rem]">
                            ✅ {item.system ? 'Domínio do Sistema' : 'Verificado'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => verifyDomain(item.id)}
                              className="h-[38px] px-3 rounded-[9px] border border-[#b78e32] text-[#ffd27a] text-[0.88rem] font-semibold hover:bg-[#b78e32]/10 transition"
                            >
                              Verificar
                            </button>
                            <button
                              onClick={() => removeDomain(item.id)}
                              className="h-[38px] px-3 rounded-[9px] border border-red-500/35 text-red-300 text-[0.88rem] font-semibold hover:bg-red-500/10 transition"
                            >
                              Remover
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[20px] border border-white/10 bg-[#202225]/70 px-6 py-10 text-center">
            <p className="text-[1.2rem] font-semibold text-white">Em breve</p>
            <p className="text-[0.95rem] text-white/70 mt-2">
              Esta seção segue o mesmo padrão visual do oficial e será habilitada na próxima etapa.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
