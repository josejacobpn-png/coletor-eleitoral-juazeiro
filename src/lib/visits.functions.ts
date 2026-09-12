import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const visitSchema = z.object({
  visited_at: z.string().min(1),
  activist_name: z.string().trim().min(1, "Informe seu nome").max(100),
  neighborhood: z.string().trim().min(1, "Informe o bairro").max(120),
  locality: z.string().trim().max(120).optional().nullable(),
  address_number: z.string().trim().max(50).optional().nullable(),
  is_undecided: z.boolean().optional().nullable(),
  undecided_details: z.string().trim().max(1000).optional().nullable(),
  vote_count: z.coerce.number().int().min(1, "A quantidade de votos deve ser no mínimo 1"),
  voter_name: z.string().trim().max(120).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  president_choice: z.string().trim().min(1).max(60),
  president_other: z.string().trim().max(120).optional().nullable(),
  governor_choice: z.string().trim().min(1).max(60),
  governor_other: z.string().trim().max(120).optional().nullable(),
  federal_choice: z.string().trim().min(1).max(60),
  federal_other: z.string().trim().max(120).optional().nullable(),
  state_choice: z.string().trim().min(1).max(60),
  state_other: z.string().trim().max(120).optional().nullable(),
});

export const listVisits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("visits")
      .select(
        "id, visited_at, neighborhood, locality, address_number, is_undecided, undecided_details, vote_count, activist_name, voter_name, notes, president_choice, president_other, governor_choice, governor_other, federal_choice, federal_other, state_choice, state_other",
      )
      .order("visited_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createVisit = createServerFn({ method: "POST" })
  .validator((input: unknown) => visitSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("visits").insert({
      user_id: null,
      activist_name: data.activist_name,
      visited_at: data.visited_at,
      neighborhood: data.neighborhood,
      locality: data.locality ?? null,
      address_number: data.address_number ?? null,
      is_undecided: data.is_undecided ?? false,
      undecided_details: data.undecided_details ?? null,
      vote_count: data.vote_count,
      voter_name: data.voter_name ?? null,
      notes: data.notes ?? null,
      president_choice: data.president_choice,
      president_other: data.president_other ?? null,
      governor_choice: data.governor_choice,
      governor_other: data.governor_other ?? null,
      federal_choice: data.federal_choice,
      federal_other: data.federal_other ?? null,
      state_choice: data.state_choice,
      state_other: data.state_other ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("visits").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
