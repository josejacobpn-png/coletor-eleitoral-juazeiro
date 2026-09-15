import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createVisit, listVisits } from "@/lib/visits.functions";
import { OTHER, RACES, PREDEFINED_NEIGHBORHOODS, toLocalInputValue, type RaceKey, type VisitRow } from "@/lib/candidates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registrar")({
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

function getOptionStyle(option: string, selected: boolean) {
  if (option === "LULA 13" || option === "ELMANO 13" || option === "FERNANDO SANTANA" || option === "ZÉ AILTON") {
    return selected
      ? "border-red-700 bg-red-600 text-white ring-4 ring-red-600/30 scale-[1.02]"
      : "border-red-700/50 bg-red-600/80 text-white hover:bg-red-600";
  }
  if (option === "FLAVIO 22") {
    return selected
      ? "border-green-700 bg-green-600 text-yellow-400 ring-4 ring-green-600/30 scale-[1.02]"
      : "border-green-700/50 bg-green-600/80 text-yellow-400/90 hover:bg-green-600 hover:text-yellow-400";
  }
  if (option === "YURI") {
    return selected
      ? "border-green-700 bg-green-500 text-black ring-4 ring-green-500/30 scale-[1.02]"
      : "border-green-700/50 bg-green-500/80 text-black hover:bg-green-500";
  }
  if (option === "FELIPE VASQUES") {
    return selected
      ? "border-green-700 bg-green-600 text-white ring-4 ring-green-600/30 scale-[1.02]"
      : "border-green-700/50 bg-green-600/80 text-white hover:bg-green-600";
  }
  if (option === "CIRO 45" || option === "FERNANDA PESSOA" || option === "GIOVANNI") {
    return selected
      ? "border-blue-700 bg-blue-600 text-white ring-4 ring-blue-600/30 scale-[1.02]"
      : "border-blue-700/50 bg-blue-600/80 text-white hover:bg-blue-600";
  }
  if (option === "ANDRÉ FIGUEIREDO") {
    return selected
      ? "border-orange-700 bg-orange-500 text-white ring-4 ring-orange-500/30 scale-[1.02]"
      : "border-orange-700/50 bg-orange-500/80 text-white hover:bg-orange-500";
  }
  if (option === "ELIANA ESTRELA") {
    return selected
      ? "border-red-600 bg-white text-red-600 ring-4 ring-white/30 scale-[1.02]"
      : "border-red-600/50 bg-white/90 text-red-600 hover:bg-white";
  }
  if (option === "outro") {
    return selected
      ? "border-slate-600 bg-slate-500 text-white ring-4 ring-slate-500/30 scale-[1.02]"
      : "border-slate-600/50 bg-slate-500/80 text-white hover:bg-slate-500";
  }
  return selected
    ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/30 scale-[1.02]"
    : "border-border bg-background text-foreground hover:border-primary/40";
}

function RegistrarPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchVisits = useServerFn(listVisits);
  const saveVisit = useServerFn(createVisit);

  const [activistName, setActivistName] = useState("");
  const [choices, setChoices] = useState<Choices>(emptyChoices);
  const [others, setOthers] = useState<Others>(emptyOthers);
  const [visitedAt, setVisitedAt] = useState(() => toLocalInputValue(new Date()));
  const [voterName, setVoterName] = useState("");
  const [voteCount, setVoteCount] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [locality, setLocality] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [isUndecided, setIsUndecided] = useState(false);
  const [undecidedDetails, setUndecidedDetails] = useState("");
  const [recentVisits, setRecentVisits] = useState<{ neighborhood: string; locality: string; address_number: string; id: number }[]>([]);

  useEffect(() => {
    const name = localStorage.getItem("activist_name");
    if (name) {
      setActivistName(name);
      setNeighborhood(localStorage.getItem("activist_neighborhood") || "");
      setLocality(localStorage.getItem("activist_locality") || "");
    } else {
      navigate({ to: "/", replace: true });
    }
  }, [navigate]);

  const { data: visits } = useQuery({
    queryKey: ["visits"],
    queryFn: () => fetchVisits() as Promise<VisitRow[]>,
  });

  const neighborhoods = useMemo(
    () => {
      const dbNeighborhoods = (visits ?? []).map((v) => v.neighborhood);
      return Array.from(new Set([...PREDEFINED_NEIGHBORHOODS, ...dbNeighborhoods])).sort();
    },
    [visits],
  );

  const mutation = useMutation({
    mutationFn: (payload: Record<string, string | null>) => saveVisit({ data: payload as never }),
    onSuccess: (_, variables) => {
      toast.success("Visita registrada!");
      setChoices(emptyChoices);
      setOthers(emptyOthers);
      setVisitedAt(toLocalInputValue(new Date()));
      setVoterName("");
      setVoteCount("");
      setAddressNumber("");
      setIsUndecided(false);
      setUndecidedDetails("");
      setNotes("");
      
      setRecentVisits((prev) => [
        {
          id: Date.now(),
          neighborhood: (variables.neighborhood as string) || "",
          locality: (variables.locality as string) || "",
          address_number: (variables.address_number as string) || "",
        },
        ...prev,
      ].slice(0, 3));

      void queryClient.invalidateQueries({ queryKey: ["visits"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err: Error) => toast.error(err.message || "Não foi possível salvar."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!neighborhood.trim()) {
      toast.error("Informe o bairro ou localidade.");
      return;
    }
    if (voteCount === "" || voteCount < 1) {
      toast.error("Informe a quantidade de votos corretamente (mínimo 1).");
      return;
    }
    for (const race of RACES) {
      if (!choices[race.key]) {
        toast.error(`Escolha a opção de ${race.label}.`);
        return;
      }
      if (choices[race.key] === OTHER && !others[race.key].trim()) {
        toast.error(`Digite o nome ou número para ${race.label}.`);
        return;
      }
    }

    const payload: Record<string, any> = {
      visited_at: new Date(visitedAt).toISOString(),
      activist_name: activistName,
      neighborhood: neighborhood.trim(),
      locality: locality.trim() || null,
      address_number: addressNumber.trim() || null,
      is_undecided: isUndecided === true,
      undecided_details: isUndecided === true ? undecidedDetails.trim() || null : null,
      vote_count: voteCount as number,
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
      <div className="mb-5 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
        <span>Pesquisador: <strong>{activistName}</strong></span>
        <button 
          onClick={() => { 
            localStorage.removeItem("activist_name"); 
            localStorage.removeItem("activist_neighborhood"); 
            localStorage.removeItem("activist_locality"); 
            navigate({ to: "/" }); 
          }} 
          className="underline hover:text-primary/80"
        >
          Sair
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
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
            <Label htmlFor="neighborhood">Bairro</Label>
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
            <Label htmlFor="locality">Localidade (opcional)</Label>
            <Input
              id="locality"
              className="h-12"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="Ex.: Rua São João, Comunidade X"
              maxLength={120}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address_number">Número (opcional)</Label>
            <Input
              id="address_number"
              className="h-12"
              value={addressNumber}
              onChange={(e) => setAddressNumber(e.target.value)}
              placeholder="Ex.: 123, 45B, S/N"
              maxLength={50}
            />
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
            <Label htmlFor="vote_count">Quantidade de votos (família/casa)</Label>
            <Input
              id="vote_count"
              type="number"
              min={1}
              className="h-12"
              value={voteCount}
              onChange={(e) => {
                const val = e.target.value;
                setVoteCount(val === "" ? "" : Number(val));
              }}
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_undecided"
                checked={isUndecided}
                onCheckedChange={setIsUndecided}
              />
              <Label htmlFor="is_undecided" className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Família ou eleitor possui indecisos?
              </Label>
            </div>
            {isUndecided === true && (
              <div className="space-y-1.5 pl-6">
                <Label htmlFor="undecided_details" className="text-xs text-muted-foreground">Detalhes da indecisão (quais candidatos, motivos, etc)</Label>
                <Textarea
                  id="undecided_details"
                  className="min-h-[80px] resize-y"
                  value={undecidedDetails}
                  onChange={(e) => setUndecidedDetails(e.target.value)}
                  placeholder="Ex.: Em dúvida entre candidato A e B para governador..."
                  maxLength={1000}
                />
              </div>
            )}
          </div>

        </section>

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
                      getOptionStyle(option, selected)
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
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="font-display text-base font-bold text-foreground">Observações finais (opcional)</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              placeholder="Pontos importantes da conversa ou anotações gerais"
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

        {recentVisits.length > 0 && (
          <section className="mt-8 rounded-2xl border border-border bg-card p-4">
            <h2 className="font-display text-sm font-bold text-foreground mb-3">Últimas visitas registradas</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 font-medium text-muted-foreground">Local/Rua</th>
                    <th className="pb-2 font-medium text-muted-foreground">Número</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentVisits.map((v) => (
                    <tr key={v.id}>
                      <td className="py-2.5 pr-2 text-foreground">
                        {v.neighborhood} {v.locality && <span className="text-muted-foreground">- {v.locality}</span>}
                      </td>
                      <td className="py-2.5 text-foreground">{v.address_number || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </form>
    </AppShell>
  );
}
