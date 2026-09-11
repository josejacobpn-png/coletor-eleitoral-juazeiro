import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createVisit, listVisits } from "@/lib/visits.functions";
import { OTHER, RACES, toLocalInputValue, type RaceKey, type VisitRow } from "@/lib/candidates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/registrar")({
  head: () => ({
    meta: [
      { title: "Registrar visita — Campanha Eleitoral" },
      {
        name: "description",
        content: "Formulário rápido para registrar a intenção de voto de cada visita.",
      },
      { property: "og:title", content: "Registrar visita — Campanha Eleitoral" },
      {
        property: "og:description",
        content: "Anote presidente, governador e deputados de cada casa visitada.",
      },
    ],
  }),
  component: RegistrarPage,
});

type Choices = Record<RaceKey, string>;
type Others = Record<RaceKey, string>;

const emptyChoices: Choices = { president: "", governor: "", federal: "", state: "" };
const emptyOthers: Others = { president: "", governor: "", federal: "", state: "" };

function RegistrarPage() {
  const queryClient = useQueryClient();
  const fetchVisits = useServerFn(listVisits);
  const saveVisit = useServerFn(createVisit);

  const [choices, setChoices] = useState<Choices>(emptyChoices);
  const [others, setOthers] = useState<Others>(emptyOthers);
  const [visitedAt, setVisitedAt] = useState(() => toLocalInputValue(new Date()));
  const [neighborhood, setNeighborhood] = useState("");
  const [voterName, setVoterName] = useState("");
  const [notes, setNotes] = useState("");

  const { data: visits } = useQuery({
    queryKey: ["visits"],
    queryFn: () => fetchVisits() as Promise<VisitRow[]>,
  });

  const neighborhoods = useMemo(
    () => Array.from(new Set((visits ?? []).map((v) => v.neighborhood))).sort(),
    [visits],
  );

  const mutation = useMutation({
    mutationFn: (payload: Record<string, string | null>) => saveVisit({ data: payload as never }),
    onSuccess: () => {
      toast.success("Visita registrada!");
      setChoices(emptyChoices);
      setOthers(emptyOthers);
      setVisitedAt(toLocalInputValue(new Date()));
      setVoterName("");
      setNotes("");
      void queryClient.invalidateQueries({ queryKey: ["visits"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err: Error) => toast.error(err.message || "Não foi possível salvar."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!neighborhood.trim()) return toast.error("Informe o bairro ou localidade.");
    for (const race of RACES) {
      if (!choices[race.key]) return toast.error(`Escolha a opção de ${race.label}.`);
      if (choices[race.key] === OTHER && !others[race.key].trim())
        return toast.error(`Digite o nome ou número para ${race.label}.`);
    }

    const payload: Record<string, string | null> = {
      visited_at: new Date(visitedAt).toISOString(),
      neighborhood: neighborhood.trim(),
      voter_name: voterName.trim() || null,
      notes: notes.trim() || null,
    };
    for (const race of RACES) {
      payload[race.choiceField] = choices[race.key];
      payload[race.otherField] = choices[race.key] === OTHER ? others[race.key].trim() : null;
    }
    mutation.mutate(payload);
  }

  return (
    <AppShell title="Registrar visita">
      <form onSubmit={handleSubmit} className="space-y-5">
        {RACES.map((race) => (
          <section key={race.key} className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-display text-base font-bold text-foreground">{race.label}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {[...race.options, OTHER].map((option) => {
                const selected = choices[race.key] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setChoices((c) => ({ ...c, [race.key]: option }))}
                    className={cn(
                      "min-h-12 flex-1 basis-[30%] rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/40",
                    )}
                  >
                    {option === OTHER ? "Outro" : option}
                  </button>
                );
              })}
            </div>
            {choices[race.key] === OTHER && (
              <Input
                className="mt-3 h-12"
                placeholder="Nome ou número do candidato"
                value={others[race.key]}
                onChange={(e) => setOthers((o) => ({ ...o, [race.key]: e.target.value }))}
                maxLength={120}
              />
            )}
          </section>
        ))}

        <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="font-display text-base font-bold text-foreground">Dados da visita</h2>

          <div className="space-y-1.5">
            <Label htmlFor="visited_at">Data e hora</Label>
            <Input
              id="visited_at"
              type="datetime-local"
              className="h-12"
              value={visitedAt}
              onChange={(e) => setVisitedAt(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="neighborhood">Bairro ou localidade</Label>
            <Input
              id="neighborhood"
              className="h-12"
              list="neighborhood-options"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Ex.: Centro"
              maxLength={120}
              required
            />
            <datalist id="neighborhood-options">
              {neighborhoods.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="voter_name">Nome do eleitor ou responsável (opcional)</Label>
            <Input
              id="voter_name"
              className="h-12"
              value={voterName}
              onChange={(e) => setVoterName(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              placeholder="Pontos importantes da conversa"
            />
          </div>
        </section>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-14 w-full text-base font-semibold"
        >
          {mutation.isPending ? "Salvando..." : "Salvar visita"}
        </Button>
      </form>
    </AppShell>
  );
}
