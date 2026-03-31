"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  BadgeDollarSign,
  Ban,
  BarChart3,
  Calendar,
  Clock3,
  DollarSign,
  HelpCircle,
  Hourglass,
  Mail,
  Package,
  Percent,
  Repeat,
  ShoppingCart,
  Star,
  Ticket,
  Timer,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserX,
  Users
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import brazilMap from '@svg-maps/brazil';

const PANEL_CLASS =
  'rounded-[24px] border border-white/10 bg-white/[0.04] shadow-[0_24px_40px_rgba(0,0,0,0.35)]';
const PANEL_TITLE = 'text-[1.05rem] font-semibold text-white/90';
const EMPTY_TEXT = 'Não há dados para exibir';

const DEFAULT_STATE_VALUES = brazilMap.locations.reduce((acc, location) => {
  acc[location.name] = 0;
  return acc;
}, {});

const SALES_STATS = [
  { label: 'Receita Total', value: 'R$ 0,00', icon: DollarSign },
  { label: 'Vendas Processadas', value: '0', icon: BadgeDollarSign },
  { label: 'Valor Pendente', value: 'R$ 0,00', icon: Clock3 },
  { label: 'Vendas Pendentes', value: '0', icon: Hourglass },
  { label: 'Valor Gerado', value: 'R$ 0,00', icon: TrendingUp },
  { label: 'Vendas Geradas', value: '0', icon: ShoppingCart },
  { label: 'Ticket Médio', value: 'R$ 0,00', icon: Ticket },
  { label: 'Tempo Médio de Retorno do Usuário (Recorrência)', value: '0.0 horas', icon: Repeat },
  { label: 'Tempo Médio Conversão', value: '0.0 horas', icon: Timer },
  { label: 'Média de Gasto por Usuário (LTV)', value: 'R$ 0,00', icon: BarChart3 },
  { label: 'Média de Vendas por Usuário', value: '0', icon: Users },
  { label: 'Taxa de Conversão', value: '0%', icon: Percent }
];

const USER_STATS = [
  { label: 'Usuários Totais', value: '0', icon: Users },
  { label: 'Usuários Ativos', value: '0', icon: UserCheck },
  { label: 'Usuários Vips', value: '0', icon: Star },
  { label: 'Usuários Expirados', value: '0', icon: UserX },
  { label: 'Nunca Pagaram', value: '0', icon: Ban },
  { label: 'Usuários Recorrentes', value: '0', icon: Repeat },
  { label: 'Usuários Pendentes (PIX gerado)', value: '0', icon: Clock3 },
  { label: 'Downsellers', value: '0', icon: UserMinus },
  { label: 'Upsellers', value: '0', icon: TrendingUp },
  { label: 'Usuários de Order Bump', value: '0', icon: ShoppingCart },
  { label: 'Usuários de Mailing', value: '0', icon: Mail },
  { label: 'Usuários de Mailing Order Bump', value: '0', icon: Mail },
  { label: 'Usuários de Pacotes', value: '0', icon: Package },
  { label: 'Telegram Premium', value: '0', icon: Star },
  { label: 'Bloquearam o Bot', value: '0', icon: UserX },
  { label: 'Upgrade de Planos', value: '0', icon: TrendingUp }
];

const PLAN_TYPES = [
  { label: 'Planos Normais', value: '0', total: 'R$ 0,00', icon: Package },
  { label: 'Planos Pacotes', value: '0', total: 'R$ 0,00', icon: Package },
  { label: 'Downsells', value: '0', total: 'R$ 0,00', icon: TrendingUp },
  { label: 'Upsells', value: '0', total: 'R$ 0,00', icon: TrendingUp },
  { label: 'Order Bump', value: '0', total: 'R$ 0,00', icon: ShoppingCart },
  { label: 'Mailing - Planos', value: '0', total: 'R$ 0,00', icon: Mail },
  { label: 'Mailing - Planos Pacotes', value: '0', total: 'R$ 0,00', icon: Mail },
  { label: 'Mailing - Order Bump', value: '0', total: 'R$ 0,00', icon: Mail }
];

const PERFORMANCE_METRICS = [
  { label: 'Taxa de Conversão', value: '0%', icon: Percent },
  { label: 'Taxa Downsell', value: '0%', icon: TrendingUp },
  { label: 'Taxa Upsell', value: '0%', icon: TrendingUp },
  { label: 'Taxa Order Bump', value: '0%', icon: TrendingUp },
  { label: 'Taxa Upgrade Planos', value: '0%', icon: TrendingUp },
  { label: 'Pagamentos Concluídos', value: '0%', icon: BadgeDollarSign },
  { label: 'Pagamentos Criados (PIX gerado)', value: '0%', icon: Clock3 },
  { label: 'Planos Normais', value: '0%', icon: Package },
  { label: 'Planos Pacotes', value: '0%', icon: Package },
  { label: 'Mailing - Planos', value: '0%', icon: Mail },
  { label: 'Mailing - Planos Pacotes', value: '0%', icon: Mail },
  { label: 'Mailing - Order Bump', value: '0%', icon: Mail },
  { label: 'Taxa de Recorrência', value: '0%', icon: Repeat },
  { label: 'Taxa de Retenção', value: '0%', icon: Users },
  { label: 'Taxa de Churn (compraram só uma vez e nunca mais)', value: '0%', icon: UserX },
  { label: 'Taxa de Desistência de Pagamento (Abandono de Carrinho)', value: '0%', icon: Ban }
];

export default function StatsPage() {
  const [viewAllBots, setViewAllBots] = useState(true);

  useEffect(() => {
    axios.get('/api/stats')
      .catch(() => {});
  }, []);

  const chartData = useMemo(() => (
    Array.from({ length: 24 }, (_, index) => ({
      time: `${String(index).padStart(2, '0')}:00`,
      value: 0
    }))
  ), []);

  const yTicks = useMemo(() => [1, 0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8, -1], []);

  return (
    <div className="w-full pb-10 pt-1 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 text-white/70">
          <span className="text-[0.9rem] font-semibold">Visualizar todos os bots</span>
          <ToggleSwitch checked={viewAllBots} onChange={() => setViewAllBots((prev) => !prev)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.9rem] text-white/70">
            Visualizando estatísticas de: <span className="text-white font-semibold">Todos os bots</span>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[0.9rem] text-white/70 inline-flex items-center gap-2">
            <Calendar size={16} className="text-white/60" />
            Período Total
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-5">
        <section className={`${PANEL_CLASS} p-6`}>
          <h2 className={PANEL_TITLE}>Média de visualizações por horário</h2>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  ticks={yTicks}
                  domain={[-1, 1]}
                  tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#e5e7eb"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#e5e7eb' }}
                  activeDot={{ r: 5, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={`${PANEL_CLASS} p-6 flex flex-col`}>
          <h2 className={PANEL_TITLE}>Métricas de desempenho</h2>
          <div className="flex-1 flex items-center justify-center text-white/70 text-[0.95rem]">
            {EMPTY_TEXT}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-5">
        <section className={`${PANEL_CLASS} p-6`}>
          <div className="flex items-center gap-2">
            <InfoBadge />
            <h2 className={PANEL_TITLE}>Usuários por estado</h2>
          </div>
          <div className="mt-4">
            <BrazilMap values={DEFAULT_STATE_VALUES} />
          </div>
        </section>

        <section className={`${PANEL_CLASS} p-6`}>
          <div className="flex items-center gap-2">
            <InfoBadge />
            <h2 className={PANEL_TITLE}>Cidades com mais vendas</h2>
          </div>
          <div className="mt-4 h-[36px] rounded-full border border-white/10 bg-white/[0.03]" />
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {['Usuários por Navegador', 'Usuários por Sistema Operacional', 'Usuários por Slug'].map((title) => (
          <section key={title} className={`${PANEL_CLASS} p-6 flex flex-col`}>
            <div className="flex items-center gap-2">
              <InfoBadge />
              <h2 className={PANEL_TITLE}>{title}</h2>
            </div>
            <div className="flex-1 flex items-center justify-center text-white/70 text-[0.95rem]">
              {EMPTY_TEXT}
            </div>
          </section>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-[1.2rem] font-semibold text-white/90">Picos de Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {['Planos Mais Vendidos', 'Dias com Mais Vendas', 'Horários com Mais Vendas'].map((title) => (
            <section key={title} className={`${PANEL_CLASS} p-6 flex items-center justify-center min-h-[120px]`}>
              <span className="text-white/80 text-[1rem] font-semibold">{title}</span>
            </section>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[1.2rem] font-semibold text-white/90">Estatísticas de Vendas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {SALES_STATS.map((item) => (
            <MetricCard key={item.label} title={item.label} value={item.value} Icon={item.icon} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[1.2rem] font-semibold text-white/90">Usuários</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {USER_STATS.map((item) => (
            <MetricCard key={item.label} title={item.label} value={item.value} Icon={item.icon} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[1.2rem] font-semibold text-white/90">Tipos de Planos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PLAN_TYPES.map((item) => (
            <MetricCard
              key={item.label}
              title={item.label}
              value={item.value}
              Icon={item.icon}
              footerLabel="Valor Total"
              footerValue={item.total}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-[1.2rem] font-semibold text-white/90">Métricas de Desempenho</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {PERFORMANCE_METRICS.map((item) => (
            <MetricCard key={item.label} title={item.label} value={item.value} Icon={item.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`h-[26px] w-[52px] rounded-full border border-white/15 flex items-center px-1 transition ${
        checked ? 'bg-white/20' : 'bg-white/10'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`h-[18px] w-[18px] rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[24px]' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function InfoBadge() {
  return (
    <div className="h-6 w-6 rounded-full border border-white/15 bg-white/[0.05] text-white/70 flex items-center justify-center">
      <HelpCircle size={14} />
    </div>
  );
}

function MetricCard({ title, value, Icon, footerLabel, footerValue }) {
  return (
    <div className={`${PANEL_CLASS} p-5`}>
      <div className="flex items-center gap-2 text-white/70">
        <span className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.06] flex items-center justify-center">
          <Icon size={16} />
        </span>
        <span className="text-[0.9rem] font-semibold text-white/85">{title}</span>
      </div>
      <div className="mt-3 text-[1.6rem] font-semibold text-white">{value}</div>
      {footerLabel ? (
        <div className="mt-3 text-[0.85rem] text-white/60">
          <span>{footerLabel}</span>
          <div className="text-[1.1rem] font-semibold text-white">{footerValue}</div>
        </div>
      ) : null}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-white/10 bg-[#0f0f10] px-3 py-2 text-xs text-white shadow-[0_10px_20px_rgba(0,0,0,0.45)]">
      <div className="font-semibold">{label}</div>
      <div className="text-white/70">Média: {payload[0]?.value ?? 0} usuários</div>
    </div>
  );
}

function BrazilMap({ values }) {
  const containerRef = useRef(null);
  const pathRefs = useRef({});
  const [centers, setCenters] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const nextCenters = {};
      brazilMap.locations.forEach((location) => {
        const node = pathRefs.current[location.id];
        if (node) {
          const box = node.getBBox();
          nextCenters[location.id] = {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2
          };
        }
      });
      setCenters(nextCenters);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMouseMove = (event, location) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      name: location.name,
      value: values[location.name] ?? 0,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
    setTooltip(null);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[320px] sm:h-[360px]">
      <svg
        viewBox={brazilMap.viewBox}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {brazilMap.locations.map((location) => (
          <path
            key={location.id}
            ref={(node) => {
              pathRefs.current[location.id] = node;
            }}
            d={location.path}
            fill={hoveredId === location.id ? '#3b3b3b' : '#2a2a2a'}
            stroke="#cfcfcf"
            strokeWidth={0.7}
            onMouseEnter={() => setHoveredId(location.id)}
            onMouseMove={(event) => handleMouseMove(event, location)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
        {brazilMap.locations.map((location) => {
          const center = centers[location.id];
          if (!center) return null;
          return (
            <text
              key={`${location.id}-label`}
              x={center.x}
              y={center.y}
              textAnchor="middle"
              alignmentBaseline="central"
              style={{ fill: '#e5e7eb', fontSize: 10, fontWeight: 700 }}
              pointerEvents="none"
            >
              {values[location.name] ?? 0}
            </text>
          );
        })}
      </svg>

      {tooltip ? (
        <div
          className="absolute z-10 rounded-[8px] border border-white/10 bg-white text-black px-3 py-2 text-xs shadow-lg"
          style={{
            left: Math.min(
              tooltip.x + 12,
              Math.max(10, (containerRef.current?.clientWidth ?? 0) - 140)
            ),
            top: Math.max(tooltip.y - 36, 10)
          }}
        >
          <div className="text-[0.7rem] text-black/60">Usuários</div>
          <div className="font-semibold">{tooltip.name}: {tooltip.value}</div>
        </div>
      ) : null}
    </div>
  );
}
