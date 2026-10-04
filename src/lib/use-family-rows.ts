import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { deleteRow, insertRows, listRows, updateRow } from "@/lib/family-tools.functions";

type ReadTable =
  | "meals"
  | "meal_plan_entries"
  | "homework"
  | "packing_lists"
  | "packing_items"
  | "birthdays"
  | "chores"
  | "chore_completions"
  | "family_members"
  | "trips";

/** Reads household-scoped rows for a table, with insert/update/delete helpers. */
export function useFamilyRows<T = any>(table: ReadTable) {
  const { session, loading } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(listRows);
  const ins = useServerFn(insertRows);
  const upd = useServerFn(updateRow);
  const del = useServerFn(deleteRow);
  const key = ["family-rows", table];
  const query = useQuery({
    queryKey: key,
    queryFn: () => list({ data: { table } }) as Promise<T[]>,
    enabled: !loading && Boolean(session),
  });
  const onError = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");
  const invalidate = () => qc.invalidateQueries({ queryKey: key });
  const insert = useMutation({
    mutationFn: (rows: Record<string, unknown>[]) => ins({ data: { table, rows } }),
    onSuccess: invalidate,
    onError,
  });
  const update = useMutation({
    mutationFn: (v: { id: string; patch: Record<string, unknown> }) => upd({ data: { table, ...v } }),
    onSuccess: invalidate,
    onError,
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { table, id } }),
    onSuccess: invalidate,
    onError,
  });
  return { rows: (query.data ?? []) as T[], isLoading: query.isLoading || loading, error: query.error, insert, update, remove };
}

export function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
