"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  AlertCircle,
  BarChart3,
  BadgeDollarSign,
  BadgePercent,
  Bot,
  Braces,
  Check,
  Clock3,
  DownloadCloud,
  FolderOpen,
  Mail,
  PlusCircle,
  Pencil,
  Phone,
  Save,
  Settings2,
  Share2,
  Trash2,
  Upload,
  UserPlus,
  Webhook,
  X,
  Zap
} from 'lucide-react';

const MAX_WELCOME_LENGTH = 4096;
const MAX_DOWNSELL_LENGTH = 4096;
const MAX_UPSELL_LENGTH = 4096;
const MAX_ORDER_BUMP_TEXT = 4096;
const MAX_ORDER_BUMP_DELIVERABLES = 2500;
const MAX_AUTO_APPROVAL_MESSAGE = 4096;

const QUICK_ACTIONS = [
  { id: 'profile', label: 'Perfil Bot', icon: Bot },
  { id: 'variables', label: 'Variáveis', icon: Braces },
  { id: 'share', label: 'Share Key', icon: Share2 },
  { id: 'config', label: 'Config Key', icon: DownloadCloud }
];

const TAB_ITEMS = [
  { id: 'editar', label: 'Editar Bot', icon: Settings2, href: '/settings' },
  { id: 'downsell', label: 'Downsell', icon: Upload, href: '/downsell' },
  { id: 'upsell', label: 'Upsell', icon: Upload, href: '/upsell' },
  { id: 'venda', label: 'Código de Venda', icon: BadgeDollarSign, href: '/sales-code' },
  { id: 'aprovacao', label: 'Aprovação Automática', icon: Zap, href: '/auto-approval' },
  { id: 'leads', label: 'Captação de Leads', icon: UserPlus, href: '/lead-capture' },
  { id: 'webhook', label: 'Webhook', icon: Webhook, href: '/webhook' }
];

const INPUT_CLASS =
  'w-full h-[52px] rounded-[10px] bg-white/[0.1] border border-white/10 px-4 text-[1.02rem] text-white placeholder:text-white/45 outline-none focus:border-white/25';

const TEXTAREA_CLASS =
  'w-full rounded-[10px] bg-white/[0.1] border border-white/10 px-4 py-3 text-[1.02rem] text-white placeholder:text-white/45 outline-none focus:border-white/25 resize-none';

const SMALL_CONTROL_CLASS =
  'h-[34px] w-full rounded-[8px] bg-[#232428] border border-white/20 px-3 text-[0.95rem] text-white outline-none';

const DOWSELL_TIME_OPTIONS = ['20 min', '1 dia', '3 dias'];
const DOWSELL_DISCOUNT_OPTIONS = ['Sem Desconto', '5%', '10%', '20%'];
const DOWSELL_BUTTON_MODE_OPTIONS = ['Planos globais: Assinaturas + Pacotes', 'Somente Assinaturas', 'Somente Pacotes'];
const DOWSELL_TRIGGER_OPTIONS = ['No /start (1ª entrada)', 'Após tentativa de compra', 'Sem clicar em checkout'];
const DOWSELL_AUDIENCE_OPTIONS = ['Novos (nunca compraram)', 'Todos os usuários', 'Expirados'];
const UPSELL_TIME_OPTIONS = ['20 min', '1 hora', '3 horas', '1 dia', '3 dias'];
const UPSELL_AUDIENCE_OPTIONS = ['Todos os cadastrados', 'Ativos', 'Expirados', 'Pendentes'];
const UPSELL_SEND_MODE_OPTIONS = [
  'Padrão — envia todas as mensagens após cada compra',
  'Sequencial — envia uma mensagem por compra',
  'Aleatório — envia uma mensagem aleatória por compra'
];
const SALE_CODE_TUTORIAL_URL = 'https://apexvips.com/tutorial/codigo-de-venda';
const AUTO_APPROVAL_TUTORIAL_URL = 'https://apexvips.com/tutorial/aprovacao-automatica';
const AUTO_APPROVAL_TIME_OPTIONS = ['Imediato', '10 segundos', '30 segundos', '1 minuto'];
const AUTO_APPROVAL_ACTION_OPTIONS = ['Aprovar e Enviar Mensagem', 'Apenas Aprovar', 'Rejeitar e Enviar Mensagem'];
const AUTO_APPROVAL_BUTTON_MODE_OPTIONS = ['Botões próprios dessa mensagem', 'Botões do bot', 'Sem botões'];
const LEAD_CAPTURE_MOMENT_OPTIONS = ['Start'];
const DEFAULT_PROFILE_NAME = 'Baiano Escoliotico';
const DEFAULT_PROFILE_BIO = `🔥Vip da Micaelle🔥
Com + de 200 mídias atualizada todo mês 😈🙈

• Exibicionismo
• Sexo anal
• Sexo Lésbico
• Sexo Oral
• Audios Gemendo 

🔥Mega promoção por apenas R$9,90🔥`;
const VARIABLE_ITEMS = [
  { value: '{profile_name}', description: 'Funciona em qualquer texto.' },
  { value: '{country}', description: 'Requer Redirecionadores ou Captação de Leads.' },
  { value: '{state}', description: 'Requer Redirecionadores ou Captação de Leads.' },
  { value: '{city}', description: 'Requer Redirecionadores ou Captação de Leads.' }
];
const BUTTON_COLOR_OPTIONS = [
  { value: '{#FF0000}', label: 'Vermelho', dotClass: 'bg-red-500' },
  { value: '{#0000FF}', label: 'Azul', dotClass: 'bg-blue-500' },
  { value: '{#00FF00}', label: 'Verde', dotClass: 'bg-green-500' }
];
const SHARE_KEY_HELPER = 'Este compartilhamento só funciona para bots vinculados à mesma conta da ApexVips.';
const WEBHOOK_EXAMPLES = [
  {
    title: 'Evento: user_joined',
    payload: `{
  "event": "user_joined",
  "timestamp": 1732250000,
  "bot_id": 123456789,
  "customer": {
    "chat_id": 987654321,
    "profile_name": "John Doe",
    "username": "@johndoe"
  },
  "origin": {
    "ip": "187.44.120.57",
    "country": "Brazil",
    "state": "São Paulo",
    "city": "Campinas",
    "user_agent": "Mozilla/5.0 (Linux; Android 12)"
  },
  "transaction": {
    "sale_code": "SALE-ABC123"
  },
  "tracking": {
    "click_id": "a1b2c3d4e5f6g7h8",
    "slug": "campanha_inicial",
    "utm_source": "instagram",
    "utm_medium": "ads",
    "utm_campaign": "promo_black_friday",
    "utm_term": "vip+conteudo",
    "utm_content": "banner_topo",
    "utm_id": "UTM12345"
  }
}`
  },
  {
    title: 'Evento: payment_created',
    payload: `{
  "event": "payment_created",
  "timestamp": 1732251000,
  "bot_id": 123456789,
  "customer": {
    "chat_id": 987654321,
    "profile_name": "John Doe",
    "username": "@johndoe",
    "phone": "+5511999999999",
    "full_name": "Johnathan Doe",
    "tax_id": "123.456.789-00"
  },
  "origin": {
    "ip": "187.44.120.57",
    "country": "Brazil",
    "state": "São Paulo",
    "city": "Campinas",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0)"
  },
  "transaction": {
    "internal_transaction_id": "xxxxxxxx",
    "external_transaction_id": "xxxxxxxx",
    "sale_code": "SALE-XYZ789",
    "category": "Assinatura Premium",
    "plan_name": "Plano Normal",
    "plan_value": 4990,
    "plan_duration": "30 dias",
    "currency": "BRL",
    "payment_pointer": "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef12345678905204000053039865405499.905802BR5925NOME DO RECEBEDOR LTDA6009SAO PAULO62070503***63041D3A",
    "payment_platform": "pushinpay",
    "payment_method": "pix"
  },
  "tracking": {
    "click_id": "b2c3d4e5f6g7h8i9",
    "slug": "campanha_google",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "google_ads_novembro",
    "utm_term": "conteudo+vip",
    "utm_content": "banner_lateral",
    "utm_id": "UTM998877"
  }
}`
  },
  {
    title: 'Evento: payment_approved',
    payload: `{
  "event": "payment_approved",
  "timestamp": 1732252000,
  "bot_id": 123456789,
  "customer": {
    "chat_id": 987654321,
    "profile_name": "John Doe",
    "username": "@johndoe",
    "phone": "+5511999999999",
    "full_name": "Johnathan Doe",
    "tax_id": "123.456.789-00"
  },
  "origin": {
    "ip": "187.44.120.57",
    "country": "Brazil",
    "state": "São Paulo",
    "city": "Campinas",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_0)"
  },
  "transaction": {
    "internal_transaction_id": "xxxxxxxx",
    "external_transaction_id": "xxxxxxxx",
    "sale_code": "SALE-XYZ789",
    "category": "Assinatura Premium",
    "plan_name": "Plano Normal",
    "plan_value": 4990,
    "plan_duration": "30 dias",
    "currency": "BRL",
    "payment_pointer": "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef12345678905204000053039865405499.905802BR5925NOME DO RECEBEDOR LTDA6009SAO PAULO62070503***63041D3A",
    "payment_platform": "pushinpay",
    "payment_method": "pix"
  },
  "tracking": {
    "click_id": "c3d4e5f6g7h8i9j0",
    "slug": "campanha_facebook",
    "utm_source": "facebook",
    "utm_medium": "ads",
    "utm_campaign": "fb_ads_2025",
    "utm_term": "vip+conteudos",
    "utm_content": "video_chamada",
    "utm_id": "UTM556677"
  }
}`
  }
];

const DEFAULT_DOWNSELL_TEXTS = [
  'Oi, tudo bem? 😄 Eu percebi que você deu uma olhadinha nas nossas ofertas, mas ainda não finalizou a sua compra.\nQue tal dar esse passo agora? Você vai adorar tudo o que temos para você. Clique aqui e descubra!',
  'Ei, você! 👋 Já se passaram alguns dias desde que você acessou o bot e ainda não completou sua compra.\nPosso te garantir: é super rápido e fácil! Venha fazer parte dessa experiência incrível!',
  'Oi de novo! 🚀 Não deixe essa chance passar! Em menos de 2 minutinhos, você pode finalizar sua compra e ter acesso a tudo o que sempre quis.'
];

function buildDownsellMessage(index, textOverride = '') {
  return {
    id: `downsell-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: `Mensagem ${index + 1}`,
    text: textOverride || DEFAULT_DOWNSELL_TEXTS[index] || '',
    time: DOWSELL_TIME_OPTIONS[Math.min(index, DOWSELL_TIME_OPTIONS.length - 1)],
    discount: DOWSELL_DISCOUNT_OPTIONS[0],
    buttonMode: DOWSELL_BUTTON_MODE_OPTIONS[0],
    trigger: DOWSELL_TRIGGER_OPTIONS[0],
    audience: DOWSELL_AUDIENCE_OPTIONS[0],
    mediaName: '',
    audioName: ''
  };
}

function buildDefaultDownsellMessages(primaryMessage = '') {
  return [
    buildDownsellMessage(0, primaryMessage || DEFAULT_DOWNSELL_TEXTS[0]),
    buildDownsellMessage(1),
    buildDownsellMessage(2)
  ];
}

function buildUpsellMessage(index, textOverride = '') {
  return {
    id: `upsell-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: `Mensagem ${index + 1}`,
    text: textOverride,
    time: UPSELL_TIME_OPTIONS[0],
    audience: UPSELL_AUDIENCE_OPTIONS[0],
    mediaName: '',
    audioName: ''
  };
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const PLAN_DURATION_OPTIONS = [
  'Selecione a duração',
  'Diário',
  'Semanal',
  'Quinzenal',
  'Mensal',
  'Bimestral',
  'Trimestral',
  'Semestral',
  'Anual',
  'Vitalício',
  'Personalizado'
];

const CTA_ACTION_OPTIONS = [
  'Planos Assinaturas, Planos Pacotes',
  'Planos Assinaturas',
  'Planos Pacotes',
  'Link externo'
];

const CUSTOM_BUTTON_TYPE_OPTIONS = ['Selecione o tipo', 'URL', 'MiniApp', 'Comando'];
const PRICE_VARIATION_DIRECTION_OPTIONS = ['Ambos (± centavos)', 'Somente + centavos', 'Somente - centavos'];
const PIX_QR_DISPLAY_OPTIONS = ['Mostrar QR Code diretamente no chat', 'Enviar QR como mídia'];
const PIX_CODE_FORMAT_OPTIONS = ['Blockquote', 'Código inline'];
const ORDER_BUMP_VARIABLES = ['{selected_plan_name}', '{order_bump_name}', '{order_bump_value}', '{total_value}'];

function createSubscriptionItem(index = 1) {
  return {
    id: makeId('sub'),
    title: `Plano ${index}`,
    name: '',
    price: '',
    duration: PLAN_DURATION_OPTIONS[0],
    orderBumpEnabled: false,
    orderBumpText: '',
    orderBumpAcceptText: 'Aceitar',
    orderBumpRejectText: 'Recusar',
    orderBumpMediaFileName: '',
    orderBumpAudioFileName: '',
    orderBumpName: '',
    orderBumpValue: '',
    orderBumpDeliverables: '',
    expanded: true
  };
}

function createPackageItem(index = 1) {
  return {
    id: makeId('pkg'),
    title: `Plano Pacote ${index}`,
    name: '',
    price: '',
    deliverables: '',
    orderBumpEnabled: false,
    orderBumpText: '',
    orderBumpAcceptText: 'Aceitar',
    orderBumpRejectText: 'Recusar',
    orderBumpMediaFileName: '',
    orderBumpAudioFileName: '',
    orderBumpName: '',
    orderBumpValue: '',
    orderBumpDeliverables: '',
    expanded: true
  };
}

function createSimpleButtonItem() {
  return {
    id: makeId('btn'),
    text: '',
    link: '',
    type: CUSTOM_BUTTON_TYPE_OPTIONS[0]
  };
}

function createAutoApprovalChannel() {
  return {
    id: makeId('auto-approval'),
    groupId: '',
    message: '',
    time: AUTO_APPROVAL_TIME_OPTIONS[0],
    action: AUTO_APPROVAL_ACTION_OPTIONS[0],
    buttonMode: AUTO_APPROVAL_BUTTON_MODE_OPTIONS[0],
    mediaName: '',
    audioName: '',
    customButtons: []
  };
}

function createAutoApprovalButton() {
  return {
    id: makeId('auto-btn'),
    text: '',
    link: '',
    type: CUSTOM_BUTTON_TYPE_OPTIONS[0]
  };
}

function createSocialProofItem(index = 1) {
  return {
    id: makeId('proof'),
    title: `Mensagem ${index}`,
    text: ''
  };
}

function buildDefaultEditBotExtras() {
  return {
    vipAccessMessage: '✅ Pagamento aprovado! Acesse o Grupo VIP aqui:\n🔗 {link_vip}',
    vipAccessMediaName: '',
    vipAccessAudioName: '',
    delayEnabled: false,
    delayAudio: '0',
    delayAudioTyping: false,
    delayMedia: '0',
    delayMediaTyping: false,
    delayText: '0',
    delayTextTyping: false,
    priceVariationEnabled: false,
    priceVariationCents: '0',
    priceVariationDirection: PRICE_VARIATION_DIRECTION_OPTIONS[0],
    ctaEnabled: false,
    ctaMessage: 'Garanta seu acesso a conteúdos exclusivos e descubra todas as opções disponíveis clicando no botão abaixo!',
    ctaButtonText: 'Acessar Agora',
    ctaAfterClickMessage: 'Selecione o plano abaixo:',
    ctaAction: CTA_ACTION_OPTIONS[0],
    pixMethodMessageEnabled: false,
    pixMethodMessage:
      '🌟 Plano selecionado:\n\n🎁 Plano: {plan_name}\n💰 Valor: {plan_value}\n⏳ Duração: {plan_duration}\n\nEscolha o método de pagamento abaixo:',
    pixButtonText: '💠 Pagar com Pix',
    paymentGeneratingText: '⏳ Aguarde alguns instantes, estamos gerando seu pagamento...',
    paymentCooldownText: '⏳ Aguarde alguns segundos antes de solicitar o pagamento novamente.',
    paymentUnconfirmedText: 'Ainda não identificamos seu pagamento. Caso já tenha pago, aguarde alguns instantes e tente novamente. {support}',
    socialProofEnabled: false,
    pixQrDisplay: PIX_QR_DISPLAY_OPTIONS[0],
    pixCodeFormat: PIX_CODE_FORMAT_OPTIONS[0],
    pixSeparateMessage: false,
    pixMainMessage:
      '{payment_pointer}\n\n👇 Toque na chave PIX acima para copiá-la\n\n‼️ Após o pagamento, clique no botão abaixo para verificar o status:',
    pixStatusButtonText: 'Verificar Status do Pagamento',
    pixQrButtonText: 'Mostrar QR Code',
    pixCopyButtonText: 'Copiar Chave Pix',
    pixMediaName: '',
    pixAudioName: ''
  };
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`h-[34px] w-[58px] rounded-full border p-1 transition ${checked ? 'bg-black border-white/15' : 'bg-white/20 border-transparent'}`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0'}`}
      />
    </button>
  );
}

function EditRow({ title, subtitle, actionLabel = 'Editar' }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/10 py-5">
      <div>
        <h4 className="text-[2.9rem] sm:text-[3.1rem] leading-none font-bold text-white/85">{title}</h4>
        <p className="mt-3 text-[1.8rem] leading-snug text-white/78">{subtitle}</p>
      </div>
      <button
        type="button"
        className="shrink-0 h-[44px] w-[56px] rounded-[12px] border border-white/20 bg-white/[0.05] text-white/80 hover:bg-white/[0.09] transition inline-flex items-center justify-center"
        aria-label={actionLabel}
      >
        <Pencil size={18} />
      </button>
    </div>
  );
}

function SectionActionButtons({ onRestore, onCancel, onConfirm }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {onRestore && (
        <button
          type="button"
          onClick={onRestore}
          className="h-[44px] px-5 rounded-[10px] bg-[#1375f6] text-white text-[0.95rem] font-semibold hover:bg-[#1e82ff] transition"
        >
          Restaurar Padrão
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        className="h-[44px] w-[54px] rounded-[10px] border border-white/15 bg-white/[0.08] text-white/80 inline-flex items-center justify-center"
      >
        <X size={17} />
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="h-[44px] w-[54px] rounded-[10px] bg-[#2eae4d] text-white inline-flex items-center justify-center"
      >
        <Check size={17} />
      </button>
    </div>
  );
}

export default function SettingsPage({ initialTab = 'editar' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [hasBotContext, setHasBotContext] = useState(true);
  const [creatingTestBot, setCreatingTestBot] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [mediaFileName, setMediaFileName] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [mediaSendMode, setMediaSendMode] = useState('Separadas');
  const [registerGroupId, setRegisterGroupId] = useState('');
  const [downsellMessages, setDownsellMessages] = useState(buildDefaultDownsellMessages());
  const [upsellMessages, setUpsellMessages] = useState([]);
  const [upsellSendMode, setUpsellSendMode] = useState(UPSELL_SEND_MODE_OPTIONS[0]);
  const [showUpsellSuccessToast, setShowUpsellSuccessToast] = useState(false);
  const [allowedSaleCodes, setAllowedSaleCodes] = useState([]);
  const [saleCodesRestricted, setSaleCodesRestricted] = useState(false);
  const [showSaleCodesToast, setShowSaleCodesToast] = useState(false);
  const [saleCodeInlineMode, setSaleCodeInlineMode] = useState(null);
  const [saleCodeDraftValue, setSaleCodeDraftValue] = useState('');
  const [saleCodeEditingIndex, setSaleCodeEditingIndex] = useState(null);
  const [editBotExtras, setEditBotExtras] = useState(buildDefaultEditBotExtras());
  const [subscriptionItems, setSubscriptionItems] = useState([]);
  const [packageItems, setPackageItems] = useState([]);
  const [customButtonItems, setCustomButtonItems] = useState([]);
  const [vipButtonItems, setVipButtonItems] = useState([]);
  const [socialProofItems, setSocialProofItems] = useState([createSocialProofItem(1)]);
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState(true);
  const [autoApprovalChannels, setAutoApprovalChannels] = useState([createAutoApprovalChannel()]);
  const [showAutoApprovalToast, setShowAutoApprovalToast] = useState(false);
  const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(false);
  const [leadCaptureMoment, setLeadCaptureMoment] = useState(LEAD_CAPTURE_MOMENT_OPTIONS[0]);
  const [leadCaptureBeforeText, setLeadCaptureBeforeText] = useState(
    'Para continuar, toque no botão abaixo e compartilhe seu número de telefone.'
  );
  const [leadCaptureAfterText, setLeadCaptureAfterText] = useState(
    'Número recebido com sucesso! Agradecemos seu contato.'
  );
  const [leadCaptureErrorText, setLeadCaptureErrorText] = useState(
    'Você só pode enviar seu próprio número usando o botão.'
  );
  const [leadCaptureButtonText, setLeadCaptureButtonText] = useState('Enviar número');
  const [leadCaptureMediaName, setLeadCaptureMediaName] = useState('');
  const [leadCaptureAudioName, setLeadCaptureAudioName] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileName, setProfileName] = useState(DEFAULT_PROFILE_NAME);
  const [profileBio, setProfileBio] = useState(DEFAULT_PROFILE_BIO);
  const [profileShortMessage, setProfileShortMessage] = useState('');
  const [profileImageName, setProfileImageName] = useState('');
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyToastMessage, setCopyToastMessage] = useState('');
  const [shareKeyValue, setShareKeyValue] = useState('');
  const [shareBots, setShareBots] = useState([]);
  const [shareTargetBotId, setShareTargetBotId] = useState('');
  const [showConfigKeyModal, setShowConfigKeyModal] = useState(false);
  const [configKeyValue, setConfigKeyValue] = useState('');
  const [configKeyPublic, setConfigKeyPublic] = useState(false);
  const [configKeyImportValue, setConfigKeyImportValue] = useState('');
  const [configKeySaving, setConfigKeySaving] = useState(false);

  const [config, setConfig] = useState({
    id: '',
    botToken: '',
    botUsername: 'Vipdamicabot',
    botExternalId: '59548',
    antiClone: false,
    startOnAnyText: false,
    welcomeMessage: '',
    supportUsername: '',
    vipGroupId: '',
    upsellEnabled: true,
    upsellMessage: '',
    downsellEnabled: true,
    downsellMessage: '',
    createdAt: ''
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    fetchData();
    const handleBotChange = () => fetchData();
    window.addEventListener('botChanged', handleBotChange);
    return () => window.removeEventListener('botChanged', handleBotChange);
  }, []);

  useEffect(() => {
    if (!selectedBotId) return;
    persistDownsellMessages(selectedBotId, downsellMessages);
  }, [selectedBotId, downsellMessages]);

  useEffect(() => {
    if (!selectedBotId) return;
    persistUpsellUi(selectedBotId, { messages: upsellMessages, sendMode: upsellSendMode });
  }, [selectedBotId, upsellMessages, upsellSendMode]);

  useEffect(() => {
    if (!selectedBotId) return;
    persistSaleCodesUi(selectedBotId, { restricted: saleCodesRestricted, allowedCodes: allowedSaleCodes });
  }, [selectedBotId, saleCodesRestricted, allowedSaleCodes]);

  useEffect(() => {
    if (!selectedBotId) return;
    persistEditBotUi(selectedBotId, {
      editBotExtras,
      subscriptionItems,
      packageItems,
      customButtonItems,
      vipButtonItems,
      socialProofItems
    });
  }, [selectedBotId, editBotExtras, subscriptionItems, packageItems, customButtonItems, vipButtonItems, socialProofItems]);

  useEffect(() => {
    if (!showUpsellSuccessToast) return;
    const timeoutId = setTimeout(() => setShowUpsellSuccessToast(false), 3200);
    return () => clearTimeout(timeoutId);
  }, [showUpsellSuccessToast]);

  useEffect(() => {
    if (!showSaleCodesToast) return;
    const timeoutId = setTimeout(() => setShowSaleCodesToast(false), 3200);
    return () => clearTimeout(timeoutId);
  }, [showSaleCodesToast]);

  useEffect(() => {
    if (!showAutoApprovalToast) return;
    const timeoutId = setTimeout(() => setShowAutoApprovalToast(false), 3200);
    return () => clearTimeout(timeoutId);
  }, [showAutoApprovalToast]);

  useEffect(() => {
    if (!copyToastMessage) return;
    const timeoutId = setTimeout(() => setCopyToastMessage(''), 3000);
    return () => clearTimeout(timeoutId);
  }, [copyToastMessage]);

  const welcomeLength = useMemo(() => String(config.welcomeMessage || '').length, [config.welcomeMessage]);

  const vipLink = useMemo(() => {
    const vipId = String(config.vipGroupId || '').trim();
    if (!vipId) {
      return 'Insira o ID do VIP no campo acima para gerar o link.';
    }
    const username = String(config.botUsername || '').replace('@', '').trim();
    if (!username) {
      return `https://t.me/share/url?text=${encodeURIComponent(`Grupo VIP: ${vipId}`)}`;
    }
    return `https://t.me/${username}`;
  }, [config.vipGroupId, config.botUsername]);

  function getDownsellStorageKey(botId) {
    return `apexclone_downsell_messages_${botId}`;
  }

  function getUpsellStorageKey(botId) {
    return `apexclone_upsell_ui_${botId}`;
  }

  function getEditBotStorageKey(botId) {
    return `apexclone_editbot_ui_${botId}`;
  }

  function getSaleCodesStorageKey(botId) {
    return `apexclone_sale_codes_${botId}`;
  }

  function getProfileStorageKey(botId) {
    return `apexclone_profile_${botId}`;
  }

  function getShareKeyStorageKey(botId) {
    return `apexclone_share_key_${botId}`;
  }

  function generateShareKey() {
    return `bot_share_${Math.random().toString(36).slice(2, 12)}`;
  }

  function generateConfigKey() {
    return `bot_cfg_${Math.random().toString(36).slice(2, 12)}`;
  }

  function normalizeDownsellMessages(messages = []) {
    return messages.map((message, index) => ({
      ...buildDownsellMessage(index),
      ...message,
      title: `Mensagem ${index + 1}`,
      id: message.id || `downsell-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    }));
  }

  function persistDownsellMessages(botId, messages) {
    if (!botId || typeof window === 'undefined') return;
    localStorage.setItem(getDownsellStorageKey(botId), JSON.stringify(messages));
  }

  function getValidUpsellSendMode(value) {
    return UPSELL_SEND_MODE_OPTIONS.includes(value) ? value : UPSELL_SEND_MODE_OPTIONS[0];
  }

  function normalizeUpsellMessages(messages = []) {
    return messages.map((message, index) => ({
      ...buildUpsellMessage(index),
      ...message,
      title: `Mensagem ${index + 1}`,
      id: message.id || `upsell-${index + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    }));
  }

  function persistUpsellUi(botId, uiState) {
    if (!botId || typeof window === 'undefined') return;
    localStorage.setItem(getUpsellStorageKey(botId), JSON.stringify(uiState));
  }

  function persistSaleCodesUi(botId, uiState) {
    if (!botId || typeof window === 'undefined') return;
    localStorage.setItem(getSaleCodesStorageKey(botId), JSON.stringify(uiState));
  }

  function syncUpsellMessageToConfig(messages) {
    setConfig((previous) => ({
      ...previous,
      upsellMessage: messages[0]?.text || ''
    }));
  }

  function normalizeSubscriptionItems(items = []) {
    return items.map((item, index) => ({
      ...createSubscriptionItem(index + 1),
      ...item,
      title: `Plano ${index + 1}`,
      id: item.id || makeId('sub')
    }));
  }

  function normalizePackageItems(items = []) {
    return items.map((item, index) => ({
      ...createPackageItem(index + 1),
      ...item,
      title: `Plano Pacote ${index + 1}`,
      id: item.id || makeId('pkg')
    }));
  }

  function normalizeSimpleButtons(items = []) {
    return items.map((item) => ({
      ...createSimpleButtonItem(),
      ...item,
      id: item.id || makeId('btn')
    }));
  }

  function normalizeSocialProofItems(items = []) {
    const normalized = items.map((item, index) => ({
      ...createSocialProofItem(index + 1),
      ...item,
      title: `Mensagem ${index + 1}`,
      id: item.id || makeId('proof')
    }));
    return normalized.length > 0 ? normalized : [createSocialProofItem(1)];
  }

  function persistEditBotUi(botId, data) {
    if (!botId || typeof window === 'undefined') return;
    localStorage.setItem(getEditBotStorageKey(botId), JSON.stringify(data));
  }

  function loadProfileFromStorage(botId, fallbackName) {
    const safeFallbackName = fallbackName || config.botUsername || DEFAULT_PROFILE_NAME;
    if (!botId || typeof window === 'undefined') {
      setProfileName(safeFallbackName);
      setProfileBio(DEFAULT_PROFILE_BIO);
      setProfileShortMessage('');
      setProfileImageName('');
      return;
    }

    const stored = localStorage.getItem(getProfileStorageKey(botId));
    if (!stored) {
      setProfileName(safeFallbackName);
      setProfileBio(DEFAULT_PROFILE_BIO);
      setProfileShortMessage('');
      setProfileImageName('');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setProfileName(parsed.name || safeFallbackName);
      setProfileBio(parsed.bio || DEFAULT_PROFILE_BIO);
      setProfileShortMessage(parsed.shortMessage || '');
      setProfileImageName(parsed.imageName || '');
    } catch {
      setProfileName(safeFallbackName);
      setProfileBio(DEFAULT_PROFILE_BIO);
      setProfileShortMessage('');
      setProfileImageName('');
    }
  }

  function formatCreatedAt(value) {
    const date = new Date(value || Date.now());
    const datePart = date.toLocaleDateString('pt-BR');
    const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${datePart} ${timePart}`;
  }

  async function fetchData() {
    const urlParams = new URLSearchParams(window.location.search);
    let botId = urlParams.get('botId') || localStorage.getItem('selected_bot_id');
    let configList = [];

    if (urlParams.get('botId')) {
      window.history.replaceState({}, '', window.location.pathname);
      localStorage.setItem('selected_bot_id', botId);
      window.dispatchEvent(new CustomEvent('botChanged', { detail: botId }));
    }

    try {
      const response = await axios.get('/api/config');
      configList = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
    } catch (error) {
      console.error(error);
    }

    if (botId) {
      const hasSelectedBot = configList.some((item) => String(item.id) === String(botId));
      if (!hasSelectedBot) {
        botId = configList[0] ? String(configList[0].id) : null;
        if (botId) {
          localStorage.setItem('selected_bot_id', botId);
          window.dispatchEvent(new CustomEvent('botChanged', { detail: botId }));
        } else {
          localStorage.removeItem('selected_bot_id');
        }
      }
    } else if (configList.length > 0) {
      botId = String(configList[0].id);
      localStorage.setItem('selected_bot_id', botId);
      window.dispatchEvent(new CustomEvent('botChanged', { detail: botId }));
    }

    if (!botId) {
      setHasBotContext(false);
      setSelectedBotId(null);
      setLoading(false);
      return;
    }

    setSelectedBotId(botId);
    setHasBotContext(true);
    setLoading(true);

    try {
      const [configResponse, plansResponse] = await Promise.all([
        axios.get('/api/config', { params: { id: botId } }),
        axios.get('/api/plans', { params: { botId } })
      ]);

      const configData = configResponse.data && !Array.isArray(configResponse.data) ? configResponse.data : null;
      if (!configData) {
        localStorage.removeItem('selected_bot_id');
        setSelectedBotId(null);
        setHasBotContext(false);
        setStatusMessage({ type: 'error', text: 'O bot selecionado não existe mais. Selecione outro bot.' });
        return;
      }

      setConfig((previous) => ({
        ...previous,
        ...configData,
        antiClone: Boolean(configData.antiClone),
        startOnAnyText: Boolean(configData.startOnAnyText),
        upsellEnabled: configData.upsellEnabled !== false,
        downsellEnabled: configData.downsellEnabled !== false,
        welcomeMessage: String(configData.welcomeMessage || '')
      }));
      setRegisterGroupId(String(configData.registerGroupId || ''));
      setShareKeyValue(String(configData.shareKey || ''));
      setConfigKeyValue(String(configData.configKey || ''));
      setConfigKeyPublic(Boolean(configData.configPublic));

      if (configData.profileName || configData.profileBio || configData.profileShortMessage || configData.profileImageName) {
        setProfileName(String(configData.profileName || configData.botUsername || DEFAULT_PROFILE_NAME));
        setProfileBio(String(configData.profileBio || DEFAULT_PROFILE_BIO));
        setProfileShortMessage(String(configData.profileShortMessage || ''));
        setProfileImageName(String(configData.profileImageName || ''));
      } else {
        loadProfileFromStorage(botId, configData.botUsername);
      }

      const defaultMessages = buildDefaultDownsellMessages(String(configData.downsellMessage || ''));
      const rawStored = localStorage.getItem(getDownsellStorageKey(botId));
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDownsellMessages(normalizeDownsellMessages(parsed));
          } else {
            setDownsellMessages(defaultMessages);
          }
        } catch {
          setDownsellMessages(defaultMessages);
        }
      } else {
        setDownsellMessages(defaultMessages);
      }

      const defaultUpsellMessages = String(configData.upsellMessage || '').trim()
        ? [buildUpsellMessage(0, String(configData.upsellMessage || ''))]
        : [];
      const rawUpsell = localStorage.getItem(getUpsellStorageKey(botId));
      if (rawUpsell) {
        try {
          const parsed = JSON.parse(rawUpsell);
          if (Array.isArray(parsed)) {
            const normalized = normalizeUpsellMessages(parsed);
            setUpsellMessages(normalized);
            syncUpsellMessageToConfig(normalized);
            setUpsellSendMode(UPSELL_SEND_MODE_OPTIONS[0]);
          } else {
            const normalized = normalizeUpsellMessages(parsed?.messages || defaultUpsellMessages);
            setUpsellMessages(normalized);
            syncUpsellMessageToConfig(normalized);
            setUpsellSendMode(getValidUpsellSendMode(parsed?.sendMode));
          }
        } catch {
          setUpsellMessages(defaultUpsellMessages);
          syncUpsellMessageToConfig(defaultUpsellMessages);
          setUpsellSendMode(UPSELL_SEND_MODE_OPTIONS[0]);
        }
      } else {
        setUpsellMessages(defaultUpsellMessages);
        syncUpsellMessageToConfig(defaultUpsellMessages);
        setUpsellSendMode(UPSELL_SEND_MODE_OPTIONS[0]);
      }

      const rawSaleCodes = localStorage.getItem(getSaleCodesStorageKey(botId));
      if (rawSaleCodes) {
        try {
          const parsed = JSON.parse(rawSaleCodes);
          const nextCodes = Array.isArray(parsed?.allowedCodes)
            ? parsed.allowedCodes
                .map((code) => String(code || '').trim())
                .filter((code) => code.length > 0)
            : [];
          setAllowedSaleCodes(nextCodes);
          setSaleCodesRestricted(Boolean(parsed?.restricted));
          setSaleCodeInlineMode(null);
          setSaleCodeDraftValue('');
          setSaleCodeEditingIndex(null);
        } catch {
          setAllowedSaleCodes([]);
          setSaleCodesRestricted(false);
          setSaleCodeInlineMode(null);
          setSaleCodeDraftValue('');
          setSaleCodeEditingIndex(null);
        }
      } else {
        setAllowedSaleCodes([]);
        setSaleCodesRestricted(false);
        setSaleCodeInlineMode(null);
        setSaleCodeDraftValue('');
        setSaleCodeEditingIndex(null);
      }

      const plansData = Array.isArray(plansResponse.data) ? plansResponse.data : [];
      setPlans(plansData);

      const rawEditUi = localStorage.getItem(getEditBotStorageKey(botId));
      if (rawEditUi) {
        try {
          const parsed = JSON.parse(rawEditUi) || {};
          setEditBotExtras({ ...buildDefaultEditBotExtras(), ...(parsed.editBotExtras || {}) });
          setSubscriptionItems(normalizeSubscriptionItems(parsed.subscriptionItems || []));
          setPackageItems(normalizePackageItems(parsed.packageItems || []));
          setCustomButtonItems(normalizeSimpleButtons(parsed.customButtonItems || []));
          setVipButtonItems(normalizeSimpleButtons(parsed.vipButtonItems || []));
          setSocialProofItems(normalizeSocialProofItems(parsed.socialProofItems || []));
        } catch {
          setEditBotExtras(buildDefaultEditBotExtras());
          setSubscriptionItems(normalizeSubscriptionItems(plansData.map((plan, index) => ({
            id: makeId('sub'),
            title: `Plano ${index + 1}`,
            name: plan.name || '',
            price: String(plan.price || ''),
            duration: plan.durationDays ? `${plan.durationDays} dias` : PLAN_DURATION_OPTIONS[0]
          }))));
          setPackageItems([]);
          setCustomButtonItems([]);
          setVipButtonItems([]);
          setSocialProofItems([createSocialProofItem(1)]);
        }
      } else {
        setEditBotExtras(buildDefaultEditBotExtras());
        setSubscriptionItems(normalizeSubscriptionItems(plansData.map((plan, index) => ({
          id: makeId('sub'),
          title: `Plano ${index + 1}`,
          name: plan.name || '',
          price: String(plan.price || ''),
          duration: plan.durationDays ? `${plan.durationDays} dias` : PLAN_DURATION_OPTIONS[0]
        }))));
        setPackageItems([]);
        setCustomButtonItems([]);
        setVipButtonItems([]);
        setSocialProofItems([createSocialProofItem(1)]);
      }
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Falha ao carregar configurações do bot.' });
    } finally {
      setLoading(false);
    }
  }

  function handleConfigChange(field, value) {
    setConfig((previous) => ({ ...previous, [field]: value }));
  }

  function handleDownsellMessageChange(messageId, field, value) {
    setDownsellMessages((previous) =>
      previous.map((message) => (message.id === messageId ? { ...message, [field]: value } : message))
    );
  }

  function handleDeleteDownsellMessage(messageId) {
    setDownsellMessages((previous) => {
      if (previous.length === 1) return previous;
      const filtered = previous.filter((message) => message.id !== messageId);
      return normalizeDownsellMessages(filtered);
    });
  }

  function handleAddDownsellMessage() {
    setDownsellMessages((previous) => normalizeDownsellMessages([...previous, buildDownsellMessage(previous.length)]));
  }

  function handleUpsellMessageChange(messageId, field, value) {
    setUpsellMessages((previous) => {
      const next = previous.map((message) => (message.id === messageId ? { ...message, [field]: value } : message));
      syncUpsellMessageToConfig(next);
      return next;
    });
  }

  function handleDeleteUpsellMessage(messageId) {
    setUpsellMessages((previous) => {
      const next = normalizeUpsellMessages(previous.filter((message) => message.id !== messageId));
      syncUpsellMessageToConfig(next);
      return next;
    });
  }

  function handleAddUpsellMessage() {
    setUpsellMessages((previous) => {
      const next = normalizeUpsellMessages([...previous, buildUpsellMessage(previous.length)]);
      syncUpsellMessageToConfig(next);
      return next;
    });
    setShowUpsellSuccessToast(true);
  }

  function handleToggleSaleCodesRestricted() {
    const next = !saleCodesRestricted;
    setSaleCodesRestricted(next);
    if (!next) {
      setSaleCodeInlineMode(null);
      setSaleCodeDraftValue('');
      setSaleCodeEditingIndex(null);
    }
    if (next) {
      setShowSaleCodesToast(true);
    }
  }

  function handleCloseSaleCodeInline() {
    setSaleCodeInlineMode(null);
    setSaleCodeDraftValue('');
    setSaleCodeEditingIndex(null);
  }

  function handleAddSaleCode() {
    setSaleCodeInlineMode('add');
    setSaleCodeDraftValue('');
    setSaleCodeEditingIndex(null);
  }

  function handleEditSaleCode(index = 0) {
    setSaleCodeInlineMode('edit');
    if (allowedSaleCodes.length === 0) {
      setSaleCodeDraftValue('');
      setSaleCodeEditingIndex(null);
      return;
    }

    const safeIndex = index >= 0 && index < allowedSaleCodes.length ? index : 0;
    setSaleCodeEditingIndex(safeIndex);
    setSaleCodeDraftValue(String(allowedSaleCodes[safeIndex] || ''));
  }

  function handleSaveSaleCodeInline() {
    if (!saleCodeInlineMode) return;

    if (saleCodeInlineMode === 'edit' && saleCodeEditingIndex === null) {
      handleCloseSaleCodeInline();
      return;
    }

    const nextCode = String(saleCodeDraftValue || '').trim();
    if (!nextCode) {
      setStatusMessage({ type: 'error', text: 'Digite um código de venda válido.' });
      return;
    }

    if (saleCodeInlineMode === 'add') {
      if (allowedSaleCodes.some((code) => code.toLowerCase() === nextCode.toLowerCase())) {
        setStatusMessage({ type: 'error', text: 'Este código de venda já está cadastrado.' });
        return;
      }
      setAllowedSaleCodes((previous) => [...previous, nextCode]);
      setStatusMessage({ type: 'success', text: 'Código de venda adicionado.' });
      handleCloseSaleCodeInline();
      return;
    }

    if (allowedSaleCodes.some((code, index) => code.toLowerCase() === nextCode.toLowerCase() && index !== saleCodeEditingIndex)) {
      setStatusMessage({ type: 'error', text: 'Este código de venda já existe.' });
      return;
    }

    setAllowedSaleCodes((previous) => previous.map((code, index) => (index === saleCodeEditingIndex ? nextCode : code)));
    setStatusMessage({ type: 'success', text: 'Código de venda atualizado.' });
    handleCloseSaleCodeInline();
  }

  function handleRemoveSaleCode(index) {
    setAllowedSaleCodes((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
    setStatusMessage({ type: 'success', text: 'Código de venda removido.' });
  }

  function updateAutoApprovalChannel(channelId, field, value) {
    setAutoApprovalChannels((previous) =>
      previous.map((channel) => (channel.id === channelId ? { ...channel, [field]: value } : channel))
    );
  }

  function handleAddAutoApprovalChannel() {
    setAutoApprovalChannels((previous) => [...previous, createAutoApprovalChannel()]);
    setShowAutoApprovalToast(true);
  }

  function handleRemoveAutoApprovalChannel(channelId) {
    setAutoApprovalChannels((previous) => {
      if (previous.length === 1) return previous;
      return previous.filter((channel) => channel.id !== channelId);
    });
  }

  function handleAddAutoApprovalButton(channelId) {
    setAutoApprovalChannels((previous) =>
      previous.map((channel) =>
        channel.id === channelId
          ? { ...channel, customButtons: [...channel.customButtons, createAutoApprovalButton()] }
          : channel
      )
    );
  }

  function updateAutoApprovalButton(channelId, buttonId, field, value) {
    setAutoApprovalChannels((previous) =>
      previous.map((channel) => {
        if (channel.id !== channelId) return channel;
        return {
          ...channel,
          customButtons: channel.customButtons.map((button) =>
            button.id === buttonId ? { ...button, [field]: value } : button
          )
        };
      })
    );
  }

  function handleRemoveAutoApprovalButton(channelId, buttonId) {
    setAutoApprovalChannels((previous) =>
      previous.map((channel) =>
        channel.id === channelId
          ? { ...channel, customButtons: channel.customButtons.filter((button) => button.id !== buttonId) }
          : channel
      )
    );
  }

  function handleSaveLeadCapture() {
    setStatusMessage({ type: 'success', text: 'Configuração de captação salva.' });
  }

  function handleAddWebhook() {
    setStatusMessage({ type: 'success', text: 'Novo webhook adicionado.' });
  }

  function handleOpenProfileModal() {
    setShowProfileModal(true);
    setProfileLoading(true);
    const botId = selectedBotId || config.id;
    setTimeout(() => {
      loadProfileFromStorage(botId, config.botUsername);
      setProfileLoading(false);
    }, 450);
  }

  function handleCloseProfileModal() {
    setShowProfileModal(false);
  }

  function handleSaveProfile() {
    const botId = selectedBotId || config.id;
    if (!botId || typeof window === 'undefined') {
      setStatusMessage({ type: 'error', text: 'Selecione um bot antes de salvar o perfil.' });
      return;
    }

    localStorage.setItem(
      getProfileStorageKey(botId),
      JSON.stringify({
        name: profileName,
        bio: profileBio,
        shortMessage: profileShortMessage,
        imageName: profileImageName
      })
    );

    axios.post('/api/config', {
      id: botId,
      profileName,
      profileBio,
      profileShortMessage,
      profileImageName
    }).then(() => {
      setShowProfileModal(false);
      setStatusMessage({ type: 'success', text: 'Perfil do bot salvo.' });
    }).catch((error) => {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Não foi possível salvar o perfil do bot.' });
    });
  }

  async function handleCopyToClipboard(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyToastMessage(`Variável copiada: ${value}`);
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Não foi possível copiar para a área de transferência.' });
    }
  }

  function handleOpenVariablesModal() {
    setShowVariablesModal(true);
  }

  async function handleOpenShareModal() {
    const botId = selectedBotId || config.id;
    if (!botId) {
      setStatusMessage({ type: 'error', text: 'Selecione um bot antes de abrir o Share Key.' });
      return;
    }

    let nextKey = shareKeyValue || '';
    if (!nextKey) {
      const storedKey = localStorage.getItem(getShareKeyStorageKey(botId));
      if (storedKey) {
        nextKey = storedKey;
      } else {
        nextKey = generateShareKey();
        localStorage.setItem(getShareKeyStorageKey(botId), nextKey);
      }
    }

    setShareKeyValue(nextKey);
    try {
      await axios.post('/api/config', { id: botId, shareKey: nextKey });
    } catch (error) {
      console.error(error);
    }
    setShareTargetBotId('');

    try {
      const response = await axios.get('/api/config');
      const list = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];
      setShareBots(list);
    } catch (error) {
      console.error(error);
      setShareBots([]);
    }

    setShowShareModal(true);
  }

  async function handleOpenConfigKeyModal() {
    const botId = selectedBotId || config.id;
    if (!botId) {
      setStatusMessage({ type: 'error', text: 'Selecione um bot antes de abrir o Config Key.' });
      return;
    }

    let nextKey = configKeyValue || '';
    if (!nextKey) {
      nextKey = generateConfigKey();
      setConfigKeyValue(nextKey);
      try {
        await axios.post('/api/config', { id: botId, configKey: nextKey });
      } catch (error) {
        console.error(error);
      }
    }

    setConfigKeyImportValue('');
    setShowConfigKeyModal(true);
  }

  async function handleSaveConfigKey() {
    const botId = selectedBotId || config.id;
    if (!botId) {
      setStatusMessage({ type: 'error', text: 'Selecione um bot antes de salvar a config key.' });
      return;
    }

    const importValue = String(configKeyImportValue || '').trim();
    const finalKey = importValue || configKeyValue || generateConfigKey();

    setConfigKeySaving(true);
    try {
      await axios.post('/api/config', {
        id: botId,
        configKey: finalKey,
        configPublic: configKeyPublic
      });
      setConfigKeyValue(finalKey);
      setConfigKeyImportValue('');
      setShowConfigKeyModal(false);
      setStatusMessage({ type: 'success', text: 'Config Key salva.' });
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Não foi possível salvar a config key.' });
    } finally {
      setConfigKeySaving(false);
    }
  }

  function handleEditBotExtraChange(field, value) {
    setEditBotExtras((previous) => ({ ...previous, [field]: value }));
  }

  function updateSubscriptionItem(itemId, field, value) {
    setSubscriptionItems((previous) => previous.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  }

  function updatePackageItem(itemId, field, value) {
    setPackageItems((previous) => previous.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  }

  function updateCustomButtonItem(itemId, field, value) {
    setCustomButtonItems((previous) => previous.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  }

  function updateVipButtonItem(itemId, field, value) {
    setVipButtonItems((previous) => previous.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  }

  function updateSocialProofItem(itemId, field, value) {
    setSocialProofItems((previous) => previous.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  }

  function addSubscriptionItem() {
    setSubscriptionItems((previous) => normalizeSubscriptionItems([...previous, createSubscriptionItem(previous.length + 1)]));
  }

  function addPackageItem() {
    setPackageItems((previous) => normalizePackageItems([...previous, createPackageItem(previous.length + 1)]));
  }

  function addCustomButtonItem() {
    setCustomButtonItems((previous) => [...previous, createSimpleButtonItem()]);
  }

  function addVipButtonItem() {
    setVipButtonItems((previous) => [...previous, createSimpleButtonItem()]);
  }

  function addSocialProofItem() {
    setSocialProofItems((previous) => normalizeSocialProofItems([...previous, createSocialProofItem(previous.length + 1)]));
  }

  function removeSubscriptionItem(itemId) {
    setSubscriptionItems((previous) => {
      return normalizeSubscriptionItems(previous.filter((item) => item.id !== itemId));
    });
  }

  function removePackageItem(itemId) {
    setPackageItems((previous) => {
      return normalizePackageItems(previous.filter((item) => item.id !== itemId));
    });
  }

  function removeCustomButtonItem(itemId) {
    setCustomButtonItems((previous) => previous.filter((item) => item.id !== itemId));
  }

  function removeVipButtonItem(itemId) {
    setVipButtonItems((previous) => previous.filter((item) => item.id !== itemId));
  }

  function removeSocialProofItem(itemId) {
    setSocialProofItems((previous) => {
      if (previous.length === 1) return previous;
      return normalizeSocialProofItems(previous.filter((item) => item.id !== itemId));
    });
  }

  function resetVipAccessSection() {
    setEditBotExtras((previous) => ({
      ...previous,
      vipAccessMessage: buildDefaultEditBotExtras().vipAccessMessage,
      vipAccessMediaName: '',
      vipAccessAudioName: ''
    }));
    setVipButtonItems([]);
  }

  function resetCtaSection() {
    const defaults = buildDefaultEditBotExtras();
    setEditBotExtras((previous) => ({
      ...previous,
      ctaEnabled: defaults.ctaEnabled,
      ctaMessage: defaults.ctaMessage,
      ctaButtonText: defaults.ctaButtonText,
      ctaAfterClickMessage: defaults.ctaAfterClickMessage,
      ctaAction: defaults.ctaAction
    }));
  }

  function resetPaymentSection() {
    const defaults = buildDefaultEditBotExtras();
    setEditBotExtras((previous) => ({
      ...previous,
      pixMethodMessageEnabled: defaults.pixMethodMessageEnabled,
      pixMethodMessage: defaults.pixMethodMessage,
      pixButtonText: defaults.pixButtonText,
      paymentGeneratingText: defaults.paymentGeneratingText,
      paymentCooldownText: defaults.paymentCooldownText,
      paymentUnconfirmedText: defaults.paymentUnconfirmedText,
      socialProofEnabled: defaults.socialProofEnabled,
      pixQrDisplay: defaults.pixQrDisplay,
      pixCodeFormat: defaults.pixCodeFormat,
      pixSeparateMessage: defaults.pixSeparateMessage,
      pixMainMessage: defaults.pixMainMessage,
      pixStatusButtonText: defaults.pixStatusButtonText,
      pixQrButtonText: defaults.pixQrButtonText,
      pixCopyButtonText: defaults.pixCopyButtonText,
      pixMediaName: '',
      pixAudioName: ''
    }));
    setSocialProofItems([createSocialProofItem(1)]);
  }

  async function handleQuickAction(actionId) {
    if (actionId === 'profile') {
      handleOpenProfileModal();
      return;
    }
    if (actionId === 'variables') {
      handleOpenVariablesModal();
      return;
    }
    if (actionId === 'share') {
      handleOpenShareModal();
      return;
    }
    if (actionId === 'config') {
      handleOpenConfigKeyModal();
      return;
    }

    const textToCopy = actionId === 'config'
      ? String(config.id || '')
      : '{profile_name}, {country}, {state}, {city}, {link_vip}';

    try {
      await navigator.clipboard.writeText(textToCopy);
      setStatusMessage({ type: 'success', text: `${actionId === 'variables' ? 'Variáveis' : 'Valor'} copiado com sucesso.` });
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Não foi possível copiar para a área de transferência.' });
    }
  }

  async function handleSave() {
    if (!selectedBotId) {
      setStatusMessage({ type: 'error', text: 'Selecione um bot para salvar as configurações.' });
      return;
    }

    try {
      const firstDownsellMessage = downsellMessages[0]?.text || '';
      const firstUpsellMessage = upsellMessages[0]?.text || '';
      await axios.post('/api/config', {
        id: selectedBotId,
        botToken: config.botToken,
        botUsername: config.botUsername,
        botExternalId: config.botExternalId,
        antiClone: config.antiClone,
        startOnAnyText: config.startOnAnyText,
        welcomeMessage: config.welcomeMessage,
        supportUsername: config.supportUsername,
        vipGroupId: config.vipGroupId,
        registerGroupId,
        upsellEnabled: config.upsellEnabled,
        upsellMessage: firstUpsellMessage,
        downsellEnabled: config.downsellEnabled,
        downsellMessage: firstDownsellMessage
      });
      persistDownsellMessages(selectedBotId, downsellMessages);
      persistUpsellUi(selectedBotId, { messages: upsellMessages, sendMode: upsellSendMode });
      setStatusMessage({ type: 'success', text: 'Configurações salvas com sucesso.' });
      window.dispatchEvent(new CustomEvent('botChanged', { detail: selectedBotId }));
      fetchData();
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
    }
  }

  async function handleRemoveBot() {
    if (!selectedBotId) return;
    const confirmed = window.confirm('Tem certeza que deseja remover este bot?');
    if (!confirmed) return;

    try {
      await axios.delete(`/api/config/${selectedBotId}`);
      localStorage.removeItem('selected_bot_id');
      window.dispatchEvent(new CustomEvent('botChanged'));
      setHasBotContext(false);
      setStatusMessage({ type: 'success', text: 'Bot removido com sucesso.' });
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Erro ao remover bot.' });
    }
  }

  async function handleCreateTestBot() {
    setCreatingTestBot(true);
    try {
      const response = await axios.post('/api/config', {
        botToken: `test-token-${Date.now()}`,
        botUsername: 'Vipdamicabot',
        welcomeMessage: '👋 Bem-vindo! Este bot utiliza o sistema para automatizar suas vendas online.'
      });

      const newBotId = response?.data?.id;
      if (!newBotId) throw new Error('ID do bot não retornado');

      localStorage.setItem('selected_bot_id', String(newBotId));
      window.dispatchEvent(new CustomEvent('botChanged', { detail: String(newBotId) }));
      window.location.href = `/settings?botId=${newBotId}`;
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: 'Não foi possível criar o bot de teste.' });
      setCreatingTestBot(false);
    }
  }

  function renderPlansTable(title, headers, rows, emptyText = 'Nenhum plano cadastrado.') {
    return (
      <section className="mt-6">
        <h3 className="text-[2.15rem] leading-none font-bold text-white/85">{title}</h3>
        <div className="mt-3 border-y border-white/10">
          <div className="grid grid-cols-3 px-3 py-3 text-[0.95rem] font-bold uppercase tracking-[0.06em] text-white/60">
            {headers.map((header) => (
              <span key={header} className="text-center">{header}</span>
            ))}
          </div>
          <div className="border-t border-white/10 py-2">
            {rows.length === 0 ? (
              <p className="text-center text-[1.45rem] text-white/65 py-2">{emptyText}</p>
            ) : (
              rows.map((row) => (
                <div key={row.id} className="grid grid-cols-3 px-3 py-2 text-[1.15rem] text-white/85">
                  <span className="text-center">{row.name}</span>
                  <span className="text-center">{row.price}</span>
                  <span className="text-center">{row.duration}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-center mt-3">
          <Link
            href="/plans"
            className="h-[44px] w-[56px] rounded-[12px] border border-white/20 bg-white/[0.05] text-white/80 hover:bg-white/[0.09] transition inline-flex items-center justify-center"
          >
            <Pencil size={18} />
          </Link>
        </div>
      </section>
    );
  }

  function renderEditTab() {
    const sectionTitleClass = 'text-[2.2rem] md:text-[2.35rem] leading-none font-bold text-white/90';
    const tableHeaderClass = 'text-center text-[0.9rem] md:text-[0.95rem] uppercase tracking-[0.08em] font-bold text-white/55';
    const plusButtonClass = 'h-[40px] w-[48px] rounded-[10px] border border-white/20 bg-white/[0.06] text-white inline-flex items-center justify-center hover:bg-white/[0.1] transition';
    const baseRowInputClass = 'w-full h-[46px] rounded-[10px] bg-white/[0.08] border border-white/15 px-4 text-[1rem] text-white placeholder:text-white/45 outline-none focus:border-white/30';
    const baseRowTextareaClass = 'w-full rounded-[10px] bg-white/[0.08] border border-white/15 px-4 py-3 text-[1rem] text-white placeholder:text-white/45 outline-none focus:border-white/30 resize-none';

    return (
      <div className="pt-5 space-y-7">
        <div className="space-y-3">
          <div className="h-[50px] rounded-[10px] bg-white/[0.08] border border-white/10 px-4 flex items-center justify-between">
            <span className="text-[1.15rem] font-semibold text-white/90">Proteção Anti-Clonagem:</span>
            <ToggleSwitch checked={config.antiClone} onChange={() => handleConfigChange('antiClone', !config.antiClone)} />
          </div>
          <div className="h-[50px] rounded-[10px] bg-white/[0.08] border border-white/10 px-4 flex items-center justify-between">
            <span className="text-[1.15rem] font-semibold text-white/90">Iniciar em Qualquer Texto:</span>
            <ToggleSwitch checked={config.startOnAnyText} onChange={() => handleConfigChange('startOnAnyText', !config.startOnAnyText)} />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Username:</label>
            <input value={config.botUsername || ''} onChange={(event) => handleConfigChange('botUsername', event.target.value)} className={INPUT_CLASS} />
          </div>
          <div>
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Token:</label>
            <div className="relative">
              <input type="password" value={config.botToken || ''} onChange={(event) => handleConfigChange('botToken', event.target.value)} className={`${INPUT_CLASS} pr-12`} />
              <Pencil size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Mensagem Inicial:</label>
            <textarea
              value={config.welcomeMessage || ''}
              maxLength={MAX_WELCOME_LENGTH}
              onChange={(event) => handleConfigChange('welcomeMessage', event.target.value)}
              className={`${TEXTAREA_CLASS} h-[210px]`}
            />
            <div className="mt-1 text-right text-[1rem] font-semibold text-white/75">{welcomeLength}/{MAX_WELCOME_LENGTH}</div>
          </div>
        </div>

        <div className="space-y-2 text-[1.02rem] text-white/70">
          <p>Enviar Mídia (PNG, JPEG, JPG, MP4): Máximo permitido: 25MB</p>
          <p>Para ativar a opção de mídia, verifique se o ID do REGISTRO está corretamente configurado e que o bot {config.botUsername || 'Vipdamicabot'} tem todas as permissões necessárias no canal/grupo!</p>
          <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
            <FolderOpen size={16} className="text-blue-400" />
            Adicionar Mídia
            <input type="file" accept="image/png,image/jpeg,image/jpg,video/mp4" className="hidden" onChange={(event) => setMediaFileName(event.target.files?.[0]?.name || '')} />
          </label>
          {mediaFileName && <p className="text-[0.95rem] text-white/75">{mediaFileName}</p>}
          <div>
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Forma de envio das mídias:</label>
            <select value={mediaSendMode} onChange={(event) => setMediaSendMode(event.target.value)} className={baseRowInputClass}>
              <option className="bg-[#1f2023]">Separadas</option>
              <option className="bg-[#1f2023]">Juntas</option>
            </select>
          </div>
          <p className="pt-1">Enviar Áudio (OGG): Máximo permitido: 10MB</p>
          <p>Para ativar a opção de áudio, verifique se o ID do REGISTRO está corretamente configurado e que o bot {config.botUsername || 'Vipdamicabot'} tem todas as permissões necessárias no canal/grupo!</p>
          <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
            <FolderOpen size={16} className="text-blue-400" />
            Escolher Áudio
            <input type="file" accept="audio/ogg" className="hidden" onChange={(event) => setAudioFileName(event.target.files?.[0]?.name || '')} />
          </label>
          {audioFileName && <p className="text-[0.95rem] text-white/75">{audioFileName}</p>}
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">ID VIP:</label>
            <input value={config.vipGroupId || ''} onChange={(event) => handleConfigChange('vipGroupId', event.target.value)} placeholder="Apenas números! Exemplo: -10022393848" className={INPUT_CLASS} />
            <p className="mt-1 text-[0.98rem] text-white/65">Antes de preencher o campo ID VIP, certifique-se de que o seu bot {config.botUsername || 'Vipdamicabot'} já foi adicionado como administrador no VIP com todas as permissões!</p>
          </div>
          <div>
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">ID REGISTRO:</label>
            <input value={registerGroupId} onChange={(event) => setRegisterGroupId(event.target.value)} placeholder="Apenas números! Exemplo: -10022393848" className={INPUT_CLASS} />
            <p className="mt-1 text-[0.98rem] text-white/65">Este é o ID do grupo/canal onde o bot enviará notificações de vendas e ativará o envio de mídias. Crie um grupo ou canal exclusivo para essa função!</p>
            <a href="https://apexvips.com/tutorial/obter-id-canal-grupo" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[1rem] font-semibold text-white underline">
              Clique aqui para acessar o tutorial de como obter o ID de um canal/grupo.
            </a>
          </div>
          <div>
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Link:</label>
            <input value={vipLink} readOnly className={`${INPUT_CLASS} text-white/70`} />
            <p className="mt-1 text-[0.98rem] text-white/65">O link do seu VIP é gerado automaticamente após configurar o ID do VIP!</p>
          </div>
          <div>
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Suporte Bot:</label>
            <input value={config.supportUsername || ''} onChange={(event) => handleConfigChange('supportUsername', event.target.value)} placeholder="Insira o username ou link do seu suporte." className={INPUT_CLASS} />
          </div>
        </div>

        <div className="rounded-[10px] border border-white/10 bg-white/[0.05] px-4 py-3">
          <p className="text-[1.55rem] font-bold text-white/90">Adicione ou edite um plano para utilizar a função de Order Bump!</p>
          <p className="text-[1rem] text-white/75">Não sabe como funciona? <span className="underline">Veja mais aqui</span></p>
        </div>

        <section>
          <h3 className={sectionTitleClass}>Planos Assinaturas</h3>
          <div className="mt-3 border-y border-white/10">
            <div className="grid grid-cols-3 px-3 py-3">
              <span className={tableHeaderClass}>Nome</span>
              <span className={tableHeaderClass}>Valor</span>
              <span className={tableHeaderClass}>Duração</span>
            </div>
            <div className="border-t border-white/10 py-3 space-y-3">
              {subscriptionItems.length === 0 && (
                <div className="flex justify-center">
                  <button type="button" onClick={addSubscriptionItem} className={plusButtonClass}>
                    <PlusCircle size={16} />
                  </button>
                </div>
              )}

              {subscriptionItems.map((item, index) => (
                <div key={item.id} className="rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-[1.9rem] font-bold text-white/90">{`Plano ${index + 1}`}</h4>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updateSubscriptionItem(item.id, 'expanded', !item.expanded)} className="h-[34px] w-[34px] inline-flex items-center justify-center text-white/85 text-[1.1rem]">
                        {item.expanded ? '▾' : '▸'}
                      </button>
                      <button type="button" onClick={() => removeSubscriptionItem(item.id)} className="h-[34px] w-[46px] rounded-[10px] border border-[#813130] bg-[#5e1717]/35 text-[#ff6f6f] inline-flex items-center justify-center">
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {item.expanded && (
                    <div className="mt-3 border-t border-white/10 pt-3 space-y-3">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <input value={item.name} onChange={(event) => updateSubscriptionItem(item.id, 'name', event.target.value)} placeholder="Nome do plano" className={baseRowInputClass} />
                        <input value={item.price} onChange={(event) => updateSubscriptionItem(item.id, 'price', event.target.value)} placeholder="Valor do plano" className={baseRowInputClass} />
                        <select value={item.duration} onChange={(event) => updateSubscriptionItem(item.id, 'duration', event.target.value)} className={baseRowInputClass}>
                          {PLAN_DURATION_OPTIONS.map((option) => (
                            <option key={option} className="bg-[#1f2023]">{option}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[1.15rem] font-semibold text-white/90">Ativar Order Bump:</span>
                        <ToggleSwitch checked={item.orderBumpEnabled} onChange={() => updateSubscriptionItem(item.id, 'orderBumpEnabled', !item.orderBumpEnabled)} />
                      </div>

                      {item.orderBumpEnabled && (
                        <div className="border-t border-white/10 pt-3 space-y-3">
                          <p className="text-[1rem] uppercase tracking-[0.08em] font-bold text-white/55">{`Order Bump — Plano ${index + 1}`}</p>
                          <div>
                            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto explicativo do Order Bump:</label>
                            <textarea
                              value={item.orderBumpText}
                              onChange={(event) => updateSubscriptionItem(item.id, 'orderBumpText', event.target.value)}
                              maxLength={MAX_ORDER_BUMP_TEXT}
                              placeholder="Digite o texto explicativo do Order Bump aqui..."
                              className={`${baseRowTextareaClass} h-[140px]`}
                            />
                            <div className="mt-1 text-right text-[1rem] font-semibold text-white/75">{String(item.orderBumpText || '').length}/{MAX_ORDER_BUMP_TEXT}</div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[0.95rem] text-white/90">
                            <span className="font-semibold">Variáveis disponíveis:</span>
                            {ORDER_BUMP_VARIABLES.map((variable) => (
                              <span key={variable} className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[0.82rem]">{variable}</span>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto Botão Aceitar:</label>
                              <input value={item.orderBumpAcceptText} onChange={(event) => updateSubscriptionItem(item.id, 'orderBumpAcceptText', event.target.value)} className={baseRowInputClass} />
                            </div>
                            <div>
                              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto Botão Recusar:</label>
                              <input value={item.orderBumpRejectText} onChange={(event) => updateSubscriptionItem(item.id, 'orderBumpRejectText', event.target.value)} className={baseRowInputClass} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[1rem] text-white/65 mb-1.5">Mídia Order Bump (PNG, JPEG, JPG, MP4):</p>
                              <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                                <FolderOpen size={16} className="text-blue-400" />
                                Escolher Mídia
                                <input type="file" accept="image/png,image/jpeg,image/jpg,video/mp4" className="hidden" onChange={(event) => updateSubscriptionItem(item.id, 'orderBumpMediaFileName', event.target.files?.[0]?.name || '')} />
                              </label>
                              {item.orderBumpMediaFileName && <p className="mt-1 text-[0.95rem] text-white/75">{item.orderBumpMediaFileName}</p>}
                            </div>
                            <div>
                              <p className="text-[1rem] text-white/65 mb-1.5">Áudio Order Bump (OGG):</p>
                              <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                                <FolderOpen size={16} className="text-blue-400" />
                                Escolher Áudio
                                <input type="file" accept="audio/ogg" className="hidden" onChange={(event) => updateSubscriptionItem(item.id, 'orderBumpAudioFileName', event.target.files?.[0]?.name || '')} />
                              </label>
                              {item.orderBumpAudioFileName && <p className="mt-1 text-[0.95rem] text-white/75">{item.orderBumpAudioFileName}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <input value={item.orderBumpName} onChange={(event) => updateSubscriptionItem(item.id, 'orderBumpName', event.target.value)} placeholder="Nome do Order Bump" className={baseRowInputClass} />
                            <input value={item.orderBumpValue} onChange={(event) => updateSubscriptionItem(item.id, 'orderBumpValue', event.target.value)} placeholder="Valor (R$)" className={baseRowInputClass} />
                          </div>

                          <div>
                            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Entregáveis:</label>
                            <textarea
                              value={item.orderBumpDeliverables}
                              onChange={(event) => updateSubscriptionItem(item.id, 'orderBumpDeliverables', event.target.value)}
                              maxLength={MAX_ORDER_BUMP_DELIVERABLES}
                              placeholder="Entregáveis após pagamento..."
                              className={`${baseRowTextareaClass} h-[140px]`}
                            />
                            <div className="mt-1 text-right text-[1rem] font-semibold text-white/75">{String(item.orderBumpDeliverables || '').length}/{MAX_ORDER_BUMP_DELIVERABLES}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {subscriptionItems.length > 0 && (
                <div className="flex justify-center pt-1">
                  <button type="button" onClick={addSubscriptionItem} className={plusButtonClass}>
                    <PlusCircle size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="pt-3"><SectionActionButtons /></div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Planos Pacotes</h3>
          <div className="mt-3 border-y border-white/10">
            <div className="grid grid-cols-3 px-3 py-3">
              <span className={tableHeaderClass}>Nome</span>
              <span className={tableHeaderClass}>Valor</span>
              <span className={tableHeaderClass}>Entregável</span>
            </div>
            <div className="border-t border-white/10 py-3 space-y-3">
              {packageItems.length === 0 && (
                <div className="flex justify-center">
                  <button type="button" onClick={addPackageItem} className={plusButtonClass}>
                    <PlusCircle size={16} />
                  </button>
                </div>
              )}

              {packageItems.map((item, index) => (
                <div key={item.id} className="rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-[1.9rem] font-bold text-white/90">{`Plano Pacote ${index + 1}`}</h4>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => updatePackageItem(item.id, 'expanded', !item.expanded)} className="h-[34px] w-[34px] inline-flex items-center justify-center text-white/85 text-[1.1rem]">
                        {item.expanded ? '▾' : '▸'}
                      </button>
                      <button type="button" onClick={() => removePackageItem(item.id)} className="h-[34px] w-[46px] rounded-[10px] border border-[#813130] bg-[#5e1717]/35 text-[#ff6f6f] inline-flex items-center justify-center">
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {item.expanded && (
                    <div className="mt-3 border-t border-white/10 pt-3 space-y-3">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Nome do Plano:</label>
                          <input value={item.name} onChange={(event) => updatePackageItem(item.id, 'name', event.target.value)} placeholder="Ex: Pacote Premium Completo" className={baseRowInputClass} />
                        </div>
                        <div>
                          <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Valor (R$):</label>
                          <input value={item.price} onChange={(event) => updatePackageItem(item.id, 'price', event.target.value)} placeholder="Ex: 19,90" className={baseRowInputClass} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Entregáveis:</label>
                        <textarea value={item.deliverables} onChange={(event) => updatePackageItem(item.id, 'deliverables', event.target.value)} placeholder="Entregáveis após pagamento..." className={`${baseRowTextareaClass} h-[140px]`} maxLength={MAX_ORDER_BUMP_DELIVERABLES} />
                        <div className="mt-1 text-right text-[1rem] font-semibold text-white/75">{String(item.deliverables || '').length}/{MAX_ORDER_BUMP_DELIVERABLES}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[1.15rem] font-semibold text-white/90">Ativar Order Bump:</span>
                        <ToggleSwitch checked={item.orderBumpEnabled} onChange={() => updatePackageItem(item.id, 'orderBumpEnabled', !item.orderBumpEnabled)} />
                      </div>

                      {item.orderBumpEnabled && (
                        <div className="border-t border-white/10 pt-3 space-y-3">
                          <p className="text-[1rem] uppercase tracking-[0.08em] font-bold text-white/55">{`Order Bump — Pacote ${index + 1}`}</p>
                          <div>
                            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto explicativo do Order Bump:</label>
                            <textarea
                              value={item.orderBumpText}
                              onChange={(event) => updatePackageItem(item.id, 'orderBumpText', event.target.value)}
                              maxLength={MAX_ORDER_BUMP_TEXT}
                              placeholder="Digite o texto explicativo do Order Bump aqui..."
                              className={`${baseRowTextareaClass} h-[140px]`}
                            />
                            <div className="mt-1 text-right text-[1rem] font-semibold text-white/75">{String(item.orderBumpText || '').length}/{MAX_ORDER_BUMP_TEXT}</div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[0.95rem] text-white/90">
                            <span className="font-semibold">Variáveis disponíveis:</span>
                            {ORDER_BUMP_VARIABLES.map((variable) => (
                              <span key={variable} className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[0.82rem]">{variable}</span>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto Botão Aceitar:</label>
                              <input value={item.orderBumpAcceptText} onChange={(event) => updatePackageItem(item.id, 'orderBumpAcceptText', event.target.value)} className={baseRowInputClass} />
                            </div>
                            <div>
                              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto Botão Recusar:</label>
                              <input value={item.orderBumpRejectText} onChange={(event) => updatePackageItem(item.id, 'orderBumpRejectText', event.target.value)} className={baseRowInputClass} />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <p className="text-[1rem] text-white/65 mb-1.5">Mídia Order Bump (PNG, JPEG, JPG, MP4):</p>
                              <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                                <FolderOpen size={16} className="text-blue-400" />
                                Escolher Mídia
                                <input type="file" accept="image/png,image/jpeg,image/jpg,video/mp4" className="hidden" onChange={(event) => updatePackageItem(item.id, 'orderBumpMediaFileName', event.target.files?.[0]?.name || '')} />
                              </label>
                              {item.orderBumpMediaFileName && <p className="mt-1 text-[0.95rem] text-white/75">{item.orderBumpMediaFileName}</p>}
                            </div>
                            <div>
                              <p className="text-[1rem] text-white/65 mb-1.5">Áudio Order Bump (OGG):</p>
                              <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                                <FolderOpen size={16} className="text-blue-400" />
                                Escolher Áudio
                                <input type="file" accept="audio/ogg" className="hidden" onChange={(event) => updatePackageItem(item.id, 'orderBumpAudioFileName', event.target.files?.[0]?.name || '')} />
                              </label>
                              {item.orderBumpAudioFileName && <p className="mt-1 text-[0.95rem] text-white/75">{item.orderBumpAudioFileName}</p>}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <input value={item.orderBumpName} onChange={(event) => updatePackageItem(item.id, 'orderBumpName', event.target.value)} placeholder="Nome do Order Bump" className={baseRowInputClass} />
                            <input value={item.orderBumpValue} onChange={(event) => updatePackageItem(item.id, 'orderBumpValue', event.target.value)} placeholder="Valor (R$)" className={baseRowInputClass} />
                          </div>

                          <div>
                            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Entregáveis:</label>
                            <textarea
                              value={item.orderBumpDeliverables}
                              onChange={(event) => updatePackageItem(item.id, 'orderBumpDeliverables', event.target.value)}
                              maxLength={MAX_ORDER_BUMP_DELIVERABLES}
                              placeholder="Entregáveis após pagamento..."
                              className={`${baseRowTextareaClass} h-[140px]`}
                            />
                            <div className="mt-1 text-right text-[1rem] font-semibold text-white/75">{String(item.orderBumpDeliverables || '').length}/{MAX_ORDER_BUMP_DELIVERABLES}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {packageItems.length > 0 && (
                <div className="flex justify-center pt-1">
                  <button type="button" onClick={addPackageItem} className={plusButtonClass}>
                    <PlusCircle size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="pt-3"><SectionActionButtons /></div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Botões Personalizados</h3>
          <div className="mt-3 border-y border-white/10">
            <div className="grid grid-cols-3 px-3 py-3">
              <span className={tableHeaderClass}>Texto</span>
              <span className={tableHeaderClass}>Link</span>
              <span className={tableHeaderClass}>Tipo</span>
            </div>
            <div className="border-t border-white/10 py-3">
              {customButtonItems.length === 0 ? (
                <div className="flex items-center justify-center py-2">
                  <button type="button" onClick={addCustomButtonItem} className={plusButtonClass}>
                    <PlusCircle size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {customButtonItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                      <input value={item.text} onChange={(event) => updateCustomButtonItem(item.id, 'text', event.target.value)} placeholder="Texto do Botão" className={baseRowInputClass} />
                      <input value={item.link} onChange={(event) => updateCustomButtonItem(item.id, 'link', event.target.value)} placeholder="https://exemplo.com" className={baseRowInputClass} />
                      <select value={item.type} onChange={(event) => updateCustomButtonItem(item.id, 'type', event.target.value)} className={baseRowInputClass}>
                        {CUSTOM_BUTTON_TYPE_OPTIONS.map((option) => (
                          <option key={option} className="bg-[#1f2023]">{option}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removeCustomButtonItem(item.id)} className="h-[38px] w-[38px] text-white/60 hover:text-white inline-flex items-center justify-center">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-center pt-1">
                    <button type="button" onClick={addCustomButtonItem} className={plusButtonClass}>
                      <PlusCircle size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="pt-3"><SectionActionButtons /></div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Mensagem de Acesso VIP</h3>
          <div className="mt-3">
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto da Mensagem:</label>
            <textarea
              value={editBotExtras.vipAccessMessage}
              onChange={(event) => handleEditBotExtraChange('vipAccessMessage', event.target.value)}
              className={`${baseRowTextareaClass} h-[150px]`}
              maxLength={2500}
            />
            <div className="mt-1 text-right text-[1rem] font-semibold text-white/75">{String(editBotExtras.vipAccessMessage || '').length}/2500</div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.95rem] text-white/90">
            <span className="font-semibold">Variáveis:</span>
            {['{profile_name}', '{plan_name}', '{plan_value}', '{plan_duration}', '{link_vip}'].map((variable) => (
              <span key={variable} className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[0.82rem]">{variable}</span>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-[1rem] text-white/65 mb-1.5">Mídia (PNG, JPEG, JPG, MP4):</p>
              <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                <FolderOpen size={16} className="text-blue-400" />
                Escolher Mídia
                <input type="file" accept="image/png,image/jpeg,image/jpg,video/mp4" className="hidden" onChange={(event) => handleEditBotExtraChange('vipAccessMediaName', event.target.files?.[0]?.name || '')} />
              </label>
              {editBotExtras.vipAccessMediaName && <p className="mt-1 text-[0.95rem] text-white/75">{editBotExtras.vipAccessMediaName}</p>}
            </div>
            <div>
              <p className="text-[1rem] text-white/65 mb-1.5">Áudio (OGG):</p>
              <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                <FolderOpen size={16} className="text-blue-400" />
                Escolher Áudio
                <input type="file" accept="audio/ogg" className="hidden" onChange={(event) => handleEditBotExtraChange('vipAccessAudioName', event.target.files?.[0]?.name || '')} />
              </label>
              {editBotExtras.vipAccessAudioName && <p className="mt-1 text-[0.95rem] text-white/75">{editBotExtras.vipAccessAudioName}</p>}
            </div>
          </div>

          <h4 className="mt-4 text-[1.9rem] leading-none font-bold text-white/90">Botões</h4>
          <div className="mt-3 border-y border-white/10">
            <div className="grid grid-cols-3 px-3 py-3">
              <span className={tableHeaderClass}>Texto</span>
              <span className={tableHeaderClass}>Link</span>
              <span className={tableHeaderClass}>Tipo</span>
            </div>
            <div className="border-t border-white/10 py-3 space-y-2">
              {vipButtonItems.map((button) => (
                <div key={button.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                  <input value={button.text} onChange={(event) => updateVipButtonItem(button.id, 'text', event.target.value)} placeholder="Texto do Botão" className={baseRowInputClass} />
                  <input value={button.link} onChange={(event) => updateVipButtonItem(button.id, 'link', event.target.value)} placeholder="https://t.me/seubot" className={baseRowInputClass} />
                  <select value={button.type} onChange={(event) => updateVipButtonItem(button.id, 'type', event.target.value)} className={baseRowInputClass}>
                    {CUSTOM_BUTTON_TYPE_OPTIONS.map((option) => (
                      <option key={option} className="bg-[#1f2023]">{option}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removeVipButtonItem(button.id)} className="h-[38px] w-[38px] text-white/60 hover:text-white inline-flex items-center justify-center"><X size={16} /></button>
                </div>
              ))}
              <div className="flex justify-center pt-1">
                <button type="button" onClick={addVipButtonItem} className={plusButtonClass}>
                  <PlusCircle size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-[10px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
            <p className="text-[1rem] leading-snug inline-flex items-center gap-2">
              <AlertCircle size={16} />
              Esta mensagem é enviada automaticamente após o cliente adquirir qualquer plano de assinatura. A variável {'{link_vip}'} será substituída pelo link do grupo VIP configurado no seu bot. Use a variável na mensagem ou em um botão do tipo URL (não funciona em MiniApp).
            </p>
          </div>
          <div className="mt-4 border-t border-white/10 pt-3">
            <SectionActionButtons onRestore={resetVipAccessSection} />
          </div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Delay Entre Mensagens</h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[1.15rem] font-semibold text-white/90">Ativar Delay Entre Mensagens:</span>
            <ToggleSwitch checked={editBotExtras.delayEnabled} onChange={() => handleEditBotExtraChange('delayEnabled', !editBotExtras.delayEnabled)} />
          </div>
          <div className="mt-3 rounded-[10px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
            <p className="text-[1rem] inline-flex items-center gap-2"><AlertCircle size={16} />Dica: Adicione um delay entre o envio de áudio, mídia e texto para simular uma conversa mais natural com o usuário.</p>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { key: 'Áudio', value: editBotExtras.delayAudio, field: 'delayAudio', typing: 'delayAudioTyping' },
              { key: 'Mídia', value: editBotExtras.delayMedia, field: 'delayMedia', typing: 'delayMediaTyping' },
              { key: 'Texto', value: editBotExtras.delayText, field: 'delayText', typing: 'delayTextTyping' }
            ].map((row) => (
              <div key={row.key} className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 items-center">
                <div className="flex items-center gap-2">
                  <span className="w-[58px] text-[1.1rem] font-semibold text-white/85">{row.key}:</span>
                  <input value={row.value} onChange={(event) => handleEditBotExtraChange(row.field, event.target.value)} className={baseRowInputClass} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[1.08rem] font-semibold text-white/85">Mostrar digitando:</span>
                  <ToggleSwitch checked={Boolean(editBotExtras[row.typing])} onChange={() => handleEditBotExtraChange(row.typing, !editBotExtras[row.typing])} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4"><SectionActionButtons /></div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Variação de Preço</h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[1.15rem] font-semibold text-white/90">Ativar Variação de Preço:</span>
            <ToggleSwitch checked={editBotExtras.priceVariationEnabled} onChange={() => handleEditBotExtraChange('priceVariationEnabled', !editBotExtras.priceVariationEnabled)} />
          </div>
          <div className="mt-3">
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Variação em Centavos (20 a 150):</label>
            <input value={editBotExtras.priceVariationCents} onChange={(event) => handleEditBotExtraChange('priceVariationCents', event.target.value)} className={INPUT_CLASS} />
            <p className="mt-1 text-[0.98rem] text-white/65">O valor representa centavos. Ex: 50 = R$0,50 de variação.</p>
          </div>
          <div className="mt-2">
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Direção da Variação:</label>
            <select value={editBotExtras.priceVariationDirection} onChange={(event) => handleEditBotExtraChange('priceVariationDirection', event.target.value)} className={baseRowInputClass}>
              {PRICE_VARIATION_DIRECTION_OPTIONS.map((option) => (
                <option key={option} className="bg-[#1f2023]">{option}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 rounded-[10px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
            <p className="text-[1rem] inline-flex items-center gap-2"><AlertCircle size={16} />Dica: Se você percebeu queda de conversão sem mudança no funil, vale muito testar essa função!</p>
          </div>
          <div className="mt-4"><SectionActionButtons /></div>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Botão de Chamada para Ação CTA</h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-[1.15rem] font-semibold text-white/90">Ativar Botão CTA:</span>
            <ToggleSwitch checked={editBotExtras.ctaEnabled} onChange={() => handleEditBotExtraChange('ctaEnabled', !editBotExtras.ctaEnabled)} />
          </div>
          <div className="mt-3 space-y-2">
            <label className="block text-[1.08rem] font-semibold text-white/90">Mensagem enviada com o botão CTA:</label>
            <textarea value={editBotExtras.ctaMessage} onChange={(event) => handleEditBotExtraChange('ctaMessage', event.target.value)} maxLength={4096} className={`${baseRowTextareaClass} h-[115px]`} />
            <div className="text-right text-[1rem] font-semibold text-white/75">{String(editBotExtras.ctaMessage || '').length}/4096</div>
            <label className="block text-[1.08rem] font-semibold text-white/90">Texto do botão CTA:</label>
            <input value={editBotExtras.ctaButtonText} onChange={(event) => handleEditBotExtraChange('ctaButtonText', event.target.value)} className={baseRowInputClass} />
            <label className="block text-[1.08rem] font-semibold text-white/90">Mensagem após clicar no botão (junto aos planos):</label>
            <textarea value={editBotExtras.ctaAfterClickMessage} onChange={(event) => handleEditBotExtraChange('ctaAfterClickMessage', event.target.value)} maxLength={4096} className={`${baseRowTextareaClass} h-[115px]`} />
            <div className="text-right text-[1rem] font-semibold text-white/75">{String(editBotExtras.ctaAfterClickMessage || '').length}/4096</div>
            <label className="block text-[1.08rem] font-semibold text-white/90">Ação do Botão:</label>
            <select value={editBotExtras.ctaAction} onChange={(event) => handleEditBotExtraChange('ctaAction', event.target.value)} className={baseRowInputClass}>
              {CTA_ACTION_OPTIONS.map((option) => (
                <option key={option} className="bg-[#1f2023]">{option}</option>
              ))}
            </select>
          </div>
          <div className="mt-4"><SectionActionButtons onRestore={resetCtaSection} /></div>
          <p className="mt-4 text-[1.05rem] text-white/70">Status do botão CTA: <span className="font-semibold text-white/90">{editBotExtras.ctaEnabled ? 'Ativo' : 'Inativo'}</span></p>
        </section>

        <section>
          <h3 className={sectionTitleClass}>Personalização do Pagamento</h3>
          <div className="mt-3 border-b border-white/10">
            <button type="button" className="h-[40px] px-5 rounded-t-[10px] border-b-2 border-white bg-white/[0.06] text-white text-[1rem] font-semibold">Pix</button>
          </div>

          <h4 className="mt-4 text-[1.9rem] leading-none font-bold text-white/90">Mensagem de Seleção de Método</h4>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[1.08rem] font-semibold text-white/90">Exibir mensagem de método:</span>
            <ToggleSwitch checked={editBotExtras.pixMethodMessageEnabled} onChange={() => handleEditBotExtraChange('pixMethodMessageEnabled', !editBotExtras.pixMethodMessageEnabled)} />
          </div>
          <div className="mt-2">
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Mensagem de Seleção de Método:</label>
            <textarea value={editBotExtras.pixMethodMessage} onChange={(event) => handleEditBotExtraChange('pixMethodMessage', event.target.value)} maxLength={1000} className={`${baseRowTextareaClass} h-[145px]`} />
            <div className="text-right text-[1rem] font-semibold text-white/75">{String(editBotExtras.pixMethodMessage || '').length}/1000</div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.95rem] text-white/90">
            <span className="font-semibold">Variáveis disponíveis:</span>
            {['{profile_name}', '{plan_name}', '{plan_value}', '{plan_duration}'].map((variable) => (
              <span key={variable} className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[0.82rem]">{variable}</span>
            ))}
          </div>
          <div className="mt-2">
            <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto do Botão Pix:</label>
            <input value={editBotExtras.pixButtonText} onChange={(event) => handleEditBotExtraChange('pixButtonText', event.target.value)} className={baseRowInputClass} />
          </div>

          <h4 className="mt-4 text-[1.9rem] leading-none font-bold text-white/90">Textos do Fluxo de Pagamento</h4>
          <div className="mt-2 space-y-2">
            <div>
              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Mensagem ao gerar pagamento:</label>
              <input value={editBotExtras.paymentGeneratingText} onChange={(event) => handleEditBotExtraChange('paymentGeneratingText', event.target.value)} className={baseRowInputClass} />
            </div>
            <div>
              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Mensagem de limite/cooldown:</label>
              <input value={editBotExtras.paymentCooldownText} onChange={(event) => handleEditBotExtraChange('paymentCooldownText', event.target.value)} className={baseRowInputClass} />
            </div>
            <p className="text-[0.95rem] text-white/65">Variáveis disponíveis: <span className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[0.82rem]">{'{payment_wait}'}</span></p>
            <div>
              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Mensagem sem pagamento confirmado:</label>
              <input value={editBotExtras.paymentUnconfirmedText} onChange={(event) => handleEditBotExtraChange('paymentUnconfirmedText', event.target.value)} className={baseRowInputClass} />
            </div>
            <p className="text-[0.95rem] text-white/65">Variáveis disponíveis: <span className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[0.82rem]">{'{support}'}</span></p>
          </div>

          <h4 className="mt-4 text-[1.9rem] leading-none font-bold text-white/90">Provas Sociais</h4>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[1.08rem] font-semibold text-white/90">Ativar provas sociais:</span>
            <ToggleSwitch checked={editBotExtras.socialProofEnabled} onChange={() => handleEditBotExtraChange('socialProofEnabled', !editBotExtras.socialProofEnabled)} />
          </div>
          <div className="mt-3 space-y-2">
            {socialProofItems.map((proof, index) => (
              <div key={proof.id} className="rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[1.45rem] font-bold text-white/90">{`Mensagem ${index + 1}`}</h5>
                  <button type="button" onClick={() => removeSocialProofItem(proof.id)} className="h-[34px] w-[46px] rounded-[10px] border border-[#813130] bg-[#5e1717]/35 text-[#ff6f6f] inline-flex items-center justify-center">
                    <X size={15} />
                  </button>
                </div>
                <div className="mt-2 border-t border-white/10 pt-2">
                  <input value={proof.text} onChange={(event) => updateSocialProofItem(proof.id, 'text', event.target.value)} placeholder="Ex: 🔥 Mais de 1.200 pessoas já ativaram hoje!" className={baseRowInputClass} />
                </div>
              </div>
            ))}
            <div className="flex justify-center">
              <button type="button" onClick={addSocialProofItem} className={plusButtonClass}>
                <PlusCircle size={16} />
              </button>
            </div>
          </div>

          <h4 className="mt-4 text-[1.9rem] leading-none font-bold text-white/90">Método Pix</h4>
          <div className="mt-2 space-y-2">
            <div>
              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Imagem do QR Code:</label>
              <select value={editBotExtras.pixQrDisplay} onChange={(event) => handleEditBotExtraChange('pixQrDisplay', event.target.value)} className={baseRowInputClass}>
                {PIX_QR_DISPLAY_OPTIONS.map((option) => (
                  <option key={option} className="bg-[#1f2023]">{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Formato do Código PIX:</label>
              <select value={editBotExtras.pixCodeFormat} onChange={(event) => handleEditBotExtraChange('pixCodeFormat', event.target.value)} className={baseRowInputClass}>
                {PIX_CODE_FORMAT_OPTIONS.map((option) => (
                  <option key={option} className="bg-[#1f2023]">{option}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[1.08rem] font-semibold text-white/90">Mensagem PIX separada:</span>
              <ToggleSwitch checked={editBotExtras.pixSeparateMessage} onChange={() => handleEditBotExtraChange('pixSeparateMessage', !editBotExtras.pixSeparateMessage)} />
            </div>
            <div>
              <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Mensagem Principal:</label>
              <textarea value={editBotExtras.pixMainMessage} onChange={(event) => handleEditBotExtraChange('pixMainMessage', event.target.value)} maxLength={1000} className={`${baseRowTextareaClass} h-[140px]`} />
              <div className="text-right text-[1rem] font-semibold text-white/75">{String(editBotExtras.pixMainMessage || '').length}/1000</div>
            </div>
            <p className="text-[0.95rem] text-white/65">
              Variáveis disponíveis:{' '}
              {['{profile_name}', '{plan_name}', '{plan_value}', '{plan_duration}', '{payment_pointer}'].map((variable) => (
                <span key={variable} className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[0.82rem] mr-1">{variable}</span>
              ))} — O marcador {'{payment_pointer}'} não pode ser removido.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto do Botão de Status:</label>
                <input value={editBotExtras.pixStatusButtonText} onChange={(event) => handleEditBotExtraChange('pixStatusButtonText', event.target.value)} className={baseRowInputClass} />
              </div>
              <div>
                <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto do Botão QR Code:</label>
                <input value={editBotExtras.pixQrButtonText} onChange={(event) => handleEditBotExtraChange('pixQrButtonText', event.target.value)} className={baseRowInputClass} />
              </div>
              <div>
                <label className="block text-[1.08rem] font-semibold text-white/90 mb-1.5">Texto do Botão Copiar Pix:</label>
                <input value={editBotExtras.pixCopyButtonText} onChange={(event) => handleEditBotExtraChange('pixCopyButtonText', event.target.value)} className={baseRowInputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-[1rem] text-white/65 mb-1.5">Mídia Pix (PNG, JPEG, JPG, MP4):</p>
                <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                  <FolderOpen size={16} className="text-blue-400" />
                  Escolher Mídia
                  <input type="file" accept="image/png,image/jpeg,image/jpg,video/mp4" className="hidden" onChange={(event) => handleEditBotExtraChange('pixMediaName', event.target.files?.[0]?.name || '')} />
                </label>
              </div>
              <div>
                <p className="text-[1rem] text-white/65 mb-1.5">Áudio Pix (OGG):</p>
                <label className="h-[42px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                  <FolderOpen size={16} className="text-blue-400" />
                  Escolher Áudio
                  <input type="file" accept="audio/ogg" className="hidden" onChange={(event) => handleEditBotExtraChange('pixAudioName', event.target.files?.[0]?.name || '')} />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4"><SectionActionButtons onRestore={resetPaymentSection} /></div>
          <div className="mt-6 text-[1rem] text-white/70">
            Os bots que apresentarem inatividade, foram deletados do Telegram ou tiveram o token alterado serão excluídos automaticamente.
            Se tiver algum problema, não hesite em chamar nosso suporte!{' '}
            <span className="underline font-semibold text-white/90">@ApexVips_Suporte</span> 🤝
          </div>
        </section>
      </div>
    );
  }

  function renderDownsellTable(title, headers, emptyText) {
    return (
      <div className="mt-6">
        <h4 className="text-[1.35rem] sm:text-[1.5rem] leading-tight font-semibold text-white/85">{title}</h4>
        <div className="mt-3 border-y border-white/10">
          <div className="grid grid-cols-3 px-2 py-2 text-[0.85rem] font-bold uppercase tracking-[0.08em] text-white/50">
            {headers.map((header) => (
              <span key={header} className="text-center">{header}</span>
            ))}
          </div>
          <div className="border-t border-white/10 py-3">
            <p className="text-center text-[1rem] text-white/55">{emptyText}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <Link
            href="/plans"
            className="h-[40px] w-[52px] rounded-[12px] border border-white/20 bg-white/[0.05] text-white/80 hover:bg-white/[0.09] transition inline-flex items-center justify-center"
          >
            <Pencil size={18} />
          </Link>
        </div>
      </div>
    );
  }

  function renderUpsellTable(title, headers, emptyText) {
    return (
      <div className="mt-6">
        <h4 className="text-[2rem] sm:text-[2.1rem] leading-none font-bold text-white/90">{title}</h4>
        <div className="mt-3 border-y border-white/10">
          <div className="grid grid-cols-3 px-2 py-3 text-[0.95rem] font-bold uppercase tracking-[0.08em] text-white/50">
            {headers.map((header) => (
              <span key={header} className="text-center">{header}</span>
            ))}
          </div>
          <div className="border-t border-white/10 py-3">
            <p className="text-center text-[1.2rem] text-white/60">{emptyText}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <Link
            href="/plans"
            className="h-[44px] w-[56px] rounded-[12px] border border-white/20 bg-white/[0.05] text-white/80 hover:bg-white/[0.09] transition inline-flex items-center justify-center"
          >
            <Pencil size={18} />
          </Link>
        </div>
      </div>
    );
  }

  function renderDownsellTab() {
    return (
      <div className="pt-5">
        <div className="rounded-[12px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
          <p className="text-[0.95rem] sm:text-[1.05rem] font-semibold leading-snug inline-flex items-center gap-2">
            <AlertCircle size={18} />
            Atenção: somente membros que derem /start pela primeira vez receberão o downsell normalmente. Isso evita envios repetidos e previne spam.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span className="text-[1.1rem] sm:text-[1.2rem] font-semibold text-white/90">Downsell Ativo</span>
          <ToggleSwitch checked={config.downsellEnabled} onChange={() => handleConfigChange('downsellEnabled', !config.downsellEnabled)} />
        </div>

        <div className="mt-4 space-y-4">
          {downsellMessages.map((message, index) => (
            <section key={message.id} className="rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[1.2rem] sm:text-[1.35rem] font-semibold text-white/90">{`Mensagem ${index + 1}`}</h3>
                <button
                  type="button"
                  onClick={() => handleDeleteDownsellMessage(message.id)}
                  disabled={downsellMessages.length === 1}
                  className="h-[32px] sm:h-[34px] px-3 rounded-[10px] border border-[#813130] bg-[#5e1717]/35 text-[#ff6f6f] text-[0.9rem] sm:text-[0.95rem] font-semibold inline-flex items-center gap-2 disabled:opacity-40"
                >
                  <Trash2 size={15} />
                  Excluir
                </button>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <textarea
                  value={message.text}
                  maxLength={MAX_DOWNSELL_LENGTH}
                  onChange={(event) => handleDownsellMessageChange(message.id, 'text', event.target.value)}
                  className={`${TEXTAREA_CLASS} h-[140px] sm:h-[150px]`}
                />
                <div className="mt-1 text-right text-[0.85rem] sm:text-[0.9rem] font-semibold text-white/80">
                  {String(message.text || '').length}/{MAX_DOWNSELL_LENGTH}
                </div>

                <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 text-[0.95rem] font-semibold text-white/85 inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      Tempo:
                    </label>
                    <select
                      value={message.time}
                      onChange={(event) => handleDownsellMessageChange(message.id, 'time', event.target.value)}
                      className={SMALL_CONTROL_CLASS}
                    >
                      {DOWSELL_TIME_OPTIONS.map((option) => (
                        <option key={option} className="bg-[#1f2023]">{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-[0.95rem] font-semibold text-white/85 inline-flex items-center gap-1.5">
                      <BadgePercent size={14} />
                      Desconto:
                    </label>
                    <select
                      value={message.discount}
                      onChange={(event) => handleDownsellMessageChange(message.id, 'discount', event.target.value)}
                      className={SMALL_CONTROL_CLASS}
                    >
                      {DOWSELL_DISCOUNT_OPTIONS.map((option) => (
                        <option key={option} className="bg-[#1f2023]">{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-[0.95rem] font-semibold text-white/85">Modo Botões:</label>
                    <select
                      value={message.buttonMode}
                      onChange={(event) => handleDownsellMessageChange(message.id, 'buttonMode', event.target.value)}
                      className={SMALL_CONTROL_CLASS}
                    >
                      {DOWSELL_BUTTON_MODE_OPTIONS.map((option) => (
                        <option key={option} className="bg-[#1f2023]">{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 text-[0.95rem] font-semibold text-white/85">Gatilho:</label>
                    <select
                      value={message.trigger}
                      onChange={(event) => handleDownsellMessageChange(message.id, 'trigger', event.target.value)}
                      className={SMALL_CONTROL_CLASS}
                    >
                      {DOWSELL_TRIGGER_OPTIONS.map((option) => (
                        <option key={option} className="bg-[#1f2023]">{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-[0.95rem] font-semibold text-white/85">Destinatários:</label>
                    <select
                      value={message.audience}
                      onChange={(event) => handleDownsellMessageChange(message.id, 'audience', event.target.value)}
                      className={SMALL_CONTROL_CLASS}
                    >
                      {DOWSELL_AUDIENCE_OPTIONS.map((option) => (
                        <option key={option} className="bg-[#1f2023]">{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[0.95rem] text-white/65 mb-1.5">Mídia (PNG, JPEG, MP4):</p>
                    <label className="h-[36px] sm:h-[38px] px-3 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.9rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                      <FolderOpen size={16} className="text-blue-400" />
                      Escolher Mídia
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,video/mp4"
                        className="hidden"
                        onChange={(event) => handleDownsellMessageChange(message.id, 'mediaName', event.target.files?.[0]?.name || '')}
                      />
                    </label>
                    {message.mediaName && <p className="mt-1 text-[0.9rem] text-white/75">{message.mediaName}</p>}
                  </div>
                  <div>
                    <p className="text-[0.95rem] text-white/65 mb-1.5">Áudio (OGG):</p>
                    <label className="h-[36px] sm:h-[38px] px-3 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.9rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                      <FolderOpen size={16} className="text-blue-400" />
                      Escolher Áudio
                      <input
                        type="file"
                        accept="audio/ogg"
                        className="hidden"
                        onChange={(event) => handleDownsellMessageChange(message.id, 'audioName', event.target.files?.[0]?.name || '')}
                      />
                    </label>
                    {message.audioName && <p className="mt-1 text-[0.9rem] text-white/75">{message.audioName}</p>}
                  </div>
                </div>

                {renderDownsellTable(`Planos Assinaturas da Mensagem ${index + 1}`, ['NOME', 'VALOR', 'DURAÇÃO'], 'Nenhum plano de assinatura cadastrado.')}
                {renderDownsellTable(`Planos Pacotes da Mensagem ${index + 1}`, ['NOME', 'VALOR', 'ENTREGÁVEL'], 'Nenhum pacote cadastrado.')}
                {renderDownsellTable(`Botões da Mensagem ${index + 1}`, ['TEXTO', 'LINK', 'TIPO'], 'Nenhum botão cadastrado.')}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleAddDownsellMessage}
            className="h-[40px] px-5 rounded-[10px] border border-white/20 bg-white/[0.07] text-white/85 text-[0.95rem] font-semibold inline-flex items-center gap-2 hover:bg-white/[0.12] transition"
          >
            <PlusCircle size={16} />
            Adicionar Nova Mensagem
          </button>
        </div>
      </div>
    );
  }

  function renderUpsellTab() {
    return (
      <div className="pt-5">
        {showUpsellSuccessToast && (
          <div className="fixed top-8 right-8 z-50 rounded-[12px] border border-emerald-300/35 bg-emerald-500 px-5 py-3 text-[1rem] font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
            Nova mensagem adicionada com sucesso!
          </div>
        )}

        <div className="rounded-[12px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
          <p className="text-[1.75rem] font-semibold leading-snug inline-flex items-center gap-2">
            <AlertCircle size={18} />
            Atenção: o upsell é enviado automaticamente após qualquer compra realizada no bot.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span className="text-[2rem] font-semibold text-white/90">Upsell Ativo</span>
          <ToggleSwitch checked={config.upsellEnabled} onChange={() => handleConfigChange('upsellEnabled', !config.upsellEnabled)} />
        </div>

        <div className="mt-4">
          <label className="block mb-1 text-[2rem] font-semibold text-white/90">Modo de Envio</label>
          <select
            value={upsellSendMode}
            onChange={(event) => setUpsellSendMode(event.target.value)}
            className="h-[40px] w-full rounded-[8px] bg-[#232428] border border-white/20 px-3 text-[1.85rem] text-white outline-none"
          >
            {UPSELL_SEND_MODE_OPTIONS.map((option) => (
              <option key={option} className="bg-[#1f2023]">{option}</option>
            ))}
          </select>
        </div>

        <div className="mt-5 space-y-4">
          {upsellMessages.map((message, index) => (
            <section key={message.id} className="rounded-[14px] border border-white/10 bg-white/[0.04] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[2.25rem] font-bold text-white/90">{`Mensagem ${index + 1}`}</h3>
                <button
                  type="button"
                  onClick={() => handleDeleteUpsellMessage(message.id)}
                  className="h-[40px] px-4 rounded-[10px] border border-[#813130] bg-[#5e1717]/35 text-[#ff6f6f] text-[1.55rem] font-semibold inline-flex items-center gap-2"
                >
                  <Trash2 size={15} />
                  Excluir
                </button>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <textarea
                  value={message.text}
                  maxLength={MAX_UPSELL_LENGTH}
                  onChange={(event) => handleUpsellMessageChange(message.id, 'text', event.target.value)}
                  className={`${TEXTAREA_CLASS} h-[170px]`}
                  placeholder="Exemplo de mensagem de upsell..."
                />
                <div className="mt-1 text-right text-[1.5rem] font-semibold text-white/90">
                  {String(message.text || '').length}/{MAX_UPSELL_LENGTH}
                </div>

                <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 text-[1.5rem] font-semibold text-white/85 inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      Tempo:
                    </label>
                    <select
                      value={message.time}
                      onChange={(event) => handleUpsellMessageChange(message.id, 'time', event.target.value)}
                      className={SMALL_CONTROL_CLASS}
                    >
                      {UPSELL_TIME_OPTIONS.map((option) => (
                        <option key={option} className="bg-[#1f2023]">{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-[1.5rem] font-semibold text-white/85">Destinatários:</label>
                    <select
                      value={message.audience}
                      onChange={(event) => handleUpsellMessageChange(message.id, 'audience', event.target.value)}
                      className={SMALL_CONTROL_CLASS}
                    >
                      {UPSELL_AUDIENCE_OPTIONS.map((option) => (
                        <option key={option} className="bg-[#1f2023]">{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[1.5rem] text-white/65 mb-1.5">Mídia (PNG, JPEG, MP4):</p>
                    <label className="h-[42px] px-3 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1.45rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                      <FolderOpen size={16} className="text-blue-400" />
                      Escolher Mídia
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,video/mp4"
                        className="hidden"
                        onChange={(event) => handleUpsellMessageChange(message.id, 'mediaName', event.target.files?.[0]?.name || '')}
                      />
                    </label>
                    {message.mediaName && <p className="mt-1 text-[1.4rem] text-white/75">{message.mediaName}</p>}
                  </div>
                  <div>
                    <p className="text-[1.5rem] text-white/65 mb-1.5">Áudio (OGG):</p>
                    <label className="h-[42px] px-3 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[1.45rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                      <FolderOpen size={16} className="text-blue-400" />
                      Escolher Áudio
                      <input
                        type="file"
                        accept="audio/ogg"
                        className="hidden"
                        onChange={(event) => handleUpsellMessageChange(message.id, 'audioName', event.target.files?.[0]?.name || '')}
                      />
                    </label>
                    {message.audioName && <p className="mt-1 text-[1.4rem] text-white/75">{message.audioName}</p>}
                  </div>
                </div>

                {renderUpsellTable(`Planos Assinaturas da Mensagem ${index + 1}`, ['NOME', 'VALOR', 'DURAÇÃO'], 'Nenhum plano de assinatura cadastrado.')}
                {renderUpsellTable(`Planos Pacotes da Mensagem ${index + 1}`, ['NOME', 'VALOR', 'ENTREGÁVEL'], 'Nenhum pacote cadastrado.')}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleAddUpsellMessage}
            className="h-[44px] px-5 rounded-[10px] border border-white/20 bg-white/[0.07] text-white/85 text-[1.55rem] font-semibold inline-flex items-center gap-2 hover:bg-white/[0.12] transition"
          >
            <PlusCircle size={16} />
            Adicionar Nova Mensagem
          </button>
        </div>
      </div>
    );
  }

  function renderSaleCodeTab() {
    const saleCodesCount = allowedSaleCodes.length;
    const isInlineEditing = saleCodeInlineMode !== null;
    const shouldShowInlineInput = saleCodeInlineMode === 'add' || (saleCodeInlineMode === 'edit' && saleCodeEditingIndex !== null);

    return (
      <div className="pt-5">
        {showSaleCodesToast && (
          <div className="fixed top-8 right-8 z-50 rounded-[12px] border border-emerald-300/35 bg-emerald-500 px-5 py-3 text-[1rem] font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
            Códigos de Vendas Permitidos ativados com sucesso!
          </div>
        )}

        <div className="rounded-[12px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
          <p className="text-[1rem] font-semibold leading-snug inline-flex items-center gap-2">
            <AlertCircle size={16} />
            <a href={SALE_CODE_TUTORIAL_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Clique aqui para acessar o tutorial completo do Código de Venda.
            </a>
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
          <section className="rounded-[18px] border border-white/10 bg-white/[0.04] px-5 py-5 min-h-[420px]">
            <h3 className="text-[2rem] leading-none font-bold text-white/90 inline-flex items-center gap-2.5">
              <BarChart3 size={18} />
              Desempenho dos códigos de venda (7 dias)
            </h3>
          </section>

          <section className="rounded-[18px] border border-white/10 bg-white/[0.04] px-5 py-5 min-h-[420px]">
            <h3 className="text-[2rem] leading-none font-bold text-white/90 inline-flex items-center gap-2.5">
              <BadgeDollarSign size={18} />
              Códigos com maior valor arrecadado
            </h3>
          </section>
        </div>

        <section className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] px-5 py-5">
          <h3 className="text-[2rem] leading-none font-bold text-white/90 inline-flex items-center gap-2.5">
            <BadgeDollarSign size={18} />
            Códigos de Venda Permitidos
          </h3>

          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-[1.4rem] font-semibold text-white/90">Permitir Códigos de Venda Específicos</span>
            <ToggleSwitch checked={saleCodesRestricted} onChange={handleToggleSaleCodesRestricted} />
          </div>

          <div className="mt-4 border-y border-white/10">
            <div className="grid grid-cols-[1fr_220px] px-2 py-3 text-[0.95rem] font-bold uppercase tracking-[0.08em] text-white/55">
              <span className="text-center">Código de venda</span>
              <span className="text-center">Ações</span>
            </div>
            <div className="border-t border-white/10 py-2">
              {shouldShowInlineInput ? (
                <div className="grid grid-cols-[1fr_220px] items-center gap-2 px-2 py-2">
                  <input
                    value={saleCodeDraftValue}
                    onChange={(event) => setSaleCodeDraftValue(event.target.value)}
                    placeholder="Ex: abc123"
                    className="h-[46px] rounded-[10px] bg-white/[0.1] border border-white/10 px-4 text-[1.05rem] text-white placeholder:text-white/45 outline-none focus:border-white/25"
                  />
                  <div />
                </div>
              ) : allowedSaleCodes.length === 0 ? (
                <p className="text-center text-[1.1rem] text-white/60 py-2">Nenhum código de venda permitido cadastrado.</p>
              ) : (
                allowedSaleCodes.map((code, index) => (
                  <div key={`${code}-${index}`} className="grid grid-cols-[1fr_220px] items-center px-2 py-2 border-b last:border-b-0 border-white/5">
                    <span className="text-center text-[1.15rem] font-semibold text-white/88">{code}</span>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditSaleCode(index)}
                        className="h-[34px] w-[44px] rounded-[10px] border border-white/15 bg-white/[0.06] text-white/80 inline-flex items-center justify-center hover:bg-white/[0.1] transition"
                        aria-label={`Editar código ${code}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSaleCode(index)}
                        className="h-[34px] w-[44px] rounded-[10px] border border-[#813130] bg-[#5e1717]/35 text-[#ff6f6f] inline-flex items-center justify-center hover:bg-[#6b1f1f]/45 transition"
                        aria-label={`Excluir código ${code}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`mt-4 ${isInlineEditing ? 'flex justify-end' : 'flex justify-center'}`}>
            {isInlineEditing ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseSaleCodeInline}
                  className="h-[42px] w-[56px] rounded-[12px] border border-white/20 bg-white/[0.06] text-white/85 inline-flex items-center justify-center hover:bg-white/[0.1] transition"
                >
                  <X size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleSaveSaleCodeInline}
                  className="h-[42px] w-[56px] rounded-[12px] bg-[#2eae4d] text-white inline-flex items-center justify-center hover:bg-[#39bd59] transition"
                >
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEditSaleCode(0)}
                  className="h-[42px] w-[50px] rounded-[12px] border border-white/20 bg-white/[0.06] text-white/80 inline-flex items-center justify-center hover:bg-white/[0.1] transition"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleAddSaleCode}
                  className="h-[42px] w-[50px] rounded-[12px] border border-white/20 bg-white/[0.06] text-white/90 inline-flex items-center justify-center hover:bg-white/[0.1] transition"
                >
                  <PlusCircle size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-[12px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
            <p className="text-[1rem] font-semibold leading-snug inline-flex items-center gap-2">
              <AlertCircle size={16} />
              Atenção: agora é possível ativar a opção Permitir Códigos de Venda Específicos, garantindo que apenas códigos previamente configurados sejam aceitos. Isso evita códigos aleatórios e mantém suas estatísticas organizadas e seguras.
            </p>
          </div>
        </section>

        {saleCodesRestricted && (
          <section className="mt-4">
            <section className="rounded-[18px] border border-white/10 bg-white/[0.04] px-5 py-5 min-h-[210px]">
              <h4 className="text-[2rem] leading-none font-bold text-white/90">Códigos de Venda ({saleCodesCount} no total)</h4>
              <div className="mt-8">
                {saleCodesCount === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-white/65">
                    <X size={18} />
                    <p className="text-[1.7rem]">Nenhum código de venda encontrado</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allowedSaleCodes.map((code) => (
                      <span key={`tag-${code}`} className="h-[38px] px-3 rounded-[10px] border border-white/20 bg-white/[0.06] text-[1rem] text-white inline-flex items-center">
                        {code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </section>
        )}
      </div>
    );
  }

  function renderAutoApprovalTab() {
    const tableHeaderClass = 'text-center text-[0.85rem] uppercase tracking-[0.08em] font-bold text-white/55';
    const baseRowInputClass = 'w-full h-[42px] rounded-[10px] bg-white/[0.08] border border-white/15 px-4 text-[1rem] text-white placeholder:text-white/45 outline-none focus:border-white/30';
    const baseRowTextareaClass = 'w-full rounded-[10px] bg-white/[0.08] border border-white/15 px-4 py-3 text-[1rem] text-white placeholder:text-white/45 outline-none focus:border-white/30 resize-none';

    return (
      <div className="pt-5 space-y-5">
        {showAutoApprovalToast && (
          <div className="fixed top-8 right-8 z-50 rounded-[12px] border border-emerald-300/35 bg-emerald-500 px-5 py-3 text-[1rem] font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
            Novo canal adicionado com sucesso!
          </div>
        )}

        <div className="rounded-[12px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
          <p className="text-[1rem] font-semibold leading-snug inline-flex items-center gap-2">
            <AlertCircle size={16} />
            <a href={AUTO_APPROVAL_TUTORIAL_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Clique aqui para acessar o tutorial de como usar a aprovação automática.
            </a>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[1.15rem] font-semibold text-white/90">Aprovação Automática Ativa</span>
          <ToggleSwitch checked={autoApprovalEnabled} onChange={() => setAutoApprovalEnabled(!autoApprovalEnabled)} />
        </div>

        <div className="space-y-4">
          {autoApprovalChannels.map((channel, index) => (
            <section key={channel.id} className="rounded-[16px] border border-white/10 bg-white/[0.04] px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[1.35rem] font-semibold text-white/90">{`Canal ${index + 1}`}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveAutoApprovalChannel(channel.id)}
                  disabled={autoApprovalChannels.length === 1}
                  className="h-[34px] px-3 rounded-[8px] border border-[#813130] bg-[#5e1717]/35 text-[#ff6f6f] text-[0.9rem] font-semibold inline-flex items-center gap-2 hover:bg-[#6b1f1f]/45 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-[1.05rem] font-semibold text-white/90 mb-1.5">ID Canal/Grupo:</label>
                <input
                  value={channel.groupId}
                  onChange={(event) => updateAutoApprovalChannel(channel.id, 'groupId', event.target.value)}
                  placeholder="Apenas números! Exemplo: -10022393848"
                  className={baseRowInputClass}
                />
                <p className="mt-2 text-[0.98rem] text-white/65">
                  Certifique-se de que o bot {config.botUsername || 'Vipdamicabot'} está como administrador no canal/grupo com todas as permissões!
                </p>
              </div>

              <div className="mt-3">
                <label className="block text-[1.05rem] font-semibold text-white/90 mb-1.5">{`Mensagem ${index + 1}:`}</label>
                <textarea
                  value={channel.message}
                  onChange={(event) => updateAutoApprovalChannel(channel.id, 'message', event.target.value)}
                  maxLength={MAX_AUTO_APPROVAL_MESSAGE}
                  placeholder="Exemplo de mensagem: Olá, bem-vindo ao canal!"
                  className={`${baseRowTextareaClass} h-[180px]`}
                />
                <div className="mt-1 text-right text-[0.95rem] font-semibold text-white/60">
                  {String(channel.message || '').length}/{MAX_AUTO_APPROVAL_MESSAGE}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[0.95rem] font-semibold text-white/75 mb-1">Tempo:</label>
                  <select
                    value={channel.time}
                    onChange={(event) => updateAutoApprovalChannel(channel.id, 'time', event.target.value)}
                    className={SMALL_CONTROL_CLASS}
                  >
                    {AUTO_APPROVAL_TIME_OPTIONS.map((option) => (
                      <option key={option} className="bg-[#1f2023]">{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.95rem] font-semibold text-white/75 mb-1">Ação:</label>
                  <select
                    value={channel.action}
                    onChange={(event) => updateAutoApprovalChannel(channel.id, 'action', event.target.value)}
                    className={SMALL_CONTROL_CLASS}
                  >
                    {AUTO_APPROVAL_ACTION_OPTIONS.map((option) => (
                      <option key={option} className="bg-[#1f2023]">{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.95rem] font-semibold text-white/75 mb-1">Modo de Botão:</label>
                  <select
                    value={channel.buttonMode}
                    onChange={(event) => updateAutoApprovalChannel(channel.id, 'buttonMode', event.target.value)}
                    className={SMALL_CONTROL_CLASS}
                  >
                    {AUTO_APPROVAL_BUTTON_MODE_OPTIONS.map((option) => (
                      <option key={option} className="bg-[#1f2023]">{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-[0.98rem] text-white/65 mb-1.5">Mídia Anexada:</p>
                  <label className="h-[40px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.95rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                    <FolderOpen size={16} className="text-blue-400" />
                    Escolher Mídia
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,video/mp4"
                      className="hidden"
                      onChange={(event) => updateAutoApprovalChannel(channel.id, 'mediaName', event.target.files?.[0]?.name || '')}
                    />
                  </label>
                  {channel.mediaName && <p className="mt-1 text-[0.95rem] text-white/75">{channel.mediaName}</p>}
                </div>
                <div>
                  <p className="text-[0.98rem] text-white/65 mb-1.5">Áudio Anexado:</p>
                  <label className="h-[40px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.95rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                    <FolderOpen size={16} className="text-blue-400" />
                    Escolher Áudio
                    <input
                      type="file"
                      accept="audio/ogg"
                      className="hidden"
                      onChange={(event) => updateAutoApprovalChannel(channel.id, 'audioName', event.target.files?.[0]?.name || '')}
                    />
                  </label>
                  {channel.audioName && <p className="mt-1 text-[0.95rem] text-white/75">{channel.audioName}</p>}
                </div>
              </div>

              <h4 className="mt-5 text-[1.6rem] leading-none font-bold text-white/90">Botões Personalizados</h4>
              <div className="mt-3 border-y border-white/10">
                <div className="grid grid-cols-3 px-3 py-3">
                  <span className={tableHeaderClass}>Texto</span>
                  <span className={tableHeaderClass}>Link</span>
                  <span className={tableHeaderClass}>Tipo</span>
                </div>
                <div className="border-t border-white/10 py-3">
                  {channel.customButtons.length === 0 ? (
                    <div className="flex items-center justify-center py-2">
                      <button
                        type="button"
                        onClick={() => handleAddAutoApprovalButton(channel.id)}
                        className="h-[38px] w-[46px] rounded-[10px] border border-white/20 bg-white/[0.06] text-white inline-flex items-center justify-center hover:bg-white/[0.1] transition"
                      >
                        <PlusCircle size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {channel.customButtons.map((button) => (
                        <div key={button.id} className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                          <input
                            value={button.text}
                            onChange={(event) => updateAutoApprovalButton(channel.id, button.id, 'text', event.target.value)}
                            placeholder="Texto do Botão"
                            className={baseRowInputClass}
                          />
                          <input
                            value={button.link}
                            onChange={(event) => updateAutoApprovalButton(channel.id, button.id, 'link', event.target.value)}
                            placeholder="https://exemplo.com"
                            className={baseRowInputClass}
                          />
                          <select
                            value={button.type}
                            onChange={(event) => updateAutoApprovalButton(channel.id, button.id, 'type', event.target.value)}
                            className={baseRowInputClass}
                          >
                            {CUSTOM_BUTTON_TYPE_OPTIONS.map((option) => (
                              <option key={option} className="bg-[#1f2023]">{option}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveAutoApprovalButton(channel.id, button.id)}
                            className="h-[38px] w-[38px] text-white/60 hover:text-white inline-flex items-center justify-center"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-center pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddAutoApprovalButton(channel.id)}
                          className="h-[38px] w-[46px] rounded-[10px] border border-white/20 bg-white/[0.06] text-white inline-flex items-center justify-center hover:bg-white/[0.1] transition"
                        >
                          <PlusCircle size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <SectionActionButtons />
              </div>
            </section>
          ))}
        </div>

        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={handleAddAutoApprovalChannel}
            className="h-[42px] px-5 rounded-[10px] border border-white/20 bg-white/[0.07] text-white/85 text-[0.98rem] font-semibold inline-flex items-center gap-2 hover:bg-white/[0.12] transition"
          >
            <PlusCircle size={16} />
            Adicionar Novo Canal
          </button>
        </div>
      </div>
    );
  }

  function renderLeadCaptureTab() {
    const fieldLabelClass = 'block text-[1rem] font-semibold text-white/90 mb-1.5';
    const baseRowInputClass = 'w-full h-[42px] rounded-[10px] bg-white/[0.08] border border-white/15 px-4 text-[1rem] text-white placeholder:text-white/45 outline-none focus:border-white/30';
    const baseRowTextareaClass = 'w-full rounded-[10px] bg-white/[0.08] border border-white/15 px-4 py-3 text-[1rem] text-white placeholder:text-white/45 outline-none focus:border-white/30 resize-none';

    return (
      <div className="pt-5 space-y-4">
        <div className="rounded-[12px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
          <p className="text-[1rem] font-semibold leading-snug inline-flex items-center gap-2">
            <AlertCircle size={16} />
            Atenção: a função de Captura de Telefone só funciona com números do Brasil que começam com +55.
          </p>
        </div>

        <section className="rounded-[16px] border border-white/10 bg-white/[0.04] px-5 py-5">
          <h3 className="text-[1.6rem] font-bold text-white/90 inline-flex items-center gap-2">
            <Phone size={18} />
            Configurar Captura de Telefone
          </h3>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-[1.05rem] font-semibold text-white/90">Captura Telefone Ativa</span>
            <ToggleSwitch checked={leadCaptureEnabled} onChange={() => setLeadCaptureEnabled(!leadCaptureEnabled)} />
          </div>

          <div className="mt-4">
            <label className={fieldLabelClass}>Momento da Captura:</label>
            <select
              value={leadCaptureMoment}
              onChange={(event) => setLeadCaptureMoment(event.target.value)}
              className={baseRowInputClass}
            >
              {LEAD_CAPTURE_MOMENT_OPTIONS.map((option) => (
                <option key={option} className="bg-[#1f2023]">{option}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className={fieldLabelClass}>Texto antes do botão:</label>
            <textarea
              value={leadCaptureBeforeText}
              onChange={(event) => setLeadCaptureBeforeText(event.target.value)}
              className={`${baseRowTextareaClass} h-[90px]`}
            />
          </div>

          <div className="mt-4">
            <label className={fieldLabelClass}>Texto depois do botão:</label>
            <textarea
              value={leadCaptureAfterText}
              onChange={(event) => setLeadCaptureAfterText(event.target.value)}
              className={`${baseRowTextareaClass} h-[90px]`}
            />
          </div>

          <div className="mt-4">
            <label className={fieldLabelClass}>Texto de erro:</label>
            <textarea
              value={leadCaptureErrorText}
              onChange={(event) => setLeadCaptureErrorText(event.target.value)}
              className={`${baseRowTextareaClass} h-[90px] border-[#a79d2b] focus:border-[#c0b63c]`}
            />
          </div>

          <div className="mt-4">
            <label className={fieldLabelClass}>Texto do Botão:</label>
            <input
              value={leadCaptureButtonText}
              onChange={(event) => setLeadCaptureButtonText(event.target.value)}
              className={baseRowInputClass}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-[0.98rem] text-white/65 mb-1.5">Mídia (PNG, JPEG, JPG, MP4):</p>
              <label className="h-[40px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.95rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                <FolderOpen size={16} className="text-blue-400" />
                Escolher Mídia
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,video/mp4"
                  className="hidden"
                  onChange={(event) => setLeadCaptureMediaName(event.target.files?.[0]?.name || '')}
                />
              </label>
              {leadCaptureMediaName && <p className="mt-1 text-[0.95rem] text-white/75">{leadCaptureMediaName}</p>}
            </div>
            <div>
              <p className="text-[0.98rem] text-white/65 mb-1.5">Áudio (OGG):</p>
              <label className="h-[40px] px-4 rounded-[10px] border border-white/20 bg-white/[0.06] text-white text-[0.95rem] font-semibold inline-flex items-center gap-2 cursor-pointer hover:bg-white/[0.1] transition w-fit">
                <FolderOpen size={16} className="text-blue-400" />
                Escolher Áudio
                <input
                  type="file"
                  accept="audio/ogg"
                  className="hidden"
                  onChange={(event) => setLeadCaptureAudioName(event.target.files?.[0]?.name || '')}
                />
              </label>
              {leadCaptureAudioName && <p className="mt-1 text-[0.95rem] text-white/75">{leadCaptureAudioName}</p>}
            </div>
          </div>

          <div className="mt-5 h-px bg-white/10" />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSaveLeadCapture}
              className="h-[42px] px-5 rounded-[10px] bg-[#2eae4d] text-white text-[0.95rem] font-semibold hover:bg-[#39bd59] transition"
            >
              Salvar Configuração
            </button>
          </div>
        </section>
      </div>
    );
  }

  function renderWebhookTab() {
    return (
      <div className="pt-5 space-y-5">
        <div className="rounded-[12px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321]">
          <p className="text-[1rem] font-semibold leading-snug inline-flex items-center gap-2">
            <AlertCircle size={16} />
            Atenção: webhooks com 3 falhas consecutivas (timeout ou erro) são removidos automaticamente da lista. Verifique se a URL está acessível e retornando status 200.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div />
          <button
            type="button"
            onClick={handleAddWebhook}
            className="h-[40px] px-5 rounded-[10px] border border-white/20 bg-white/[0.06] text-white/80 text-[0.95rem] font-semibold inline-flex items-center gap-2 hover:bg-white/[0.1] transition"
          >
            <PlusCircle size={16} />
            Adicionar Novo Webhook
          </button>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="h-[40px] px-5 rounded-[10px] bg-[#2eae4d] text-white text-[0.95rem] font-semibold hover:bg-[#39bd59] transition"
            >
              Salvar alterações
            </button>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <section>
          <h3 className="text-[1.6rem] font-bold text-white/90">Exemplos de Webhooks</h3>
          <div className="mt-4 space-y-4">
            {WEBHOOK_EXAMPLES.map((example) => (
              <div key={example.title} className="rounded-[16px] border border-white/10 bg-white/[0.04] p-5">
                <h4 className="text-[1.2rem] font-semibold text-white/90">📌 {example.title}</h4>
                <pre className="mt-3 rounded-[12px] border border-white/10 bg-white/[0.04] p-4 text-[0.95rem] text-white/80 font-mono leading-6 whitespace-pre overflow-x-auto">
                  {example.payload}
                </pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  function renderSimplePlaceholder(title, description) {
    return (
      <div className="pt-5">
        <div className="rounded-[14px] border border-white/10 bg-white/[0.03] px-5 py-6">
          <h3 className="text-[1.45rem] font-bold text-white/90">{title}</h3>
          <p className="mt-2 text-[1.02rem] text-white/70">{description}</p>
        </div>
      </div>
    );
  }

  function renderTabContent() {
    if (activeTab === 'editar') return renderEditTab();
    if (activeTab === 'downsell') return renderDownsellTab();
    if (activeTab === 'upsell') return renderUpsellTab();
    if (activeTab === 'venda') return renderSaleCodeTab();
    if (activeTab === 'aprovacao') {
      return renderAutoApprovalTab();
    }
    if (activeTab === 'leads') {
      return renderLeadCaptureTab();
    }
    if (activeTab === 'webhook') {
      return renderWebhookTab();
    }
    return renderSimplePlaceholder('Webhook', `Endpoint atual: ${window.location.origin}/api/webhooks/payment?botId=${selectedBotId || ''}`);
  }

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <p className="text-[0.9rem] font-black uppercase tracking-[0.35em] text-slate-700 animate-pulse">Lendo Configurações Core...</p>
      </div>
    );
  }

  if (!hasBotContext) {
    return (
      <div className="w-full pb-10 pt-1">
        <div className="rounded-[18px] border border-white/10 bg-[#1f2023] px-7 py-8 text-center">
          <h2 className="text-[2rem] font-bold text-white">Configurar Bot</h2>
          <p className="mt-3 text-[1.05rem] text-white/70">Nenhum bot selecionado. Selecione um bot no menu lateral ou crie um novo bot.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCreateTestBot}
              disabled={creatingTestBot}
              className="h-[46px] px-5 rounded-[10px] bg-[#2eae4d] text-white font-semibold hover:bg-[#39bd59] transition disabled:opacity-60"
            >
              {creatingTestBot ? 'Criando bot de teste...' : 'Criar bot de teste'}
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = '/bot/create')}
              className="h-[46px] px-5 rounded-[10px] border border-white/20 bg-white/[0.06] text-white font-semibold hover:bg-white/[0.1] transition"
            >
              Criar novo bot
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-10 pt-1 animate-in fade-in duration-500">
      <section className="rounded-[18px] border border-white/10 bg-[#1f2023] shadow-[0_12px_35px_rgba(0,0,0,0.35)] px-6 lg:px-8 py-6">
        <div>
          <h1 className="text-[2.6rem] leading-none font-extrabold tracking-tight text-white/95">
            {config.botUsername || 'Vipdamicabot'} ID: {config.botExternalId || '59548'}
          </h1>
          <p className="mt-1 text-[1.02rem] text-white/60">Criado em: {formatCreatedAt(config.createdAt)}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => handleQuickAction(action.id)}
                className="h-[46px] px-4 rounded-[10px] border border-white/15 bg-white/[0.08] text-white/85 text-[0.98rem] font-semibold inline-flex items-center gap-2.5 hover:bg-white/[0.12] transition"
              >
                <Icon size={16} />
                {action.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 border-b border-white/10 flex flex-wrap gap-2.5 pb-1">
          {TAB_ITEMS.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                href={tab.href}
                className={`h-[44px] px-4 rounded-[10px] border-b-2 text-[1.02rem] font-semibold inline-flex items-center gap-2.5 transition ${
                  selected
                    ? 'text-white bg-white/[0.08] border-white'
                    : 'text-white/60 border-transparent hover:text-white/85 hover:bg-white/[0.05]'
                }`}
              >
                <Icon size={16} className={selected ? 'text-white' : 'text-white/60'} />
                {tab.label}
              </Link>
            );
          })}
        </div>

        {renderTabContent()}

        {statusMessage && (
          <div
            className={`mt-5 rounded-[10px] px-4 py-3 text-[0.98rem] font-semibold ${
              statusMessage.type === 'success'
                ? 'bg-green-500/15 border border-green-500/35 text-green-300'
                : 'bg-red-500/15 border border-red-500/35 text-red-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {copyToastMessage && (
          <div className="fixed top-8 right-8 z-[70] rounded-[12px] border border-emerald-300/35 bg-emerald-700/80 px-5 py-3 text-[0.98rem] font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)] flex items-center gap-3">
            <span>{copyToastMessage}</span>
            <button
              type="button"
              onClick={() => setCopyToastMessage('')}
              className="h-[22px] w-[22px] rounded-full bg-black/20 text-white/70 inline-flex items-center justify-center hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {showProfileModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-[560px] rounded-[18px] border border-white/10 bg-[#262626] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <h3 className="text-[1.1rem] font-semibold text-white/90">Perfil do Bot</h3>
                <button
                  type="button"
                  onClick={handleCloseProfileModal}
                  className="h-[28px] w-[28px] rounded-[8px] border border-white/10 bg-white/[0.06] text-white/60 inline-flex items-center justify-center hover:text-white hover:bg-white/[0.12] transition"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="px-5 py-4">
                {profileLoading ? (
                  <p className="text-[0.98rem] text-white/65">Carregando perfil...</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="h-[56px] w-[56px] rounded-full bg-[#1f8ef1] border border-white/10 flex items-center justify-center cursor-pointer">
                        <Check size={28} className="text-white" />
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={(event) => setProfileImageName(event.target.files?.[0]?.name || '')}
                        />
                      </label>
                      <div className="text-[0.9rem] text-white/60">
                        <p>Clique na foto para alterar. JPEG ou PNG, recomendado 512×512 px.</p>
                        {profileImageName && <p className="mt-1 text-white/80">{profileImageName}</p>}
                      </div>
                    </div>

                    <input
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      className="w-full h-[40px] rounded-[10px] bg-white/[0.08] border border-white/15 px-4 text-[0.98rem] text-white placeholder:text-white/40 outline-none focus:border-white/30"
                    />

                    <textarea
                      value={profileBio}
                      onChange={(event) => setProfileBio(event.target.value)}
                      className="w-full h-[90px] rounded-[10px] bg-white/[0.08] border border-white/15 px-4 py-3 text-[0.98rem] text-white placeholder:text-white/40 outline-none focus:border-white/30 resize-none"
                    />

                    <input
                      value={profileShortMessage}
                      onChange={(event) => setProfileShortMessage(event.target.value)}
                      placeholder="Mensagem curta (exibida nas listas de bots)"
                      className="w-full h-[40px] rounded-[10px] bg-white/[0.08] border border-white/15 px-4 text-[0.95rem] text-white placeholder:text-white/40 outline-none focus:border-white/30"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCloseProfileModal}
                  className="h-[36px] px-4 rounded-[10px] border border-white/15 bg-white/[0.06] text-white/70 text-[0.92rem] font-semibold hover:bg-white/[0.12] transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="h-[36px] px-4 rounded-[10px] bg-[#2eae4d] text-white text-[0.92rem] font-semibold hover:bg-[#39bd59] transition disabled:opacity-60"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {showVariablesModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-[520px] rounded-[18px] border border-white/10 bg-[#262626] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <h3 className="text-[1.05rem] font-semibold text-white/90">Variáveis Disponíveis</h3>
                <button
                  type="button"
                  onClick={() => setShowVariablesModal(false)}
                  className="h-[28px] w-[28px] rounded-[8px] border border-white/10 bg-white/[0.06] text-white/60 inline-flex items-center justify-center hover:text-white hover:bg-white/[0.12] transition"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="px-5 py-4 space-y-3 text-[0.95rem] text-white/75">
                <div className="flex flex-wrap gap-2">
                  {VARIABLE_ITEMS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleCopyToClipboard(item.value)}
                      className="h-[28px] px-3 rounded-full bg-white/10 border border-white/15 text-white/85 text-[0.82rem] font-semibold hover:bg-white/[0.18] transition"
                    >
                      {item.value}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="h-[26px] px-2 rounded-full bg-white/10 border border-white/15 text-[0.8rem] font-semibold text-white/85">
                      {VARIABLE_ITEMS[0].value}
                    </span>
                    <span>→ Funciona em qualquer texto.</span>
                  </p>
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="h-[26px] px-2 rounded-full bg-white/10 border border-white/15 text-[0.8rem] font-semibold text-white/85">
                      {VARIABLE_ITEMS[1].value}
                    </span>
                    <span className="h-[26px] px-2 rounded-full bg-white/10 border border-white/15 text-[0.8rem] font-semibold text-white/85">
                      {VARIABLE_ITEMS[2].value}
                    </span>
                    <span className="h-[26px] px-2 rounded-full bg-white/10 border border-white/15 text-[0.8rem] font-semibold text-white/85">
                      {VARIABLE_ITEMS[3].value}
                    </span>
                    <span>→ Requer <span className="underline underline-offset-2">Redirecionadores</span> ou <span className="underline underline-offset-2">Captação de Leads</span>.</span>
                  </p>
                </div>

                <div className="rounded-[10px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-2 text-[#f2b321] text-[0.9rem] font-semibold inline-flex items-center gap-2">
                  <AlertCircle size={14} />
                  Cores de botões — Aplique no final do texto do botão. Funciona em todos os tipos de botão.
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[0.9rem] text-white/75">
                  {BUTTON_COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleCopyToClipboard(color.value)}
                      className="inline-flex items-center gap-2 hover:text-white transition"
                    >
                      <span className={`h-3 w-3 rounded-full ${color.dotClass}`} />
                      <span className="h-[24px] px-2 rounded-full bg-white/10 border border-white/15 text-[0.8rem] font-semibold text-white/85">
                        {color.value}
                      </span>
                      <span>→ {color.label}</span>
                    </button>
                  ))}
                </div>

                <p className="text-[0.82rem] text-white/60">
                  Exemplo: Comprar agora {BUTTON_COLOR_OPTIONS[0].value} → botão vermelho com texto “Comprar agora”
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowVariablesModal(false)}
                  className="h-[34px] px-4 rounded-[10px] border border-white/15 bg-white/[0.06] text-white/70 text-[0.9rem] font-semibold hover:bg-white/[0.12] transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {showShareModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-[620px] rounded-[18px] border border-white/10 bg-[#262626] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <h3 className="text-[1.05rem] font-semibold text-white/90">Compartilhamento de Dados Entre Bots</h3>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="h-[28px] w-[28px] rounded-[8px] border border-white/10 bg-white/[0.06] text-white/60 inline-flex items-center justify-center hover:text-white hover:bg-white/[0.12] transition"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4 text-[0.95rem] text-white/75">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white/70">Share Key atual:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(shareKeyValue)}
                    className="h-[26px] px-3 rounded-full bg-white/10 border border-white/15 text-[0.82rem] font-semibold text-white/90 hover:bg-white/[0.18] transition"
                  >
                    {shareKeyValue || '—'}
                  </button>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <h4 className="text-[0.95rem] font-semibold text-white/90 inline-flex items-center gap-2">
                    <Share2 size={14} />
                    Como Funciona
                  </h4>
                  <p className="mt-2 text-white/70 text-[0.9rem]">
                    Quando o usuário clicar no link gerado, ele será redirecionado para o bot de destino com todos os dados preservados do bot de origem. Perfeito para upsell, remarketing e funis segmentados sem perder informações.
                  </p>
                </div>

                <div className="rounded-[10px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-2 text-[#f2b321] text-[0.9rem] font-semibold inline-flex items-center gap-2">
                  <AlertCircle size={14} />
                  {SHARE_KEY_HELPER}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[0.82rem] font-bold text-white/60 uppercase tracking-[0.08em]">Bot de Origem:</p>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <span className="h-[30px] px-3 rounded-[10px] bg-white/[0.08] border border-white/15 text-[0.9rem] font-semibold text-white/85">
                        {config.botUsername || 'Vipdamicabot'}
                      </span>
                      <span className="text-[0.75rem] text-white/55">(bot atual)</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[0.82rem] font-bold text-white/60 uppercase tracking-[0.08em]">Bot de Destino:</p>
                    <select
                      value={shareTargetBotId}
                      onChange={(event) => setShareTargetBotId(event.target.value)}
                      className="mt-1 w-full h-[40px] rounded-[10px] bg-white/[0.08] border border-white/15 px-3 text-[0.9rem] text-white outline-none"
                    >
                      <option value="" className="bg-[#1f2023]">— Selecione o bot —</option>
                      {shareBots
                        .filter((bot) => String(bot.id) !== String(selectedBotId || config.id))
                        .map((bot) => (
                          <option key={bot.id} value={bot.id} className="bg-[#1f2023]">
                            {bot.botUsername}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-[0.82rem] font-bold text-white/60 uppercase tracking-[0.08em]">Link Gerado:</p>
                    <input
                      readOnly
                      value={
                        shareTargetBotId && shareKeyValue
                          ? `${typeof window === 'undefined' ? '' : window.location.origin}/share/${shareKeyValue}?to=${shareTargetBotId}`
                          : ''
                      }
                      onClick={(event) => {
                        const value = event.currentTarget.value;
                        if (value) handleCopyToClipboard(value);
                      }}
                      placeholder="—"
                      className="mt-1 w-full h-[40px] rounded-[10px] bg-white/[0.08] border border-white/15 px-3 text-[0.9rem] text-white/70 outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <h4 className="text-[0.95rem] font-semibold text-white/90 inline-flex items-center gap-2">
                    💡 Onde Este Link Pode Ajudar
                  </h4>
                  <div className="mt-3 space-y-2">
                    <div className="rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail size={18} className="text-white/70" />
                        <div>
                          <p className="text-[0.95rem] font-semibold text-white/90">Mailing</p>
                          <p className="text-[0.82rem] text-white/60">Dispare mensagens diretas mantendo o histórico do usuário</p>
                        </div>
                      </div>
                      <span className="text-white/30">→</span>
                    </div>
                    <div className="rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BadgeDollarSign size={18} className="text-white/70" />
                        <div>
                          <p className="text-[0.95rem] font-semibold text-white/90">Upsell</p>
                          <p className="text-[0.82rem] text-white/60">Ofereça produtos complementares após a compra inicial</p>
                        </div>
                      </div>
                      <span className="text-white/30">→</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="h-[34px] px-4 rounded-[10px] border border-white/15 bg-white/[0.06] text-white/70 text-[0.9rem] font-semibold hover:bg-white/[0.12] transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfigKeyModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-[520px] rounded-[18px] border border-white/10 bg-[#262626] shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <h3 className="text-[1.05rem] font-semibold text-white/90">Configurações da Chave</h3>
                <button
                  type="button"
                  onClick={() => setShowConfigKeyModal(false)}
                  className="h-[28px] w-[28px] rounded-[8px] border border-white/10 bg-white/[0.06] text-white/60 inline-flex items-center justify-center hover:text-white hover:bg-white/[0.12] transition"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4 text-[0.95rem] text-white/75">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white/70">Config Key atual:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyToClipboard(configKeyValue)}
                    className="h-[26px] px-3 rounded-full bg-white/10 border border-white/15 text-[0.82rem] font-semibold text-white/90 hover:bg-white/[0.18] transition"
                  >
                    {configKeyValue || '—'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Acesso público:</span>
                  <ToggleSwitch checked={configKeyPublic} onChange={() => setConfigKeyPublic(!configKeyPublic)} />
                </div>

                <input
                  value={configKeyImportValue}
                  onChange={(event) => setConfigKeyImportValue(event.target.value)}
                  placeholder="Insira config_key para importar"
                  className="w-full h-[40px] rounded-[10px] bg-white/[0.08] border border-white/15 px-4 text-[0.95rem] text-white placeholder:text-white/40 outline-none focus:border-white/30"
                />

                <div className="rounded-[10px] border border-[#8d651b] bg-[#4b3b22]/55 px-4 py-3 text-[#f2b321] text-[0.85rem] leading-relaxed">
                  <p className="font-semibold">⚠️ Atenção:</p>
                  <p>
                    Ao importar uma config_key, todas as mídias e áudios associados ao bot serão removidos, pois mídias e áudios não são importados com a config_key.
                    Além disso, a opção “Acesso público” determina se a config_key pode ser compartilhada com outros usuários. Se ativada, outros usuários com contas ApexVips poderão importar sua config_key para seus bots.
                    Se desativada, apenas sua conta ApexVips poderá importar essa config_key para outros bots vinculados à mesma conta.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowConfigKeyModal(false)}
                  className="h-[34px] px-4 rounded-[10px] border border-white/15 bg-white/[0.06] text-white/70 text-[0.9rem] font-semibold hover:bg-white/[0.12] transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfigKey}
                  disabled={configKeySaving}
                  className="h-[34px] px-4 rounded-[10px] bg-[#2eae4d] text-white text-[0.9rem] font-semibold hover:bg-[#39bd59] transition disabled:opacity-60"
                >
                  {configKeySaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'leads' && activeTab !== 'webhook' && (
          <>
            <div className="mt-6 h-px bg-white/10" />
            <div className="mt-4 flex flex-wrap justify-end gap-3">
              {activeTab === 'editar' && (
                <button
                  type="button"
                  onClick={handleRemoveBot}
                  className="h-[48px] px-5 rounded-[10px] border border-white/20 bg-white/[0.05] text-white/70 text-[1rem] font-semibold inline-flex items-center gap-2 hover:bg-white/[0.09] transition"
                >
                  <Trash2 size={16} />
                  Remover Bot
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="h-[48px] px-6 rounded-[10px] bg-[#2eae4d] text-white text-[1rem] font-semibold inline-flex items-center gap-2 hover:bg-[#39bd59] transition"
              >
                <Save size={16} />
                Salvar Alterações
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
