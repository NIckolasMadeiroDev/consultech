"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RespondFormLandingPage() {
  const [formId, setFormId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = formId.trim();
    if (id) router.push(`/forms/${id}/respond`);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Responder formulário</h1>
      <p className="mt-2 text-slate-600">
        Cole o ID do formulário ou o link que você recebeu.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 max-w-md">
        <input
          type="text"
          value={formId}
          onChange={(e) => setFormId(e.target.value)}
          placeholder="ID do formulário (ex: 550e8400-e29b-41d4-a716-446655440000)"
          className="w-full rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="mt-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Ir para o formulário
        </button>
      </form>
      <p className="mt-4">
        <a href="/" className="text-blue-600 hover:underline">
          ← Voltar ao início
        </a>
      </p>
    </main>
  );
}
