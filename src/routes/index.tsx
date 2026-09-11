import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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
  { icon: ClipboardPlus, title: "Formulário rápido", text: "Registre uma visita em poucos toques, direto do celular." },
  { icon: BarChart3, title: "Painel de intenções", text: "Gráficos por cargo e por bairro, atualizados na hora." },
  { icon: ListChecks, title: "Histórico completo", text: "Filtre por data, bairro e candidato quando precisar." },
];

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/registrar", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
          Campanha eleitoral
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">
          Registro de Visitas
        </h1>
        <p className="mt-4 max-w-md text-base opacity-80">
          A ferramenta da equipe de rua para anotar a intenção de voto de cada casa
          visitada e enxergar o resultado em tempo real.
        </p>

        <Link
          to="/auth"
          className="mt-8 inline-flex h-13 items-center justify-center rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground shadow-lg transition-transform hover:scale-[1.02]"
        >
          Entrar ou criar conta
        </Link>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-primary-foreground/10 p-5">
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
