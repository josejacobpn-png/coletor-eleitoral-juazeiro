import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const visitSchema = z.object({
  visited_at: z.string().min(1),
  neighborhood: z.string().trim().min(1, "Informe o bairro").max(120),
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
        "id, visited_at, neighborhood, voter_name, notes, president_choice, president_other, governor_choice, governor_other, federal_choice, federal_other, state_choice, state_other",
      )
      .order("visited_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => visitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("visits")
      .insert({ ...data, user_id: context.userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("visits").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
