"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Eye, EyeOff } from "lucide-react";

const REDIRECT_DELAY_MS = 400;

export default function LoginPage() {
  const router = useRouter();
  const { setUserFromLogin } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({})) as { error?: string; user?: { id: string; email: string; name: string } };
      if (!res.ok) {
        setError(data.error ?? "Erro ao entrar");
        setLoading(false);
        return;
      }
      if (data.user) setUserFromLogin(data.user);
      toast("Bem-vindo! Redirecionando para seus formulários.", "success");
      router.replace("/admin/forms");
      router.refresh();
      setTimeout(() => {
        if (globalThis.window !== undefined) {
          globalThis.window.location.href = "/admin/forms";
        }
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
      toast(err instanceof Error ? err.message : "Erro ao entrar", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--surface)] p-4 pb-safe pt-12 sm:p-6 sm:pt-6">
      <div
        className="absolute right-4 sm:right-6"
        style={{ top: "max(1rem, env(safe-area-inset-top, 0px))" }}
      >
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm" padding="lg">
        <h1 className="text-center text-h3 text-[var(--text-primary)]">Consultech Admin</h1>
        <p className="mt-1 text-center text-small text-[var(--text-secondary)]">
          Entre com sua conta
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p
              className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-small text-error"
              role="alert"
            >
              {error}
            </p>
          )}
          <Input
            id="email"
            type="email"
            label="E-mail"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            label="Senha"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightAction={
              <button
                type="button"
                className="rounded-md p-1.5 text-neutral-500 outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-primary-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            }
          />
          <Button type="submit" className="w-full" loading={loading} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="mt-4 text-center text-small text-[var(--text-secondary)]">
          <Link
            href="/"
            className="text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400"
          >
            Voltar ao início
          </Link>
          {" · "}
          <Link
            href="/tutorial"
            className="text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400"
          >
            Ver tutorial
          </Link>
        </p>
      </Card>
    </main>
  );
}
