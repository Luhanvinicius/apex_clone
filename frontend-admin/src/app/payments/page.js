"use client"

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CircleDollarSign, CircleSlash2, RotateCcw } from 'lucide-react';

const gatewayCards = [
  {
    id: 'pushinpay',
    name: 'Pushinpay',
    methods: 'Métodos: Pix',
    links: [
      { prefix: '📖', label: 'Tutorial para obter token', url: 'https://apexvips.com/tutorial/obter-token-pushinpay' },
      { prefix: '🔗', label: 'Criar conta PushinPay', url: 'https://app.pushinpay.com.br/register' }
    ],
    Icon: CircleSlash2,
    iconWrapClass: 'bg-gradient-to-br from-[#5b61ff] to-[#3f45d7]'
  },
  {
    id: 'syncpay',
    name: 'Syncpay',
    methods: 'Métodos: Pix',
    links: [
      { prefix: '🔗', label: 'Criar conta Syncpay', url: 'https://app.syncpayments.com.br/signup' },
      {
        prefix: '💬',
        label: 'Aplicar taxa fixa 0,35',
        url: 'https://api.whatsapp.com/send/?phone=556198170140&text=Olá%2C+tudo+bem%3F%0A%0AVim+através+da+apexvips+e+gostaria+de+aplicar+minha+taxa+fixa+de+0%2C35+por+transação.%0A%0AMeu+e-mail+cadastrado+é%3A&type=phone_number&app_absent=0'
      }
    ],
    Icon: RotateCcw,
    iconWrapClass: 'bg-gradient-to-br from-[#1e4767] to-[#1f5a86]'
  },
  {
    id: 'wiinpay',
    name: 'Wiinpay',
    methods: 'Métodos: Pix',
    links: [
      { prefix: '🔗', label: 'Criar conta Wiinpay', url: 'https://wiinpay.com.br/cadastro' },
      {
        prefix: '💬',
        label: 'Aplicar taxa 4,50%',
        url: 'https://api.whatsapp.com/send/?phone=5547999439885&text=Olá%2C+tudo+bem%3F+Vim+através+da+apexvips+e+gostaria+de+aplicar+minha+taxa+de+4.5%25+por+transação.+Meu+e-mail+cadastrado+é%3A&type=phone_number&app_absent=0'
      }
    ],
    Icon: CircleDollarSign,
    iconWrapClass: 'bg-gradient-to-br from-[#292139] to-[#3d255f]'
  }
];

function IntegrationsView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[920px]">
      {gatewayCards.map(({ id, name, methods, links, Icon, iconWrapClass }) => (
        <div key={id} className="rounded-[24px] border border-white/10 bg-[#202225]/70 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-h-[420px] flex flex-col">
          <div className={`w-[104px] h-[104px] rounded-[22px] ${iconWrapClass} flex items-center justify-center mb-5 mx-auto`}>
            <Icon size={58} className="text-white/90" strokeWidth={1.75} />
          </div>
          <h3 className="text-[1.85rem] leading-none font-bold text-white">{name}</h3>
          <p className="text-[0.95rem] text-white/70 mt-2">{methods}</p>
          <div className="h-px w-full bg-white/10 my-5" />
          <p className="text-[0.95rem] text-white/70">Nenhum token conectado</p>

          <button className="w-full mt-5 h-[52px] rounded-[11px] border border-white/25 text-white text-[1.05rem] font-semibold hover:bg-white/5 transition">
            Conectar
          </button>

          <div className="mt-auto pt-2 space-y-2">
            {links.map((linkItem) => (
              <a
                key={linkItem.url}
                href={linkItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[0.92rem] text-white/85 underline underline-offset-2 hover:text-white transition text-left w-fit leading-[1.2]"
              >
                {linkItem.prefix} {linkItem.label}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoutingView({ onGoToIntegrations }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[#202225]/70 px-6 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.28)]">
      <h2 className="text-[1.95rem] md:text-[2.15rem] leading-none font-bold text-white mb-4">Ordem dos Gateways de Pagamento</h2>
      <p className="text-[0.92rem] leading-[1.35] text-white/70 mb-6">
        Os gateways seguem a ordem de prioridade definida. Se o primeiro estiver em manutenção ou instável, a
        <span className="font-semibold text-white"> ApexVips </span>
        redireciona automaticamente para o próximo, garantindo estabilidade e zero perdas em pagamentos.
      </p>

      <h3 className="text-[1.45rem] font-semibold text-white">Pix</h3>
      <div className="h-px w-8 bg-white/25 mt-1 mb-4" />

      <div className="rounded-[14px] border border-white/10 bg-white/[0.03] px-5 py-5 mb-4">
        <h4 className="text-[1.8rem] md:text-[1.95rem] leading-none font-semibold text-white mb-3">Gateways Disponíveis para Adicionar:</h4>
        <p className="text-[0.9rem] text-white/70 italic">
          Nenhum gateway configurado ou todos já adicionados.
          <button
            onClick={onGoToIntegrations}
            className="ml-1 underline underline-offset-2 text-white/90 hover:text-white"
          >
            Clique aqui
          </button>
          <span> para gerenciar as integrações.</span>
        </p>
      </div>

      <div className="rounded-[14px] border border-white/10 bg-[#1d1f23] min-h-[190px] flex items-center justify-center mb-6">
        <p className="max-w-[430px] mx-auto text-center text-[0.98rem] leading-[1.35] text-white/80">
          Nenhum gateway adicionado para Pix. Adicione gateways acima.
        </p>
      </div>

      <div className="flex justify-end">
        <button className="h-[46px] px-6 rounded-[10px] bg-[#4aa154] text-white text-[0.95rem] font-semibold hover:bg-[#55b05f] transition">
          Salvar Ordem
        </button>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('routing');

  useEffect(() => {
    const tabFromQuery = searchParams.get('tab');
    setActiveTab(tabFromQuery === 'integracoes' || tabFromQuery === 'integrations' ? 'integrations' : 'routing');
  }, [searchParams]);

  const changeTab = (nextTab) => {
    setActiveTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());

    if (nextTab === 'integrations') {
      params.set('tab', 'integracoes');
    } else {
      params.delete('tab');
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const isRouting = activeTab === 'routing';

  return (
    <div className="w-full pb-10 pt-1 animate-in fade-in duration-500">
      <section className="w-full rounded-[18px] border border-white/10 bg-[#1f2023] shadow-[0_8px_35px_rgba(0,0,0,0.35)] px-5 md:px-6 py-6">
        <h1 className="text-[2.05rem] md:text-[2.35rem] leading-none font-bold text-white">Meios de Pagamento</h1>

        <div className="flex items-end gap-2 border-b border-white/12 mt-5 mb-4">
          <button
            onClick={() => changeTab('routing')}
            className={`h-[54px] px-4 rounded-t-[10px] text-[1rem] font-semibold transition ${
              isRouting
                ? 'bg-white/10 text-white border-b-2 border-white'
                : 'text-white/65 hover:text-white'
            }`}
          >
            Roteamento
          </button>
          <button
            onClick={() => changeTab('integrations')}
            className={`h-[54px] px-4 rounded-t-[10px] text-[1rem] font-semibold transition ${
              !isRouting
                ? 'bg-white/10 text-white border-b-2 border-white'
                : 'text-white/65 hover:text-white'
            }`}
          >
            Integrações
          </button>
        </div>

        {isRouting ? <RoutingView onGoToIntegrations={() => changeTab('integrations')} /> : <IntegrationsView />}
      </section>
    </div>
  );
}
