import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, Card } from "@/components/app-shell";
import { Search, Upload, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listDocuments,
  createDocument,
  createDocumentUploadUrl,
  deleteDocument,
  getDocumentSignedUrl,
} from "@/lib/vault.functions";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [{ title: "Document Vault — Family COO" }] }),
  component: VaultPage,
});

function VaultPage() {
  const list = useServerFn(listDocuments);
  const create = useServerFn(createDocument);
  const uploadUrl = useServerFn(createDocumentUploadUrl);
  const signedUrl = useServerFn(getDocumentSignedUrl);
  const del = useServerFn(deleteDocument);
  const qc = useQueryClient();

  const { data } = useSuspenseQuery({ queryKey: ["documents"], queryFn: () => list() });
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = data.filter(
    (d: any) =>
      d.title.toLowerCase().includes(q.toLowerCase()) ||
      (d.category || "").toLowerCase().includes(q.toLowerCase()),
  );

  const mDel = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });

  async function onUpload(file: File) {
    setBusy(true);
    try {
      const { path, token } = await uploadUrl({ data: { filename: file.name } });
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.storage.from("vault").uploadToSignedUrl(path, token, file);
      if (error) throw error;
      await create({
        data: {
          title: file.name,
          category: "other",
          storage_path: path,
          mime_type: file.type,
          size_bytes: file.size,
        },
      });
      qc.invalidateQueries({ queryKey: ["documents"] });
    } finally {
      setBusy(false);
    }
  }

  async function onOpen(id: string) {
    const { url } = await signedUrl({ data: { id } });
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <AppShell>
      <PageHeader
        back
        eyebrow="Document vault"
        title="Everything findable."
        subtitle="Private, encrypted storage. Signed URLs expire after 60 seconds."
      />

      <div className="px-6 mb-4">
        <div className="flex items-center gap-3 rounded-full border border-hairline bg-surface px-4 py-3">
          <Search className="size-4 text-muted-foreground" strokeWidth={1.75} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the vault…"
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      <div className="px-6 mb-6">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <Upload className="size-3.5" strokeWidth={1.75} />
          {busy ? "Uploading…" : "Upload"}
          <input
            type="file"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <section className="px-6">
        <Card>
          <ul className="divide-y divide-hairline">
            {filtered.map((d: any) => (
              <li key={d.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{d.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.category} · {d.mime_type || "file"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {d.storage_path && (
                    <button
                      onClick={() => onOpen(d.id)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Open"
                    >
                      <ExternalLink className="size-3.5" strokeWidth={1.75} />
                    </button>
                  )}
                  <button
                    onClick={() => mDel.mutate(d.id)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Delete"
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">Nothing matched.</li>
            )}
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
