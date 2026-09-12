import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClipboardPlus, BarChart3, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Registro de Visitas — Campanha Eleitoral" },
      {
        name: "description",
        content:
          "Registre visitas porta a porta, acompanhe as intenções de voto por bairro e veja o histórico completo da campanha.",
      },
      { property: "og:title", content: "Registro de Visitas — Campanha Eleitoral" },
      {
        property: "og:description",
        content:
          "Formulário rápido no celular para registrar intenção de voto, com painel de estatísticas e histórico.",
      },
    ],
  }),
  component: Index,
});

const FEATURES = [
  {
    icon: ClipboardPlus,
    title: "Formulário rápido",
    text: "Registre uma visita em poucos toques, direto do celular.",
  },
  {
    icon: BarChart3,
    title: "Painel de intenções",
    text: "Gráficos por cargo e por bairro, atualizados na hora.",
  },
  {
    icon: ListChecks,
    title: "Histórico completo",
    text: "Filtre por data, bairro e candidato quando precisar.",
  },
];

function Index() {
  const navigate = useNavigate();
  const [showActivistForm, setShowActivistForm] = useState(false);
  const [activistName, setActivistName] = useState("");
  const [activistNeighborhood, setActivistNeighborhood] = useState("");
  const [activistLocality, setActivistLocality] = useState("");

  function handleActivistEnter(e: React.FormEvent) {
    e.preventDefault();
    if (!activistName.trim()) return;
    localStorage.setItem("activist_name", activistName.trim());
    localStorage.setItem("activist_neighborhood", activistNeighborhood.trim());
    localStorage.setItem("activist_locality", activistLocality.trim());
    navigate({ to: "/registrar" });
  }

  // Removido o useEffect de auto-redirecionamento para que a tela inicial sempre mostre as opções

  return (
    <div
      className="min-h-screen bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
          Campanha eleitoral
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">
          Registro de Visitas
        </h1>
        <p className="mt-4 max-w-md text-base opacity-90 drop-shadow-md">
          A ferramenta da equipe de rua para anotar a intenção de voto de cada casa visitada e
          enxergar o resultado em tempo real.
        </p>

        {showActivistForm ? (
          <form onSubmit={handleActivistEnter} className="mt-8 max-w-sm space-y-3 rounded-2xl bg-card p-5 text-card-foreground shadow-xl">
            <div>
              <label htmlFor="name" className="text-sm font-medium">Qual seu nome ou apelido?</label>
              <input 
                id="name"
                type="text" 
                required
                autoFocus
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={activistName}
                onChange={(e) => setActivistName(e.target.value)}
                placeholder="Digite seu nome..."
              />
            </div>
            <div>
              <label htmlFor="neighborhood" className="text-sm font-medium">Bairro (opcional)</label>
              <input 
                id="neighborhood"
                type="text" 
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={activistNeighborhood}
                onChange={(e) => setActivistNeighborhood(e.target.value)}
                placeholder="Ex: Centro"
              />
            </div>
            <div>
              <label htmlFor="locality" className="text-sm font-medium">Localidade (opcional)</label>
              <input 
                id="locality"
                type="text" 
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                value={activistLocality}
                onChange={(e) => setActivistLocality(e.target.value)}
                placeholder="Ex: Rua São João"
              />
            </div>
            <div className="mt-5 flex gap-2">
              <button type="submit" className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Continuar</button>
              <button type="button" onClick={() => setShowActivistForm(false)} className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">Voltar</button>
            </div>
          </form>
        ) : (
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => {
                const saved = localStorage.getItem("activist_name");
                if (saved) {
                  navigate({ to: "/registrar" });
                } else {
                  setShowActivistForm(true);
                }
              }}
              className="inline-flex h-13 items-center justify-center rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground shadow-lg transition-transform hover:scale-[1.02]"
            >
              Sou Pesquisador
            </button>
            <Link
              to="/auth"
              className="inline-flex h-13 items-center justify-center rounded-full bg-primary-foreground/20 px-8 py-3.5 text-base font-semibold backdrop-blur-md transition-transform hover:bg-primary-foreground/30 hover:scale-[1.02]"
            >
              Acesso Coordenador
            </Link>
          </div>
        )}

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-primary-foreground/10 p-5 backdrop-blur-sm">
              <Icon className="h-6 w-6 text-accent" />
              <h2 className="mt-3 font-display text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm opacity-75">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
