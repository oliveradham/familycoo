import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function resolveHousehold(supabase: any, userId: string) {
  const { data } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!data) throw new Error("No household");
  return data.household_id as string;
}

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const householdId = await resolveHousehold(supabase, userId);
    const { data, error } = await supabase
      .from("documents")
      .select("id, family_member_id, category, title, storage_path, mime_type, size_bytes, created_at")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: {
    title: string;
    category?: string;
    family_member_id?: string | null;
    storage_path?: string | null;
    mime_type?: string | null;
    size_bytes?: number | null;
    notes?: string | null;
  }) => {
    if (!input?.title?.trim()) throw new Error("Title required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const householdId = await resolveHousehold(supabase, userId);
    const { encryptField } = await import("./field-crypto.server");
    const { data: row, error } = await supabase
      .from("documents")
      .insert({
        household_id: householdId,
        title: data.title.trim(),
        category: data.category || "other",
        family_member_id: data.family_member_id || null,
        storage_path: data.storage_path || null,
        mime_type: data.mime_type || null,
        size_bytes: data.size_bytes ?? null,
        notes_enc: await encryptField(householdId, data.notes ?? null),
      })
      .select("id, family_member_id, category, title, storage_path, mime_type, size_bytes, created_at")
      .single();
    if (error) throw error;
    return row;
  });

export const getDocumentSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("documents")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (error) throw error;
    if (!row?.storage_path) return { url: null };
    const { data: signed, error: sErr } = await supabase.storage
      .from("vault")
      .createSignedUrl(row.storage_path, 60);
    if (sErr) throw sErr;
    return { url: signed?.signedUrl ?? null };
  });

export const createDocumentUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { filename: string }) => {
    if (!input?.filename?.trim()) throw new Error("filename required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const householdId = await resolveHousehold(supabase, userId);
    const path = `${householdId}/${crypto.randomUUID()}-${data.filename.replace(/[^\w.\-]/g, "_")}`;
    const { data: signed, error } = await supabase.storage
      .from("vault")
      .createSignedUploadUrl(path);
    if (error) throw error;
    return { path, token: signed.token, signedUrl: signed.signedUrl };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    if (!input?.id) throw new Error("id required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row } = await supabase
      .from("documents")
      .select("storage_path")
      .eq("id", data.id)
      .single();
    if (row?.storage_path) {
      await supabase.storage.from("vault").remove([row.storage_path]);
    }
    const { error } = await supabase.from("documents").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
