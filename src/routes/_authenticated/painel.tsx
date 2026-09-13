import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { listVisits } from "@/lib/visits.functions";
import { RACES, answerFor, type VisitRow } from "@/lib/candidates";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel de intenções — Campanha Eleitoral" },
      {
        name: "description",
        content: "Estatísticas e gráficos das intenções de voto registradas nas visitas.",
      },
      { property: "og:title", content: "Painel de intenções — Campanha Eleitoral" },
      {
        property: "og:description",
        content: "Acompanhe as intenções de voto por cargo e por bairro.",
      },
    ],
  }),
  component: PainelPage,
});

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function tally(visits: VisitRow[], get: (v: VisitRow) => string) {
  const map = new Map<string, number>();
  for (const v of visits) {
    const key = get(v);
    const count = Number(v.vote_count) || 1;
    map.set(key, (map.get(key) ?? 0) + count);
  }
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function PainelPage() {
  const fetchVisits = useServerFn(listVisits);
  const { data, isPending, error } = useQuery({
    queryKey: ["visits"],
    queryFn: () => fetchVisits() as Promise<VisitRow[]>,
  });
  const visits = useMemo(() => data ?? [], [data]);

  const today = new Date().toDateString();
  const totalVotes = visits.reduce((acc, v) => acc + (Number(v.vote_count) || 1), 0);
  const todayVotes = visits
    .filter((v) => new Date(v.visited_at).toDateString() === today)
    .reduce((acc, v) => acc + (Number(v.vote_count) || 1), 0);
  const neighborhoods = new Set(visits.map((v) => v.neighborhood)).size;
  const byNeighborhood = tally(visits, (v) => v.neighborhood).slice(0, 10);

  if (isPending) {
    return (
      <AppShell title="Painel">
        <p className="text-sm text-muted-foreground p-5">Carregando dados...</p>
      </AppShell>
    );
  }
  if (error) {
    return (
      <AppShell title="Painel">
        <div className="p-5">
          <p className="text-red-500 font-bold mb-2">Erro ao carregar dados:</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <p className="text-sm mt-4">Verifique se você rodou o comando SQL no Supabase para as novas colunas.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Painel">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Intenções" value={totalVotes} />
        <Stat label="Hoje" value={todayVotes} />
        <Stat label="Bairros" value={neighborhoods} />
      </div>

      {visits.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Nenhuma visita registrada ainda. Assim que você salvar a primeira, os gráficos aparecem
          aqui.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {RACES.map((race, raceIndex) => {
            const rows = tally(visits, (v) => answerFor(v, race));
            const total = totalVotes;
            return (
              <section key={race.key} className="rounded-2xl border border-border bg-card p-4">
                <h2 className="font-display text-base font-bold text-foreground">{race.label}</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center">
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      {raceIndex < 2 ? (
                        <PieChart>
                          <Pie
                            data={rows}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={38}
                            outerRadius={68}
                          >
                            {rows.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      ) : (
                        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 8 }}>
                          <XAxis type="number" hide />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {rows.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-1.5">
                    {rows.map((row, i) => (
                      <li key={row.name} className="flex items-center gap-2 text-sm">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="min-w-0 flex-1 truncate text-foreground">{row.name}</span>
                        <span className="shrink-0 font-semibold text-foreground">{row.value}</span>
                        <span className="w-14 shrink-0 text-right text-muted-foreground">
                          {((row.value / total) * 100).toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}

          <section className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-display text-base font-bold text-foreground">Visitas por bairro</h2>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byNeighborhood} margin={{ left: -20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-25}
                    dy={10}
                    height={56}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
