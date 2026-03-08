"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api";

export default function AdminSearchPage() {
  const searchParams = useSearchParams();
  const qParam = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(qParam);
  const [results, setResults] = useState<{
    forms: Array<{ id: string; title: string; status: string; createdAt: string }>;
    respondents: Array<{ id: string; name: string; email: string }>;
    answerMatches: Array<{
      answerId: string;
      responseId: string;
      formId: string;
      formTitle: string;
      respondentName: string;
      snippet: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.search(term);
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro na busca");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (qParam) runSearch(qParam);
  }, [qParam, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = query.trim();
    if (term) {
      globalThis.history.replaceState(null, "", `/admin/search?q=${encodeURIComponent(term)}`);
      runSearch(term);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Busca no sistema</h1>
        <p className="text-slate-600">Busque por formulários, respondentes e conteúdo das respostas.</p>
      </div>
      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o termo de busca..."
          className="flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Buscar
        </button>
      </form>
      {loading && <p className="text-slate-600">Buscando...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && results && (
        <div className="space-y-8">
          {results.forms.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Formulários</h2>
              <ul className="space-y-2">
                {results.forms.map((f) => (
                  <li key={f.id} className="rounded border bg-white p-3">
                    <Link href={`/admin/forms/${f.id}/responses`} className="font-medium text-blue-600 hover:underline">
                      {f.title}
                    </Link>
                    <span className="ml-2 text-sm text-slate-500">({f.status})</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.respondents.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Respondentes</h2>
              <ul className="space-y-2">
                {results.respondents.map((r) => (
                  <li key={r.id} className="rounded border bg-white p-3">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-slate-600"> — {r.email}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.answerMatches.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Respostas (trechos)</h2>
              <ul className="space-y-2">
                {results.answerMatches.map((a) => (
                  <li key={a.answerId} className="rounded border bg-white p-3">
                    <Link
                      href={`/admin/forms/${a.formId}/responses`}
                      className="text-blue-600 hover:underline"
                    >
                      {a.formTitle}
                    </Link>
                    <span className="text-slate-500"> — {a.respondentName}</span>
                    <p className="mt-1 text-sm text-slate-700">{a.snippet}…</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.forms.length === 0 &&
            results.respondents.length === 0 &&
            results.answerMatches.length === 0 && (
              <p className="text-slate-500">Nenhum resultado encontrado.</p>
            )}
        </div>
      )}
      {!loading && !error && !results && qParam && (
        <p className="text-slate-500">Digite um termo e clique em Buscar.</p>
      )}
    </div>
  );
}
