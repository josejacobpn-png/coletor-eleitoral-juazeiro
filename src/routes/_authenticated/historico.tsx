import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteVisit, listVisits } from "@/lib/visits.functions";
import { RACES, answerFor, formatDateTime, type VisitRow } from "@/lib/candidates";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de visitas — Campanha Eleitoral" },
      {
        name: "description",
        content: "Histórico completo das visitas com filtros por data, bairro e candidato.",
      },
      { property: "og:title", content: "Histórico de visitas — Campanha Eleitoral" },
      {
        property: "og:description",
        content: "Consulte e filtre todas as visitas registradas pela equipe.",
      },
    ],
  }),
  component: HistoricoPage,
});

function HistoricoPage() {
  const queryClient = useQueryClient();
  const fetchVisits = useServerFn(listVisits);
  const removeVisit = useServerFn(deleteVisit);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [candidate, setCandidate] = useState("");

  const { data } = useQuery({
    queryKey: ["visits"],
    queryFn: () => fetchVisits() as Promise<VisitRow[]>,
  });
  const visits = useMemo(() => data ?? [], [data]);

  const neighborhoods = useMemo(
    () => Array.from(new Set(visits.map((v) => v.neighborhood))).sort(),
    [visits],
  );
  const candidates = useMemo(() => {
    const set = new Set<string>();
    for (const v of visits) for (const race of RACES) set.add(answerFor(v, race));
    return Array.from(set).sort();
  }, [visits]);

  const filtered = useMemo(() => {
    return visits.filter((v) => {
      const date = new Date(v.visited_at);
      if (from && date < new Date(`${from}T00:00:00`)) return false;
      if (to && date > new Date(`${to}T23:59:59`)) return false;
      if (neighborhood && v.neighborhood !== neighborhood) return false;
      if (candidate && !RACES.some((race) => answerFor(v, race) === candidate)) return false;
      return true;
    });
  }, [visits, from, to, neighborhood, candidate]);

  const mutation = useMutation({
    mutationFn: (id: string) => removeVisit({ data: { id } }),
    onSuccess: () => {
      toast.success("Visita excluída.");
      void queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
    onError: (err: Error) => toast.error(err.message || "Não foi possível excluir."),
  });

  return (
    <AppShell title="Histórico">
      <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="from">De</Label>
          <Input
            id="from"
            type="date"
            className="h-11"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Até</Label>
          <Input
            id="to"
            type="date"
            className="h-11"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bairro">Bairro</Label>
          <select
            id="bairro"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">Todos</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="candidato">Candidato</Label>
          <select
            id="candidato"
            value={candidate}
            onChange={(e) => setCandidate(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">Todos</option>
            {candidates.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

      <p className="mt-4 text-sm text-muted-foreground">
        {filtered.length} visita{filtered.length === 1 ? "" : "s"} encontrada
        {filtered.length === 1 ? "" : "s"}
      </p>

      <div className="mt-3 space-y-3 md:hidden">
        {filtered.map((v) => (
          <article key={v.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {v.neighborhood} {v.locality && <span className="font-normal text-muted-foreground">- {v.locality}</span>} {v.address_number && <span className="font-normal text-muted-foreground">, nº {v.address_number}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{formatDateTime(v.visited_at)}</p>
                {v.voter_name && (
                  <p className="mt-1 truncate text-sm text-foreground">Eleitor: {v.voter_name}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{v.vote_count} voto{v.vote_count !== 1 ? 's' : ''}</p>
                <p className="mt-1 text-xs font-medium text-primary">Por: {v.activist_name || "Desconhecido"}</p>
              </div>
              <button
                onClick={() => mutation.mutate(v.id)}
                aria-label="Excluir visita"
                className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {RACES.map((race) => (
                <div key={race.key} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{race.short}</dt>
                  <dd className="truncate font-medium text-foreground">{answerFor(v, race)}</dd>
                </div>
              ))}
            </dl>
            {v.is_undecided && (
              <div className="mt-3 rounded-md bg-amber-500/10 p-2.5 text-sm text-amber-600 border border-amber-500/20">
                <strong>⚠️ Indecisos:</strong> {v.undecided_details || "Detalhes não informados"}
              </div>
            )}
            {v.notes && <p className="mt-3 text-sm text-muted-foreground">{v.notes}</p>}
          </article>
        ))}
      </div>

      <div className="mt-3 hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Bairro / Localidade</th>
              <th className="p-3">Eleitor</th>
              <th className="p-3 text-center">Votos</th>
              <th className="p-3">Pesquisador</th>
              {RACES.map((race) => (
                <th key={race.key} className="p-3">
                  {race.short}
                </th>
              ))}
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id} className="border-b border-border last:border-0">
                <td className="whitespace-nowrap p-3">{formatDateTime(v.visited_at)}</td>
                <td className="p-3">
                  {v.neighborhood}
                  {v.locality && <span className="ml-1 text-muted-foreground">/ {v.locality}</span>}
                  {v.address_number && <span className="ml-1 text-muted-foreground">, nº {v.address_number}</span>}
                </td>
                <td className="p-3">{v.voter_name ?? "—"}</td>
                <td className="p-3 text-center">{v.vote_count}</td>
                <td className="p-3 font-medium text-primary">{v.activist_name ?? "—"}</td>
                {RACES.map((race) => (
                  <td key={race.key} className="p-3">
                    {answerFor(v, race)}
                  </td>
                ))}
                <td className="p-3 text-right">
                  <button
                    onClick={() => mutation.mutate(v.id)}
                    aria-label="Excluir visita"
                    className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
