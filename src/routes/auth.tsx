import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar — Registro de Visitas da Campanha" },
      {
        name: "description",
        content:
          "Acesse sua conta para registrar visitas e acompanhar as intenções de voto da campanha.",
      },
      { property: "og:title", content: "Entrar — Registro de Visitas da Campanha" },
      {
        property: "og:description",
        content: "Acesse sua conta para registrar visitas da campanha eleitoral.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/registrar", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/registrar", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/registrar", replace: true });
        } else {
          toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Campanha eleitoral
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-foreground">
          Registro de Visitas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "in"
            ? "Entre para registrar suas visitas."
            : "Crie sua conta de militante."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-12 w-full text-base">
            {loading ? "Aguarde..." : mode === "in" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-4 w-full text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {mode === "in" ? "Não tem conta? Criar agora" : "Já tenho conta. Entrar"}
        </button>
      </div>
    </div>
  );
}
