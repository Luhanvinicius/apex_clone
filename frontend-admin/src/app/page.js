"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  BadgeDollarSign,
  Calendar,
  Clock3,
  Percent,
  Ticket,
  Users
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const PANEL_CLASS =
  "rounded-[30px] border border-white/[0.06] bg-[linear-gradient(135deg,rgba(40,40,40,0.96),rgba(23,23,23,0.96))] shadow-[0_24px_48px_rgba(0,0,0,0.28)]";
const INNER_PANEL_CLASS =
  "rounded-[22px] border border-white/[0.06] bg-white/[0.03]";
const LABEL_CLASS = "text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#6d6d6d]";

const EMPTY_STATS = {
  users: { today: 0, month: 0, active: 0, total: 0, blocked: 0, subscriptions: 0 },
  sales: { today: 0, revenueToday: 0, month: 0, revenueMonth: 0 },
  history: [],
  conversion: {
    user: { today: 0, month: 0, total: 0 },
    payment: { today: 0, month: 0, total: 0 },
    avgTime: { today: 0, month: 0, total: 0 },
    ticket: { today: 0, month: 0, total: 0 }
  }
};

const SALES_CODE_ROWS = Array.from({ length: 5 }, () => ({
  label: "×",
  value: "0.00 | 0"
}));

export default function DashboardPage() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [viewAllBots, setViewAllBots] = useState(false);
  const [period, setPeriod] = useState("7d");
  const [currentBot, setCurrentBot] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);

    try {
      const botId = typeof window !== "undefined" ? localStorage.getItem("selected_bot_id") : null;
      const useAllBots = viewAllBots || !botId;

      const requests = [
        axios.get("/api/stats", {
          params: useAllBots ? {} : { botId }
        })
      ];

      if (!useAllBots) {
        requests.push(
          axios.get("/api/config", {
            params: { id: botId }
          })
        );
      }

      const [statsRes, botRes] = await Promise.all(requests);

      setStats({
        ...EMPTY_STATS,
        ...(statsRes?.data || {})
      });
      setCurrentBot(useAllBots ? null : botRes?.data || null);
    } catch (error) {
      console.error(error);
      setStats(EMPTY_STATS);
      setCurrentBot(null);
    } finally {
      setLoading(false);
    }
  }, [viewAllBots]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const handleBotChange = () => fetchStats();
    window.addEventListener("botChanged", handleBotChange);
    return () => window.removeEventListener("botChanged", handleBotChange);
  }, [fetchStats]);

  const chartData = useMemo(() => buildHistoryData(stats.history, period), [stats.history, period]);
  const historyMax = useMemo(() => Math.max(...chartData.map((item) => Number(item.value) || 0), 0), [chartData]);
  const chartDomain = historyMax > 0 ? [0, Math.max(1, Math.ceil(historyMax * 1.15))] : [-1, 1];
  const chartTicks = historyMax > 0 ? undefined : [1, 0.8, 0.6, 0.4, 0.2, 0, -0.2, -0.4, -0.6, -0.8, -1];
  const viewingLabel = viewAllBots ? "Todos os bots" : currentBot?.botUsername || "Carregando...";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center text-[0.72rem] font-black uppercase tracking-[0.32em] text-white/35 animate-pulse">
          Sincronizando métricas do dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1560px] space-y-7 pb-10 pt-2 animate-in fade-in duration-700">
      <RankingHero />

      <div className="grid gap-4 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
        <div className="flex items-center gap-3">
          <span className="text-[0.82rem] font-medium text-white/80">Visualizar todos os bots</span>
          <ToggleSwitch checked={viewAllBots} onChange={() => setViewAllBots((prev) => !prev)} />
        </div>

        <div className="justify-self-start xl:justify-self-center">
          <div className="rounded-[18px] border border-white/[0.08] bg-white/[0.04] px-5 py-3 text-[0.95rem] text-white/65 shadow-[0_18px_35px_rgba(0,0,0,0.18)]">
            Visualizando métricas de: <span className="font-semibold text-white">{viewingLabel}</span>
          </div>
        </div>

        <div />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
        <SalesSummaryCard
          title="Hoje"
          icon={Calendar}
          sales={stats.sales.today}
          amount={stats.sales.revenueToday}
        />
        <SalesSummaryCard
          title="Mês"
          icon={Activity}
          sales={stats.sales.month}
          amount={stats.sales.revenueMonth}
        />
        <UsersSummaryCard stats={stats.users} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <SalesHistoryPanel
          data={chartData}
          period={period}
          onPeriodChange={setPeriod}
          chartDomain={chartDomain}
          chartTicks={chartTicks}
        />

        <ActivityPanel />
      </div>

      <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-5">
        <InsightCard
          icon={Users}
          title="Conversão de Usuário"
          description="% de usuários que compraram"
          rows={buildProgressRows(stats.conversion.user, "percent")}
          footerCaption="A cada x starts → 1 venda"
          footerItems={buildFooterItems(stats.conversion.user, "percent")}
        />
        <InsightCard
          icon={Percent}
          title="Conversão de Pagamento"
          description="% de pag. gerados que foram pagos"
          rows={buildProgressRows(stats.conversion.payment, "percent")}
          footerCaption="A cada x pag. gerados → 1 venda"
          footerItems={buildFooterItems(stats.conversion.payment, "percent")}
        />
        <InsightCard
          icon={Clock3}
          title="Tempo Médio"
          description="Média do start até a compra"
          rows={buildProgressRows(stats.conversion.avgTime, "time")}
          footerCaption="50% das vendas acontecem em até"
          footerItems={buildFooterItems(stats.conversion.avgTime, "time")}
        />
        <InsightCard
          icon={Ticket}
          title="Ticket Médio"
          description="Valor médio por venda processada"
          rows={buildProgressRows(stats.conversion.ticket, "price")}
          footerCaption="Ticket mais comprado"
          footerItems={buildFooterItems(stats.conversion.ticket, "price")}
        />
        <SalesCodeCard />
      </div>
    </div>
  );
}

function RankingHero() {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#060606] px-8 py-8 shadow-[0_26px_60px_rgba(0,0,0,0.28)] sm:px-12 lg:px-14">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.03)_0%,transparent_36%,transparent_64%,rgba(255,255,255,0.03)_100%)]" />
      <div className="absolute inset-y-0 right-0 w-[44%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_62%)] opacity-80" />

      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-3">
          <h1 className="max-w-[560px] text-[2rem] font-black uppercase leading-[1.05] tracking-[-0.03em] text-white sm:text-[2.35rem]">
            No ápice do ranking,
            <br />
            os melhores ganham
          </h1>
          <p className="text-[1rem] font-medium text-white/78 sm:text-[1.1rem]">
            Disputa em tempo real pelo topo do faturamento.
          </p>
        </div>

        <div className="flex items-end justify-center gap-5 sm:gap-8">
          <PodiumPlace position="2º" price="R$ 7.500" height="h-[78px]" accent="bg-white/[0.1]" notes="teal" />
          <PodiumPlace position="1º" price="R$ 15.000" height="h-[110px]" accent="bg-white/[0.16]" notes="stack" featured />
          <PodiumPlace position="3º" price="R$ 3.000" height="h-[58px]" accent="bg-white/[0.08]" notes="green" />
        </div>
      </div>
    </section>
  );
}

function PodiumPlace({ position, price, height, accent, notes, featured }) {
  return (
    <div className="flex flex-col items-center">
      <MoneyVisual variant={notes} featured={featured} />
      <div
        className={`relative mt-2 flex w-[92px] flex-col items-center justify-center rounded-t-[22px] border border-white/[0.08] text-center ${height} ${accent} ${
          featured ? "w-[112px]" : ""
        }`}
      >
        <div className="absolute -top-3 h-6 w-[70px] rounded-full border border-white/[0.08] bg-[#101010] shadow-[0_0_25px_rgba(255,255,255,0.08)]" />
        <div className="relative z-10 mt-4 text-[2rem] font-black italic leading-none text-white">{position}</div>
        <div className="relative z-10 mt-2 text-[1rem] font-black text-white sm:text-[1.08rem]">{price}</div>
      </div>
    </div>
  );
}

function MoneyVisual({ variant, featured }) {
  if (variant === "stack") {
    return (
      <div className={`relative mb-1 ${featured ? "h-[86px] w-[88px]" : "h-[72px] w-[72px]"}`}>
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="absolute left-1/2 h-3 w-14 -translate-x-1/2 rounded-[4px] border border-cyan-200/30 bg-[linear-gradient(90deg,rgba(171,240,255,0.75),rgba(232,255,255,0.88),rgba(123,207,227,0.72))] shadow-[0_8px_18px_rgba(126,231,255,0.12)]"
            style={{
              bottom: `${10 + index * 8}px`,
              width: `${featured ? 62 : 52}px`,
              transform: `translateX(-50%) rotate(${index % 2 === 0 ? -3 : 3}deg)`
            }}
          />
        ))}
      </div>
    );
  }

  const noteColors =
    variant === "green"
      ? "from-[#9de4bf] via-[#d5ffe7] to-[#54b685]"
      : "from-[#73e4d6] via-[#e8ffff] to-[#b5f7ff]";

  return (
    <div className={`relative mb-1 ${featured ? "h-[70px] w-[80px]" : "h-[62px] w-[72px]"}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={`absolute bottom-0 left-1/2 h-8 w-8 rounded-[4px] border border-white/15 bg-gradient-to-br ${noteColors}`}
          style={{
            transform: `translateX(-50%) rotate(${(index - 2) * 12}deg)`,
            transformOrigin: "bottom center",
            opacity: 1 - index * 0.08
          }}
        />
      ))}
    </div>
  );
}

function SalesSummaryCard({ title, icon: Icon, sales, amount }) {
  return (
    <section className={`${PANEL_CLASS} min-h-[128px] px-8 py-7`}>
      <div className="flex items-center gap-3 text-white">
        <Icon size={22} className="text-white/90" />
        <h2 className="text-[2rem] font-extrabold tracking-[-0.03em] text-white">{title}</h2>
      </div>
      <div className="mt-5 space-y-1">
        <p className={LABEL_CLASS}>Vendas: {Number(sales) || 0}</p>
        <p className="text-[3.1rem] font-black leading-none tracking-[-0.04em] text-white">
          {formatCurrency(amount)}
        </p>
      </div>
    </section>
  );
}

function UsersSummaryCard({ stats }) {
  const items = [
    { label: "Hoje", value: stats.today, icon: Calendar },
    { label: "Mês", value: stats.month, icon: Calendar },
    { label: "Ativos", value: stats.active, icon: Users },
    { label: "Totais", value: stats.total, icon: Users },
    { label: "Bloqueados", value: stats.blocked, icon: Users },
    { label: "Assinaturas", value: stats.subscriptions, icon: BadgeDollarSign }
  ];

  return (
    <section className={`${PANEL_CLASS} min-h-[286px] px-8 py-7`}>
      <div className="mb-5 flex items-center gap-3 text-white">
        <Users size={20} className="text-white/90" />
        <h2 className="text-[1.9rem] font-bold tracking-[-0.03em] text-white">Usuários</h2>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {items.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 text-white/84">
              <Icon size={16} className="text-white/80" />
              <span className="text-[0.95rem] font-medium">{label}</span>
            </div>
            <span className="text-[1.05rem] font-semibold text-white">{Number(value) || 0}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SalesHistoryPanel({ data, period, onPeriodChange, chartDomain, chartTicks }) {
  return (
    <section className={`${PANEL_CLASS} px-8 py-7`}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[2rem] font-extrabold tracking-[-0.03em] text-white">Histórico de Vendas</h2>

        <div className="inline-flex rounded-full border border-white/[0.06] bg-white/[0.04] p-1">
          <PeriodButton active={period === "7d"} onClick={() => onPeriodChange("7d")}>
            7D
          </PeriodButton>
          <PeriodButton active={period === "30d"} onClick={() => onPeriodChange("30d")}>
            30D
          </PeriodButton>
        </div>
      </div>

      <div className="h-[350px] md:h-[390px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} strokeDasharray="0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: 600 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              ticks={chartTicks}
              domain={chartDomain}
              tick={{ fill: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: 600 }}
              tickFormatter={(value) => formatAxisTick(value)}
              width={42}
            />
            <Tooltip content={<DashboardTooltip />} cursor={{ stroke: "rgba(255,255,255,0.18)", strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f5f5f5"
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2, fill: "#f5f5f5", stroke: "#f5f5f5" }}
              activeDot={{ r: 6, fill: "#ffffff", stroke: "#ffffff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function PeriodButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[58px] rounded-full px-4 py-2 text-[0.92rem] font-bold transition-colors ${
        active ? "bg-white text-black" : "text-white/72 hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function ActivityPanel() {
  return (
    <section
      className={`${PANEL_CLASS} flex min-h-[350px] flex-col items-center justify-center px-8 py-7 text-center md:min-h-[390px]`}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.05]">
        <Activity size={30} className="text-[#4d6187]" />
      </div>
      <h2 className="text-[1.85rem] font-bold tracking-[-0.03em] text-white">Log de Atividade</h2>
      <p className="mt-2 text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-[#556278]">
        Nenhuma atividade ainda
      </p>
    </section>
  );
}

function InsightCard({ icon: Icon, title, description, rows, footerCaption, footerItems }) {
  return (
    <section className={`${PANEL_CLASS} flex min-h-[332px] flex-col px-7 py-6`}>
      <div className="mb-4 flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <Icon size={18} className="text-white/92" />
        <h3 className="text-[1.05rem] font-bold tracking-[-0.02em] text-white">{title}</h3>
      </div>

      <p className={`${LABEL_CLASS} min-h-[30px]`}>{description}</p>

      <div className="mt-3 space-y-4">
        {rows.map((row) => (
          <MetricRow key={row.label} {...row} />
        ))}
      </div>

      <div className="mt-auto pt-6">
        <p className="text-center text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#656565]">
          {footerCaption}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {footerItems.map((item) => (
            <div key={item.label} className={`${INNER_PANEL_CLASS} px-2 py-2 text-center`}>
              <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#8a8a8a]">{item.label}</div>
              <div className="mt-1 text-[1rem] font-bold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricRow({ label, value, progress }) {
  return (
    <div className={`${INNER_PANEL_CLASS} flex items-center gap-3 px-4 py-3`}>
      <div className="flex min-w-[52px] items-center gap-2 text-white">
        <div className="h-4 w-4 rounded-[4px] border border-white/[0.15] bg-white/[0.03]" />
        <span className="text-[0.98rem] font-semibold">{label}</span>
      </div>

      <div className="h-[9px] flex-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.45),rgba(255,255,255,0.12))]"
          style={{ width: `${Math.max(0, Math.min(100, progress || 0))}%` }}
        />
      </div>

      <div className="min-w-[64px] text-right text-[1.05rem] font-bold text-white">{value}</div>
    </div>
  );
}

function SalesCodeCard() {
  return (
    <section className={`${PANEL_CLASS} flex min-h-[332px] flex-col px-7 py-6`}>
      <div className="mb-4 flex items-center gap-3 border-b border-white/[0.06] pb-4">
        <Ticket size={18} className="text-white/92" />
        <h3 className="text-[1.05rem] font-bold tracking-[-0.02em] text-white">Códigos de Venda</h3>
      </div>

      <p className={`${LABEL_CLASS} min-h-[30px]`}>Top 5 por volume faturado</p>

      <div className="mt-3 flex-1 divide-y divide-white/[0.06]">
        {SALES_CODE_ROWS.map((row, index) => (
          <div key={`${row.label}-${index}`} className="flex items-center justify-between py-4">
            <span className="text-[1rem] font-semibold text-white/74">{row.label}</span>
            <span className="text-[1rem] font-semibold text-white">{row.value}</span>
          </div>
        ))}
      </div>

      <Link
        href="/sales-code"
        className="mt-6 block border-t border-white/[0.06] pt-5 text-center text-[1rem] font-semibold text-white hover:text-white/80"
      >
        Ver mais
      </Link>
    </section>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-8 w-[52px] rounded-full border border-white/[0.08] transition-colors ${
        checked ? "bg-white/[0.16]" : "bg-white/[0.08]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${
          checked ? "translate-x-[24px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function DashboardTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#151515] px-4 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
      <div className="text-[0.82rem] font-semibold text-white">{label}</div>
      <div className="mt-1 text-[0.82rem] font-medium text-white/78">Valor: {formatCurrency(payload[0].value)}</div>
    </div>
  );
}

function buildHistoryData(history = [], period = "7d") {
  if (period === "7d") {
    return (history || []).map((item) => ({
      name: item.name,
      value: Number(item.value) || 0
    }));
  }

  const today = new Date();
  const map = new Map(
    (history || []).map((item) => [
      item.name,
      Number(item.value) || 0
    ])
  );

  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      name: key,
      value: map.get(key) || 0
    };
  });
}

function buildProgressRows(source = {}, type = "percent") {
  const values = [
    { label: "Hoje", raw: source.today },
    { label: "Mês", raw: source.month },
    { label: "Total", raw: source.total }
  ];

  return values.map((item) => ({
    label: item.label,
    value: formatMetricValue(item.raw, type),
    progress: buildProgressValue(item.raw, type)
  }));
}

function buildFooterItems(source = {}, type = "percent") {
  return [
    { label: "Hoje", value: formatMetricValue(source.today, type) },
    { label: "Mês", value: formatMetricValue(source.month, type) },
    { label: "Total", value: formatMetricValue(source.total, type) }
  ];
}

function buildProgressValue(value, type) {
  const numeric = Number(value) || 0;

  if (type === "percent") return numeric;
  if (type === "time") return numeric > 0 ? Math.min(100, numeric) : 0;
  if (type === "price") return numeric > 0 ? Math.min(100, (numeric / 1000) * 100) : 0;
  return 0;
}

function formatMetricValue(value, type) {
  const numeric = Number(value) || 0;

  if (type === "price") return formatCurrency(numeric);
  if (type === "time") return `${numeric}s`;
  return `${numeric.toFixed(2)}%`;
}

function formatCurrency(value) {
  return `R$ ${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatAxisTick(value) {
  if (Number.isInteger(value)) return String(value);
  return Number(value).toFixed(1).replace(".", ",");
}
